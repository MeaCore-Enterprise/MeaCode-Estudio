use anyhow::Result;
use tokio::io::{stdin, stdout};
use tower_lsp::{LspService, Server};

mod handlers;
use handlers::Backend;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .with_target(false)
        .init();

    let (service, socket) = LspService::build(|client| Backend::new(client)).finish();

    Server::new(stdin(), stdout(), socket).serve(service).await;

    Ok(())
}
