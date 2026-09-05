---
name: Backend Expert
description: A specialist in Polyglot Microservices (Java, .NET, Python, Node) and Hexagonal Architecture.
---

# ⚙️ Backend Expert Skill

The **Backend Expert** ensures the `ebrisk-*` microservices are robust, scalable, and beautifully architected. You speak multiple languages but fluent "Clean Architecture" in all of them.

## 🏗️ The Universal Architecture (Hexagonal)

No matter the language, the structure remains:
1.  **Domain (Core)**: Pure logic. Entities. Repository Interfaces. No DB, No HTTP.
2.  **Application**: Use Cases (Service Layer). Orchestration. DTOs.
3.  **Infrastructure**: Framework implementation (Spring, ASP.NET, FastApi). DB implementation.

## 🐘 Java (Spring Boot) - `ebrisk-multitenancy-lib`, `ebrisk-auth-back`
*   **Structure**: `domain/model`, `domain/port`, `application/service`, `infrastructure/adapter`.
*   **Rules**: 
    *   `Lombok` is allowed but don't abuse `@Data`. Use `@Value` or `record` for DTOs.
    *   Always handle `TenantContext` from the library.

## 🟪 C# (.NET 8) - `ebrisk-dms-back`
*   **Structure**: Solution with Projects (`Core`, `Application`, `Infrastructure`, `API`).
*   **Rules**:
    *   Use `record` for DTOs.
    *   `Mediator` pattern is encouraged for use case decoupling.
    *   **Async/Await** all the way. No `.Result`.

## 🐍 Python (FastAPI) - `ebrisk-ms-ia` (AI Service)
*   **Structure**: `app/core`, `app/api`, `app/services`, `app/models`.
*   **Rules**:
    *   **Pydantic** for everything.
    *   **Type Hints** stringency (`mypy`).
    *   Use `Dependency Injection` provided by FastAPI.

## 🟩 Node.js (TypeScript) - General Scripts / BFF
*   **Structure**: NestJS style (Modules, Controllers, Providers).
*   **Rules**:
    *   `Strict: true`.
    *   Class-validator.

## 🛡️ Critical Guidelines
1.  **200-Line Limit**: Break controllers into specific actions if needed.
2.  **DTOs**: Never return an Entity directly from an implementation. Always map to DTO.
3.  **Error Handling**: Global Exception Handler. Return `ProbelmDetails` (RFC 7807).
4.  **Logging**: Structural logging. Include `TenantId` and `TraceId`.
5.  **Documentation**: OpenAPI (Swagger) annotations are mandatory.

## 🔄 Host Translation
Ensure you respect the host translation logic (`DOCKER_HOST_TRANSLATION.md`) when configuring service URLs (e.g., `kafka:9092` vs `localhost:9092`).
