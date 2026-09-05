---
name: Git Branching Strategy
description: Estrategia de ramas, ambientes y despliegue del proyecto EBrisk. Usa esta skill cuando el agente necesite crear ramas, hacer commits, crear PRs, o entender el flujo de desarrollo.
---

# Git Branching Strategy - EBrisk

## Cuándo usar esta skill

- Cuando el agente necesita crear una rama de trabajo (`feature/*`, `bugfix/*`, `hotfix/*`)
- Cuando va a hacer commits o crear Pull Requests
- Cuando necesita entender a qué ambiente va un cambio
- Cuando trabaja en el servidor de staging
- Cuando necesita saber el flujo de aprobación

## Flujo de ramas

```
staging (origen)
    │
    ├── feature/* ──► develop (PR libre, testing)
    │                 └──► staging (PR con aprobación @kathe)
    │
    ├── bugfix/*  ──► develop (PR libre, testing)
    │                 └──► staging (PR con aprobación @kathe)
    │
    └── hotfix/*  ──► staging + main (directo, sin develop)

staging ──► main (viernes, liberación semanal)
```

## Reglas obligatorias

### Crear rama
```bash
# SIEMPRE desde staging
git checkout staging
git pull origin staging
git checkout -b feature/nombre-funcionalidad
```

### Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
refactor: refactorización
test: pruebas
chore: mantenimiento
```

### Pull Requests
1. **PR a develop**: Merge libre, sin aprobación formal. Deploy automático a dev.
2. **PR a staging**: Solo después de aprobación de @kathe. PR independiente con solo cambios propios.
3. **Nunca**: develop → staging, main → staging.

### Hotfix
- Nace de `staging`
- Merge directo a `staging` y `main`
- No pasa por `develop`
- Se prefiere romper staging que producción

## Ambientes

| Ambiente | Rama | Deploy | Propósito |
|----------|------|--------|-----------|
| Dev | `develop` | Automático | Testing desarrollador + QA |
| Staging | `staging` | Automático | Validación funcional (datos prod) |
| Producción | `main` | Automático viernes | Usuarios finales |

## Datos clave

### UUIDs
- Contrato default: `a4537042-79fb-4e9f-a4be-18d11066e8fd`
- Tenant Luna: `3d3a8afa-deac-44b5-ab94-ec8a9fee9fc8`

### Headers requeridos para APIs
```
Authorization: Bearer <JWT>
X-Contract-ID: <contrato-uuid>
X-Tenant-ID: <tenant-uuid>
```

### Staging VPS
- IP: `217.216.48.164`
- SSH: root (usar plink)
- APISIX: puerto 80
- Contenedores: `ebrisk-*-staging`

## Preguntas frecuentes

**¿De dónde creo mi rama?**
→ Siempre desde `staging`.

**¿A dónde hago PR primero?**
→ A `develop` (obligatorio, excepto hotfix).

**¿Cuándo puedo mergear a staging?**
→ Después de que @kathe apruebe funcionalmente.

**¿Cuándo se libera a producción?**
→ Viernes (merge staging → main).

**¿Qué pasa con develop?**
→ Se borra y recrea desde `staging` después de cada liberación.

**¿Hotfix?**
→ Desde `staging`, merge directo a `staging` + `main`.

## Documentos de referencia

- `docs/AGENTS.md` - Documento principal de estrategia
- `docs/ESTRATEGIA_RAMAS_AMBIENTES.md` - Documento completo de estrategia
