#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::process::{Command, Stdio};
use tauri::api::dialog::{blocking::FileDialogBuilder, MessageDialogBuilder};

use kernel_core::{KernelCore, KernelRequest, KernelResponse};
use kernel_lsp::{engine_completions, engine_diagnostics, engine_hover};
use serde::Serialize;
use tokio::sync::mpsc;

#[derive(Serialize)]
struct AppInfo {
    name: String,
    version: String,
}

#[derive(Serialize)]
struct KernelPingResult {
    status: String,
}

#[derive(Serialize)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
}

#[derive(Serialize)]
struct FileContent {
    path: String,
    content: String,
}

#[derive(Serialize)]
struct LspCompletionItem {
    label: String,
    detail: Option<String>,
}

#[derive(Serialize)]
struct LspHoverResult {
    contents: String,
}

#[derive(Serialize)]
struct LspDiagnostic {
    message: String,
    severity: Option<u8>,
    start_line: u32,
    start_col: u32,
    end_line: u32,
    end_col: u32,
}

#[tauri::command]
async fn get_app_info() -> AppInfo {
    AppInfo {
        name: "MeaCode Studio".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[tauri::command]
async fn ping_kernel() -> Result<KernelPingResult, String> {
    let (req_tx, req_rx) = mpsc::channel(4);
    let (res_tx, mut res_rx) = mpsc::channel(4);

    let kernel = KernelCore::new(req_rx, res_tx);

    tauri::async_runtime::spawn(async move {
        if let Err(err) = kernel.run().await {
            eprintln!("[kernel-core] error in Tauri host: {err:?}");
        }
    });

    req_tx
        .send(KernelRequest::Ping)
        .await
        .map_err(|e| e.to_string())?;

    match res_rx.recv().await {
        Some(KernelResponse::Pong) => Ok(KernelPingResult {
            status: "ok".to_string(),
        }),
        None => Err("kernel did not respond".to_string()),
    }
}

#[tauri::command]
async fn list_dir(path: Option<String>) -> Result<Vec<FileEntry>, String> {
    let base = path.unwrap_or_else(|| ".".to_string());

    let mut entries = Vec::new();
    let read_dir = fs::read_dir(&base).map_err(|e| e.to_string())?;

    for entry in read_dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let file_type = entry.file_type().map_err(|e| e.to_string())?;
        let file_name = entry
            .file_name()
            .to_string_lossy()
            .to_string();
        let path_str = entry.path().to_string_lossy().to_string();

        entries.push(FileEntry {
            name: file_name,
            path: path_str,
            is_dir: file_type.is_dir(),
        });
    }

    Ok(entries)
}

#[derive(Serialize)]
struct WorkspaceInfo {
    path: String,
    project_type: String,
    name: String,
}

#[tauri::command]
async fn detect_project_type(path: String) -> Result<String, String> {
    // Check for common project files
    let cargo_toml = format!("{}/Cargo.toml", path);
    if fs::metadata(&cargo_toml).is_ok() {
        return Ok("rust".to_string());
    }

    let package_json = format!("{}/package.json", path);
    if fs::metadata(&package_json).is_ok() {
        return Ok("node".to_string());
    }

    let pyproject_toml = format!("{}/pyproject.toml", path);
    if fs::metadata(&pyproject_toml).is_ok() {
        return Ok("python".to_string());
    }

    let requirements_txt = format!("{}/requirements.txt", path);
    if fs::metadata(&requirements_txt).is_ok() {
        return Ok("python".to_string());
    }

    let pom_xml = format!("{}/pom.xml", path);
    if fs::metadata(&pom_xml).is_ok() {
        return Ok("java".to_string());
    }

    let go_mod = format!("{}/go.mod", path);
    if fs::metadata(&go_mod).is_ok() {
        return Ok("go".to_string());
    }

    Ok("unknown".to_string())
}

#[tauri::command]
async fn get_workspace_info(path: String) -> Result<WorkspaceInfo, String> {
    let project_type = detect_project_type(path.clone()).await.unwrap_or_else(|_| "unknown".to_string());
    let name = path
        .split(std::path::MAIN_SEPARATOR)
        .last()
        .unwrap_or("Workspace")
        .to_string();

    Ok(WorkspaceInfo {
        path: path.clone(),
        project_type,
        name,
    })
}

#[tauri::command]
async fn read_file(path: String) -> Result<FileContent, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;

    Ok(FileContent { path, content })
}

#[tauri::command]
async fn open_folder() -> Result<Option<String>, String> {
    let path = FileDialogBuilder::new()
        .set_title("Select Folder")
        .pick_folder();
    
    Ok(path.map(|p| p.to_string_lossy().to_string()))
}

#[tauri::command]
async fn open_file() -> Result<Option<String>, String> {
    let path = FileDialogBuilder::new()
        .set_title("Open File")
        .add_filter("All Files", &["*"])
        .add_filter("Text Files", &["txt", "md", "json", "yaml", "yml"])
        .add_filter("Code Files", &["rs", "ts", "tsx", "js", "jsx", "py", "java", "go", "cpp", "c", "h"])
        .pick_file();
    
    Ok(path.map(|p| p.to_string_lossy().to_string()))
}

#[tauri::command]
async fn save_file(path: String, content: String) -> Result<bool, String> {
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
async fn save_file_as(content: String) -> Result<Option<String>, String> {
    let path = FileDialogBuilder::new()
        .set_title("Save File As")
        .add_filter("All Files", &["*"])
        .add_filter("Text Files", &["txt", "md", "json", "yaml", "yml"])
        .add_filter("Code Files", &["rs", "ts", "tsx", "js", "jsx", "py", "java", "go", "cpp", "c", "h"])
        .save_file();
    
    if let Some(path) = path {
        let path_str = path.to_string_lossy().to_string();
        fs::write(&path, content).map_err(|e| e.to_string())?;
        Ok(Some(path_str))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn execute_command(command: String, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(&command)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[derive(Serialize)]
struct TerminalOutput {
    stdout: String,
    stderr: String,
    exit_code: i32,
}

#[tauri::command]
async fn get_current_directory() -> Result<String, String> {
    Ok(std::env::current_dir()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string())
}

#[tauri::command]
async fn execute_shell_command(command: String) -> Result<TerminalOutput, String> {
    #[cfg(target_os = "windows")]
    let shell = "cmd";
    #[cfg(target_os = "windows")]
    let shell_arg = "/c";
    
    #[cfg(not(target_os = "windows"))]
    let shell = "sh";
    #[cfg(not(target_os = "windows"))]
    let shell_arg = "-c";

    let output = Command::new(shell)
        .arg(shell_arg)
        .arg(&command)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| e.to_string())?;

    Ok(TerminalOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(0),
    })
}

#[tauri::command]
async fn lsp_completion(prefix: String) -> Result<Vec<LspCompletionItem>, String> {
    let engine_items = engine_completions(&prefix);

    let items = engine_items
        .into_iter()
        .map(|i| LspCompletionItem {
            label: i.label,
            detail: i.detail,
        })
        .collect();

    Ok(items)
}

#[tauri::command]
async fn lsp_hover(symbol: String) -> Result<LspHoverResult, String> {
    let contents = engine_hover(&symbol);

    Ok(LspHoverResult { contents })
}

#[tauri::command]
async fn lsp_diagnostics(text: String) -> Result<Vec<LspDiagnostic>, String> {
    let engine_diags = engine_diagnostics(&text);

    let diagnostics = engine_diags
        .into_iter()
        .map(|d| LspDiagnostic {
            message: d.message,
            severity: d.severity,
            start_line: d.start_line,
            start_col: d.start_col,
            end_line: d.end_line,
            end_col: d.end_col,
        })
        .collect();

    Ok(diagnostics)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            ping_kernel,
            list_dir,
            read_file,
            open_folder,
            open_file,
            save_file,
            save_file_as,
            execute_command,
            execute_shell_command,
            get_current_directory,
            detect_project_type,
            get_workspace_info,
            lsp_completion,
            lsp_hover,
            lsp_diagnostics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
