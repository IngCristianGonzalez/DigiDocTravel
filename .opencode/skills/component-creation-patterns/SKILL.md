---
name: component-creation-patterns
description: Patrones guiados para crear componentes Angular del proyecto con ayuda de IA, siguiendo arquitectura y diseño HSK.
license: MIT
metadata:
	version: 1.2.0
	tags: [angular, components, ia, patterns, frontend]
	owner: equipo-frontend
	dependencies: [design-system]
---

# Component Creation Patterns

Eres un asistente de frontend para crear componentes en ebrisk-front de forma consistente, incluso para personas con poca experiencia.

## Contexto

- Stack: Angular 20 standalone + signals + PrimeNG 20
- Arquitectura: Pages (UI) -> Facades (application) -> Services API (infraestructura)
- Convenciones de estilos: tokens CSS y componentes compartidos
- Documento base: FRONTEND_CONTRIBUTING.md

## Reglas Obligatorias

1. Todos los componentes deben ser standalone.
2. Usa inject() en vez de constructor injection cuando sea posible.
3. No uses HttpClient en componentes.
4. Para tablas, NO USES componentes custom (app-table). Usa el estándar `p-table` (PrimeNG TableModule) con `[size]="'small'"`, `[scrollable]="true"` y `scrollHeight="flex"`.
5. Para componentes de entrada (inputs, selects, textareas), SIEMPRE usa `<p-floatlabel variant="on">`. NO uses labels sueltos.
6. Para selects y multiselects (`p-select`, `p-multiselect`), SIEMPRE agrega `appendTo="body"` para asegurar que se cierren al hacer click afuera y no se corten.
7. En selects/multiselects, habilita búsqueda con lupa por defecto (`[filter]="true"`) en formularios de gestión; usa `filterBy` cuando exista más de un campo útil (ej. `name,code`).
8. Los placeholders de texto en selects dentro de `p-floatlabel` deben evitarse para no generar solapamiento visual de label flotante + texto.
9. Los componentes custom `badge`, `table`, `select`, `multi-select` están DEPRECADOS. Usa las alternativas de PrimeNG (`p-tag`, `p-table`, `p-select`, `p-multiselect`).
10. Para CTAs, usa app-primary-button.
11. Para filtros de tabla, usa `app-filter-panel` fuera de la tabla (en el header de acciones).
12. Para modales de confirmación simples, usa el patrón visual estandar: titulo, boton X, bloque de advertencia, texto de ayuda opcional y footer con Cancelar + accion.
13. Para formularios/creacion/edicion complejos, usa app-modal.
14. No uses p-dialog como modal principal.
15. Usa @if y @for en templates (evita *ngIf y *ngFor).
16. No uses any; tipa todo con interfaces o types.
17. Mantén lógica de negocio fuera de la página y dentro de Facade/servicio.
18. Estandar de cierre en modales de formulario: `X` cierra manteniendo borrador (persistencia temporal), `Cancelar` descarta cambios y limpia el formulario/draft; nunca guardar datos al cerrar con `X` o `Cancelar`.

## Patrones de UI estandar

### 1) Tabla con filtros por columnas de datos

- Contenedor con clase `.table-wrapper` que tenga `flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow: hidden; border: none;` (el estándar es sin bordes ni contenedor visual).
- Header con titulo + acciones (botones).
- Filtros fuera de la tabla (en el header actions) con `<app-filter-panel>`.
- Chips de filtros activos debajo del header (opcional recomendado).
- `<p-table>` con skeleton (`<p-skeleton>`) en el `#body` cuando `loading()` es true.
- El `p-table` debe ir dentro de `.table-wrapper` para usar `scrollHeight="flex"`.
- Los botones de la tabla deben estar en una celda y usar `p-button icon="pi pi-..." [text]="true" [rounded]="true" size="small"`.

### 2) Modal simple de confirmacion

- Titulo claro: Ej. "Deseas eliminar este elemento?"
- Cierre por X en esquina superior derecha.
- Bloque de warning: "Esta accion no se puede deshacer."
- Texto de ayuda opcional contextual (nombre de entidad, impacto, etc.).
- Checkbox de confirmacion opcional para acciones sensibles.
- Footer con dos botones al 50/50: Cancelar (secundario) y accion principal (Eliminar/Desactivar/Guardar segun contexto).

### 3) Selects con busqueda (lupa)

- En formularios administrativos, `p-select` y `p-multiselect` deben incluir `[filter]="true"` como valor por defecto.
- Si el dataset tiene codigo + nombre, usar `filterBy="name,code"`.
- Mantener `appendTo="body"` para overlays consistentes.
- Si el select vive dentro de `p-floatlabel`, evitar `placeholder` de texto para prevenir superposición de labels.

### 4) Cierre de modal en formularios

- Cierre por `X`: cierra visualmente y conserva borrador para reabrir sin perder digitado.
- Cierre por `Cancelar`: descarta la intención de edición/creación y limpia formulario + borrador.
- Cierre por click en overlay: NO debe cerrar automáticamente salvo que el flujo lo pida explícitamente.

## Flujo de creación recomendado

1. Crear estructura base:
- feature/pages/nombre-pagina/
- feature/pages/nombre-pagina/components/
- feature/pages/nombre-pagina/models/ (solo UI)
- feature/pages/nombre-pagina/services/ (solo UI)

2. Definir modelo de dominio en core/<dominio>/models.
3. Implementar API service en core/<dominio>/services.
4. Implementar facade en features/<feature>/services.
5. Implementar page component que consume facade.
6. Registrar ruta lazy en feature routes.

## Checklist de validación

- Hay estados de carga y error.
- El componente no hace llamadas HTTP directas.
- Se usan tokens de color y spacing.
- Se usan componentes compartidos requeridos.
- El template no rompe patrones de accesibilidad básica.

## Ejemplo mínimo

Entrada del usuario:
"Crea una página de reportes con tabla, búsqueda y modal de creación"

Salida esperada del agente:
- Modelo en core/dashboard/models/reportes.ts
- Servicio en core/dashboard/services/reportes.service.ts
- Facade en features/dashboard/services/reportes.facade.ts
- Page standalone + p-table + app-modal
- Ruta lazy agregada en dashboard.route.ts
