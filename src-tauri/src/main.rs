#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

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

#[tauri::command]
async fn read_file(path: String) -> Result<FileContent, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;

    Ok(FileContent { path, content })
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
            lsp_completion,
            lsp_hover,
            lsp_diagnostics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
