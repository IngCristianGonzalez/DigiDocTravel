# Requirements: 015 — Asesor asociable al estudiante

Contexto: hoy el modal Editar asocia asesor con un campo de texto
`Advisor ID` crudo y `POST /students/:id/advisor` guarda cualquier string
sin validar (sin UUID, sin existencia, sin rol). Este spec define la gestión
mínima de asesor elegible + asociación validada y seleccionable.

## R1 [Ubicuo]

El sistema DEBE exponer los asesores elegibles (usuarios con rol asesor/
consultivo) para su selección en el frontend.

## R2 [Evento]

CUANDO un asesor/admin abre el modal Editar de un estudiante, el sistema
DEBE mostrar el asesor actualmente asociado (nombre + email) o `—` si no
hay ninguno.

## R3 [Evento]

CUANDO el usuario elige un asesor en el selector y confirma, el sistema
DEBE asociarlo al estudiante y mostrar confirmación vía toast.

## R4 [Ubicuo]

El sistema DEBE sustituir el campo de texto `Advisor ID` por un selector
buscable que solo liste asesores elegibles; NO DEBE aceptar IDs libres.

## R5 [No deseado]

SI el `advisorId` no es UUID válido, ENTONCES el backend DEBE retornar
HTTP 400 con mensaje de error.

## R6 [No deseado]

SI el `advisorId` no corresponde a un usuario existente con rol elegible,
ENTONCES el backend DEBE retornar HTTP 404 (usuario) o 422 (rol no
elegible) sin modificar al estudiante.

## R7 [Ubicuo]

El sistema DEBE registrar la asociación en auditoría (`ASSIGN_ADVISOR`,
módulo `students`) como ya hace el endpoint actual.

## R8 [NF]

El sistema DEBE mantener el build del backend y los 73 tests en verde
tras el cambio, con tests nuevos para R5 y R6.
