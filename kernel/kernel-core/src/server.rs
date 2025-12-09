use tokio::net::UnixListener;

pub struct Server {
    // fields: socket, handlers, state 
}

impl Server {
    pub async fn new() -> anyhow::Result<Self> {
        // init state, db, gpu manager, plugin host
        Ok(Self { })
    }
    
    pub async fn run(&self) -> anyhow::Result<()> {
        // accept IPC from frontend (named pipe / ws) and dispatch
        // For now, just a dummy loop
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        }
    }
    
    pub async fn shutdown(&self) -> anyhow::Result<()> { 
        log::info!("Server shutting down resources...");
        Ok(()) 
    }
}
