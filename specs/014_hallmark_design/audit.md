# Hallmark Audit — DigiDocTravel frontend (014)

Verbo: `hallmark audit`. Solo lectura, sin edits.
Fecha: 2026-09-30. Rama: `feature/014_hallmark_design` (base 002 ac934f5 + main 656b3f1).
Alcance: `digidoc-travel-frontend` (landing pública + layout app + auth + 9 features).

## Pre-flight findings

- Font stack: system sans (`-apple-system, Segoe UI, Roboto…`, `styles.scss` L80). Sin display face, sin `next/font`/`fontsource`. Verificar si se quiere preservar o introducir pairing.
- Palette: tokens hex propios `--sl-*` en `:root` (`styles.scss` L7-102) + aliases HSK. No OKLCH, no DTCG. Hallmark preservará tokens, introducirá disciplina de acento.
- Motion: `@angular/animations` 21.2 + PrimeNG 17.18 (package.json L14, L29). Sin framer-motion/gsap/lenis. Stance: motion-cut controlado por Angular.
- Spacing: escala `--space-1..12` 4pt (`styles.scss` L84-92). Hallmark preservará.
- Framework: Angular 21 standalone + PrimeNG + NgRx + chart.js (package.json). Vanilla-Hallmark (hecho para Next/Astro/Vue) se adapta a Angular: tokens CSS + componentes standalone.

Hallmark preservará: tokens `--sl-*`, escala 4pt, stack Angular/PrimeNG, rutas e IA.
Hallmark introducirá: macroestructura no-template, disciplina de acento/tipo, gates anti-slop, hero enrichment honesto.

## Punch list (rankeado)

### P0 — Honest copy / métricas inventadas (gate 46)
- `landing.component.html` L77-79: `2,400+ documentos procesados este mes` + avatares con iniciales (A/M/R/L). Sin fuente. Hallmark exige número real, placeholder `—` con bloque gris etiquetado, o cambiar macroestructura.
- Revisar `#stats` y `#testimonials` (mismo archivo, L~200-438): si hay `+47%`, `50,000+`, logos o casos sin fuente, misma regla.

### P0 — Re-drawn chrome (gate 47)
- `landing.component.scss` L304 `hero__card-dot` + template `hero__card-dot--green` + `hero__card-status`: tarjeta hero con dots tipo ventana de navegador + mock de documento. Hallmark prohíbe barras/phone-frames/code-windows falsas. Usar `<figure>` real o dejar el contenido sin chrome.

### P1 — Ritmo template hero→features→how→stats→testimonials→CTA→footer
- Landing sigue `hero → #features → #how → #stats → #testimonials → CTA → footer` (nav L13-16 + secciones). Dos landings Hallmark no deben compartir ritmo. Redesign debe romper la estructura, no solo re-colorear.
- Nav actual ≈ N1b SaaS canónico (4 links + login/register). Funciona para producto real, pero es fingerprint. Evaluar N5/N11/N13 en redesign.

### P1 — Gradientes genéricos
- `landing.component.scss` L146 `linear-gradient(180deg, gray-50 → white)` + gradientes en `login/register.component.scss`. Típico fondo AI-slop. Sustituir por banda de papel sólida + divisores con lenguaje propio.

### P1 — Tokens improvisados / hex inline
- `layout.component.ts`, `toast/loading/error.component.ts`, `dashboard.component.spec.ts` con hex literales en TS/templates. Hallmark disciplina 3: todo color/fuente vía `var(--sl-*)`; si falta token, crearlo en `:root` y referenciarlo.

### P2 — Italic headers (gate 38a)
- `font-style: italic` en `students/documents/payments/events/notifications/reports.component.scss` (p. ej. students L552). Verificar si afecta a `h1/h2/display`. Headers siempre roman; énfasis con peso, acento o subrayado dibujado. Itálica solo en cuerpo.

### P2 — Tipo sin voz
- Sistema sans en todo, sin pairing display/body, sin escala hero declarada. Elegir pairing libre (2+1 fonts) y tamaños hero con `measure` controlada en redesign.

### P2 — Responsive sin verificar
- Hallmark exige 320/375/414/768 sin scroll-x (`overflow-x: clip`, no `hidden`), sin CTAs a dos líneas, grids con `minmax(0,1fr)`, headers con `overflow-wrap:anywhere`. Landing + tablas lazy PrimeNG (7 módulos, filtros por columna, commit 656b3f1) deben verificarse en esos anchos.

## Qué NO se toca (safety rail)
- Rutas, `app.routes`, guards por rol, NgRx stores, servicios API, PrimeNG lazy tables. Redesign solo capa visual/interacción dentro de los componentes existentes, salvo aprobación explícita con plan de archivos.
- `README/docs/*.md` son referencia, no se copian verbatim al UI.

## Siguiente paso (puerta Hallmark)
Antes de `hallmark redesign`, responder (o decir "go ahead" e infiero):

1. **Audience** — ¿Quién usa esto? (p. ej. asesores SL Global vs estudiantes vs admins)
2. **Use case** — ¿La única acción de la landing? (registrarse / pedir demo / leer?)
3. **Tone** — Extremo: editorial · brutalist · soft · utilitarian · luxury · playful · technical · austere. "Clean and modern" no es tono.

Alcance propuesto para redesign: solo landing pública primero (una página, sin tocar app interna). Confirmar o ampliar a auth/layout.
