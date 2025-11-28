#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use sysinfo::{System, SystemExt};

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

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_info, run_js])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
