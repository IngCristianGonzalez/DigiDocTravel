# Tasks: 012 — Internacionalización ES + English (AU)

- [ ] T1 — Crear `I18nService` con `AppLang`, `STORE_KEY`, `DICTS`, `lang`/`dict` signals y `t(key, params)` en `core/i18n/i18n.service.ts`.
  Cubre: R1, R2, R3, R5, R6.
- [ ] T2 — Crear diccionario `ES` en `core/i18n/lang-es.ts`.
  Cubre: R1, R6.
- [ ] T3 — Crear diccionario `EN_AU` en `core/i18n/lang-en-au.ts` con paridad de claves respecto a ES.
  Cubre: R1, R6.
- [ ] T4 — Crear `LangSelectorComponent` standalone (select nativo, sin banderas, aria-label) en `shared/components/lang-selector.component.ts`.
  Cubre: R4.
- [ ] T5 — Integrar selector pre-login (login/register/forgot-password) y en layout/landing.
  Cubre: R4.
- [ ] T6 — Migrar templates auth a claves `i18n.t()` (login, register, forgot-password).
  Cubre: R6.
- [ ] T7 — Migrar features a claves (students, users, documents, visas, payments, events, notifications, reports, dashboard).
  Cubre: R6.
- [ ] T8 — Migrar layout, landing y compartidos (error, loading, toast, unauthorized) a claves.
  Cubre: R6.
- [ ] T9 — Configurar Vitest zoneless + `test-setup.ts` con locale `es` y ajustar `vitest.config.ts`.
  Cubre: R7.
- [ ] T10 — Fijar locale `es` en los `*.spec.ts` de features (+3 líneas c/u).
  Cubre: R7.
- [ ] T11 — Test: `I18nService` autodetección (`stored > navigator > es`), `setLang` persiste, `t()` fallback e interpolación.
  Cubre: R2, R3, R5.
- [ ] T12 — Test: `LangSelectorComponent` renderiza opciones ES/English (AU), cambia idioma y persiste; suite completa 129/129 en verde (`vitest run`) + `tsc` + build frontend.
  Cubre: R3, R4, R7.
