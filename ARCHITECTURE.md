# MeaCode Studio - Project Architecture

This document describes the organization and architecture of MeaCode Studio to ensure scalability and maintainability.

## Directory Structure

### `/apps` (Planned)
Future entry points for different platforms.

### `/kernel`
Core logic written in Rust. Organized as a Cargo workspace.
- `kernel-core`: Core engine logic.
- `kernel-lsp`: Language Server Protocol integration.
- `kernel-ai`: AI and LLM integration.

### `/src` (Frontend)
The frontend is built with React, TypeScript, and Tailwind CSS. It follows a **Feature-Based Architecture**.

- `api/`: IPC (Inter-Process Communication) wrappers for Tauri commands.
- `core/`: Global state management, context providers, and core application logic.
- `features/`: Isolated feature modules. Each feature contains its own components, hooks, and logic.
    - `editor/`: Monaco editor integration and file editing.
    - `explorer/`: File system navigation.
    - `terminal/`: Integrated terminal.
    - `ai/`: AI chat and assistance.
    - `settings/`: Application configuration.
- `shared/`: Reusable resources used across multiple features.
    - `components/`: Generic UI components (buttons, modals, etc.).
    - `hooks/`: Generic React hooks.
    - `utils/`: Helper functions.
- `layout/`: Main application shell and layout-specific components.

### `/src-tauri`
The Tauri backend configuration and main entry point for the desktop application.

## Scaling Principles
1.  **Isolation**: Keep features as independent as possible.
2.  **Shared vs. Feature**: Only put code in `shared/` if it is truly generic. If it's specific to a feature, keep it inside `features/`.
3.  **Rust for Heavy Lifting**: Perform performance-critical or system-level tasks in the Rust kernel crates.
4.  **Small Components**: Avoid large monolithic files. Break down complex components into smaller ones.
