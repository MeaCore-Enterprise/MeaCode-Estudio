use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct GitStatus {
    pub branch: String,
    pub is_clean: bool,
    pub modified_files: Vec<String>,
    pub untracked_files: Vec<String>,
    pub staged_files: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitBranch {
    pub name: String,
    pub is_current: bool,
    pub is_remote: bool,
}

pub fn get_git_status(workspace_path: &str) -> Result<GitStatus, String> {
    let path = PathBuf::from(workspace_path);
    
    // Get current branch
    let branch_output = Command::new("git")
        .arg("branch")
        .arg("--show-current")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to get branch: {}", e))?;
    
    let branch = String::from_utf8_lossy(&branch_output.stdout).trim().to_string();
    
    // Get status
    let status_output = Command::new("git")
        .arg("status")
        .arg("--porcelain")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to get status: {}", e))?;
    
    let status_text = String::from_utf8_lossy(&status_output.stdout);
    let is_clean = status_text.trim().is_empty();
    
    let mut modified_files = Vec::new();
    let mut untracked_files = Vec::new();
    let mut staged_files = Vec::new();
    
    for line in status_text.lines() {
        if line.len() < 3 {
            continue;
        }
        
        let status = &line[..2];
        let file_path = line[3..].trim().to_string();
        
        match status {
            "??" => untracked_files.push(file_path),
            " M" | "MM" => modified_files.push(file_path),
            "M " | "A " | "D " => staged_files.push(file_path),
            _ => {}
        }
    }
    
    Ok(GitStatus {
        branch: if branch.is_empty() { "main".to_string() } else { branch },
        is_clean,
        modified_files,
        untracked_files,
        staged_files,
    })
}

pub fn get_git_branches(workspace_path: &str) -> Result<Vec<GitBranch>, String> {
    let path = PathBuf::from(workspace_path);
    
    // Get local branches
    let local_output = Command::new("git")
        .arg("branch")
        .arg("--format=%(refname:short)")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to get branches: {}", e))?;
    
    let current_branch_output = Command::new("git")
        .arg("branch")
        .arg("--show-current")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to get current branch: {}", e))?;
    
    let current_branch = String::from_utf8_lossy(&current_branch_output.stdout).trim().to_string();
    
    let mut branches = Vec::new();
    
    for line in String::from_utf8_lossy(&local_output.stdout).lines() {
        let name = line.trim().to_string();
        if !name.is_empty() {
            branches.push(GitBranch {
                name: name.clone(),
                is_current: name == current_branch,
                is_remote: false,
            });
        }
    }
    
    // Get remote branches
    let remote_output = Command::new("git")
        .arg("branch")
        .arg("-r")
        .arg("--format=%(refname:short)")
        .current_dir(&path)
        .output();
    
    if let Ok(output) = remote_output {
        for line in String::from_utf8_lossy(&output.stdout).lines() {
            let name = line.trim().to_string();
            if !name.is_empty() && !name.contains("HEAD") {
                branches.push(GitBranch {
                    name,
                    is_current: false,
                    is_remote: true,
                });
            }
        }
    }
    
    Ok(branches)
}

pub fn git_commit(workspace_path: &str, message: &str) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let output = Command::new("git")
        .arg("commit")
        .arg("-m")
        .arg(message)
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to commit: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git commit failed: {}", error));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_push(workspace_path: &str, branch: Option<&str>) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let mut cmd = Command::new("git");
    cmd.arg("push");
    
    if let Some(branch_name) = branch {
        cmd.arg("origin").arg(branch_name);
    }
    
    let output = cmd
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to push: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git push failed: {}", error));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_pull(workspace_path: &str) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let output = Command::new("git")
        .arg("pull")
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to pull: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git pull failed: {}", error));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_checkout_branch(workspace_path: &str, branch_name: &str) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let output = Command::new("git")
        .arg("checkout")
        .arg(branch_name)
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to checkout branch: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git checkout failed: {}", error));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_create_branch(workspace_path: &str, branch_name: &str) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let output = Command::new("git")
        .arg("checkout")
        .arg("-b")
        .arg(branch_name)
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to create branch: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git create branch failed: {}", error));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_add_files(workspace_path: &str, files: Vec<String>) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let mut cmd = Command::new("git");
    cmd.arg("add");
    
    if files.is_empty() {
        cmd.arg(".");
    } else {
        for file in files {
            cmd.arg(file);
        }
    }
    
    let output = cmd
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to add files: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git add failed: {}", error));
    }
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn git_get_diff(workspace_path: &str, file_path: Option<&str>) -> Result<String, String> {
    let path = PathBuf::from(workspace_path);
    
    let mut cmd = Command::new("git");
    cmd.arg("diff");
    
    if let Some(file) = file_path {
        cmd.arg(file);
    }
    
    let output = cmd
        .current_dir(&path)
        .output()
        .map_err(|e| format!("Failed to get diff: {}", e))?;
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

