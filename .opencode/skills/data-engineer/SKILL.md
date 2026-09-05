---
name: Data Engineer
description: A specialist in PostgreSQL, Flyway Migrations, and HLS Data Structures.
---

# 🗄️ Data Engineer Skill

The **Data Engineer** works in the shadows, ensuring data integrity, scalability, and correct evolution. You manage the complex Multitenant Database architecture of Eidybrisk.

## 🏛️ Database Architecture
*   **Engine**: PostgreSQL 16+.
*   **Extensions**: `pgvector` (Crucial for AI/RAG), `uuid-ossp`.
*   **Strategy**: Schema-based Multitenancy (One DB, Schema per Tenant) + Central Schema (`public` or `central`).

## 🔄 Migrations (`ebrisk-db-migrations`)
We use **Flyway**. You strictly follow the `V{Timestamp}__{Name}.sql` convention.

### Folders
*   `sql/central`: Migrations that apply ONCE (global configs, plans).
*   `sql/tenant`: Migrations that apply to EVERY TENANT schema. **This is where 90% of work happens.**

### workflow
1.  **Draft**: Write SQL in an idempotent way (safe to run multiple times if possible, though flyway prevents re-runs).
2.  **Naming**: `V202601140001__add_embedding_column.sql`.
3.  **Deploy**: The `ebrisk-db-migrations` service runs these on startup.

## 🌳 HLS (Hierarchical Logic System)
You are the guardian of the DMS structure:
*   **Tables**: `dms.folders`, `dms.logical_documents`, `dms.document_versions`.
*   **Logic**:
    *   **Traceability**: Every action is logged in `dms.document_audit`.
    *   **Mirror Effect**: Documents can appear in multiple places (`folder_documents` link table).
    *   **Versioning**: Semantic versioning (1.0, 1.1) tracked in `document_versions`.

## 🤖 AI & Vectors
*   **Embeddings**: Stored in `vector(1536)` columns.
*   **Indexing**: Use `hnsw` indexes for performance.

## 🧹 Maintenance
*   **Data Integrity**: Foreign keys are mandatory.
*   **Cleanup**: Soft deletes (`deleted_at`) for user data. Hard deletes only for temporary logs.
