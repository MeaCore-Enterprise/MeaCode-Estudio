use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GpuInfo {
    pub id: usize,
    pub name: String,
    pub vendor: String,
    pub memory_mb: Option<u64>,
    pub is_primary: bool,
    pub driver_version: Option<String>,
}

pub fn detect_gpus() -> Result<Vec<GpuInfo>, String> {
    let mut gpus = Vec::new();
    
    // Try to detect GPUs using platform-specific methods
    #[cfg(target_os = "windows")]
    {
        gpus.extend(detect_gpus_windows()?);
    }
    
    #[cfg(target_os = "linux")]
    {
        gpus.extend(detect_gpus_linux()?);
    }
    
    #[cfg(target_os = "macos")]
    {
        gpus.extend(detect_gpus_macos()?);
    }
    
    // If no GPUs detected, return at least a CPU fallback
    if gpus.is_empty() {
        gpus.push(GpuInfo {
            id: 0,
            name: "CPU (Fallback)".to_string(),
            vendor: "Generic".to_string(),
            memory_mb: None,
            is_primary: true,
            driver_version: None,
        });
    } else {
        // Mark first GPU as primary if none is marked
        if !gpus.iter().any(|g| g.is_primary) {
            if let Some(first) = gpus.first_mut() {
                first.is_primary = true;
            }
        }
    }
    
    Ok(gpus)
}

#[cfg(target_os = "windows")]
fn detect_gpus_windows() -> Result<Vec<GpuInfo>, String> {
    let mut gpus = Vec::new();
    
    // Try using wmic to get GPU info
    let output = Command::new("wmic")
        .args(&["path", "win32_VideoController", "get", "name,AdapterRAM,DriverVersion"])
        .output();
    
    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        let mut id = 0;
        
        for line in text.lines().skip(1) {
            let parts: Vec<&str> = line.trim().split_whitespace().collect();
            if parts.is_empty() {
                continue;
            }
            
            // Extract GPU name (usually first part)
            let name = parts[0..parts.len().saturating_sub(2)].join(" ");
            
            if !name.is_empty() && name != "Name" {
                let memory_mb = if parts.len() >= 2 {
                    parts[parts.len() - 2].parse::<u64>().ok()
                        .map(|bytes| bytes / (1024 * 1024))
                } else {
                    None
                };
                
                let driver_version = if parts.len() >= 1 {
                    parts.last().and_then(|v| {
                        if v.parse::<u64>().is_ok() {
                            None
                        } else {
                            Some(v.to_string())
                        }
                    })
                } else {
                    None
                };
                
                let vendor = if name.to_lowercase().contains("nvidia") {
                    "NVIDIA".to_string()
                } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                    "AMD".to_string()
                } else if name.to_lowercase().contains("intel") {
                    "Intel".to_string()
                } else {
                    "Unknown".to_string()
                };
                
                gpus.push(GpuInfo {
                    id,
                    name,
                    vendor,
                    memory_mb,
                    is_primary: id == 0,
                    driver_version,
                });
                
                id += 1;
            }
        }
    }
    
    // Fallback: Try using dxdiag or other methods
    if gpus.is_empty() {
        // Try PowerShell method
        let ps_output = Command::new("powershell")
            .args(&["-Command", "Get-WmiObject Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion | ConvertTo-Json"])
            .output();
        
        if let Ok(output) = ps_output {
            // Parse JSON output (simplified)
            let text = String::from_utf8_lossy(&output.stdout);
            // Basic parsing - in production, use proper JSON parser
            if text.contains("Name") {
                gpus.push(GpuInfo {
                    id: 0,
                    name: "GPU Detected".to_string(),
                    vendor: "Unknown".to_string(),
                    memory_mb: None,
                    is_primary: true,
                    driver_version: None,
                });
            }
        }
    }
    
    Ok(gpus)
}

#[cfg(target_os = "linux")]
fn detect_gpus_linux() -> Result<Vec<GpuInfo>, String> {
    let mut gpus = Vec::new();
    
    // Try lspci to detect GPUs
    let output = Command::new("lspci")
        .args(&["-nn", "-d", "::0300"])
        .output();
    
    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        let mut id = 0;
        
        for line in text.lines() {
            if line.contains("VGA") || line.contains("3D") || line.contains("Display") {
                let name = line.split(':').nth(2)
                    .map(|s| s.trim().to_string())
                    .unwrap_or_else(|| "Unknown GPU".to_string());
                
                let vendor = if name.to_lowercase().contains("nvidia") {
                    "NVIDIA".to_string()
                } else if name.to_lowercase().contains("amd") || name.to_lowercase().contains("radeon") {
                    "AMD".to_string()
                } else if name.to_lowercase().contains("intel") {
                    "Intel".to_string()
                } else {
                    "Unknown".to_string()
                };
                
                gpus.push(GpuInfo {
                    id,
                    name,
                    vendor,
                    memory_mb: None,
                    is_primary: id == 0,
                    driver_version: None,
                });
                
                id += 1;
            }
        }
    }
    
    Ok(gpus)
}

#[cfg(target_os = "macos")]
fn detect_gpus_macos() -> Result<Vec<GpuInfo>, String> {
    let mut gpus = Vec::new();
    
    // Try system_profiler on macOS
    let output = Command::new("system_profiler")
        .args(&["SPDisplaysDataType"])
        .output();
    
    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        let mut id = 0;
        let mut current_name = String::new();
        let mut current_vendor = String::new();
        
        for line in text.lines() {
            if line.contains("Chipset Model:") {
                current_name = line.split(':').nth(1)
                    .map(|s| s.trim().to_string())
                    .unwrap_or_default();
            } else if line.contains("Vendor:") {
                current_vendor = line.split(':').nth(1)
                    .map(|s| s.trim().to_string())
                    .unwrap_or_default();
            } else if line.contains("VRAM") && !current_name.is_empty() {
                let memory_str = line.split(':').nth(1)
                    .and_then(|s| {
                        s.trim().split_whitespace().next()
                            .and_then(|num| num.parse::<u64>().ok())
                    });
                
                gpus.push(GpuInfo {
                    id,
                    name: current_name.clone(),
                    vendor: if current_vendor.is_empty() { "Apple".to_string() } else { current_vendor.clone() },
                    memory_mb: memory_str,
                    is_primary: id == 0,
                    driver_version: None,
                });
                
                id += 1;
                current_name.clear();
                current_vendor.clear();
            }
        }
    }
    
    Ok(gpus)
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn detect_gpus_windows() -> Result<Vec<GpuInfo>, String> {
    Ok(Vec::new())
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn detect_gpus_linux() -> Result<Vec<GpuInfo>, String> {
    Ok(Vec::new())
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn detect_gpus_macos() -> Result<Vec<GpuInfo>, String> {
    Ok(Vec::new())
}

