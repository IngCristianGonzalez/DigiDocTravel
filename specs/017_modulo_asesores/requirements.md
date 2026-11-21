# Requirements: 017 — Módulo de asesores

Contexto: el asesor existe solo como `User` con rol (`asesor`/`consultor`)
gestionado dentro del módulo de usuarios (CU-005, solo admin). No hay vista
propia para operar asesores ni ver sus estudiantes asociados. El spec 015
(pendiente de aprobación) define la asociación; este módulo es la pantalla
desde donde se crean, listan y consultan.

## R1 [Ubicuo]

El sistema DEBE ofrecer el módulo de asesores en la ruta `/advisors`,
accesible solo para roles `admin` y `supervisor`.

## R2 [Ubicuo]

El sistema DEBE listar en `/advisors` únicamente usuarios con rol asesor
(vía `GET /users?role=asesor`), con tabla lazy, filtros por columna y
paginación server-side siguiendo el patrón de estudiantes.

## R3 [Evento]

CUANDO se abre el detalle de un asesor, el sistema DEBE mostrar sus datos
y la lista de estudiantes asociados (vía `GET /students?advisorId=`).

## R4 [Evento]

CUANDO se crea un asesor, el sistema DEBE crearlo como usuario con el rol
asesor preasignado (sin permitir elegir otro rol en ese formulario) y con
las mismas validaciones de registro de usuarios.

## R5 [Evento]

CUANDO se desactiva un asesor con estudiantes asociados, el sistema DEBE
pedir confirmación mostrando cuántos estudiantes quedarán sin asesor
asignado visible, y NO DEBE borrar la asociación histórica.

## R6 [Ubicuo]

El sistema DEBE incluir el acceso a Asesores en la navegación del layout
(acordeón Sistema o Académico) solo visible para `admin`/`supervisor`.

## R7 [No deseado]

SI el backend recibe `role` distinto de los roles existentes en el filtro,
ENTONCES DEBE retornar lista vacía (no error), manteniendo el contrato
actual de `GET /users`.

## R8 [NF]

El sistema DEBE mantener builds y suites en verde (backend 73 tests +
frontend) con tests nuevos del módulo (lista filtra por rol, detalle
muestra asociados, crear preasigna rol).
