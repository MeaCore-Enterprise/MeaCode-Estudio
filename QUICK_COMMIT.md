# Guía Rápida de Commit

## ✅ Archivos Listos para Commit

Todos estos archivos están listos y son seguros para commit:

### Código
- `src/` - Todo el código fuente
- `src-tauri/src/` - Código Rust (solo .rs)
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

### Configuración
- `package.json`, `package-lock.json`
- `tsconfig.json`, `next.config.ts`, etc.
- `.gitignore`, `.gitattributes`

### Tests
- `src/test/` - Tests unitarios
- `e2e/` - Tests E2E
- `vitest.config.ts`, `playwright.config.ts`

### Documentación
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`
- `ARCHITECTURE.md`, `API.md`, `ROADMAP.md`
- `docs/` - Toda la documentación

### CI/CD
- `.github/workflows/`

## ❌ NO Hacer Commit

- `src-tauri/target/` y `src-tauri/target2/` - Build de Rust
- `node_modules/` - Dependencias
- `.env*` - Variables de entorno
- `*.pfx`, `*.p12`, `*.key` - Certificados

## 🚀 Comando Rápido

```bash
# Ver qué se va a agregar
git status

# Agregar todo excepto lo ignorado
git add .

# Verificar que NO hay archivos de target
git status | grep -i target

# Si está limpio, hacer commit
git commit -m "feat: complete implementation of MeaCode Estudio plan"
```

## 🔧 Si Hay Archivos de Build en el Staging

```bash
# Remover del staging (pero mantener localmente)
git reset HEAD src-tauri/target/
git reset HEAD src-tauri/target2/

# O usar el script
.\scripts\clean-rust-build.ps1
```

