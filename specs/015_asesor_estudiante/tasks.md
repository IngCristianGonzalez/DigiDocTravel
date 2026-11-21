# Tasks: 015 — Asesor asociable al estudiante

- [x] T1 — Confirmar nombre exacto del rol asesor en seed/tabla de roles y fijar `ADVISOR_ROLES` en backend students.
  Cubre: R1, R6.
- [ ] T2 — Añadir `@IsUUID()` a `AssignAdvisorDto.advisorId` en `students/dto/`.
  Cubre: R5.
- [ ] T3 — Endurecer `assignAdvisor` en `students.service.ts`: valida UUID → usuario existe → rol elegible, errores 400/404/422.
  Cubre: R5, R6.
- [ ] T4 — Crear `GET /students/advisors/eligible` (roles admin/supervisor) con id+nombre+email mínimos.
  Cubre: R1.
- [ ] T5 — Test backend: UUID inválido → 400; usuario inexistente → 404; usuario sin rol elegible → 422; feliz → asocia + auditoría.
  Cubre: R5, R6, R7, R8.
- [x] T6 — Frontend: signal `advisors()`, carga de elegibles al abrir Editar, asesor actual visible (nombre + email o —).
  Cubre: R1, R2.
- [x] T7 — Frontend: sustituir input `Advisor ID` por `p-dropdown` filtrable de elegibles; Asociar habilitado solo con selección.
  Cubre: R3, R4.
- [x] T8 — Frontend: toast de confirmación/error al asociar (mensajes existentes).
  Cubre: R3.
- [ ] T9 — Test frontend: el selector lista solo elegibles; sin input libre; muestra asesor actual o —.
  Cubre: R2, R4.
- [x] T10 — Estilos del selector con tokens SL (sin hex) + responsive móvil del bloque asociar.
  Cubre: R4.
- [ ] T11 — Verificación: `npm run build` backend + frontend y suites en verde (73 backend + frontend).
  Cubre: R8.
- [ ] T12 — Trazabilidad R↔Tests en `progress/impl_015_asesor.md`.
  Cubre: R1–R8.
