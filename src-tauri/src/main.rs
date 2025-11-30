#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use sysinfo::System;
use serde_json::json;

#[derive(Serialize)]
struct Info {
  platform: String,
  versions: serde_json::Value,
  is_dev: bool,
  cpus: usize,
  totalmem: u64,
  freemem: u64,
  arch: String,
}

#[tauri::command]
fn get_info() -> Info {
  let mut sys = System::new_all();
  sys.refresh_memory();
  let cpus = num_cpus::get();
  // sysinfo memory units are in KiB for many versions; multiply by 1024 to approximate bytes
  let totalmem = sys.total_memory() * 1024;
  let freemem = sys.available_memory() * 1024;
  Info {
    platform: std::env::consts::OS.to_string(),
    versions: serde_json::json!({}),
    is_dev: cfg!(debug_assertions),
    cpus,
    totalmem,
    freemem,
    arch: std::env::consts::ARCH.to_string(),
  }
}

#[tauri::command]
fn run_js(_code: String) -> serde_json::Value {
  // For now we do not evaluate JS natively in Tauri.
  // Frontend will fallback to in-browser execution.
  serde_json::json!({})
}

fn build_prompt(context: &str, query: &str) -> String {
  let mut base = String::from("Eres MeaMind, un asistente de programación integrado en un IDE. Responde de forma concisa. Si sugieres código completo listo para aplicar, usa el bloque ```suggestion:<language> ...```.");
  base.push_str("\n\nCONTEXTO:\n");
  base.push_str(context);
  base.push_str("\n\nPREGUNTA:\n");
  base.push_str(query);
  base
}

#[tauri::command]
async fn ai_chat(query: String, context: String) -> Result<String, String> {
  let api_key = std::env::var("GOOGLE_API_KEY").ok();
  if let Some(key) = api_key {
    let url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={}", key);
    let prompt = build_prompt(&context, &query);
    let body = json!({
      "contents": [
        { "role": "user", "parts": [{"text": prompt}] }
      ]
    });
    let client = reqwest::Client::new();
    let res = client
      .post(&url)
      .json(&body)
      .send()
      .await
      .map_err(|e| e.to_string())?;
    let value: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let text = value
      .pointer("/candidates/0/content/parts/0/text")
      .and_then(|v| v.as_str())
      .unwrap_or("No response");
    return Ok(text.to_string());
  }
  Ok("No hay clave de API configurada. Define GOOGLE_API_KEY para habilitar IA.".to_string())
}

#[derive(Serialize)]
struct IntelliSenseOut {
  completionSuggestions: Vec<String>,
  errorDetection: String,
}

#[tauri::command]
async fn ai_intellisense(code_snippet: String, programming_language: String, context: Option<String>) -> Result<IntelliSenseOut, String> {
  let mut suggestions = Vec::new();
  if code_snippet.trim().is_empty() {
    suggestions.push("// Start typing to get suggestions".to_string());
  } else {
    if !code_snippet.trim_end().ends_with(';') && programming_language.to_lowercase().contains("javascript") {
      suggestions.push("Add missing semicolon".to_string());
    }
    suggestions.push("Refactor variables to const/let".to_string());
    suggestions.push("Extract function".to_string());
  }
  let mut error = String::new();
  if code_snippet.matches("(").count() != code_snippet.matches(")").count() {
    error = "Unbalanced parentheses".to_string();
  }
  if let Some(ctx) = context {
    if ctx.len() > 0 { let _ = ctx.len(); }
  }
  Ok(IntelliSenseOut { completionSuggestions: suggestions, errorDetection: error })
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_info, run_js, ai_chat, ai_intellisense])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
