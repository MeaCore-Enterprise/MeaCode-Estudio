use tokio::signal;
use std::sync::Arc;
use kernel_core::server::Server;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();
    log::info!("Starting MeaCore Kernel...");
    
    let server = Server::new().await?;
    let server = Arc::new(server);
    
    // run server accept loop (ipc/gRPC/ws)
    let s = server.clone();
    tokio::spawn(async move {
        if let Err(e) = s.run().await {
            log::error!("server run error: {:?}", e);
        }
    });

    log::info!("Kernel ready. Waiting for SIGINT...");
    signal::ctrl_c().await?;
    println!("shutting down...");
    server.shutdown().await?;
    Ok(())
}
