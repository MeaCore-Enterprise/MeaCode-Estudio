use clap::{Parser, Subcommand};
use tokio;

#[derive(Parser)]
#[command(name = "meacore")]
#[command(about = "MeaCore IDE CLI", long_about = None)]
struct Opt {
    #[command(subcommand)]
    cmd: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Create a new project
    New { name: String },
    /// Create a new plugin template
    PluginNew { name: String },
    /// Build the current project
    Build,
    /// Run diagnostics / profile
    Inspect,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let opt = Opt::parse();
    
    match opt.cmd {
        Command::New { name } => {
            println!("Creating new MeaCore project: {}", name);
            // Logic to scaffold a new user project
        },
        Command::PluginNew { name } => {
            println!("Creating new Plugin: {}", name);
        },
        Command::Build => {
            println!("Building project...");
        },
        Command::Inspect => {
            println!("Inspecting environment...");
            // Could call into gpu-manager to list devices here
        }
    }
    Ok(())
}
