# MeaCode Estudio

Un IDE potenciado por IA para desarrolladores modernos, construido con Next.js, Tauri y tecnologías de vanguardia.

## Características Principales

- **Editor de Código Avanzado**: Monaco Editor con syntax highlighting, IntelliSense con IA, y soporte multi-lenguaje
- **IA Integrada (MeaMind)**: Asistente de código con contexto completo del proyecto
- **Soporte Multi-GPU**: Aprovecha múltiples GPUs para renderizado y procesamiento de IA
- **Git Integration**: Control de versiones completo integrado
- **Code Canvas**: Editor visual drag-and-drop para construir código
- **Sistema de Suscripciones**: Planes Free, Basic y Premium con Stripe
- **Rendimiento Extremo**: Optimizado para máximo rendimiento y mínimo consumo de recursos

## Requisitos

- Node.js 18+ y npm
- Rust (para compilar Tauri)
- Git (para funcionalidades de control de versiones)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/yourusername/meacode-estudio.git
cd meacode-estudio
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env.local` con:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Google API (para IA)
GOOGLE_API_KEY=your_google_api_key
```

Ver [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) para instrucciones detalladas de configuración.

4. Ejecuta en modo desarrollo:
```bash
npm run tauri:dev
```

## Scripts Disponibles

- `npm run dev` - Inicia Next.js en modo desarrollo
- `npm run tauri:dev` - Inicia la aplicación Tauri en modo desarrollo
- `npm run tauri:build` - Construye la aplicación para producción
- `npm run build` - Construye Next.js para producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
meacode-estudio/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/        # Componentes React
│   ├── contexts/          # Contextos de React (Auth, Subscription, Editor)
│   ├── lib/              # Utilidades y helpers
│   ├── ai/               # Flujos de IA
│   └── types/            # Definiciones de tipos TypeScript
├── src-tauri/            # Backend Rust (Tauri)
│   ├── src/
│   │   ├── main.rs       # Punto de entrada Tauri
│   │   ├── git.rs        # Funcionalidades Git
│   │   └── gpu.rs        # Detección de GPU
│   └── Cargo.toml        # Dependencias Rust
└── package.json          # Dependencias Node.js
```

## Planes de Suscripción

- **Free**: 10 requests IA/día, características básicas
- **Basic** ($9.99/mes): 100 requests IA/día, multi-GPU básico
- **Premium** ($19.99/mes): Ilimitado, multi-GPU avanzado, soporte prioritario

## Desarrollo

### Agregar Nuevas Funcionalidades

1. Para comandos Tauri: Agrega funciones en `src-tauri/src/main.rs` y expórtalas con `#[tauri::command]`
2. Para componentes UI: Crea componentes en `src/components/`
3. Para contextos: Agrega nuevos contextos en `src/contexts/`

### Testing

```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:e2e:ui       # E2E tests con UI
npm run test:e2e:install  # Instalar navegadores para Playwright
```

## Documentación

### Para Usuarios
- **[Guía de Inicio Rápido](docs/QUICK_START.md)** - Empieza en 5 minutos
- **[Guía de Usuario Completa](docs/USER_GUIDE.md)** - Documentación detallada

### Para Desarrolladores
- **[Arquitectura](ARCHITECTURE.md)** - Estructura del proyecto
- **[API Interna](API.md)** - Documentación de comandos y contextos
- **[Code Signing](docs/CODE_SIGNING.md)** - Guía de firma de aplicaciones
- **[Contribuir](CONTRIBUTING.md)** - Cómo contribuir al proyecto

## Contribuir

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso de envío de pull requests.

### Antes de Hacer Commit

**IMPORTANTE**: Revisa [COMMIT_GUIDE.md](COMMIT_GUIDE.md) antes de hacer commit. Asegúrate de no incluir:
- Archivos de build de Rust (`src-tauri/target/`, `src-tauri/target2/`)
- `node_modules/`
- Archivos `.env`
- Certificados (`.pfx`, `.p12`, `.key`)

Si accidentalmente agregaste archivos de build, usa:
```bash
# Windows
.\scripts\clean-rust-build.ps1

# Linux/macOS
./scripts/clean-rust-build.sh
```

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Roadmap

Ver [ROADMAP.md](ROADMAP.md) para el plan de desarrollo hasta Diciembre 2024.
