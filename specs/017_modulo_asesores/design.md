# Design: 017 — Módulo de asesores

## Resumen

Módulo frontend `/advisors` con patrón de estudiantes (tabla lazy + modales
con footers a la derecha + confirmación previa) que opera sobre endpoints
existentes: `GET /users?role=asesor`, `POST /users` + `assignRoles`,
`GET /students?advisorId=`. Sin nuevas tablas ni migraciones; el backend
solo recibe validación menor y tests.

## Proyectos y archivos

### Nuevos

- `digidoc-travel-frontend/src/app/features/advisors/advisors.component.ts` — componente standalone (signals, tabla lazy, modales crear/detalle/desactivar)
- `digidoc-travel-frontend/src/app/features/advisors/advisors.component.html` — tabla + modales (convención `.register-modal`, footer a la derecha, confirm previa)
- `digidoc-travel-frontend/src/app/features/advisors/advisors.component.scss` — tokens SL, sin hex
- `digidoc-travel-frontend/src/app/features/advisors/advisors.component.spec.ts` — tests R2/R3/R4/R8
- `digidoc-travel-frontend/src/app/features/advisors/advisors.service.ts` — wrapper sobre endpoints users/students (o reutiliza `UsersService` + `StudentsService`)

### Modificados

- `digidoc-travel-frontend/src/app/app.routes.ts` — ruta `advisors` con `roleGuard(['admin','supervisor'])`
- `digidoc-travel-frontend/src/app/layout/layout.component.ts` — link Asesores en acordeón Sistema (visible admin/supervisor)
- `digidoc-travel-backend/src/users/users.service.spec.ts` — test filtro `role=asesor` solo devuelve asesores (R2/R7)
- `digidoc-travel-backend/src/students/students.service.spec.ts` — test `advisorId` devuelve asociados (R3)

## Nuevos tipos

| Tipo | Nombre | Ubicación |
| ---- | ------ | --------- |
| Componente | `AdvisorsComponent` standalone | `features/advisors/` |
| Servicio | `AdvisorsService` (o reuse) | `features/advisors/` |
| Const | `ADVISOR_ROLE = 'asesor'` (confirmar contra tabla roles; `consultor` como alias si aplica) | frontend + backend |

## Decisiones técnicas

### ADR-001: Módulo propio en lugar de filtro dentro de Usuarios

**Contexto:** Los asesores se operan a diario (ver carga de estudiantes,
crear, desactivar); el módulo de usuarios es de administración general solo
admin y mezcla todos los roles.

**Decisión:** Componente `AdvisorsComponent` dedicado en `/advisors`,
accesible a `admin` y `supervisor`, con tabla y modales propios.

**Alternativa descartada:** Pestaña/filtro "asesores" dentro de Usuarios —
obliga a dar acceso admin a supervisores y mezcla concerns. Se descarta.

**Consecuencias:** Un módulo más con el patrón ya probado; el layout suma un
link con guard.

---

### ADR-002: Sin backend nuevo; endpoints existentes

**Contexto:** `GET /users?role=`, `POST /users`, `POST /users/:id/roles` y
`GET /students?advisorId=` ya existen y están probados.

**Decisión:** El módulo consume esos endpoints; el backend solo suma tests de
contrato (filtro por rol, asociados por asesor). Sin migraciones.

**Alternativa descartada:** Controlador `advisors` propio con CRUD duplicado —
duplica lógica de usuarios y diverge. Se descarta.

**Consecuencias:** Implementación mayoritariamente frontend; riesgo de cambio
backend mínimo.

---

### ADR-003: Crear asesor = usuario + rol preasignado, sin selector de rol

**Contexto:** En el módulo de usuarios el rol se elige; aquí siempre es asesor.

**Decisión:** El formulario de crear asesor no muestra selector de rol; al
guardar llama `POST /users` y luego `assignRoles` con el id del rol asesor
(obtenido de `GET /roles` por nombre).

**Alternativa descartada:** Reutilizar el modal de crear usuario tal cual —
permite crear no-asesores desde este módulo y rompe R4. Se descarta.

**Consecuencias:** Dos requests encadenados al crear; error parcial (usuario
creado sin rol) se reporta con reintento de asignación.

## Paquetes

Ninguno nuevo (PrimeNG, signals y guards existentes).

## Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
| ------ | ----- | ------- | ---------- |
| Nombre exacto del rol (`asesor` vs `consultor`) | Media | Alto | T1: confirmar contra `GET /roles` antes de implementar; constante única |
| Asesor desactivado con estudiantes huérfanos visibles | Media | Medio | R5: confirm muestra conteo; la asociación se conserva (015 la repara con selector) |
| Divergencia visual con estudiantes/usuarios | Baja | Bajo | Misma convención `.register-modal` + footer derecha + confirm previa |
