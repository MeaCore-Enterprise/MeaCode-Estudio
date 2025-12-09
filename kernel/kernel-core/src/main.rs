use anyhow::Result;
use tokio::sync::mpsc;

use kernel_core::{KernelCore, KernelRequest, KernelResponse};

#[tokio::main]
async fn main() -> Result<()> {
    let (req_tx, req_rx) = mpsc::channel(32);
    let (res_tx, mut res_rx) = mpsc::channel(32);

    let kernel = KernelCore::new(req_rx, res_tx);

    tokio::spawn(async move {
        if let Err(err) = kernel.run().await {
            eprintln!("[kernel-core] error: {err:?}");
        }
    });

    req_tx.send(KernelRequest::Ping).await?;

    if let Some(resp) = res_rx.recv().await {
        println!("[kernel-core] response: {:?}", resp);
    }

    Ok(())
}
