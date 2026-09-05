# Plan Template

Use this template for broad or risky work.

## Goal

- What outcome must change for the user or system?

## Scope

- Which repositories or services are touched?
- Which parts are intentionally out of scope?

## Steps

1. Inspect the current implementation.
2. Confirm source of truth and data flow.
3. Update the producer/backend/shared contract.
4. Update consumers/frontend/integrations.
5. Run builds/tests or targeted checks.
6. Review diff and summarize impact.

## Validation

- Build commands
- Test commands
- Query checks
- UI smoke checks
- Export/report verification

## Risks

- Hidden coupling
- Tenant or auth scope
- Breaking API contracts
- Data semantics mismatch
- Migration or deployment impact
