---
name: clean-frontend-programming
description: Guía práctica para programar frontend limpio en Angular con IA, evitando errores comunes y deuda técnica.
license: MIT
metadata:
	version: 1.1.0
	tags: [clean-code, angular, ia, frontend, architecture]
	owner: equipo-frontend
	dependencies: [design-system]
---

# Clean Frontend Programming

Eres un asistente enfocado en mantener código frontend limpio, mantenible y alineado con la arquitectura del proyecto.

## Contexto

- Proyecto Angular estricto con TypeScript
- Arquitectura por capas y vertical slicing
- Design system con tokens y componentes compartidos

## Reglas de limpieza

1. Una responsabilidad por función o método.
2. Nombres explícitos y consistentes (sin abreviaturas ambiguas).
3. Evitar lógica duplicada: extraer helpers o servicios UI.
4. Estado explícito: signals para estado local, NgRx para estado global.
5. Errores visibles y manejados (loading/error/success).
6. Nada de magic numbers de spacing, radius o colores.
7. Evitar comentarios redundantes; preferir código claro.
8. No mezclar UI con infraestructura en el mismo archivo.

## Patrón recomendado para IA

Cuando generes o refactorices código:
1. Identifica capa correcta (UI, facade, service, model).
2. Escribe tipos primero (interfaces/types).
3. Implementa flujo feliz + errores.
4. Agrega validaciones mínimas de entrada.
5. Verifica consistencia de diseño y nombres.

## Antipatrones a evitar

- any en datos de negocio.
- subscribe anidados sin necesidad.
- componentes con más de una responsabilidad principal.
- acoplar componentes a detalles de API.
- usar confirm/alert nativo cuando exista patrón de modal del proyecto.
- tablas sin filtros por campos de datos cuando la vista ya usa patron de gestion.
- modales con estructura visual inconsistente (sin titulo, sin cierre X, o CTA sin jerarquia clara).

## Estandar transversal de UI

Para vistas de administracion con tablas:

1. Filtros con app-filter-panel por cada campo de datos (excepto columna de acciones).
2. Tabla con p-table (PrimeNG) y estado de carga con skeleton.
3. Acciones de fila con p-button icon-only; acciones principales fuera de la tabla con app-primary-button.

Para modales simples de confirmacion:

1. Estructura fija: titulo + boton X + warning + ayuda opcional + footer.
2. Footer siempre con Cancelar + accion principal (Eliminar/Desactivar/Guardar).
3. Usar checkbox de confirmacion en acciones sensibles cuando aplique.

## Definition of Done

- Compila sin errores de TypeScript.
- Mantiene convenciones del repositorio.
- No introduce regresiones funcionales obvias.
- Código legible para un desarrollador junior.

## Ejemplo rápido

Solicitud:
"Refactoriza un componente que hace HTTP directo"

Resultado esperado:
- HTTP movido a servicio API en core.
- Orquestación movida a facade.
- componente solo renderiza, dispara eventos y consume signals.
