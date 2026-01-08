# Development Guide

This guide provides detailed instructions for setting up and developing MeaCode Studio.

## Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 9.0.0 or higher (specified in `packageManager`)
- **Rust**: Latest stable version (1.70+)
- **Git**: For version control

### Platform-Specific Requirements

#### Windows
- Microsoft Visual C++ Build Tools
- Windows SDK

#### macOS
- Xcode Command Line Tools: `xcode-select --install`

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  libsoup2.4-dev \
  pkg-config \
  patchelf
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MeaCore-Enterprise/MeaCode-Studio.git
cd MeaCode-Studio
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Rust dependencies are installed automatically on first build
```

### 3. Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check pnpm version
pnpm --version  # Should be 9.0.0

# Check Rust version
rustc --version  # Should be 1.70+
```

## Development Workflow

### Running in Development Mode

```bash
# Start the development server
pnpm tauri:dev

# Or use the shorthand
pnpm dev
```

This will:
- Start the Vite dev server on `http://localhost:1420`
- Launch the Tauri application
- Enable hot module replacement (HMR)

### Building for Production

```bash
# Build the application
pnpm tauri:build

# Or use the full command
pnpm tauri build
```

The built application will be in `src-tauri/target/release/` (or `target/debug/` for debug builds).

## Code Quality

### Formatting

```bash
# Format all code
pnpm format

# Check formatting without modifying files
pnpm format:check
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm type-check
```

### Rust Formatting and Linting

```bash
# Format Rust code
cargo fmt

# Run Clippy linter
cargo clippy
```

## Project Structure

```
MeaCode-Estudio/
├── kernel/              # Rust backend modules
│   ├── kernel-core/     # Core IDE functionality
│   ├── kernel-lsp/      # LSP server
│   └── kernel-ai/        # AI engine
├── src/                 # React frontend
│   ├── components/      # Reusable UI components
│   ├── editor/          # Editor components
│   ├── panels/          # Side panels (AI, Terminal, etc.)
│   ├── layout/          # Layout components
│   ├── hooks/           # React hooks
│   ├── utils/           # Utility functions
│   └── ipc/             # IPC bridge
├── src-tauri/           # Tauri configuration
│   ├── src/             # Rust backend entry point
│   ├── icons/           # Application icons
│   └── tauri.conf.json  # Tauri configuration
└── docs/                # Documentation
```

## Configuration Files

### EditorConfig

The project uses `.editorconfig` for consistent code formatting across editors.

### Prettier

Formatting rules are defined in `.prettierrc.json`. To format code:

```bash
pnpm format
```

### TypeScript

TypeScript configuration is in `tsconfig.json`. The project uses strict mode.

### Rust

Rust configuration is in `Cargo.toml` files. The workspace uses Rust edition 2021.

## Setting Up Auto-Updater

### 1. Generate Signing Keys

```bash
cd src-tauri
pnpm tauri signer generate
```

This will generate:
- A public key (to be added to `tauri.conf.json`)
- A private key (to be added as a GitHub secret)
- A password (to be added as a GitHub secret)

### 2. Update Configuration

Edit `src-tauri/tauri.conf.json` and replace:
```json
"pubkey": "TU_CLAVE_PUBLICA_AQUI"
```

With your generated public key.

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `TAURI_SIGNING_PRIVATE_KEY`: Your private key
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: The password for your private key

**⚠️ Important**: Never commit the private key or password to the repository.

## Debugging

### Frontend Debugging

- Use browser DevTools (available in development mode)
- React DevTools extension recommended
- Check console for errors and warnings

### Backend Debugging

- Use `println!` or `dbg!` macros for Rust debugging
- Check terminal output for backend logs
- Use `cargo test` for unit tests

### Tauri IPC Debugging

- Check the browser console for IPC errors
- Verify IPC command handlers in `src-tauri/src/main.rs`
- Check the IPC bridge in `src/ipc/bridge.ts`

## Testing

### Running Tests

```bash
# Rust tests
cargo test

# Frontend tests (when configured)
pnpm test
```

## Common Issues

### Build Failures

**Issue**: Rust compilation errors
**Solution**: 
- Ensure Rust is up to date: `rustup update`
- Clean build: `cargo clean && pnpm tauri build`

**Issue**: Node.js version mismatch
**Solution**: Use Node.js 18+ as specified in `package.json`

### Development Server Issues

**Issue**: Port 1420 already in use
**Solution**: 
- Kill the process using the port
- Or change the port in `vite.config.ts`

### Tauri Issues

**Issue**: Tauri commands not working
**Solution**:
- Verify `tauri.conf.json` is valid JSON
- Check that IPC commands are properly registered
- Ensure Tauri features are enabled in `Cargo.toml`

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to the project.

## Additional Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Rust Documentation](https://doc.rust-lang.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

