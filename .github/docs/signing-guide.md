# Guía de Firma de Binarios para Tauri

Esta guía explica cómo configurar las claves de firma para habilitar el sistema de auto-actualización de MeaCode Studio.

## ¿Qué son las claves de firma?

Las claves de firma permiten:
- ✅ **Firmar binarios** para verificar su autenticidad
- ✅ **Habilitar el auto-updater** de Tauri (actualizaciones automáticas)
- ✅ **Proteger a los usuarios** contra binarios modificados

**Sin claves de firma:**
- ✅ Los builds funcionan normalmente
- ✅ La instalación manual funciona
- ❌ El auto-updater NO funcionará
- ❌ Los binarios no estarán firmados

## Generación de Claves

### Opción 1: Usando el Script Automatizado (Recomendado)

1. **Ejecuta el script de generación:**
   ```powershell
   .\scripts\generate-keys.ps1
   ```

2. **El script:**
   - Genera la clave privada y pública
   - Actualiza `src-tauri/tauri.conf.json` automáticamente
   - Crea un archivo `tauri-keys-info.txt` con toda la información

3. **Sigue las instrucciones** que muestra el script para configurar los GitHub Secrets.

### Opción 2: Generación Manual

1. **Navega al directorio de Tauri:**
   ```bash
   cd src-tauri
   ```

2. **Genera las claves:**
   ```bash
   pnpm tauri signer generate -w ~/.tauri/meacode-studio.key
   ```

3. **Cuando se te pida:**
   - Ingresa una contraseña segura (guárdala, la necesitarás)
   - Confirma la contraseña

4. **El comando mostrará:**
   - La **clave pública** (publkey) - cópiala
   - La ubicación de la **clave privada** (normalmente `~/.tauri/meacode-studio.key`)

5. **Actualiza `src-tauri/tauri.conf.json`:**
   ```json
   {
     "tauri": {
       "updater": {
         "active": true,
         "endpoints": [...],
         "dialog": true,
         "pubkey": "TU_CLAVE_PUBLICA_AQUI"
       }
     }
   }
   ```

## Configuración de GitHub Secrets

Para que los builds en GitHub Actions usen las claves de firma:

1. **Ve a tu repositorio en GitHub:**
   ```
   https://github.com/TU_USUARIO/TU_REPO/settings/secrets/actions
   ```

2. **Crea los siguientes secrets:**

   | Secret Name | Valor | Descripción |
   |------------|-------|-------------|
   | `TAURI_SIGNING_PRIVATE_KEY` | Contenido completo del archivo `.key` | La clave privada generada |
   | `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | La contraseña que usaste | La contraseña para desencriptar la clave |
   | `TAURI_PRIVATE_KEY` | Mismo que `TAURI_SIGNING_PRIVATE_KEY` | Alias requerido para Windows |

3. **Para obtener la clave privada:**
   ```bash
   # Linux/macOS
   cat ~/.tauri/meacode-studio.key
   
   # Windows PowerShell
   Get-Content $env:USERPROFILE\.tauri\meacode-studio.key
   ```

4. **Copia TODO el contenido** del archivo (incluyendo las líneas `-----BEGIN...` y `-----END...`)

## Verificación

Después de configurar los secrets:

1. **Crea un tag de release:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Revisa el workflow `release.yml`:**
   - Debería mostrar: `✅ Signing keys found - builds will be signed`
   - Los binarios se firmarán automáticamente
   - El auto-updater funcionará

## ¿Qué hacer si no tienes claves?

**No pasa nada.** Los workflows están diseñados para funcionar sin claves:

- ✅ **build.yml** - Funciona sin claves (solo verificación)
- ✅ **release.yml** - Funciona sin claves (builds sin firma)
- ⚠️ **Auto-updater** - NO funcionará sin claves

### Builds sin firma

Si no configuras las claves:
- Los builds se completarán exitosamente
- Los binarios se generarán normalmente
- La instalación manual funcionará
- El auto-updater estará deshabilitado

El workflow mostrará un warning pero **no fallará**:
```
⚠️ WARNING: Signing keys not found!
⚠️ Build will continue WITHOUT signing:
  - Binaries will be built successfully
  - Auto-updater will NOT work (requires signed binaries)
  - Manual installation will work fine
```

## Troubleshooting

### Error: "incorrect updater private key password"

**Causa:** La contraseña en el GitHub Secret no coincide con la usada para generar la clave.

**Solución:**
1. Verifica que `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` tenga exactamente la misma contraseña
2. O regenera las claves con una contraseña conocida y actualiza ambos secrets

### Error: "A public key has been found, but no private key"

**Causa:** Falta el secret `TAURI_PRIVATE_KEY` (especialmente en Windows).

**Solución:**
1. Crea el secret `TAURI_PRIVATE_KEY` con el mismo valor que `TAURI_SIGNING_PRIVATE_KEY`

### La clave pública no se actualiza automáticamente

**Solución manual:**
1. Ejecuta: `.\scripts\update-pubkey.ps1 -PublicKey "TU_CLAVE_PUBLICA"`
2. O edita manualmente `src-tauri/tauri.conf.json`

## Seguridad

⚠️ **IMPORTANTE:**
- ❌ **NUNCA** subas la clave privada al repositorio
- ❌ **NUNCA** subas la contraseña al repositorio
- ✅ La clave privada está en `.gitignore`
- ✅ El archivo `tauri-keys-info.txt` está en `.gitignore`
- ✅ Solo usa GitHub Secrets para almacenar las claves

## Referencias

- [Tauri Updater Documentation](https://tauri.app/v1/guides/distribution/updater)
- [Tauri Signer Documentation](https://tauri.app/v1/guides/distribution/signing)
