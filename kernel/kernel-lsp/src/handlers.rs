use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::{
    CompletionItem, CompletionItemKind, CompletionOptions, CompletionParams, CompletionResponse,
    Diagnostic, DiagnosticSeverity, Hover, HoverContents, HoverParams, InitializedParams,
    MarkedString, MessageType, NumberOrString, Position, Range, ServerCapabilities, ServerInfo,
    TextDocumentSyncCapability, TextDocumentSyncKind, Url,
};
use tower_lsp::{Client, LanguageServer};

pub struct Backend {
    client: Client,
    documents: Arc<RwLock<HashMap<Url, String>>>,
}

impl Backend {
    pub fn new(client: Client) -> Self {
        Self {
            client,
            documents: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    async fn analyze_document(&self, uri: &Url, text: &str) -> Vec<Diagnostic> {
        let mut diagnostics = Vec::new();
        let lines: Vec<&str> = text.lines().collect();

        for (line_idx, line) in lines.iter().enumerate() {
            let line_num = line_idx as u32;

            // Check for common issues
            if line.contains("console.log") {
                diagnostics.push(Diagnostic {
                    range: Range {
                        start: Position {
                            line: line_num,
                            character: 0,
                        },
                        end: Position {
                            line: line_num,
                            character: line.len() as u32,
                        },
                    },
                    severity: Some(DiagnosticSeverity::WARNING),
                    code: Some(NumberOrString::String("no-console".to_string())),
                    code_description: None,
                    source: Some("meacode-lsp".to_string()),
                    message: "Uso de console.log detectado".to_string(),
                    related_information: None,
                    tags: None,
                    data: None,
                });
            }

            if line.contains("TODO") || line.contains("FIXME") {
                diagnostics.push(Diagnostic {
                    range: Range {
                        start: Position {
                            line: line_num,
                            character: 0,
                        },
                        end: Position {
                            line: line_num,
                            character: line.len() as u32,
                        },
                    },
                    severity: Some(DiagnosticSeverity::INFORMATION),
                    code: Some(NumberOrString::String("todo".to_string())),
                    code_description: None,
                    source: Some("meacode-lsp".to_string()),
                    message: format!("{} encontrado", if line.contains("TODO") { "TODO" } else { "FIXME" }),
                    related_information: None,
                    tags: None,
                    data: None,
                });
            }

            // Check for potential errors in TypeScript/JavaScript
            if line.contains("any ") && uri.path().ends_with(".ts") {
                diagnostics.push(Diagnostic {
                    range: Range {
                        start: Position {
                            line: line_num,
                            character: 0,
                        },
                        end: Position {
                            line: line_num,
                            character: line.len() as u32,
                        },
                    },
                    severity: Some(DiagnosticSeverity::WARNING),
                    code: Some(NumberOrString::String("no-any".to_string())),
                    code_description: None,
                    source: Some("meacode-lsp".to_string()),
                    message: "Uso de tipo 'any' detectado".to_string(),
                    related_information: None,
                    tags: None,
                    data: None,
                });
            }
        }

        diagnostics
    }

    async fn get_completions(&self, uri: &Url, position: Position) -> Vec<CompletionItem> {
        let text = {
            let docs = self.documents.read().await;
            docs.get(uri).cloned().unwrap_or_default()
        };
        let lines: Vec<&str> = text.lines().collect();
        
        if position.line as usize >= lines.len() {
            return vec![];
        }

        let line = lines[position.line as usize];
        let prefix = &line[..(position.character as usize).min(line.len())];

        let mut completions = Vec::new();

        // Basic keyword completions
        let keywords = vec![
            ("function", "Declaración de función"),
            ("const", "Constante"),
            ("let", "Variable mutable"),
            ("var", "Variable (no recomendado)"),
            ("if", "Condicional"),
            ("else", "Alternativa condicional"),
            ("for", "Bucle for"),
            ("while", "Bucle while"),
            ("return", "Retornar valor"),
            ("class", "Clase"),
            ("interface", "Interfaz"),
            ("type", "Tipo"),
            ("import", "Importar módulo"),
            ("export", "Exportar"),
        ];

        for (keyword, detail) in keywords {
            if keyword.starts_with(prefix.trim()) {
                completions.push(CompletionItem {
                    label: keyword.to_string(),
                    kind: Some(CompletionItemKind::KEYWORD),
                    detail: Some(detail.to_string()),
                    ..CompletionItem::default()
                });
            }
        }

        // Context-aware completions
        if prefix.contains("console.") {
            completions.push(CompletionItem {
                label: "console.log".to_string(),
                kind: Some(CompletionItemKind::METHOD),
                detail: Some("Registra un mensaje en la consola".to_string()),
                ..CompletionItem::default()
            });
            completions.push(CompletionItem {
                label: "console.error".to_string(),
                kind: Some(CompletionItemKind::METHOD),
                detail: Some("Registra un error en la consola".to_string()),
                ..CompletionItem::default()
            });
        }

        // Extract variables and functions from the document
        for line in lines.iter() {
            if let Some(pos) = line.find("function ") {
                if let Some(name_start) = line[pos + 9..].find(|c: char| c.is_alphanumeric() || c == '_') {
                    let name = line[pos + 9 + name_start..]
                        .split(|c: char| !c.is_alphanumeric() && c != '_')
                        .next()
                        .unwrap_or("");
                    if !name.is_empty() && name.starts_with(prefix.trim()) {
                        completions.push(CompletionItem {
                            label: name.to_string(),
                            kind: Some(CompletionItemKind::FUNCTION),
                            detail: Some("Función definida en este archivo".to_string()),
                            ..CompletionItem::default()
                        });
                    }
                }
            }
        }

        completions
    }
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(
        &self,
        _: tower_lsp::lsp_types::InitializeParams,
    ) -> Result<tower_lsp::lsp_types::InitializeResult> {
        let capabilities = ServerCapabilities {
            text_document_sync: Some(TextDocumentSyncCapability::Kind(
                TextDocumentSyncKind::FULL,
            )),
            completion_provider: Some(CompletionOptions::default()),
            hover_provider: Some(tower_lsp::lsp_types::HoverProviderCapability::Simple(true)),
            ..Default::default()
        };

        Ok(tower_lsp::lsp_types::InitializeResult {
            capabilities,
            server_info: Some(ServerInfo {
                name: "MeaCode LSP".to_string(),
                version: Some("0.1.0".to_string()),
            }),
            offset_encoding: None,
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client
            .log_message(MessageType::INFO, "MeaCode LSP initialized")
            .await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn did_open(&self, params: tower_lsp::lsp_types::DidOpenTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        let text = params.text_document.text;
        {
            let mut docs = self.documents.write().await;
            docs.insert(uri.clone(), text.clone());
        }

        let diagnostics = self.analyze_document(&uri, &text).await;
        if !diagnostics.is_empty() {
            self.client
                .publish_diagnostics(uri, diagnostics, None)
                .await;
        }
    }

    async fn did_change(&self, params: tower_lsp::lsp_types::DidChangeTextDocumentParams) {
        if let Some(change) = params.content_changes.first() {
            let uri = params.text_document.uri.clone();
            {
                let mut docs = self.documents.write().await;
                docs.insert(uri.clone(), change.text.clone());
            }

            let diagnostics = self.analyze_document(&uri, &change.text).await;
            self.client
                .publish_diagnostics(uri, diagnostics, None)
                .await;
        }
    }

    async fn completion(&self, params: CompletionParams) -> Result<Option<CompletionResponse>> {
        let uri = params.text_document_position.text_document.uri;
        let position = params.text_document_position.position;
        let items = self.get_completions(&uri, position).await;

        Ok(Some(CompletionResponse::Array(items)))
    }

    async fn hover(&self, params: HoverParams) -> Result<Option<Hover>> {
        let uri = params.text_document_position_params.text_document.uri;
        let position = params.text_document_position_params.position;
        let text = {
            let docs = self.documents.read().await;
            docs.get(&uri).cloned().unwrap_or_default()
        };
        let lines: Vec<&str> = text.lines().collect();

        if position.line as usize >= lines.len() {
            return Ok(None);
        }

        let line = lines[position.line as usize];
        let char_pos = position.character as usize;

        // Extract word at position
        let word_start = line[..char_pos.min(line.len())]
            .rfind(|c: char| !c.is_alphanumeric() && c != '_')
            .map(|i| i + 1)
            .unwrap_or(0);
        let word_end = line[char_pos.min(line.len())..]
            .find(|c: char| !c.is_alphanumeric() && c != '_')
            .map(|i| char_pos + i)
            .unwrap_or(line.len());

        if word_start >= word_end {
            return Ok(None);
        }

        let word = &line[word_start..word_end];

        // Provide hover information
        let hover_text = if word == "function" {
            "Palabra clave: Declara una función".to_string()
        } else if word == "const" {
            "Palabra clave: Declara una constante".to_string()
        } else if word == "let" {
            "Palabra clave: Declara una variable mutable".to_string()
        } else if word.starts_with("console.") {
            "Objeto global de consola del navegador".to_string()
        } else {
            format!("Símbolo: {}", word)
        };

        Ok(Some(Hover {
            contents: HoverContents::Scalar(MarkedString::String(hover_text)),
            range: Some(Range {
                start: Position {
                    line: position.line,
                    character: word_start as u32,
                },
                end: Position {
                    line: position.line,
                    character: word_end as u32,
                },
            }),
        }))
    }
}
