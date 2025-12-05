# Guía de Commit - MeaCode Estudio

## ✅ Archivos Listos para Commit

### Código Fuente
- ✅ `src/` - Todo el código fuente frontend
- ✅ `src-tauri/src/` - Código Rust (solo archivos .rs)
- ✅ `src-tauri/Cargo.toml` - Configuración de Rust
- ✅ `src-tauri/tauri.conf.json` - Configuración de Tauri
- ✅ `package.json` - Dependencias Node.js
- ✅ `package-lock.json` - Lock file de dependencias

### Configuración
- ✅ `tsconfig.json` - Configuración TypeScript
- ✅ `next.config.ts` - Configuración Next.js
- ✅ `tailwind.config.ts` - Configuración Tailwind
- ✅ `postcss.config.mjs` - Configuración PostCSS
- ✅ `vitest.config.ts` - Configuración de tests
- ✅ `playwright.config.ts` - Configuración E2E tests
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `.gitattributes` - Atributos de Git

### Tests
- ✅ `src/test/` - Tests unitarios
- ✅ `e2e/` - Tests E2E

### Documentación
- ✅ `README.md`
- ✅ `CONTRIBUTING.md`
- ✅ `CHANGELOG.md`
- ✅ `ROADMAP.md`
- ✅ `ARCHITECTURE.md`
- ✅ `API.md`
- ✅ `docs/` - Toda la documentación

### Scripts
- ✅ `scripts/` - Scripts de utilidad

### CI/CD
- ✅ `.github/workflows/` - GitHub Actions

## ❌ Archivos que NO Debes Hacer Commit

### Build Artifacts
- ❌ `src-tauri/target/` - Build de Rust
- ❌ `src-tauri/target2/` - Build alternativo de Rust
- ❌ `src-tauri/**/.fingerprint/` - Fingerprints de build
- ❌ `src-tauri/**/build/` - Archivos de build
- ❌ `src-tauri/**/deps/` - Dependencias compiladas
- ❌ `src-tauri/**/incremental/` - Cache incremental
- ❌ `src-tauri/**/*.exe` - Ejecutables
- ❌ `src-tauri/**/*.pdb` - Debug symbols
- ❌ `src-tauri/**/*.json` dentro de target (excepto configs)

### Node.js
- ❌ `node_modules/` - Dependencias
- ❌ `.next/` - Build de Next.js
- ❌ `out/` - Output de Next.js
- ❌ `*.tsbuildinfo` - Cache de TypeScript

### Tests
- ❌ `coverage/` - Cobertura de tests
- ❌ `playwright-report/` - Reportes de Playwright
- ❌ `test-results/` - Resultados de tests

### Variables de Entorno
- ❌ `.env` - Variables de entorno
- ❌ `.env.local` - Variables locales
- ❌ `.env*.local` - Cualquier .env local

### Certificados
- ❌ `*.pfx` - Certificados Windows
- ❌ `*.p12` - Certificados macOS
- ❌ `*.key` - Claves privadas
- ❌ `*.pem` - Certificados PEM

### IDE y OS
- ❌ `.vscode/` (opcional, algunos proyectos lo incluyen)
- ❌ `.idea/` - Configuración IntelliJ
- ❌ `.DS_Store` - macOS
- ❌ `Thumbs.db` - Windows

## 🔧 Comandos Útiles

### Ver qué se va a commitear
```bash
git status
```

### Agregar solo archivos específicos
```bash
git add src/ package.json README.md
```

### Ver qué archivos están siendo rastreados (pero deberían ignorarse)
```bash
git ls-files | grep -E "(target|node_modules|\.env)"
```

### Limpiar archivos de build del índice
```bash
# Windows PowerShell
.\scripts\clean-rust-build.ps1

# Linux/macOS
./scripts/clean-rust-build.sh
```

## 📝 Checklist Antes de Commit

Antes de hacer commit, verifica:

- [ ] `git status` no muestra archivos de `target/` o `target2/`
- [ ] No hay archivos `.env` o `.env.local`
- [ ] No hay certificados (`.pfx`, `.p12`, `.key`)
- [ ] `node_modules/` no está en el staging
- [ ] Solo estás agregando código fuente y documentación
- [ ] Los tests pasan: `npm run test`

## 🚀 Comando de Commit Recomendado

```bash
# 1. Verificar estado
git status

# 2. Agregar archivos específicos (evita git add .)
git add src/ src-tauri/src/ src-tauri/Cargo.toml src-tauri/tauri.conf.json
git add package.json package-lock.json
git add *.md docs/ .github/
git add .gitignore .gitattributes
git add e2e/ src/test/ vitest.config.ts playwright.config.ts

# 3. Verificar qué se agregó
git status

# 4. Hacer commit
git commit -m "feat: implement complete plan - auth, subscriptions, git, AI, GPU, canvas, tests, docs"
```

## ⚠️ Si Ya Commiteaste Archivos de Build

Si accidentalmente commiteaste archivos de build:

1. **Limpiar del índice**:
   ```bash
   git rm -r --cached src-tauri/target/
   git rm -r --cached src-tauri/target2/
   ```

2. **Actualizar .gitignore** (ya está actualizado)

3. **Commit de la limpieza**:
   ```bash
   git add .gitignore
   git commit -m "chore: remove Rust build artifacts from repository"
   ```

4. **Los archivos seguirán en el historial**, pero ya no se rastrearán

---

**Recuerda**: Los archivos de build son grandes y cambian constantemente. Siempre revisa `git status` antes de hacer commit.

