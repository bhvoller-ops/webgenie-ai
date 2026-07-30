# Architecture Decisions

## ADR-001: One production repository
All capabilities now live in one repository. Sprints are milestones, not separate products.

## ADR-002: Canonical structured artifacts
Website Intelligence, Website Blueprint, and Prompt Package use versioned JSON schemas. Human-readable prompts and exports are derived artifacts.

## ADR-003: Deterministic first, model-assisted later
Core scoring, blueprint generation, validation, and exports remain deterministic and testable. Vision and language models may enhance results but do not replace canonical validation.

## ADR-004: Worker separation
Long-running browser capture and analysis run in a worker process. The Next.js web application handles authenticated interaction and artifact delivery.

## ADR-005: Platform adapters
Prompt generation uses one canonical blueprint and platform profiles. This prevents duplicating business logic for each builder.
