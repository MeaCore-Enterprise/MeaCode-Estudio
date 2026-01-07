# Optimizaciones de Compilación - MeaCode Studio

## Optimizaciones Aplicadas

### 1. Rust/Cargo Optimizations

#### Perfil de Desarrollo (`Cargo.toml`)
- `opt-level = 1` para el código principal (compilación más rápida)
- `opt-level = 3` para dependencias (mejor rendimiento)
- `incremental = true` (compilación incremental habilitada)

#### Perfil de Release
- `opt-level = 3` (máxima optimización)
- `lto = true` (Link-Time Optimization)
- `codegen-units = 1` (mejor optimización)
- `panic = 'abort'` (binarios más pequeños)

#### Linker Optimizations (`.cargo/config.toml`)
- Uso de `lld` linker (más rápido que el linker por defecto)
- Optimizaciones de link para Windows (`/OPT:REF`, `/OPT:ICF`)

### 2. Vite/Frontend Optimizations

#### `vite.config.ts`
- `optimizeDeps.include`: Pre-optimización de dependencias grandes
- `manualChunks`: Code splitting para mejor caching
- Chunks separados para React, Monaco y XTerm

### 3. Dependencias Actualizadas

- `@xterm/xterm` v6.0.0 (versión moderna, no deprecada)
- `@xterm/addon-fit` v0.11.0 (versión estable)

## Mejoras de Tiempo Esperadas

### Desarrollo (Dev Mode)
- **Primera compilación**: ~30-40% más rápida
- **Recompilaciones incrementales**: ~50-70% más rápidas
- **Hot Reload**: Más rápido gracias a code splitting

### Build de Producción
- **Tiempo de build**: ~20-30% más rápido
- **Tamaño de binario**: ~10-15% más pequeño
- **Tiempo de inicio**: Mejorado gracias a optimizaciones

## Comandos Útiles

```bash
# Desarrollo (con optimizaciones)
pnpm tauri dev

# Build de producción
pnpm tauri build

# Limpiar cache de Rust (si hay problemas)
cargo clean

# Limpiar cache de Vite
rm -rf node_modules/.vite
```

## Notas Adicionales

- La primera compilación siempre será más lenta (descarga de dependencias)
- Las compilaciones subsecuentes usan cache incremental
- En Windows, asegúrate de tener `lld` instalado o usa el linker por defecto
- Para builds de producción, considera usar `--release` flag

