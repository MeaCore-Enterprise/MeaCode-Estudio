# Limpiar Archivos de Build de Rust del Repositorio

Si accidentalmente agregaste archivos de build de Rust al repositorio, aquí está cómo limpiarlos.

## Problema

Los archivos de build de Rust (en `src-tauri/target/` y `src-tauri/target2/`) no deberían estar en el repositorio porque:
- Son archivos generados (pueden recrearse con `cargo build`)
- Son muy grandes (cientos de MB)
- Cambian constantemente
- No son necesarios para otros desarrolladores

## Solución

### Opción 1: Usar el Script (Recomendado)

**Windows (PowerShell):**
```powershell
.\scripts\clean-rust-build.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/clean-rust-build.sh
./scripts/clean-rust-build.sh
```

### Opción 2: Manual

1. **Remover del índice de Git** (pero mantener localmente):
```bash
git rm -r --cached src-tauri/target/
git rm -r --cached src-tauri/target2/
```

2. **Remover archivos .json de build**:
```bash
# Windows PowerShell
Get-ChildItem -Path "src-tauri" -Recurse -Include "*.json" | Where-Object {
    $_.FullName -match "target" -or $_.FullName -match "\.fingerprint"
} | ForEach-Object { git rm --cached $_.FullName }

# Linux/macOS
find src-tauri/target src-tauri/target2 -name "*.json" -type f -exec git rm --cached {} \;
```

3. **Verificar que .gitignore esté actualizado**:
El archivo `.gitignore` ya incluye reglas para excluir estos archivos.

4. **Hacer commit**:
```bash
git add .gitignore
git commit -m "chore: remove Rust build artifacts from repository"
```

## Verificar

Después de limpiar, verifica que los archivos ya no estén rastreados:

```bash
git status
```

No deberías ver archivos de `target/` o `target2/` en la lista.

## Prevenir en el Futuro

El `.gitignore` ya está configurado para ignorar estos archivos. Asegúrate de:

1. **No hacer `git add .` sin revisar**:
   ```bash
   git add .  # ⚠️ Puede agregar archivos no deseados
   ```

2. **Usar `git status` antes de commit**:
   ```bash
   git status  # Revisa qué se va a agregar
   ```

3. **Usar `git add` específico**:
   ```bash
   git add src/ package.json  # Agrega solo lo necesario
   ```

## Archivos que DEBEN estar en el Repositorio

✅ **Sí incluir:**
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src-tauri/src/*.rs`
- `src-tauri/build.rs`

❌ **NO incluir:**
- `src-tauri/target/` (cualquier cosa dentro)
- `src-tauri/target2/` (cualquier cosa dentro)
- `src-tauri/Cargo.lock` (opcional, pero generalmente se excluye)
- Archivos `.exe`, `.pdb`, `.d`, `.rlib`, etc. generados

## Si los Archivos Ya Están en el Historial

Si los archivos ya fueron commiteados anteriormente:

1. **Limpiar del índice** (como arriba)
2. **Hacer commit** de la limpieza
3. **Opcional**: Usar `git filter-branch` o `git filter-repo` para limpiar el historial (avanzado)

---

**Nota**: Los archivos seguirán existiendo localmente después de `git rm --cached`. Solo se remueven del índice de Git. Para eliminarlos completamente, bórralos manualmente después de verificar que el build funciona.

