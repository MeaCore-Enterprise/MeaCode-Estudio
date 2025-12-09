use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;

#[derive(Debug, Serialize, Deserialize)]
pub enum KernelRequest {
    Ping,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum KernelResponse {
    Pong,
}

pub struct KernelCore {
    receiver: mpsc::Receiver<KernelRequest>,
    sender: mpsc::Sender<KernelResponse>,
}

impl KernelCore {
    pub fn new(
        receiver: mpsc::Receiver<KernelRequest>,
        sender: mpsc::Sender<KernelResponse>,
    ) -> Self {
        Self { receiver, sender }
    }

    pub async fn run(mut self) -> Result<()> {
        while let Some(msg) = self.receiver.recv().await {
            match msg {
                KernelRequest::Ping => {
                    let _ = self.sender.send(KernelResponse::Pong).await;
                }
            }
        }

        Ok(())
    }
}
