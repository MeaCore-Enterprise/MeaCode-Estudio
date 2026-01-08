# MeaCode Studio

AI-first desktop IDE built with Rust, Tauri and modern web technologies.

## Project Status

MeaCode Studio is in early development.
Some features are incomplete or experimental.
This release is intended for testing and feedback.

APIs, features and behavior may change without notice.

## Features

### Core Editor
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Multi-tab support**: Work with multiple files simultaneously
- **File Explorer**: Navigate your project structure
- **Command Palette**: Quick access to commands (Ctrl+Shift+P)
- **Quick Open**: Fast file navigation (Ctrl+P)

### AI Integration
- **AI Chat**: Integrated AI assistant powered by Nexusify API
- **Contextual Code Actions**: AI-powered code explanations, fixes, and refactoring
- **Hybrid Autocomplete**: Combines LSP and AI suggestions

### Development Tools
- **Integrated Terminal**: Full terminal support with xterm.js
- **LSP Support**: Language Server Protocol integration for diagnostics and completions
- **Run/Debug Panel**: Execute and debug your code

### User Experience
- **Modern UI**: Built with React, TypeScript, and TailwindCSS
- **Session Persistence**: Your workspace state is saved automatically
- **Responsive Layout**: Customizable panel layout

## System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 22.04+)
- **Node.js**: Version 18.0.0 or higher
- **Rust**: Latest stable version (for development)
- **Disk Space**: At least 500MB free space

## Installation

### From Releases

1. Download the latest release for your platform from [GitHub Releases](https://github.com/MeaCore-Enterprise/MeaCode-Studio/releases)
2. Run the installer
3. Launch MeaCode Studio

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MeaCore-Enterprise/MeaCode-Studio.git
   cd MeaCode-Studio
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Run in development mode**:
   ```bash
   pnpm tauri dev
   ```

4. **Build for production**:
   ```bash
   pnpm tauri build
   ```

## Usage

### Opening a Project

1. Click "Open Folder" from the welcome screen
2. Select your project directory
3. The file explorer will populate with your project structure

### Basic Editing

- **Open file**: Click on a file in the explorer or use Quick Open (Ctrl+P)
- **Save**: Ctrl+S (or Cmd+S on macOS)
- **Close tab**: Click the X on the tab or use Ctrl+W

### AI Features

- **Chat with AI**: Open the AI Chat panel and type your questions
- **Explain Code**: Select code and use the context menu "Explain this"
- **Fix Errors**: Right-click on error markers and select "Fix error"
- **Refactor**: Select code and use "Refactor" from the context menu

### Terminal

- The integrated terminal supports your system's default shell
- Multiple terminal tabs are supported
- Terminal automatically adapts to your workspace environment

## Updates

MeaCode Studio includes an automatic update system.
When a new version is available, the app will prompt you
to download and install it, then restart automatically.

### Setup for Developers

**⚠️ Important**: Before the updater can work, you must:

1. **Generate signing keys**:
   ```bash
   cd src-tauri
   pnpm tauri signer generate
   ```

2. **Update `src-tauri/tauri.conf.json`**:
   - Replace `"pubkey": "TU_CLAVE_PUBLICA_AQUI"` with your generated public key

3. **Configure GitHub Secrets**:
   - `TAURI_SIGNING_PRIVATE_KEY`: Your private key
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: The password for your private key

The updater will **NOT work** until the public key placeholder is replaced.

## Project Structure

```
MeaCode-Estudio/
├── kernel/                    # Backend in Rust
│   ├── kernel-core/          # Core IDE functionality
│   ├── kernel-lsp/           # LSP server
│   └── kernel-ai/            # AI engine
├── src/                       # Frontend in React + TypeScript
│   ├── components/           # Reusable components
│   ├── editor/               # Editor components
│   ├── panels/               # Side panels (AI, Terminal, etc.)
│   ├── layout/               # Layout components
│   └── utils/                 # Utility functions
└── src-tauri/                 # Tauri configuration
```

## Technologies

### Backend
- **Rust**: Core language for performance and safety
- **Tokio**: Async runtime
- **Tower LSP**: Language Server Protocol implementation

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Monaco Editor**: Code editor
- **TailwindCSS**: Styling
- **xterm.js**: Terminal emulator

### Desktop
- **Tauri**: Cross-platform desktop framework
- **Native IPC**: Fast communication between frontend and backend

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is proprietary software. All rights reserved.
See [LICENSE](LICENSE) for details.

## Links

- [Roadmap](Roadmap.md)
- [Changelog](CHANGELOG.md)
- [Contributing Guide](CONTRIBUTING.md)

---

**MeaCode Studio** - Part of the MeaCore Enterprise ecosystem

