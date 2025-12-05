# Arquitectura de MeaCode Estudio

## Visión General

MeaCode Estudio es una aplicación de escritorio híbrida construida con:
- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Backend**: Tauri (Rust)
- **Editor**: Monaco Editor
- **IA**: Google Gemini API
- **Autenticación**: Firebase Auth
- **Pagos**: Stripe

## Estructura del Proyecto

```
meacode-estudio/
├── src/                          # Código fuente frontend
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx          # Layout principal con providers
│   │   └── page.tsx            # Página principal
│   ├── components/              # Componentes React
│   │   ├── panels/             # Paneles del IDE
│   │   ├── code-canvas/        # Componentes de Code Canvas
│   │   ├── auth/               # Componentes de autenticación
│   │   └── ui/                 # Componentes UI base (shadcn/ui)
│   ├── contexts/               # Contextos de React
│   │   ├── auth-context.tsx    # Autenticación
│   │   ├── subscription-context.tsx  # Suscripciones
│   │   └── editor-context.tsx  # Estado del editor
│   ├── lib/                    # Utilidades y helpers
│   │   ├── stripe.ts           # Integración Stripe
│   │   ├── gpu-detector.ts     # Detección de GPU
│   │   ├── intellisense-cache.ts  # Cache de IntelliSense
│   │   └── performance-optimizations.ts  # Optimizaciones
│   ├── ai/                     # Flujos de IA
│   │   └── flows/              # Flujos de IA (chat, intellisense)
│   └── test/                   # Tests
├── src-tauri/                  # Backend Rust (Tauri)
│   ├── src/
│   │   ├── main.rs             # Punto de entrada, comandos Tauri
│   │   ├── git.rs              # Funcionalidades Git
│   │   └── gpu.rs              # Detección de GPU
│   └── Cargo.toml              # Dependencias Rust
└── package.json                # Dependencias Node.js
```

## Flujo de Datos

### Autenticación
```
Usuario → LoginDialog → Firebase Auth → AuthContext → SubscriptionContext
```

### Suscripciones
```
Usuario → SubscriptionPanel → Stripe → Backend API → SubscriptionContext
```

### Editor
```
Usuario → EditorPanel → Monaco Editor → EditorContext → File System (Tauri)
```

### IA
```
Usuario → AIChatPanel → Tauri Command → Gemini API → Response → UI
```

### Git
```
Usuario → SourceControlPanel → Tauri Command → Git CLI → Response → UI
```

## Comunicación Frontend-Backend

### Tauri Commands

Los comandos Tauri permiten que el frontend llame a funciones Rust:

```typescript
// Frontend
const result = await invoke('git_status', { workspacePath: '/path' });
```

```rust
// Backend (Rust)
#[tauri::command]
fn git_status(workspace_path: String) -> Result<GitStatus, String> {
  git::get_git_status(&workspace_path)
}
```

### Comandos Disponibles

- **Sistema**: `get_info()`
- **Git**: `git_status`, `git_branches`, `git_commit`, `git_push`, `git_pull`, etc.
- **GPU**: `detect_gpus()`
- **IA**: `ai_chat`, `ai_intellisense`
- **Suscripciones**: `get_subscription`, `create_checkout_session`, `cancel_subscription`

## Contextos de React

### AuthContext
- Estado de autenticación del usuario
- Funciones: `signIn`, `signUp`, `signOut`, `signInWithGoogle`
- Persistencia de sesión

### SubscriptionContext
- Estado de suscripción del usuario
- Límites por plan
- Verificación de features disponibles
- Contador de requests de IA

### EditorContext
- Archivos abiertos
- Archivo activo
- Workspace root
- File system tree
- Console logs
- Funciones de gestión de archivos

## Optimizaciones de Rendimiento

### Lazy Loading
- Componentes pesados cargados con `dynamic()` de Next.js
- Code splitting automático

### Cache
- IntelliSense cache (5 min, 100 entradas)
- LocalStorage para preferencias

### Virtualización
- Helpers para virtual scrolling de listas grandes
- React Window para listas de archivos

### Debounce/Throttle
- Debounce para cambios en editor (120ms)
- Throttle para eventos frecuentes

### Web Workers
- Helpers para procesamiento pesado en background
- Preparado para procesamiento de IA local

## Seguridad

### Autenticación
- Firebase Auth con tokens JWT
- Sesiones persistentes encriptadas

### Permisos
- Tauri permite acceso controlado al sistema de archivos
- Sandbox para iframe de preview

### API Keys
- Variables de entorno para claves sensibles
- No expuestas en el código

## Testing

### Unit Tests
- Vitest para tests unitarios
- Testing Library para componentes React
- Cobertura objetivo: >80%

### Integration Tests
- Tests de comandos Tauri
- Tests de flujos completos

### E2E Tests
- Playwright (pendiente)
- Tests de usuario completos

## Build y Distribución

### Desarrollo
```bash
npm run tauri:dev  # Inicia Tauri en modo desarrollo
```

### Producción
```bash
npm run tauri:build  # Construye aplicación para producción
```

### Targets
- Windows: MSI, NSIS
- macOS: DMG, APP
- Linux: AppImage, DEB, RPM

## Próximas Mejoras

1. **Plugin System**: Sistema de plugins para extensibilidad
2. **Workspace Manager**: Gestión avanzada de proyectos
3. **Collaboration**: Colaboración en tiempo real
4. **Offline Mode**: Funcionalidad completa offline
5. **Performance Monitoring**: Métricas de rendimiento en tiempo real

