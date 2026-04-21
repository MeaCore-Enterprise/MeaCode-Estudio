# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-21

### Added
- **Initial Modular Release**: Complete refactoring of the IDE architecture.
- **TopBar & ActivityBar**: Extracted from `IdeLayout.tsx` for better maintainability.
- **Feature-Based Structure**: Organized code into `features/` (AI, Editor, Explorer, Terminal) and `shared/` components.
- **Rust Workspace**: Centralized crate dependencies for faster and more consistent builds.
- **GitHub Actions**: Automated release pipeline for Windows (NSIS/MSI).
- **AI Integration**: Base infrastructure for AI-powered coding assistance.
- **Multi-root Kernel**: Separation of concerns between `kernel-core`, `kernel-lsp`, and `kernel-ai`.

### Fixed
- **Tauri Dialog API**: Resolved compilation errors with `MessageDialogButtons` and `MessageDialogKind`.
- **Dependency Version Mismatch**: Unified versioning across `package.json`, `Cargo.toml`, and `tauri.conf.json`.

### Changed
- Refactored `IdeLayout.tsx` to reduce monolithic file size.
- Improved layout responsiveness and glassmorphism styling.
