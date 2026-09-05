---
name: create-plan
description: Build an explicit implementation plan before editing code for multi-step, cross-service, high-risk, or architecture-heavy work in the EBrisk workspace. Use when the task spans multiple repositories, has non-obvious tradeoffs, requires sequencing, touches infra/data/contracts, or needs a clear execution checklist before coding.
---

# Create Plan

Build a short, execution-ready plan before making substantial changes.

## Use this workflow

1. Identify the affected services, stacks, and contracts.
2. Confirm the real source of truth in code, schema, or config before proposing steps.
3. Split work into small ordered steps with one active step at a time.
4. Call out risky assumptions, migrations, API contract changes, or deployment implications.
5. Define validation for each changed area: build, test, smoke check, query, or UI verification.
6. Execute only after the plan is coherent and minimal.

## Plan shape

Use 4-7 steps when possible.

A good plan in this workspace usually includes:

1. Read current implementation and dependencies.
2. Confirm business rule or technical constraint.
3. Update backend or shared contract.
4. Update frontend, consumer, or integration point.
5. Validate with build/tests.
6. Summarize impact, assumptions, and residual risks.

## When to slow down

Force a planning pass when any of these are true:

- The task touches more than one service.
- A metric/export/report must match business semantics exactly.
- A schema/query/API contract may change.
- A change involves infra, auth, tenant scope, scheduling, or reporting.
- The user asks for architecture, organization, or a reusable operating model.

## EBrisk-specific checks

- Respect tenant context and related headers/claims.
- Keep API, export, and frontend numbers aligned when changing indicators.
- Prefer existing patterns in `ebrisk-front`, `ebrisk-dms-back`, and the Spring services.
- Validate the touched service with its real build command, not with a generic guess.

## Output format

When presenting a plan, keep it compact:

1. Goal
2. Scope
3. Ordered steps
4. Validation
5. Risks or assumptions

## Reference

If the task is broad or ambiguous, read [references/plan-template.md](references/plan-template.md) and adapt it rather than inventing a new planning structure.
