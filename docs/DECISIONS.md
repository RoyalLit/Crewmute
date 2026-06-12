# Architectural Decision Records
# Crewmute

This document records all significant technical decisions made in the Crewmute repository.
All ADRs must follow the format defined in AGENT_RULES.md §24.2.
New ADRs are numbered sequentially. Numbers are never reused.

---

## ADR-001: Feature-First Directory Structure

**Date:** 2026-06-12
**Status:** Accepted

### Decision

Code in both `backend/src/` and `mobile/src/` is organized by feature/domain (feature-first), not by technical type. Feature code lives under `features/<feature-name>/`. Cross-feature shared code graduates to `shared/` or `components/` only when demonstrably used by two or more features.

### Context

A conflict exists between the two authoritative source documents:
- `ARCHITECTURE.md §2` shows a type-grouped layout (`controllers/`, `routes/`, `models/`, `components/`, `hooks/`)
- `AGENT_RULES.md §7.1` and `§9.2` mandate feature-first organization

The AGENT_RULES.md §2 precedence hierarchy places AGENT_RULES above the existing codebase. Both ARCHITECTURE.md and AGENT_RULES.md are ranked equally as source documents, but AGENT_RULES.md is the engineering constitution that explicitly governs architectural organization, and its feature-first mandate is a specific rule that overrides the illustrative overview in ARCHITECTURE.md.

### Reasoning

Feature-first organization collocates all layers of a feature (route, controller, service, repository, validators, types, tests) in one directory. This reduces cognitive overhead when working on a feature, makes deletion of a feature clean, and aligns with the AGENT_RULES mandate.

The type-grouped layout in ARCHITECTURE.md §2 is treated as a high-level conceptual overview, not a binding directory specification.

### Alternatives Considered

- **Type-grouped layout (ARCHITECTURE.md §2):** Rejected. AGENT_RULES.md explicitly mandates feature-first in §7.1 and §9.2. Following the type-grouped layout would violate the engineering constitution.
- **Hybrid (type-grouped top level, feature-first inside features/):** Rejected. Adds complexity without benefit; AGENT_RULES.md is unambiguous.

### Consequences

- **Positive:** Collocated feature code, clean feature deletion, explicit cross-feature sharing rules.
- **Negative:** ARCHITECTURE.md §2 diagrams differ from actual structure — ARCHITECTURE.md §2 should be updated in a follow-up docs PR to reflect the actual layout.
- **Risks:** Contributors familiar with ARCHITECTURE.md §2 may expect type-grouped layout. Mitigated by this ADR and the README.
- **Reversibility:** Reversing to type-grouped would require a broad rename/restructure. Treat as a durable decision.

---

## ADR-002: TypeScript Strict Mode for Backend

**Date:** 2026-06-12
**Status:** Accepted

### Decision

The backend is written in TypeScript 5.x with `strict: true`, `noImplicitAny: true`, and `strictNullChecks: true`. TypeScript is compiled with `tsc` to `dist/` for production; `ts-node-dev` is used in development.

### Context

AGENT_RULES.md §9 specifies the backend stack as "Node.js + Express + TypeScript." Strict mode is not explicitly mandated but directly supports the correctness and explicitness principles in §3.1 and the `any` prohibition in §3.4.

### Reasoning

Strict TypeScript catches entire classes of runtime bugs at compile time (null dereferences, type mismatches, missing property accesses). The cost is more explicit type annotations; the benefit is that AGENT_RULES §27.2 (no hallucinated imports) is enforced by the compiler.

### Alternatives Considered

- **JavaScript (no TypeScript):** Rejected. AGENT_RULES.md §9 mandates TypeScript.
- **TypeScript without strict mode:** Rejected. Non-strict TypeScript allows `any` implicitly, which violates §3.4 and undermines the correctness goal.

### Consequences

- **Positive:** Type safety, better IDE support, enforces AGENT_RULES §3.4 `any` prohibition.
- **Negative:** Slightly more verbose initial setup; some third-party types may require `@types/*` packages.
- **Risks:** None significant.
- **Reversibility:** Loosening strict mode later is straightforward. Tightening it later is painful. Start strict.

---

## ADR-003: express-validator for Backend Request Validation

**Date:** 2026-06-12
**Status:** Accepted

### Decision

`express-validator` is used for all HTTP request input validation in the backend. Environment variable validation is handled inline in `config/env.ts` without an external library (under 30 lines, per AGENT_RULES.md §15.1).

### Context

ARCHITECTURE.md §8.2 explicitly names `express-validator`. AGENT_RULES.md §9.6 says "uses the library specified in ARCHITECTURE.md." Zod was considered as an alternative due to its TypeScript-native schema inference, but ARCHITECTURE.md is unambiguous.

### Reasoning

ARCHITECTURE.md explicitly names `express-validator`. Following the authoritative document rather than substituting a preferred alternative maintains predictability and avoids introducing an unapproved dependency.

### Alternatives Considered

- **Zod:** TypeScript-native schema inference, single source of truth for types and validation. Rejected because ARCHITECTURE.md mandates `express-validator` for request validation. Zod may be reconsidered post-MVP via a superseding ADR if express-validator proves limiting.
- **Joi:** Mature but JavaScript-first. Rejected — same reasoning as Zod plus less TypeScript integration.

### Consequences

- **Positive:** Consistent with ARCHITECTURE.md; well-documented; large ecosystem.
- **Negative:** Validation schemas do not automatically infer TypeScript types (unlike Zod). Type definitions must be maintained separately in `*.types.ts` files.
- **Risks:** Low. express-validator is actively maintained.
- **Reversibility:** Replacing express-validator with Zod would require updating all `*.validators.ts` files — significant but mechanical.

---

## ADR-004: Pino for Structured Logging

**Date:** 2026-06-12
**Status:** Accepted

### Decision

`pino` is used as the structured logger for the backend. `pino-http` provides request logging middleware. All application code uses the `logger` singleton from `shared/logger.ts`. `console.log`, `console.error`, and `console.warn` are forbidden in application code (enforced via ESLint rule).

### Context

AGENT_RULES.md §20.3 explicitly forbids `console.log` for application logging and mandates a structured logger. No specific logger is named in ARCHITECTURE.md or AGENT_RULES.md.

### Reasoning

Pino is the fastest Node.js JSON logger, actively maintained, natively supports structured log fields (timestamp, level, requestId, userId), and has a first-class `pino-http` middleware. Its output is JSON in production and pretty-printed in development via `pino-pretty`.

### Alternatives Considered

- **Winston:** More feature-rich but heavier, slower, and more complex. Rejected — overkill for MVP scope.
- **Morgan (HTTP only) + console:** Morgan handles HTTP logs only; `console.*` is forbidden by AGENT_RULES.md §20.3. Rejected.

### Consequences

- **Positive:** JSON-structured logs compatible with Railway log aggregation, fast, meets §20.3 requirements.
- **Negative:** Requires `pino-pretty` for human-readable dev logs (dev dependency).
- **Risks:** None significant.
- **Reversibility:** Replacing logger requires updating all log call sites. Mitigated by the `shared/logger.ts` singleton — only one import point to change.

---

## ADR-005: Jest + ts-jest + Supertest for Backend Testing

**Date:** 2026-06-12
**Status:** Accepted

### Decision

Backend tests use Jest as the test runner, `ts-jest` for TypeScript compilation in tests, and `supertest` for HTTP integration testing. Coverage thresholds are enforced per AGENT_RULES.md §22.4: statements 80%, branches 75%, functions 80%, lines 80%.

### Context

AGENT_RULES.md §22.2 mandates Jest for unit tests and Supertest + Jest for integration tests.

### Reasoning

Jest is explicitly named in AGENT_RULES.md. `ts-jest` is the standard TypeScript integration for Jest, avoiding a separate compilation step. Supertest is the de facto HTTP assertion library for Express.

### Alternatives Considered

- **Vitest:** Faster and more TypeScript-native than Jest. Rejected — AGENT_RULES.md §22.2 explicitly names Jest.
- **Mocha + Chai:** Older, requires more configuration. Rejected — AGENT_RULES.md names Jest.

### Consequences

- **Positive:** Consistent with AGENT_RULES.md mandates; widely understood.
- **Negative:** Jest can be slow on large test suites; ts-jest adds compilation overhead.
- **Risks:** None significant.
- **Reversibility:** Migrating test runners is feasible but involves rewriting all test files.

---

## ADR-006: Zustand for Mobile Global State

**Date:** 2026-06-12
**Status:** Accepted

### Decision

Zustand is used for global application state on mobile. Per AGENT_RULES.md §12.1, global state is limited to: auth session, theme preference, and global notification queue. All API-derived data lives in server state (TanStack Query — see ADR-007).

### Context

ARCHITECTURE.md §2.2 explicitly names Zustand (`store/ — Zustand global state`). AGENT_RULES.md §12.1 defines the state scope hierarchy and what belongs in global state.

### Reasoning

Zustand is explicitly named in ARCHITECTURE.md. It is lightweight (~1KB), TypeScript-native, and has minimal boilerplate. The constraint on global state scope (§12.1) prevents the common mistake of putting API data in global state.

### Alternatives Considered

- **Redux Toolkit:** More powerful but significantly more boilerplate. Rejected — Zustand is named in ARCHITECTURE.md and is sufficient for the constrained global state scope.
- **React Context for global state:** Appropriate for feature-scoped state (§12.1 level 3) but causes re-render cascades at global scope. Rejected for global state.

### Consequences

- **Positive:** Minimal boilerplate, TypeScript-native, consistent with ARCHITECTURE.md.
- **Negative:** Less tooling than Redux (no Redux DevTools, though Zustand has its own devtools middleware).
- **Risks:** None significant.
- **Reversibility:** Replacing Zustand requires updating all store files and consumers.

---

## ADR-007: TanStack Query v5 for Mobile Server State

**Date:** 2026-06-12
**Status:** Accepted

### Decision

TanStack Query (React Query) v5 is used for all server/async state in the mobile app. API responses are never copied into Zustand. Queries are defined per-feature in `features/<name>/hooks/`.

### Context

AGENT_RULES.md §12.1 mandates a dedicated server state library for all API-derived data: "No manual re-implementation of caching logic — use the designated server state library." ARCHITECTURE.md does not name a specific server state library.

### Reasoning

TanStack Query v5 is the industry standard for React server state management. It handles caching, background refetching, stale-while-revalidate, pagination, and optimistic updates — features that will be needed for the ride feed and request management flows.

### Alternatives Considered

- **SWR:** Simpler API but fewer features. Rejected — TanStack Query's mutation support and cache invalidation primitives are needed for the ride/request lifecycle.
- **Manual fetch + useState:** Forbidden by AGENT_RULES.md §12.2 ("No manual re-implementation of caching logic").

### Consequences

- **Positive:** Eliminates all manual caching logic, handles loading/error/success states automatically, aligns with §12.1 requirements.
- **Negative:** Adds bundle size (~13KB gzipped). Accepted — the benefit is proportionate.
- **Risks:** v5 API differs from v4; ensure all feature PRs use v5 patterns.
- **Reversibility:** Replacing TanStack Query requires refactoring all data-fetching hooks. Treat as durable.

---

## ADR-008: NativeWind v4 for Mobile Styling

**Date:** 2026-06-12
**Status:** Accepted

### Decision

NativeWind v4 is installed and configured for mobile styling. It provides Tailwind CSS utility classes in React Native. The custom Crewmute design token system (from DESIGN.md) is layered on top via `useTheme()` and the `tokens.ts` file. Tailwind utilities are extended in `tailwind.config.js` to map to Crewmute brand colors.

### Context

PRD.md §6.1 explicitly lists NativeWind v4 in the mobile tech stack. DESIGN.md §9 mandates a custom token system via React Context + Zustand.

### Reasoning

NativeWind is explicitly named in the PRD. It provides familiar Tailwind utility classes for rapid layout work while the custom token layer (DESIGN.md §9) ensures design system compliance. The two layers are complementary: Tailwind for structural utilities, tokens for semantic color/spacing values.

### Alternatives Considered

- **StyleSheet.create only (no NativeWind):** Valid, but PRD explicitly names NativeWind. Rejected to maintain fidelity to the PRD.
- **NativeWind only (no custom token layer):** Would conflict with DESIGN.md §9 which mandates `useTheme()` and the token map for semantic values. Rejected.

### Consequences

- **Positive:** Rapid layout iteration with Tailwind, semantic token layer for design system compliance.
- **Negative:** Two styling paradigms to understand (Tailwind utilities + token hooks). Mitigated by clear documentation of when to use each.
- **Risks:** NativeWind v4 is relatively new; some React Native components may require workarounds.
- **Reversibility:** Removing NativeWind would require converting Tailwind class strings to StyleSheet equivalents across all components. Significant but mechanical.

---

*DECISIONS.md — Crewmute Architectural Decision Records*
*All ADRs authored by human engineers or reviewed by human engineers before acceptance.*
*Format per AGENT_RULES.md §24.2*
