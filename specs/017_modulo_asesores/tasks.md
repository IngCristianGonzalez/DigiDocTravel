# Tasks: 017 — Módulo de asesores

- [x] T1 — Confirmar nombre exacto del rol asesor (`GET /roles`) y fijar `ADVISOR_ROLE`.
  Cubre: R2, R4.
- [x] T2 — Crear `AdvisorsService` (lista por `role=asesor`, detalle, asociados por `advisorId`) o reutilizar `UsersService` + `StudentsService`.
  Cubre: R2, R3.
- [x] T3 — Crear `AdvisorsComponent` con tabla lazy + filtros por columna + paginación (patrón estudiantes).
  Cubre: R2.
- [x] T4 — Modal detalle: datos del asesor + estudiantes asociados.
  Cubre: R3.
- [x] T5 — Modal crear: formulario usuario con rol asesor preasignado (sin selector de rol) + validaciones de registro.
  Cubre: R4.
- [x] T6 — Modal desactivar con confirmación y conteo de estudiantes asociados (sin borrar historial).
  Cubre: R5.
- [x] T7 — Ruta `/advisors` con `roleGuard(['admin','supervisor'])` en `app.routes.ts`.
  Cubre: R1.
- [x] T8 — Link Asesores en layout (acordeón Sistema, visible admin/supervisor).
  Cubre: R6.
- [x] T9 — Estilos con tokens SL + footer a la derecha + confirm previa (convención 016).
  Cubre: R2–R6.
- [x] T10 — Tests frontend: lista filtra por rol, detalle muestra asociados, crear preasigna rol.
  Cubre: R2, R3, R4, R8.
- [x] T11 — Tests backend de contrato: `role=asesor` solo asesores; `advisorId` devuelve asociados; rol inválido → lista vacía.
  Cubre: R2, R3, R7, R8.
- [x] T12 — Verificación: builds + suites en verde; trazabilidad en `progress/impl_017_asesores.md`.
  Cubre: R1–R8.
