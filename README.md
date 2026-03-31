# MeaCode Studio

IDE de escritorio orientado a IA, construido con Rust, Tauri y tecnologías web modernas.

## Estado del proyecto

MeaCode Studio está en desarrollo temprano. Algunas funciones son experimentales y pueden cambiar sin previo aviso.

## Características actuales

### Editor
- Editor basado en Monaco con resaltado de sintaxis.
- Soporte de múltiples pestañas.
- Explorador de archivos.
- Paleta de comandos (`Ctrl+Shift+P`).
- Apertura rápida (`Ctrl+P`).

### IA
- Chat integrado con proveedor Nexusify.
- Acciones de código con IA (explicar, corregir, refactorizar).
- Base para sugerencias híbridas (LSP + IA).

### Herramientas
- Terminal integrada con xterm.
- Diagnósticos y ayudas de tipo LSP (base/piloto).
- Panel Run/Debug en evolución.

## Requisitos

- Windows 10+, macOS 10.15+ o Linux (Ubuntu 22.04+).
- Node.js 18+.
- Rust estable (para desarrollo).
- Espacio libre recomendado: 500 MB o más.

## Instalación

### Desde releases
1. Descarga la versión más reciente desde [GitHub Releases](https://github.com/MeaCore-Enterprise/MeaCode-Studio/releases).
2. Ejecuta el instalador.
3. Abre MeaCode Studio.

### Linux (.deb / AppImage)
- El pipeline `Linux Release` genera artefactos `.deb` y `.AppImage` en cada tag de versión.
- Recomendado para Ubuntu/Debian: instalar el `.deb` para integración con menú de aplicaciones y centros de software.
- Instalación manual:
  ```bash
  sudo apt install ./meacode-studio_<version>_amd64.deb
  ```

### Para desarrollo
1. Clona el repositorio:
   ```bash
   git clone https://github.com/MeaCore-Enterprise/MeaCode-Studio.git
   cd MeaCode-Studio
   ```
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Ejecuta en modo desarrollo:
   ```bash
   pnpm tauri:dev
   ```
4. Construye para producción:
   ```bash
   pnpm tauri:build
   ```

Guía detallada: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Estructura del proyecto

```text
MeaCode-Estudio/
├── kernel/                   # Backend en Rust
│   ├── kernel-core/          # Núcleo del IDE
│   ├── kernel-lsp/           # Capa LSP
│   └── kernel-ai/            # Capa de IA
├── src/                      # Frontend React + TypeScript
│   ├── components/
│   ├── editor/
│   ├── panels/
│   ├── layout/
│   └── utils/
└── src-tauri/                # Configuración y host Tauri
```

## Actualizaciones automáticas

**Próximamente.** Se está trabajando en un mecanismo de actualización propio que no dependerá de generar ni gestionar las claves de firmado de Tauri.

## Contribución y licencia

- Guía de contribución: [CONTRIBUTING.md](CONTRIBUTING.md)
- Licencia propietaria: [LICENSE](LICENSE)

## Enlaces

- [Guía de desarrollo](docs/DEVELOPMENT.md)
- [Historial de cambios](CHANGELOG.md)

