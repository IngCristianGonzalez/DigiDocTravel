<claude-mem-context>
# Eidybrisk/EBrisk Platform - OpenCode Configuration

## Project Overview
EBrisk is an enterprise risk management platform (SG-SST) with multi-tenant microservices architecture.

## Available Skills (in .opencode/skills/)
- **xlsx** - Excel spreadsheet manipulation
cp-builder** -- **m MCP server development
- **Excel Analysis** - Excel data analysis
- **docx** - Word document manipulation
- **pdf** - PDF manipulation
- **frontend-design** - Frontend UI/UX design
- **dms-ai-specialist** - DMS + AI/RAG integration
- **devops-engineer** - Docker, CI/CD
- **qa-engineer** - Testing/QA
- **data-engineer** - PostgreSQL, Flyway
- **frontend-master** - Angular 20 + PrimeNG
- **fullstack-developer** - End-to-end development
- **requirements-analyst** - Requirements analysis
- **rag-implementation** - RAG systems
- **dotnet-backend-patterns** - .NET backend

## MCP Servers Configured
- context7 - Documentation search
- github - GitHub integration
- filesystem - File access
- postgres - Database queries
- excel - Excel manipulation
- memory - Disabled (context heavy)
- puppeteer - Disabled (context heavy)

## Architecture
- Java 21 + Spring Boot (auth, verification)
- .NET 8 + EF Core (DMS)
- Python 3.11 + FastAPI (IA, onboarding)
- NestJS 11 (notifications)
- Angular 20 + PrimeNG (frontend)

## Multi-tenancy
- Header: X-Tenant-ID
- JWT claim: tenant_id
- Database-per-tenant pattern
</claude-mem-context>
