use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EngineCompletionItem {
  pub label: String,
  pub detail: Option<String>,
}

pub fn engine_completions(prefix: &str) -> Vec<EngineCompletionItem> {
  let p = prefix.to_lowercase();

  let mut items = Vec::new();

  items.push(EngineCompletionItem {
    label: "helloMeaCode".to_string(),
    detail: Some("Demo completion from MeaCode LSP".to_string()),
  });

  if p.starts_with("con") {
    items.push(EngineCompletionItem {
      label: "console.log".to_string(),
      detail: Some("Log to console".to_string()),
    });
  }

  if p.starts_with("fn") || p.starts_with("fun") {
    items.push(EngineCompletionItem {
      label: "function".to_string(),
      detail: Some("JavaScript/TypeScript function keyword".to_string()),
    });
  }

  items
}

pub fn engine_hover(symbol: &str) -> String {
  let s = symbol.trim();

  if s.eq_ignore_ascii_case("helloMeaCode") {
    "Demo symbol from MeaCode LSP: helloMeaCode()".to_string()
  } else if s.eq_ignore_ascii_case("console") {
    "Built-in console object".to_string()
  } else if s.eq_ignore_ascii_case("function") {
    "JavaScript/TypeScript function keyword".to_string()
  } else {
    format!("Simulated hover for symbol `{}`", s)
  }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EngineDiagnostic {
  pub message: String,
  pub severity: Option<u8>,
  pub start_line: u32,
  pub start_col: u32,
  pub end_line: u32,
  pub end_col: u32,
}

pub fn engine_diagnostics(text: &str) -> Vec<EngineDiagnostic> {
  let mut diagnostics = Vec::new();

  for (idx, line) in text.lines().enumerate() {
    let line_no = (idx as u32) + 1;

    if let Some(col) = line.find("console.log") {
      diagnostics.push(EngineDiagnostic {
        message: "Uso de console.log (demo warning)".to_string(),
        severity: Some(2),
        start_line: line_no,
        start_col: (col as u32) + 1,
        end_line: line_no,
        end_col: (col as u32) + 1 + "console.log".len() as u32,
      });
    }

    if let Some(col) = line.find("TODO") {
      diagnostics.push(EngineDiagnostic {
        message: "TODO pendiente (demo info)".to_string(),
        severity: Some(3),
        start_line: line_no,
        start_col: (col as u32) + 1,
        end_line: line_no,
        end_col: (col as u32) + 1 + "TODO".len() as u32,
      });
    }

    if let Some(col) = line.find("any ") {
      diagnostics.push(EngineDiagnostic {
        message: "Tipo 'any' detectado (demo error)".to_string(),
        severity: Some(1),
        start_line: line_no,
        start_col: (col as u32) + 1,
        end_line: line_no,
        end_col: (col as u32) + 1 + "any".len() as u32,
      });
    }
  }

  diagnostics
}
