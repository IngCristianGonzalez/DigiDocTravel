# Trazabilidad 017 — Módulo de asesores

Ejecutado por: Cristian Alarcon Gonzalez (cristianjussepalarcongonzalez@gmail.com)
Rama: feature/017_modulo_asesores · Fecha: 2026-09-30

## R ↔ Tests

| Requirement | Test(s) |
| ----------- | ------- |
| R1 (ruta /advisors admin/sup) | `app.routes.ts` con `roleGuard(['admin','supervisor'])` — verificación manual + build |
| R2 (lista solo asesores) | `users.service.spec.ts` → "debe filtrar solo asesores con role=asesor"; `advisors.component.spec.ts` → params role/status |
| R3 (detalle + asociados) | `students.service.spec.ts` → "Listar asociados por advisorId" |
| R4 (crear con rol preasignado) | `advisors.component.spec.ts` → confirm con Rol=asesor; flujo create→assignRoles code-reviewed |
| R5 (desactivar con conteo) | code-reviewed (conteo vía `total` de students?advisorId); sin test E2E (fuera de alcance) |
| R6 (nav layout) | verificación visual en local |
| R7 (rol inválido → vacía) | contrato actual de `GET /users` sin cambios (sin test nuevo; documentado) |
| R8 (suites verdes) | backend 18/18 (students+users specs); frontend `ng build` verde |

## Desviación del spec

- T2: no se creó `AdvisorsService` nuevo; se reutilizan `UsersService` + `StudentsService` (menos código, mismo contrato). `ADVISOR_ROLE='asesor'` vive en el componente y se exporta para tests.

## Verificación

- `npm run build` backend ✓ · jest students+users 18/18 ✓
- `ng build` frontend ✓ (tras corregir `app-loading [show]`)
- Frontend specs no ejecutados (Karma sin runner en este entorno); nuevos tests siguen el patrón existente.
