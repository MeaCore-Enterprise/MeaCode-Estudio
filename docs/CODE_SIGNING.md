# Code Signing para MeaCode Estudio

## ¿Qué es Code Signing?

Code Signing es el proceso de firmar digitalmente tu aplicación con un certificado que verifica:
- **Autenticidad**: Confirma que la aplicación viene de ti (el desarrollador)
- **Integridad**: Garantiza que la aplicación no ha sido modificada después de ser firmada
- **Confianza**: Los usuarios ven que la aplicación es legítima y no un malware

## ¿Por qué es Importante?

### Sin Code Signing:
- ⚠️ Windows muestra advertencias de "Unknown Publisher"
- ⚠️ macOS bloquea la aplicación por defecto
- ⚠️ Los usuarios deben hacer clic en "Ejecutar de todas formas"
- ⚠️ Menor confianza del usuario
- ⚠️ Posibles problemas con auto-updates

### Con Code Signing:
- ✅ Sin advertencias de seguridad
- ✅ Instalación fluida
- ✅ Mayor confianza del usuario
- ✅ Auto-updates funcionan correctamente
- ✅ Aplicación aparece como "verificada"

## Certificados Necesarios

### Windows

#### Opción 1: Certificado de Code Signing (Recomendado)
**Costo:** ~$200-400 USD/año

**Proveedores:**
- **DigiCert** - https://www.digicert.com/
- **Sectigo (antes Comodo)** - https://sectigo.com/
- **GlobalSign** - https://www.globalsign.com/
- **SSL.com** - https://www.ssl.com/

**Proceso:**
1. Comprar certificado de Code Signing
2. Verificar identidad (proceso de validación)
3. Recibir certificado (.pfx o .p12)
4. Configurar en Tauri

#### Opción 2: Certificado de Windows Store (Gratis con cuenta de desarrollador)
**Costo:** $19 USD/año (cuenta de desarrollador de Microsoft)

**Proceso:**
1. Crear cuenta de desarrollador en Microsoft Partner Center
2. Obtener certificado desde el portal
3. Usar para firmar aplicaciones

### macOS

#### Certificado de Apple Developer
**Costo:** $99 USD/año

**Proceso:**
1. Unirse al Apple Developer Program
2. Crear certificado de "Developer ID Application" en Xcode
3. Exportar certificado
4. Configurar en Tauri

## Configuración en Tauri

### Windows

1. **Obtener certificado** (.pfx o .p12)

2. **Configurar en `tauri.conf.json`:**
```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "TU_THUMBPRINT_AQUI",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

3. **O usar variables de entorno:**
```bash
# Windows
set CERT_PATH=C:\path\to\certificate.pfx
set CERT_PASSWORD=tu_password
```

4. **Firmar durante el build:**
```bash
npm run tauri:build
```

Tauri automáticamente firmará la aplicación si encuentra el certificado.

### macOS

1. **Obtener certificado de Apple Developer**

2. **Configurar en `tauri.conf.json`:**
```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "signingIdentity": "Developer ID Application: Tu Nombre (TEAM_ID)"
      }
    }
  }
}
```

3. **O usar variables de entorno:**
```bash
# macOS
export APPLE_CERTIFICATE="Developer ID Application: Tu Nombre"
export APPLE_CERTIFICATE_PASSWORD="password"
```

4. **Firmar y notarizar:**
```bash
npm run tauri:build
```

## Proceso de Firma

### Windows (signtool)

```bash
# Firmar ejecutable
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com "path\to\app.exe"

# Verificar firma
signtool verify /pa "path\to\app.exe"
```

### macOS (codesign)

```bash
# Firmar aplicación
codesign --force --deep --sign "Developer ID Application: Tu Nombre" "path/to/app.app"

# Verificar firma
codesign --verify --verbose "path/to/app.app"

# Notarizar (requerido para distribución fuera del App Store)
xcrun notarytool submit "path/to/app.dmg" --keychain-profile "notary-profile" --wait
```

## Configuración Automática con Tauri

Tauri puede firmar automáticamente durante el build. Configura en `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["msi", "nsis", "app", "dmg"],
      "windows": {
        "certificateThumbprint": "${CERT_THUMBPRINT}",
        "digestAlgorithm": "sha256"
      },
      "macOS": {
        "signingIdentity": "${APPLE_SIGNING_IDENTITY}"
      }
    }
  }
}
```

## Alternativas Gratuitas (Solo para Desarrollo)

### Windows
- **Self-signed certificate** (solo para testing local)
- No es confiable para distribución pública

### macOS
- **Ad-hoc signing** (solo para desarrollo)
- No funciona para distribución

## Costos Estimados

| Plataforma | Certificado | Costo Anual |
|------------|-------------|-------------|
| Windows | Code Signing Certificate | $200-400 USD |
| Windows | Microsoft Store Dev | $19 USD |
| macOS | Apple Developer | $99 USD |
| Linux | No requerido | Gratis |

## Recomendaciones

1. **Para desarrollo local**: No es necesario
2. **Para distribución beta**: Considera certificados básicos
3. **Para producción**: Invierte en certificados oficiales
4. **Para ambas plataformas**: Presupuesta ~$300-500 USD/año

## Pasos Siguientes

1. **Decidir plataformas objetivo** (Windows, macOS, ambos)
2. **Presupuestar certificados**
3. **Comprar certificados** cuando estés listo para distribución
4. **Configurar en Tauri** según las instrucciones arriba
5. **Probar firma** en builds de desarrollo primero

## Notas Importantes

- ⚠️ Los certificados expiran (generalmente 1-3 años)
- ⚠️ Mantén los certificados seguros (no los subas a Git)
- ⚠️ Usa variables de entorno para credenciales
- ⚠️ El proceso de validación puede tomar días
- ⚠️ Para macOS, también necesitas notarización para distribución

## Recursos Adicionales

- [Tauri Code Signing Docs](https://tauri.app/v1/guides/building/signing)
- [Windows Code Signing Guide](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [Apple Code Signing Guide](https://developer.apple.com/documentation/security/code_signing_services)

