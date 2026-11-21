# Requirements: 012 — Internacionalización ES + English (AU)

Fuente: rama legacy `feature/i18n-enAU-es` (6 commits, 52 archivos, HEAD a6d2c68).
Integra cambios de `main` 656b3f1 (ya incluidos en base 002).

## R1 [Ubicuo]

El sistema DEBE ofrecer exactamente dos idiomas en el frontend: `es` y `en-AU`.

## R2 [Evento]

CUANDO el frontend arranca sin preferencia guardada, el sistema DEBE seleccionar
el idioma a partir de `navigator.languages`/`navigator.language` y usar `es`
como valor por defecto.

## R3 [Evento]

CUANDO el usuario cambia el idioma en el selector, el sistema DEBE aplicar
el nuevo idioma de inmediato y persistirlo en `localStorage` bajo la clave
`digidoc-lang`.

## R4 [Ubicuo]

El sistema DEBE mostrar el selector de idioma como un `select` nativo con las
opciones `Español` y `English (AU)`, sin banderas, visible pre-login y
reutilizable en el layout.

## R5 [No deseado]

SI una clave de traducción falta en el diccionario activo, ENTONCES el sistema
DEBE usar el diccionario `es` como fallback y SI tampoco existe DEBE devolver
la clave.

## R6 [Ubicuo]

El sistema DEBE traducir todas las vistas del frontend (auth, estudiantes,
usuarios, documentos, visas, pagos, eventos, notificaciones, reportes,
dashboard, landing, layout y componentes compartidos) mediante claves
`i18n.t(key, params)` con soporte de interpolación `{var}`.

## R7 [NF]

El sistema DEBE mantener la suite frontend en 129/129 tests Vitest en verde
con plugin Angular zoneless y locale `es` fijado en los specs.
