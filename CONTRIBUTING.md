# Guía de Contribución a MeaCode Estudio

¡Gracias por tu interés en contribuir a MeaCode Estudio! Esta guía te ayudará a entender cómo puedes contribuir al proyecto.

## Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no haya sido reportado ya en los [Issues](https://github.com/yourusername/meacode-estudio/issues)
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del sistema (OS, versión de Node, etc.)

### Sugerir Funcionalidades

Las sugerencias son bienvenidas. Por favor:

1. Verifica que no haya sido sugerida ya
2. Crea un issue con la etiqueta "enhancement"
3. Describe claramente la funcionalidad y su caso de uso

### Pull Requests

1. **Fork el repositorio**
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Haz commit** de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

## Estándares de Código

### TypeScript/React

- Usa TypeScript para todo el código frontend
- Sigue las convenciones de React Hooks
- Usa componentes funcionales
- Mantén componentes pequeños y enfocados

### Rust

- Sigue las convenciones de Rust
- Documenta funciones públicas con `///`
- Usa `cargo fmt` y `cargo clippy` antes de commitear

### Commits

Usa mensajes de commit descriptivos:
- `feat:` para nuevas funcionalidades
- `fix:` para correcciones de bugs
- `docs:` para documentación
- `style:` para formato
- `refactor:` para refactorización
- `test:` para tests
- `chore:` para tareas de mantenimiento

Ejemplo: `feat: add GPU detection for multi-GPU support`

## Estructura de Desarrollo

### Setup Local

1. Fork y clona el repositorio
2. Instala dependencias: `npm install`
3. Configura variables de entorno (ver README.md)
4. Ejecuta en desarrollo: `npm run tauri:dev`

### Testing

- Escribe tests para nuevas funcionalidades
- Asegúrate de que todos los tests pasen
- Mantén o mejora la cobertura de tests

## Código de Conducta

Este proyecto sigue el [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

## Preguntas?

Si tienes preguntas, abre un issue o contacta a los mantenedores.

¡Gracias por contribuir! 🚀

