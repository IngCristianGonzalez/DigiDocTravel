# Sesión activa

> Vacío = sin sesión activa. Rellena esto al comenzar a trabajar.

## Estado

- **Feature en curso:** 002_index_notebook (fix 2) — fallback embebido para árbol/dependencias con file://
- **Status:** in_progress
- **Inicio de sesión:** 2026-09-08
- **Rama:** feature/002_index_notebook
- **Ejecutado por:** Cristian Alarcon Gonzalez (cristianjussepalarcongonzalez@gmail.com)

## Plan (tasks de specs/{NNN}\_{name}/tasks.md)

_Fix 2 dashboard: fallback embebido para file://._
- [x] Reproducir: file:// → 0 nodos/0 aristas (fetch bloqueado); http → 13 nodos/14 aristas
- [x] Embebido feature_list.json en index.html (10.4KB) + init() con fallback + badge de fuente
- [x] Verificar ambos modos: live y file → 13 nodos/14 aristas, badge correcto

## Notas de bloqueo (si aplica)

- Sin bloqueos. Causa raíz del "sigue": apertura con doble clic (file://).
