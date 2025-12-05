#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod git;
mod gpu;

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
#[serde(rename_all = "camelCase")]
struct IntelliSenseOut {
  completion_suggestions: Vec<String>,
  error_detection: String,
}

#[tauri::command]
async fn ai_intellisense(code_snippet: String, programming_language: String, context: Option<String>) -> Result<IntelliSenseOut, String> {
  let api_key = std::env::var("GOOGLE_API_KEY").ok();
  
  if let Some(key) = api_key {
    // Build prompt for IntelliSense
    let mut prompt = format!(
      "You are an AI code assistant. Analyze this {} code snippet and provide:\n1. 3-5 intelligent code completion suggestions\n2. Any errors or potential issues\n\nCode:\n```{}\n{}\n```\n",
      programming_language,
      programming_language,
      code_snippet
    );
    
    if let Some(ctx) = context {
      if !ctx.is_empty() {
        prompt.push_str(&format!("\n\nContext:\n{}", ctx));
      }
    }
    
    prompt.push_str("\n\nRespond in JSON format: {\"suggestions\": [\"suggestion1\", \"suggestion2\"], \"errors\": \"error description\"}");
    
    let url = format!("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={}", key);
    let body = json!({
      "contents": [
        { "role": "user", "parts": [{"text": prompt}] }
      ],
      "generationConfig": {
        "temperature": 0.3,
        "maxOutputTokens": 500
      }
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
      .unwrap_or("");
    
    // Try to parse JSON response
    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(text) {
      let suggestions = parsed
        .get("suggestions")
        .and_then(|s| s.as_array())
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
        .unwrap_or_else(|| {
          // Fallback: extract suggestions from text
          text.lines()
            .filter(|l| l.trim().starts_with("-") || l.trim().starts_with("•"))
            .map(|l| l.trim_start_matches("-").trim_start_matches("•").trim().to_string())
            .take(5)
            .collect()
        });
      
      let error = parsed
        .get("errors")
        .and_then(|e| e.as_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| {
          // Basic error detection fallback
          let mut err = String::new();
          if code_snippet.matches("(").count() != code_snippet.matches(")").count() {
            err = "Unbalanced parentheses".to_string();
          } else if code_snippet.matches("{").count() != code_snippet.matches("}").count() {
            err = "Unbalanced braces".to_string();
          } else if code_snippet.matches("[").count() != code_snippet.matches("]").count() {
            err = "Unbalanced brackets".to_string();
          }
          err
        });
      
      return Ok(IntelliSenseOut {
        completion_suggestions: suggestions,
        error_detection: error,
      });
    }
    
    // Fallback: parse text response
    let suggestions: Vec<String> = text
      .lines()
      .filter(|l| !l.trim().is_empty() && (l.contains("suggestion") || l.contains("complete") || l.contains("add")))
      .map(|l| l.trim().to_string())
      .take(5)
      .collect();
    
    Ok(IntelliSenseOut {
      completion_suggestions: if suggestions.is_empty() {
        vec!["Continue typing...".to_string()]
      } else {
        suggestions
      },
      error_detection: String::new(),
    })
  } else {
    // Fallback to basic detection if no API key
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
    Ok(IntelliSenseOut { completion_suggestions: suggestions, error_detection: error })
  }
}

// Git commands
#[tauri::command]
fn git_status(workspace_path: String) -> Result<git::GitStatus, String> {
  git::get_git_status(&workspace_path)
}

#[tauri::command]
fn git_branches(workspace_path: String) -> Result<Vec<git::GitBranch>, String> {
  git::get_git_branches(&workspace_path)
}

#[tauri::command]
fn git_commit(workspace_path: String, message: String) -> Result<String, String> {
  git::git_commit(&workspace_path, &message)
}

#[tauri::command]
fn git_push(workspace_path: String, branch: Option<String>) -> Result<String, String> {
  git::git_push(&workspace_path, branch.as_deref())
}

#[tauri::command]
fn git_pull(workspace_path: String) -> Result<String, String> {
  git::git_pull(&workspace_path)
}

#[tauri::command]
fn git_checkout_branch(workspace_path: String, branch_name: String) -> Result<String, String> {
  git::git_checkout_branch(&workspace_path, &branch_name)
}

#[tauri::command]
fn git_create_branch(workspace_path: String, branch_name: String) -> Result<String, String> {
  git::git_create_branch(&workspace_path, &branch_name)
}

#[tauri::command]
fn git_add_files(workspace_path: String, files: Vec<String>) -> Result<String, String> {
  git::git_add_files(&workspace_path, files)
}

#[tauri::command]
fn git_get_diff(workspace_path: String, file_path: Option<String>) -> Result<String, String> {
  git::git_get_diff(&workspace_path, file_path.as_deref())
}

// GPU commands
#[tauri::command]
fn detect_gpus() -> Result<Vec<gpu::GpuInfo>, String> {
  gpu::detect_gpus()
}

// Subscription commands (placeholder - should connect to backend API)
#[tauri::command]
async fn get_subscription(user_id: String) -> Result<serde_json::Value, String> {
  // TODO: Implement actual subscription fetching from backend
  // For now, return free plan
  Ok(serde_json::json!({
    "plan": "free",
    "status": "active",
    "currentPeriodEnd": null,
    "cancelAtPeriodEnd": false
  }))
}

#[tauri::command]
async fn create_checkout_session(user_id: String, plan: String) -> Result<serde_json::Value, String> {
  // TODO: Implement Stripe checkout session creation
  // This should call your backend API which creates the Stripe session
  Err("Checkout session creation not yet implemented. Please configure Stripe backend.".to_string())
}

#[tauri::command]
async fn cancel_subscription(user_id: String) -> Result<(), String> {
  // TODO: Implement subscription cancellation
  Err("Subscription cancellation not yet implemented. Please configure backend.".to_string())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_info, 
      run_js, 
      ai_chat, 
      ai_intellisense,
      git_status,
      git_branches,
      git_commit,
      git_push,
      git_pull,
      git_checkout_branch,
      git_create_branch,
      git_add_files,
      git_get_diff,
      detect_gpus,
      get_subscription,
      create_checkout_session,
      cancel_subscription
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
