# Checklist Pre-Commit - MeaCode Estudio

## ✅ Verificación Rápida

Antes de hacer `git commit`, ejecuta estos comandos:

### 1. Verificar Estado
```bash
git status
```

### 2. Verificar que NO hay archivos de build
```bash
# Windows PowerShell
git status | Select-String -Pattern "target"

# Linux/macOS
git status | grep target
```

**Resultado esperado**: No debería mostrar archivos de `target/` o `target2/`

### 3. Verificar que NO hay node_modules
```bash
git status | Select-String -Pattern "node_modules"
```

**Resultado esperado**: No debería mostrar `node_modules/`

### 4. Verificar que NO hay .env
```bash
git status | Select-String -Pattern "\.env"
```

**Resultado esperado**: No debería mostrar archivos `.env`

## 📋 Lista de Archivos Seguros para Commit

### ✅ SEGURO - Puedes hacer commit de estos:

**Código Fuente:**
- ✅ `src/` (todo el directorio)
- ✅ `src-tauri/src/*.rs` (solo archivos Rust)
- ✅ `src-tauri/Cargo.toml`
- ✅ `src-tauri/tauri.conf.json`
- ✅ `src-tauri/build.rs`

**Configuración:**
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `tsconfig.json`
- ✅ `next.config.ts`
- ✅ `tailwind.config.ts`
- ✅ `postcss.config.mjs`
- ✅ `vitest.config.ts`
- ✅ `playwright.config.ts`

**Tests:**
- ✅ `src/test/` (todos los tests)
- ✅ `e2e/` (todos los tests E2E)

**Documentación:**
- ✅ `README.md`
- ✅ `CONTRIBUTING.md`
- ✅ `CHANGELOG.md`
- ✅ `ROADMAP.md`
- ✅ `ARCHITECTURE.md`
- ✅ `API.md`
- ✅ `docs/` (toda la documentación)
- ✅ `COMMIT_GUIDE.md`
- ✅ `QUICK_COMMIT.md`

**Configuración Git:**
- ✅ `.gitignore`
- ✅ `.gitattributes`

**CI/CD:**
- ✅ `.github/workflows/`

**Scripts:**
- ✅ `scripts/`

## ❌ NO SEGURO - NO hacer commit de estos:

- ❌ `src-tauri/target/` (cualquier cosa dentro)
- ❌ `src-tauri/target2/` (cualquier cosa dentro)
- ❌ `src-tauri/**/.fingerprint/` (cualquier cosa dentro)
- ❌ `src-tauri/**/build/` (cualquier cosa dentro)
- ❌ `src-tauri/**/deps/` (cualquier cosa dentro)
- ❌ `src-tauri/**/incremental/` (cualquier cosa dentro)
- ❌ `src-tauri/**/*.exe`
- ❌ `src-tauri/**/*.pdb`
- ❌ `src-tauri/**/*.json` (dentro de target, excepto configs)
- ❌ `node_modules/`
- ❌ `.env` o `.env.local`
- ❌ `*.pfx`, `*.p12`, `*.key` (certificados)
- ❌ `.next/`, `out/`, `build/`
- ❌ `coverage/`, `playwright-report/`, `test-results/`

## 🚀 Comando de Commit Recomendado

```bash
# 1. Verificar estado
git status

# 2. Si ves archivos de target, limpiarlos primero
.\scripts\clean-rust-build.ps1

# 3. Agregar archivos (git add . es seguro si .gitignore está bien)
git add .

# 4. Verificar nuevamente
git status

# 5. Si todo está bien, hacer commit
git commit -m "feat: complete MeaCode Estudio implementation

- Authentication system with Firebase
- Subscription system with Stripe
- Complete Git integration
- AI-powered IntelliSense
- Multi-GPU support
- Code Canvas with drag-and-drop
- Performance optimizations
- Enhanced Preview Panel
- E2E tests with Playwright
- Complete documentation"
```

## ⚠️ Si Aparecen Archivos de Build

Si `git status` muestra archivos de `target/` o `target2/`:

1. **Verificar .gitignore**:
   ```bash
   cat .gitignore | grep target
   ```

2. **Limpiar del índice**:
   ```bash
   .\scripts\clean-rust-build.ps1
   ```

3. **Verificar nuevamente**:
   ```bash
   git status
   ```

4. **Si persisten**, remover manualmente:
   ```bash
   git rm -r --cached src-tauri/target/
   git rm -r --cached src-tauri/target2/
   ```

## ✅ Confirmación Final

Antes de hacer push, verifica:

- [ ] `git status` no muestra archivos de build
- [ ] `git status` no muestra `node_modules/`
- [ ] `git status` no muestra archivos `.env`
- [ ] Los tests pasan: `npm run test`
- [ ] No hay errores de lint: `npm run lint`

---

**Recuerda**: Los archivos de build son grandes (cientos de MB) y no deben estar en el repositorio. El `.gitignore` ya está configurado para excluirlos automáticamente.

