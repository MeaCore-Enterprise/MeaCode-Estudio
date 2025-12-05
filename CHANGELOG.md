# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Sistema de autenticación con Firebase Auth
- Sistema de suscripciones con Stripe (Free, Basic, Premium)
- Integración completa de Git (commit, push, pull, branches)
- Detección de GPUs multi-GPU
- Panel de suscripciones en Settings
- Verificación de límites de requests de IA
- Componentes de login y registro
- IntelliSense mejorado con IA real (Gemini API)
- Sistema de cache para sugerencias de IntelliSense
- MeaCode Panel funcional con orquestación de herramientas
- Code Canvas con drag-and-drop de bloques
- Exportación de canvas a código
- Optimizaciones de rendimiento (debounce, throttle, virtual scrolling)
- Tab de Canvas integrado en Editor Panel
- Panel de configuración de GPU en Settings
- Preview Panel mejorado con hot reload y soporte React/Vue
- Network inspector en Preview Panel
- Framework detection automático
- Suite de tests con Vitest
- Tests E2E completos con Playwright
- Configuración de CI/CD con GitHub Actions
- Documentación completa (ARCHITECTURE.md, API.md)
- Guías de usuario detalladas (USER_GUIDE.md, QUICK_START.md)
- Documentación de Code Signing (CODE_SIGNING.md)

### Changed
- Actualizado Source Control Panel para usar comandos Git reales
- Mejorado AI Chat Panel con verificación de suscripción
- Actualizado layout principal para incluir Auth y Subscription providers

### Fixed
- Correcciones menores de UI

## [0.1.0] - 2024-12-XX

### Added
- Editor Monaco básico
- Panel de chat de IA (MeaMind)
- File Explorer
- Preview Panel
- Console Panel
- Settings Panel básico
- Soporte para temas claro/oscuro
- Integración inicial con Tauri

[Unreleased]: https://github.com/yourusername/meacode-estudio/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/meacode-estudio/releases/tag/v0.1.0

