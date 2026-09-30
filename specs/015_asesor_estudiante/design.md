# Design: 015 — Asesor asociable al estudiante

## Resumen

Se formaliza el concepto "asesor" (usuario con rol asesor/consultivo) y se
endurece la asociación: endpoint de elegibles + validación en
`assignAdvisor` + selector buscable en el modal Editar en lugar del input
crudo. Sin cambios en el modelo `Student` (`advisorId` + relación `advisor`
ya existen) ni en el flujo de auditoría.

## Proyectos y archivos

### Nuevos

- `digidoc-travel-backend/src/students/dto/advisor-eligibility.ts` — helper o
  spec de elegibilidad por rol (o constante `ADVISOR_ROLES`)
- `digidoc-travel-backend/src/students/students.service.spec.ts` — casos
  R5/R6 (UUID inválido, usuario inexistente, rol no elegible)
- `digidoc-travel-frontend/src/app/features/students/students.component.spec.ts` —
  caso selector (solo elegibles, sin input libre)

### Modificados

- `digidoc-travel-backend/src/students/students.service.ts` — `assignAdvisor`
  valida UUID, existencia de usuario y rol elegible antes de guardar
- `digidoc-travel-backend/src/students/students.controller.ts` — `GET
  /students/advisors/eligible` (roles `admin`, `supervisor`) o reutiliza
  `GET /users` con filtro por rol
- `digidoc-travel-backend/src/students/dto/assign-advisor.dto.ts` — `advisorId`
  con `@IsUUID()`
- `digidoc-travel-frontend/src/app/features/students/students.component.ts` —
  signal `advisors()`, carga de elegibles, `assignAdvisor` usa selección
- `digidoc-travel-frontend/src/app/features/students/students.component.html` —
  bloque "Asociar asesor": `p-dropdown` filtrable + asesor actual visible
- `digidoc-travel-frontend/src/app/features/students/students.component.scss` —
  estilos del selector con tokens (sin hex)

## Nuevos tipos

| Tipo | Nombre | Ubicación |
| ---- | ------ | --------- |
| Const | `ADVISOR_ROLES = ['asesor', 'consultor']` (nombres exactos a confirmar contra seed de roles) | backend students |
| DTO | `AssignAdvisorDto.advisorId` con `@IsUUID()` | `students/dto/` |
| Signal | `advisors: UserBrief[]` + `advisorId` (selección) | students.component |

## Decisiones técnicas

### ADR-001: Selector cerrado en lugar de input libre

**Contexto:** El input crudo permite asociar UUIDs inexistentes o usuarios
sin rol, dejando datos huérfanos que luego rompen filtros y vistas.

**Decisión:** `p-dropdown` filtrable alimentado por el endpoint de elegibles;
el botón Asociar se habilita solo con selección válida.

**Alternativa descartada:** Mantener input + validar solo en backend — mejora
integridad pero conserva UX propensa a error (pegar UUIDs a mano). Se descarta.

**Consecuencias:** Un request extra al abrir Editar; cero IDs huérfanos desde UI.

---

### ADR-002: Validación en servicio aunque la UI ya filtre

**Contexto:** La UI puede bypassearse (curl, Postman); la integridad la
garantiza el backend.

**Decisión:** `assignAdvisor` verifica UUID → usuario existe → rol elegible,
en ese orden, antes de `save`. Errores 400/404/422 respectivamente.

**Alternativa descartada:** Confiar solo en `ParseUUIDPipe` + UI — no cubre
existencia ni rol. Se descarta.

**Consecuencias:** +1 query a users por asociación; comportamiento documentado
y testeado.

---

### ADR-003: Endpoint dedicado vs reutilizar GET /users

**Contexto:** El frontend necesita id+nombre+email de elegibles; `GET /users`
existe con tabla lazy y filtros pero devuelve paginado de gestión.

**Decisión:** `GET /students/advisors/eligible` liviano (solo elegibles,
campos mínimos), roles `admin`/`supervisor`, sin paginación.

**Alternativa descartada:** Reutilizar `GET /users?role=` — acopla el modal a
un contrato de gestión con paginación y más permisos. Se descarta.

**Consecuencias:** Un endpoint más, contrato mínimo y estable para el selector.

## Paquetes

Ninguno nuevo (PrimeNG `p-dropdown` y `class-validator` ya instalados).

## Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
| ------ | ----- | ------- | ---------- |
| Nombre exacto del rol asesor difiere (`consultor` vs `asesor`) | Media | Medio | Confirmar contra seed/tabla de roles antes de implementar; constante única |
| Lista de elegibles grande degrada el dropdown | Baja | Bajo | `p-dropdown` con filtro; virtual scroll si >100 |
| Asociaciones huérfanas históricas | Media | Bajo | Script de reporte (no migran solas); fuera de alcance del spec |
