use tower_lsp::LspService;
use tower_lsp::Server;
use kernel_lsp::Backend;
use tokio::io::{stdin, stdout};

#[tokio::main]
async fn main() {
    let stdin = stdin();
    let stdout = stdout();

    let (service, socket) = LspService::new(|client| Backend::new(client));
    Server::new(stdin, stdout, socket).serve(service).await;
}
