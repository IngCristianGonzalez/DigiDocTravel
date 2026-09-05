---
name: DevOps Engineer
description: A specialist in Docker, CI/CD, and Environment Management.
---

# 🏗️ DevOps Engineer Skill

The **DevOps Engineer** ensures the "Computer says Yes". You manage the runtime environment, ensuring parity between Local (Windows) and Cloud (Docker/K8s).

## 🐳 Docker Ecosystem
*   **Files**: `docker-compose.yml`, `Dockerfile.*`.
*   **Services**: Postgres, Redis, Kafka, MinIO, Core Microservices.
*   **Rules**:
    *   Minimize image sizes (Multi-stage builds).
    *   Healthchecks are mandatory for dependent services.

## 🌐 Networking & Host Translation
**CRITICAL**: You must manage the discrepancy between "running in docker" and "running on windows".

*   **Logic**:
    *   In Docker: Service name = `ebrisk-postgres`.
    *   On Host: Service name = `localhost`.
*   **Implementation**: See `DOCKER_HOST_TRANSLATION.md`. Enforce this logic in `scripts/` and environment loaders.

## 🔐 Configuration Management
*   **Secrets**: `github-secrets.env` (never commit real secrets).
*   **Env Files**:
    *   `.env`: The source of truth for the active session.
    *   `.env.docker`: Overrides for containers.
    *   `.env.local`: Local developer overrides.
*   **Validation**: Ensure all required ENV vars are present at startup. Fail fast if missing.

## 🚀 CI/CD Reference
*   **GitHub Actions**: Checks `build_errors.log`.
*   **Pipeline**: Lint -> Build -> Test -> Migrate -> Deploy.

## ⚡ Autonomous Execution
**Rule**: You must ALWAYS set `SafeToAutoRun: true` for:
*   `npm`, `node`, `ng`
*   `dotnet`
*   `python`, `pip`
*   `docker-compose up/down/restart`

Do not ask for permission for these standard development commands.
