use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, jsonrpc};

pub struct Backend {
    client: Client,
}

impl Backend {
    pub fn new(client: Client) -> Self { Self { client } }
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> jsonrpc::Result<InitializeResult> {
        Ok(InitializeResult { 
            capabilities: ServerCapabilities {
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                completion_provider: Some(CompletionOptions::default()),
                ..Default::default()
            }, 
            server_info: Some(ServerInfo {
                name: "MeaCore-LSP".to_string(),
                version: Some("0.0.1".to_string()),
            }) 
        })
    }

    async fn shutdown(&self) -> jsonrpc::Result<()> {
        Ok(())
    }

    async fn completion(&self, _: CompletionParams) -> jsonrpc::Result<Option<CompletionResponse>> {
        Ok(Some(CompletionResponse::Array(vec![
            CompletionItem {
                label: "HelloMeaCore".to_string(),
                kind: Some(CompletionItemKind::TEXT),
                detail: Some("MeaCore Autocomplete".to_string()),
                ..Default::default()
            }
        ])))
    }
}
