---
name: Convenciones y feedback del usuario
description: Preferencias de trabajo y correcciones del usuario
type: feedback
originSessionId: 3332a76e-f5ed-4c26-a535-16ed7f7e46bb
---
Usar siempre **yarn** (no npm) para instalar dependencias.
**Why:** El proyecto usa `packageManager: yarn@3.6.4` en package.json. El usuario actualizó CLAUDE.md explícitamente para indicar esto.
**How to apply:** Cualquier comando de instalación debe usar `yarn add`, `yarn add -D`, etc.

En zsh, los argumentos con `^` deben ir entre comillas dobles.
**Why:** zsh trata `^` como carácter especial. `yarn add @pkg@^1.0.0` falla; `yarn add "@pkg@^1.0.0"` funciona.
**How to apply:** Siempre citar paquetes con versión semver en comandos de terminal.

En commits, **no agregar `Co-Authored-By` ni ninguna referencia al agente**. El commit debe salir solo con Jorge como autor.
**Why:** Jorge sube el código él mismo y quiere que los commits sean únicamente suyos.
**How to apply:** Dar solo el mensaje de commit limpio, sin líneas de autoría adicionales.

**No ejecutar `git commit` ni `git add` automáticamente al terminar una tarea.**
**Why:** Jorge hace sus propios commits — se lo ha dicho explícitamente dos veces.
**How to apply:** Nunca correr git commit al final de un task. Solo mostrar un resumen de los cambios hechos.
