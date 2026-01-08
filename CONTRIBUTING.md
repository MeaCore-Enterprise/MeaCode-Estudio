# Contributing to MeaCode Studio

Thank you for your interest in contributing to MeaCode Studio! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and professional environment.

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or suggest features
- Provide clear descriptions, steps to reproduce, and relevant system information
- Check existing issues before creating a new one

### Pull Requests

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Submit a pull request** with a clear description of your changes

## Development Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 9.0.0 or higher
- **Rust**: Latest stable version
- **Git**: For version control

### Initial Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MeaCode-Studio.git
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

### Project Structure

```
MeaCode-Estudio/
├── kernel/              # Rust backend
│   ├── kernel-core/    # Core functionality
│   ├── kernel-lsp/     # LSP server
│   └── kernel-ai/       # AI engine
├── src/                 # React frontend
│   ├── components/     # UI components
│   ├── editor/         # Editor components
│   ├── panels/         # Side panels
│   └── utils/          # Utilities
└── src-tauri/          # Tauri config
```

## Coding Standards

### Rust

- Follow the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `rustfmt` for formatting: `cargo fmt`
- Run `clippy` for linting: `cargo clippy`
- Write tests for new functionality

### TypeScript/React

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components
- Format code with Prettier (configured in the project)
- Use meaningful variable and function names

### Commits

- Write clear, descriptive commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issue numbers when applicable: "Fix #123: Description"

Example:
```
feat: Add file explorer context menu
fix: Resolve terminal resize issue
docs: Update README with installation steps
```

## Branch Strategy

- `main`: Stable, production-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`

## Testing

- Write tests for new features
- Ensure existing tests pass: `pnpm test` (when available)
- Test on your target platform before submitting

## Build and Development

### Development Commands

```bash
# Start development server
pnpm tauri dev

# Build frontend only
pnpm build

# Build Tauri app
pnpm tauri build

# Format code
pnpm format  # (if configured)
```

## Scope Control

**Large refactors or architectural changes must be discussed before submitting a pull request.**

Please open an issue or discussion thread to propose significant changes. This helps ensure:
- Alignment with project goals
- Proper review and planning
- Avoid duplicate work

Examples of changes requiring discussion:
- Major refactoring of core components
- Changes to the project structure
- New major dependencies
- Breaking API changes

## Intellectual Property

**By contributing, you agree that your contributions may be used, modified and distributed as part of proprietary software owned by MeaCore Enterprise.**

This means:
- Your contributions become part of the proprietary codebase
- MeaCore Enterprise retains all rights to the contributed code
- Contributions are subject to the project's proprietary license

## Third-Party Rights

**By submitting a pull request, you confirm that you have the right to submit the code and that it does not violate any third-party licenses.**

Please ensure:
- Code you submit is either original or properly licensed
- You have permission to contribute any third-party code
- All dependencies are compatible with the project's license

## Review Process

1. All pull requests require review before merging
2. Maintainers will review code quality, tests, and alignment with project goals
3. Address feedback promptly and professionally
4. Be patient - reviews may take time depending on complexity

## Questions?

If you have questions about contributing, please:
- Open a discussion on GitHub
- Check existing documentation
- Review closed issues and PRs for similar questions

Thank you for contributing to MeaCode Studio!

