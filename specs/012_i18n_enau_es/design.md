# Design: 012 — Internacionalización ES + English (AU)

## Resumen

Se formaliza el trabajo ya probado en `feature/i18n-enAU-es`: servicio i18n
liviano con signals, dos diccionarios tipados, selector nativo pre-login con
autodetección por navegador y migración de todos los templates a claves.
Sin dependencias externas. Vitest con plugin Angular zoneless en verde.

## Proyectos y archivos

### Nuevos

- `digidoc-travel-frontend/src/app/core/i18n/i18n.service.ts` — servicio `I18nService` (signals, autodetección, `t()` con fallback)
- `digidoc-travel-frontend/src/app/core/i18n/lang-es.ts` — diccionario `ES` (~779 claves)
- `digidoc-travel-frontend/src/app/core/i18n/lang-en-au.ts` — diccionario `EN_AU` (~783 claves)
- `digidoc-travel-frontend/src/app/shared/components/lang-selector.component.ts` — `LangSelectorComponent` standalone (select nativo, sin banderas)
- `digidoc-travel-frontend/src/test-setup.ts` — fija locale `es` para specs
- `digidoc-travel-frontend/vitest.config.ts` — plugin Angular zoneless (ajuste)

### Modificados

- `digidoc-travel-frontend/src/app/auth/pages/login|register|forgot-password/*` — templates + `.ts` a claves `i18n.t()`
- `digidoc-travel-frontend/src/app/features/*/*.html|*.ts` — dashboard, students, users, documents, visas, payments, events, notifications, reports a claves
- `digidoc-travel-frontend/src/app/layout/layout.component.ts` — integra selector reutilizable
- `digidoc-travel-frontend/src/app/public/pages/landing/*` — landing a claves
- `digidoc-travel-frontend/src/app/shared/components/error|loading|toast|unauthorized.component.ts` — mensajes a claves
- `digidoc-travel-frontend/src/styles.scss` — estilos del selector
- `digidoc-travel-frontend/package.json` + `package-lock.json` — Vitest + plugin Angular
- `.github/workflows/frontend.yml` — CI instala con `legacy-peer-deps`, typecheck `tsc`, tests `vitest run`
- `digidoc-travel-frontend/src/app/features/*/*.spec.ts` — `+3` líneas c/u para locale `es` (fija entorno)

## Nuevos tipos

| Tipo | Nombre | Ubicación |
| ---- | ------ | --------- |
| Type | `AppLang = 'es' \| 'en-AU'` | `core/i18n/i18n.service.ts` |
| Const | `STORE_KEY = 'digidoc-lang'` | `core/i18n/i18n.service.ts` |
| Const | `DICTS: Record<AppLang, Record<string,string>>` | `core/i18n/i18n.service.ts` |
| Servicio | `I18nService` (signal `lang`, computed `dict`) | `core/i18n/` |
| Componente | `LangSelectorComponent` standalone | `shared/components/` |
| Diccionario | `ES`, `EN_AU` | `core/i18n/lang-*.ts` |

## Decisiones técnicas

### ADR-001: Servicio i18n propio liviano con signals

**Contexto:** Solo dos idiomas, sin pluralización compleja ni lazy-loading.
El frontend ya usa signals y standalone components.

**Decisión:** `I18nService` con `signal<AppLang>`, `computed(dict)`, `t(key, params)`
con fallback `activo → es → clave` e interpolación `{var}`.

**Alternativa descartada:** `ngx-translate` / `@angular/localize` — añaden
dependencia, loader HTTP y pipeline de extracción para un caso de dos
diccionarios estáticos. Se descarta por sobre-ingeniería.

**Consecuencias:** 0 dependencias nuevas, traducción síncrona, fallback visible
facilita detectar claves faltantes en revisión.

---

### ADR-002: Selector como `select` nativo sin banderas

**Contexto:** Requisito de accesibilidad y no usar banderas como metáfora de idioma.
Debe funcionar pre-login y en layout.

**Decisión:** `LangSelectorComponent` standalone con `CommonModule + FormsModule`,
`select` nativo, `aria-label`, estilos con tokens `--sl-*`.

**Alternativa descartada:** Dropdown custom con banderas — rompe a11y de teclado,
confunde país con idioma, exige JS/CSS extra. Se descarta.

**Consecuencias:** Teclado y lector de pantalla gratis, un solo componente
reutilizable.

---

### ADR-003: Autodetección `localStorage > navigator > es`

**Contexto:** Primera visita sin preferencia debe respetar el navegador sin
parpadeo de idioma.

**Decisión:** `init()` lee `digidoc-lang`, si no hay recorre
`navigator.languages + navigator.language` (`en* → en-AU`, `es* → es`),
defecto `es`. Todo en `try/catch` por SSR/privado.

**Alternativa descartada:** Solo defecto `es` sin autodetección — peor UX para
usuarios AU. Se descarta.

**Consecuencias:** Determinista y testeable inyectando `navigator`.

---

### ADR-004: Vitest con plugin Angular zoneless

**Contexto:** Specs Angular standalone necesitan `TestBed` sin Zone.js y locale
estable.

**Decisión:** `vitest.config.ts` con plugin Angular zoneless, `test-setup.ts`
fija locale `es`, CI con `legacy-peer-deps + tsc + vitest run`.

**Alternativa descartada:** Karma/Jasmine — más lento en CI y exige navegador.
Se descarta.

**Consecuencias:** 129/129 en verde en local y CI.

## Paquetes npm

| Paquete | Versión | Propósito |
| ------- | ------- | --------- |
| `vitest` + plugin Angular zoneless | según `package.json` legacy | runner frontend |
| _(ningún paquete i18n externo)_ | — | servicio propio |

## Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
| ------ | ----- | ------- | ---------- |
| Claves divergentes ES vs EN_AU | Media | Medio | script que compara keys de ambos dicts en CI; fallback a `es` visible |
| Textos hardcodeados que escapen a la migración | Media | Bajo | `grep` de literales en templates durante review; `t()` devuelve clave si falta |
| Parpadeo de idioma en primer render | Baja | Bajo | `init()` síncrono en constructor antes del primer `computed` |
