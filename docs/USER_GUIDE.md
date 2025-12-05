# Guía de Usuario - MeaCode Estudio

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Primeros Pasos](#primeros-pasos)
4. [Editor de Código](#editor-de-código)
5. [IA y MeaMind](#ia-y-meamind)
6. [Code Canvas](#code-canvas)
7. [Control de Versiones (Git)](#control-de-versiones-git)
8. [Configuración](#configuración)
9. [Suscripciones](#suscripciones)
10. [Atajos de Teclado](#atajos-de-teclado)
11. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

MeaCode Estudio es un IDE potenciado por IA diseñado para desarrolladores modernos. Combina un editor de código avanzado, asistencia de IA, herramientas visuales y control de versiones integrado.

### Características Principales

- ✨ **Editor de Código Avanzado** con syntax highlighting
- 🤖 **IA Integrada (MeaMind)** para asistencia inteligente
- 🎨 **Code Canvas** para construcción visual de código
- 🔄 **Git Integration** completa
- 🚀 **Multi-GPU Support** para máximo rendimiento
- 💳 **Sistema de Suscripciones** con planes flexibles

---

## Instalación

### Requisitos del Sistema

- **Windows**: Windows 10 o superior
- **macOS**: macOS 10.15 o superior
- **Linux**: Ubuntu 20.04+ / Fedora 34+ / Debian 11+
- **RAM**: Mínimo 4GB (recomendado 8GB+)
- **Espacio**: 500MB libres

### Descargar e Instalar

1. **Descarga la aplicación** desde el sitio oficial
2. **Ejecuta el instalador**
   - Windows: `.msi` o `.exe`
   - macOS: `.dmg` (arrastra a Applications)
   - Linux: `.AppImage` (dar permisos de ejecución)
3. **Abre MeaCode Estudio** desde el menú de aplicaciones

### Primera Configuración

Al abrir por primera vez:

1. **Crea una cuenta** o inicia sesión
   - Puedes usar email/password o Google
2. **Selecciona tu plan** (Free, Basic, o Premium)
3. **Configura tu workspace** (opcional)
4. **¡Listo para empezar!**

---

## Primeros Pasos

### Abrir un Proyecto

1. **Clic en "Open Folder"** en la barra de herramientas
2. **Selecciona la carpeta** de tu proyecto
3. El explorador de archivos se actualizará automáticamente

### Crear un Nuevo Archivo

1. **Clic en "New"** en la barra superior
2. **Ingresa el nombre** del archivo (ej: `app.js`)
3. El archivo se creará y abrirá automáticamente

### Guardar Archivos

- **Ctrl+S** (Windows/Linux) o **Cmd+S** (macOS): Guardar
- **Ctrl+Shift+S** (Windows/Linux) o **Cmd+Shift+S** (macOS): Guardar como

---

## Editor de Código

### Características del Editor

#### Syntax Highlighting
El editor resalta automáticamente la sintaxis según el lenguaje:
- JavaScript/TypeScript
- Python
- HTML/CSS
- JSON
- Y más...

#### IntelliSense con IA
- **Sugerencias automáticas** mientras escribes
- **Detección de errores** en tiempo real
- **Completado inteligente** basado en contexto
- **Refactorización sugerida**

**Cómo usar:**
- Escribe código normalmente
- Las sugerencias aparecen automáticamente
- Presiona **Tab** para aceptar una sugerencia
- Presiona **Esc** para cancelar

#### Múltiples Pestañas
- Abre varios archivos simultáneamente
- Cambia entre archivos con clic en las pestañas
- Cierra archivos con **X** en la pestaña

#### Búsqueda y Reemplazo
- **Ctrl+F** (Windows/Linux) o **Cmd+F** (macOS): Buscar
- **Ctrl+H** (Windows/Linux) o **Cmd+H** (macOS): Buscar y reemplazar
- **Ctrl+Shift+F**: Buscar en todos los archivos

### Tabs del Editor

El editor tiene 4 tabs principales:

1. **Editor**: Código principal
2. **Canvas**: Editor visual (ver sección Code Canvas)
3. **Console**: Salida de ejecución
4. **Preview**: Vista previa (para HTML/JS)

---

## IA y MeaMind

### ¿Qué es MeaMind?

MeaMind es el asistente de IA integrado que te ayuda a:
- Generar código
- Explicar código existente
- Optimizar código
- Corregir errores
- Responder preguntas sobre programación

### Usar MeaMind

#### Abrir el Panel de Chat

1. **Busca el panel de IA** en la barra lateral
2. **O usa el Command Palette**: **Ctrl+Shift+P** (Windows/Linux) o **Cmd+Shift+P** (macOS)
3. Escribe "AI Chat" y presiona Enter

#### Hacer una Pregunta

1. **Escribe tu pregunta** en el campo de texto
2. **Presiona Enter** o clic en el botón de enviar
3. **Espera la respuesta** de MeaMind

#### Acciones Rápidas

MeaMind incluye botones de acción rápida:

- **Fix Errors**: Corrige errores automáticamente
- **Explicar código**: Explica qué hace tu código
- **Optimize**: Optimiza el código actual
- **Review**: Revisa tu código

#### Aplicar Sugerencias de Código

Cuando MeaMind sugiere código:

1. **Revisa la sugerencia** en el chat
2. **Clic en "Aplicar al editor"** si te gusta
3. El código se insertará automáticamente

### Límites de Requests

Según tu plan:
- **Free**: 10 requests/día
- **Basic**: 100 requests/día
- **Premium**: Ilimitado

El contador se muestra en el panel de IA.

---

## Code Canvas

### ¿Qué es Code Canvas?

Code Canvas es un editor visual donde puedes construir código arrastrando bloques. Perfecto para:
- Prototipar rápidamente
- Visualizar la estructura del código
- Aprender programación
- Generar código desde diagramas

### Usar Code Canvas

#### Abrir Canvas

1. **Abre el tab "Canvas"** en el editor
2. El canvas aparecerá con la biblioteca de bloques a la izquierda

#### Agregar Bloques

1. **Selecciona un bloque** de la biblioteca (Function, Component, etc.)
2. **Arrástralo** al canvas
3. **Suelta** donde quieras colocarlo

#### Conectar Bloques

1. **Haz clic en un nodo** de salida (parte inferior del bloque)
2. **Arrastra** hasta otro bloque
3. **Conecta** con el nodo de entrada

#### Editar Código de Bloques

1. **Doble clic** en un bloque
2. **Edita el código** en el editor que aparece
3. Los cambios se guardan automáticamente

#### Exportar a Código

1. **Clic en "Exportar Código"** en la barra superior
2. El código se generará automáticamente
3. Se creará un nuevo archivo con el código

#### Guardar Proyecto Canvas

1. **Clic en "Guardar Canvas"**
2. **Elige ubicación** y nombre
3. El proyecto se guarda como archivo JSON

#### Cargar Proyecto Canvas

1. **Clic en "Cargar Canvas"**
2. **Selecciona** el archivo JSON guardado
3. El proyecto se cargará en el canvas

### Bloques Disponibles

- **Function**: Funciones JavaScript
- **Component**: Componentes React
- **Class**: Clases JavaScript
- **Variable**: Declaraciones de variables
- **Conditional**: If/else statements
- **Loop**: Bucles for/while

---

## Control de Versiones (Git)

### Panel de Source Control

El panel de Source Control está en la barra lateral. Muestra:
- **Rama actual**
- **Archivos modificados**
- **Archivos sin seguimiento**
- **Archivos en staging**

### Operaciones Básicas

#### Ver Estado

El estado se actualiza automáticamente cada 5 segundos. Verás:
- Archivos modificados (amarillo)
- Archivos en staging (verde)
- Archivos sin seguimiento (gris)

#### Agregar Archivos

1. Los archivos se agregan automáticamente al hacer commit
2. O usa "Stage All" si está disponible

#### Hacer Commit

1. **Escribe un mensaje** en el campo "Commit message"
2. **Clic en "Commit"**
3. El commit se creará localmente

#### Push (Subir Cambios)

1. **Clic en "Push"**
2. Los commits se subirán al remoto
3. Verás confirmación cuando termine

#### Pull (Bajar Cambios)

1. **Clic en "Pull"**
2. Los cambios del remoto se bajarán
3. Se fusionarán automáticamente si es posible

#### Cambiar de Rama

1. **Selecciona la rama** en el dropdown
2. El cambio se hará automáticamente
3. O crea una nueva rama con el botón "+"

### Inicializar Repositorio Git

Si tu proyecto no tiene Git:

1. **Abre terminal** en tu proyecto
2. **Ejecuta**: `git init`
3. El panel de Source Control detectará el repositorio

---

## Configuración

### Abrir Settings

1. **Clic en el icono de Settings** en la barra lateral
2. O usa **Ctrl+,** (Windows/Linux) o **Cmd+,** (macOS)

### Tabs de Configuración

#### General

**Theme:**
- Light: Tema claro
- Dark: Tema oscuro
- System: Seguir sistema operativo

#### GPU

**Configuración de GPU:**
- **GPU para Editor**: Selecciona qué GPU usar para renderizar el editor
- **GPU para IA**: Selecciona qué GPU usar para procesamiento de IA

**Nota**: Requiere plan Basic o Premium para habilitar multi-GPU.

#### Subscription

Ver y gestionar tu suscripción (ver sección Suscripciones).

---

## Suscripciones

### Planes Disponibles

#### Free
- ✅ 10 requests de IA por día
- ✅ Editor básico
- ✅ Git integration
- ✅ Code Canvas básico
- ❌ Sin multi-GPU

#### Basic - $9.99/mes
- ✅ 100 requests de IA por día
- ✅ Multi-GPU básico
- ✅ Todas las funciones del editor
- ✅ Soporte por email

#### Premium - $19.99/mes
- ✅ Requests de IA ilimitados
- ✅ Multi-GPU avanzado
- ✅ Soporte prioritario
- ✅ Acceso anticipado a nuevas funciones
- ✅ Code Canvas avanzado

### Gestionar Suscripción

1. **Abre Settings** → **Subscription**
2. **Ver tu plan actual** y requests restantes
3. **Upgrade**: Clic en "Upgrade" en el plan deseado
4. **Cancel**: Clic en "Cancel Subscription"

### Verificar Límites

El contador de requests se muestra en:
- Panel de IA (badge con número restante)
- Settings → Subscription

---

## Atajos de Teclado

### Navegación

| Acción | Windows/Linux | macOS |
|--------|---------------|-------|
| Abrir archivo | Ctrl+O | Cmd+O |
| Nuevo archivo | Ctrl+N | Cmd+N |
| Guardar | Ctrl+S | Cmd+S |
| Guardar como | Ctrl+Shift+S | Cmd+Shift+S |
| Cerrar archivo | Ctrl+W | Cmd+W |
| Command Palette | Ctrl+Shift+P | Cmd+Shift+P |

### Editor

| Acción | Windows/Linux | macOS |
|--------|---------------|-------|
| Buscar | Ctrl+F | Cmd+F |
| Reemplazar | Ctrl+H | Cmd+H |
| Buscar en archivos | Ctrl+Shift+F | Cmd+Shift+F |
| Ir a línea | Ctrl+G | Cmd+G |
| Comentar línea | Ctrl+/ | Cmd+/ |
| Duplicar línea | Ctrl+Shift+D | Cmd+Shift+D |

### Tabs

| Acción | Windows/Linux | macOS |
|--------|---------------|-------|
| Siguiente tab | Ctrl+Tab | Cmd+Tab |
| Tab anterior | Ctrl+Shift+Tab | Cmd+Shift+Tab |
| Cerrar tab | Ctrl+W | Cmd+W |

### IA

| Acción | Windows/Linux | macOS |
|--------|---------------|-------|
| Abrir chat IA | Ctrl+Shift+I | Cmd+Shift+I |
| Enviar mensaje | Enter | Enter |
| Nueva línea | Shift+Enter | Shift+Enter |

---

## Solución de Problemas

### La aplicación no inicia

1. **Verifica requisitos del sistema**
2. **Reinstala la aplicación**
3. **Revisa logs** en:
   - Windows: `%APPDATA%\MeaCode Estudio\logs`
   - macOS: `~/Library/Logs/MeaCode Estudio`
   - Linux: `~/.config/MeaCode Estudio/logs`

### El editor está lento

1. **Cierra archivos innecesarios**
2. **Revisa configuración de GPU** en Settings
3. **Reduce el tamaño del archivo** (divide en múltiples archivos)
4. **Reinicia la aplicación**

### MeaMind no responde

1. **Verifica tu conexión a internet**
2. **Revisa límites de requests** en Settings
3. **Verifica tu API key** (si usas API propia)
4. **Espera unos segundos** y vuelve a intentar

### Git no funciona

1. **Verifica que Git esté instalado**:
   ```bash
   git --version
   ```
2. **Asegúrate de estar en un repositorio Git**
3. **Revisa permisos** de la carpeta del proyecto

### Preview no muestra cambios

1. **Clic en "Refresh"** en el tab Preview
2. **Verifica que el archivo sea HTML**
3. **Revisa la consola** por errores

### Code Canvas no carga

1. **Refresca el tab Canvas**
2. **Verifica que React Flow esté cargado** (espera unos segundos)
3. **Intenta crear un nuevo proyecto canvas**

### Problemas con suscripción

1. **Verifica tu conexión**
2. **Revisa Settings → Subscription**
3. **Contacta soporte** si el problema persiste

---

## Consejos y Mejores Prácticas

### Optimizar Rendimiento

1. **Cierra archivos que no uses**
2. **Usa Code Canvas** para prototipos grandes
3. **Habilita multi-GPU** si tienes plan Premium
4. **Mantén el workspace organizado**

### Trabajar con IA

1. **Sé específico** en tus preguntas
2. **Proporciona contexto** cuando sea necesario
3. **Revisa sugerencias** antes de aplicarlas
4. **Usa acciones rápidas** para tareas comunes

### Organizar Proyectos

1. **Usa Git** desde el inicio
2. **Haz commits frecuentes**
3. **Usa ramas** para features nuevas
4. **Mantén mensajes de commit claros**

---

## Recursos Adicionales

- **Documentación**: Ver `README.md` y `ARCHITECTURE.md`
- **Contribuir**: Ver `CONTRIBUTING.md`
- **Reportar bugs**: Abre un issue en GitHub
- **Soporte**: Contacta a través del panel de Settings

---

## Actualizaciones

MeaCode Estudio se actualiza automáticamente. Verás notificaciones cuando haya actualizaciones disponibles.

Para verificar manualmente:
1. **Settings** → **About**
2. **Clic en "Check for Updates"**

---

¡Disfruta usando MeaCode Estudio! 🚀

