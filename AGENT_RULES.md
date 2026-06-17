# AGENT_RULES.md
# Crewmute Engineering Constitution
# Version: 2.0.0
# Applies to: All AI agents and human contributors

---

## PREAMBLE

This document is the engineering constitution for the Crewmute repository. It governs every change made by every contributor — human or AI — including but not limited to: Claude Code, Codex, Cursor, Gemini, Windsurf, Roo, Cline, and OpenCode.

These rules are not suggestions. They are enforced standards. Any change that violates this document must be reverted or corrected before merging.

**This document may not be modified by any AI agent under any circumstances.** See Section 27.

---

## 1. MISSION

Crewmute is a full-scale, production-ready system. We are NOT focused on building an MVP; we are building the complete main product. This repository exists to ship a correct, reliable, and maintainable product with robust features. Correctness, security, and scalability are non-negotiable. Speed is a result of discipline, not a replacement for it. Shortcuts or "MVP hacks" are strictly forbidden.

### 1.1 Purpose of This Repository

This repository contains the complete implementation of Crewmute: mobile client, backend API, shared utilities, tests, scripts, and documentation.

### 1.2 Source Documents

| Document | Authority |
|---|---|
| `PRD.md` | Defines what the product does and why |
| `ARCHITECTURE.md` | Defines how the system is built |
| `DESIGN_SYSTEM.md` | Defines how the UI looks and behaves |
| `AGENT_RULES.md` | Defines how all contributors must work in this repo |

### 1.3 Agent Scope

Agents implement what the source documents define. Agents do not:

- Invent product features not described in the PRD
- Introduce architectural patterns not approved in ARCHITECTURE.md
- Create UI components that deviate from DESIGN_SYSTEM.md
- Make assumptions about product direction
- Interpret silence as permission
- Delete existing code without explicit instruction to do so

If a requirement is unclear, the agent must surface the ambiguity rather than resolve it unilaterally.

---

## 2. SOURCE OF TRUTH HIERARCHY

When any conflict exists between sources, this precedence applies strictly, in order:

```
1. PRD.md                  → Product behavior and requirements
2. ARCHITECTURE.md         → System design and technical decisions
3. DESIGN_SYSTEM.md        → UI, tokens, components, patterns
4. Existing Codebase       → Established patterns and conventions
5. Agent Assumptions       → Never a valid source of truth
```

**The higher source always wins.**

### 2.1 Conflict Resolution Process

When a conflict is detected:

1. **Identify** the specific conflict and which documents are in tension.
2. **Do not resolve silently.** Do not pick one and proceed.
3. **Document the conflict** as a comment in the relevant file or in the PR description.
4. **Escalate** to a human engineer for resolution before implementing.
5. **Never implement a resolution that contradicts a higher-ranked document.**

Example: If the codebase uses pattern X but ARCHITECTURE.md mandates pattern Y, implement Y and refactor X. Do not extend pattern X.

### 2.2 When Documentation Is Behind the Codebase

At any point, a source document may describe a state the codebase has not yet reached, or may be silent on a detail the codebase has already solved pragmatically. When an agent encounters this:

- **If the codebase is ahead of the docs:** treat the codebase pattern as provisional, flag it with `// TODO(docs): this pattern is undocumented — verify against ARCHITECTURE.md`, and note it in the PR.
- **If the docs describe something not yet built:** implement the documented approach, do not improvise an alternative.
- **If the docs are silent on a specific detail:** follow the closest established codebase pattern, add a `// TODO(prd): clarify behavior for <case>` comment, and flag in the PR.

Never use documentation gaps as permission to invent solutions.

---

## 3. AGENT OPERATING PRINCIPLES

These principles govern all decision-making. When two valid options exist, these principles determine the correct choice.

### 3.1 Core Principles

| Principle | Rule |
|---|---|
| **Correctness over speed** | A feature that works correctly and ships tomorrow is better than one that ships today and breaks in production. |
| **Simplicity over cleverness** | If a simpler solution exists, use it. Clever code that is hard to read is bad code. |
| **Readability over brevity** | Write code for the next engineer, not the compiler. A longer, clear solution beats a short, cryptic one. |
| **Consistency over preference** | Follow established patterns in the codebase, even if you would personally choose differently. |
| **Explicitness over magic** | No implicit behaviors. No hidden control flows. No side effects in constructors. |
| **Reversibility over permanence** | When two approaches are otherwise equal, prefer the one that is easier to change or undo. Irreversible architectural decisions require proportionally more justification. |
| **Maintainability over novelty** | Do not introduce a new pattern, library, or paradigm because it is interesting. Introduce it only if it demonstrably solves a real problem better than the existing approach. |

### 3.2 Decision Test

Before implementing any non-trivial decision, apply this test:

> "Could a mid-level engineer unfamiliar with this codebase understand this in 5 minutes?"

If no: simplify.

### 3.3 The Reversibility Test

Before making any architectural or structural decision that is difficult to undo, ask:

> "If this turns out to be wrong in 6 months, how painful is it to reverse?"

If the answer is "very painful," the decision requires an ADR and explicit human approval before implementation.

### 3.4 Anti-Patterns — Always Forbidden

- Premature abstraction
- Speculative generality ("we might need this later")
- Deep nesting beyond 3 levels
- Functions longer than 50 lines without documented justification
- Files longer than 300 lines without documented justification
- Magic numbers and strings without named constants
- Silent failures
- `any` types in TypeScript without a suppression comment explaining why
- Deleting existing non-test code without an explicit instruction or explanation

---

## 4. PLANNING BEFORE CODING

No agent may begin writing implementation code without completing the planning phase.

### 4.1 Required Pre-Implementation Steps

Before writing a single line of implementation code, the agent must:

1. **Read the relevant documentation.** For any feature task, read the relevant PRD section. For any architectural change, read ARCHITECTURE.md. For any UI task, read DESIGN_SYSTEM.md.

2. **Understand the existing implementation.** Search the codebase for related files, components, services, and utilities. Understand what already exists before creating anything new.

3. **Verify all imports and dependencies.** Confirm that every module, function, and type referenced in the plan actually exists at the stated path. Do not assume.

4. **Produce a written plan** stating:
   - What is being built or changed.
   - Why it is needed (reference to PRD/Architecture).
   - Which files will be created or modified.
   - Which existing patterns will be followed.
   - Any risks, unknowns, or concerns.
   - What is explicitly out of scope.

5. **Identify all impacted files** including tests, documentation, types, and consumers of changed interfaces.

### 4.2 Forbidden: Blind Implementation

Agents must not:

- Start writing code before reading relevant docs
- Assume they understand the existing system without exploring it
- Implement first and plan later
- Refactor while implementing a feature (separate tasks)
- Reference a module or function without verifying it exists

### 4.3 Plan Format

```
## Plan: <Task Name>

**What:** <One sentence description>
**Why:** <Reference to PRD/Architecture requirement>
**Files to modify:** <List>
**Files to create:** <List with justification for each>
**Approach:** <Step-by-step description>
**Risks:** <Any concerns or unknowns>
**Out of scope:** <What will NOT be done in this task>
```

---

## 5. TASK SIZE AND QUALITY GATES

All work must be decomposed into small, reviewable, atomic tasks. Size limits exist not as bureaucracy but as quality gates — large changes are harder to review correctly, more likely to introduce bugs, and harder to revert.

### 5.1 Thresholds

| Dimension | Review Carefully | Requires Decomposition |
|---|---|---|
| Files modified | > 8 files | > 15 files |
| Lines changed | > 400 lines | > 800 lines |
| New files created | > 5 files | > 10 files |
| Features touched | > 2 features | > 3 features |

Exceeding the **Requires Decomposition** threshold requires a written phase plan before any code is written.

### 5.2 New Feature Scaffolding Exception

When building a new feature from scratch (routes + controller + service + repository + validators + types + tests), the line threshold applies per logical unit, not per feature. A single feature scaffold that touches all layers is expected to be larger than a targeted bug fix. The quality gate in this case is completeness and correctness of each layer, not line count alone.

### 5.3 Required Phase Decomposition

For tasks that require decomposition, the agent must:

1. Define all phases in writing before starting.
2. Ensure each phase leaves the codebase in a buildable, testable state.
3. Never leave the codebase in a broken or partially-wired state without a `// WIP(phase N of M): <what is incomplete>` marker on every affected file.
4. Complete phase N before beginning phase N+1.

### 5.4 Scope Creep — Strictly Forbidden

If during implementation the agent identifies a related issue or improvement:

- **Do not fix it inline.**
- Add a `// TODO: <description>` comment.
- Complete the original task first.

The only exception: if the related issue makes the current task impossible to complete correctly, it may be fixed as a prerequisite with explicit documentation in the PR.

---

## 6. REPOSITORY STRUCTURE RULES

### 6.1 Approved Top-Level Structure

```
/
├── mobile/          # React Native + Expo application
├── backend/         # Node.js + Express API server
├── docs/            # All project documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── DECISIONS.md
│   └── api/         # API reference documentation
├── tests/           # Cross-cutting integration and E2E tests
├── scripts/         # Build, deploy, seed, and migration scripts
├── .github/         # CI/CD workflows
├── AGENT_RULES.md
└── README.md
```

### 6.2 Directory Ownership

| Directory | Owner | Purpose |
|---|---|---|
| `mobile/` | Mobile team | All React Native / Expo code |
| `backend/` | Backend team | All Node.js API code |
| `docs/` | All contributors | All documentation |
| `tests/` | All contributors | Cross-cutting integration and E2E tests |
| `scripts/` | All contributors | Automation scripts |

### 6.3 Forbidden Actions

- Creating new top-level directories without an ADR in `docs/DECISIONS.md`
- Placing source code outside the designated directories
- Creating catch-all directories (`utils/`, `helpers/`, `misc/`, `common/`, `shared/` at the top level) without an ADR defining exactly what belongs there and why a feature-scoped location is insufficient

### 6.4 The Catch-All Directory Problem

`shared/` is not a catch-all. It is a last resort. Before placing anything in a shared directory, the agent must answer: "Is this genuinely used by more than one feature, and is there no better feature-scoped home for it?" If the answer is no to either, it does not belong in shared.

### 6.5 New Top-Level Directory Process

1. Write an ADR in `docs/DECISIONS.md`.
2. Get explicit approval from a human engineer.
3. Update Section 6.1 of this document via a separate PR.

---

## 7. ARCHITECTURE RULES

### 7.1 Mandatory Principles

- **Separation of concerns**: UI, business logic, and data access are in separate layers and must not bleed into each other.
- **Feature-first organization**: Code is organized by feature/domain, not by type. Prefer `features/mute-request/` over scattered `components/`, `hooks/`, `services/`.
- **Dependency direction**: Dependencies flow inward. UI depends on business logic. Business logic depends on data access. Data access depends on the database. Never reverse this.
- **No circular dependencies**: Module A must never import from Module B if Module B imports from Module A, directly or transitively. Use a linting tool to enforce this.
- **Business logic in services only**: Business logic lives in services. Not in controllers. Not in UI components. Not in middleware. Not in repositories.

### 7.2 Dependency Direction — Enforced Examples

```
CORRECT:
  Screen → Hook → Service → Repository → DB Model

FORBIDDEN:
  Service → Screen component
  Repository → another Repository (cross-repo logic belongs in a Service)
  UI Component → DB model or Repository
  Middleware → Service (middleware is cross-cutting, not feature-aware)
```

### 7.3 Architecture Violations

Any code that violates ARCHITECTURE.md must not be merged. If ARCHITECTURE.md is itself wrong or outdated, update the document first via an ADR, then implement. Do not implement a workaround while the doc remains wrong.

### 7.4 Prefer Reversible Architecture

When choosing between two architecturally valid approaches, prefer the one that is easier to change later. Document the tradeoff in an ADR if it's a meaningful decision.

---

## 8. MOBILE DEVELOPMENT STANDARDS

Stack: **React Native + Expo**

### 8.1 Feature Structure

Each feature follows this structure:

```
mobile/src/features/<feature-name>/
├── components/       # UI components used only by this feature
├── screens/          # Screen-level components (navigation entry points)
├── hooks/            # Custom hooks for this feature
├── services/         # API calls and data logic for this feature
├── types.ts          # Types specific to this feature
└── index.ts          # Public API of the feature (explicit exports only)
```

Shared UI components used across features live in `mobile/src/components/`. Shared hooks used across features live in `mobile/src/hooks/`. These are not catch-alls — a component only graduates to shared when it is demonstrably used by two or more features.

### 8.2 Component Rules

- Components are pure UI. No API calls. No business logic. No data transformation.
- All data enters via props or from a hook.
- All business logic lives in hooks or services.
- Components accept typed props. No `any` prop types.
- Each component lives in its own file.
- File names and exported component names are identical: `MuteRequestCard.tsx` exports `MuteRequestCard`.

### 8.3 Design System Compliance

- All colors, spacing, typography, and border radii come from design tokens defined in DESIGN_SYSTEM.md.
- No hardcoded color values, font sizes, or spacing values anywhere in the codebase.
- Use the design system's component library before building a custom component.
- If a required component does not exist in the design system, create it in `mobile/src/components/`, document it, and flag it for design review.

```tsx
// FORBIDDEN
<View style={{ padding: 16, backgroundColor: '#1A1A2E' }}>

// REQUIRED
<View style={{ padding: spacing.md, backgroundColor: colors.background.primary }}>
```

### 8.4 Navigation

- Navigation structure is defined in ARCHITECTURE.md. Do not invent new navigation patterns.
- Screen components receive navigation props and render UI. No data fetching in screen components.
- Deep links must be documented in `docs/` when added.

### 8.5 Accessibility

- All interactive elements must have `accessibilityLabel` and `accessibilityRole`.
- Touch targets must be at minimum 44×44 points.
- Color contrast must meet WCAG AA.
- Screen reader compatibility is required for all user-facing flows.

### 8.6 Feature Flags

Incomplete features that exist in the codebase but are not ready for users must be gated behind a feature flag. The feature flag system is defined in ARCHITECTURE.md.

- Never ship a screen or flow to production that is reachable without a flag if it is not complete.
- Feature flag constants are named `FF_<FEATURE_NAME>` and live in `mobile/src/config/featureFlags.ts`.
- Removing a flag after a full rollout requires deleting the flag constant and all conditional branches — do not leave dead flag code in the codebase.

### 8.7 Forbidden — Mobile

- Inline `StyleSheet.create` calls inside component render functions
- `style={{ ... }}` object literals on any component that renders in a list
- Business logic inside screen components
- API calls inside screen components
- Duplicating screens — extend or parameterize existing screens
- `useEffect` to fetch data that should be in a dedicated hook
- Any async operation without a corresponding loading state

---

## 9. BACKEND DEVELOPMENT STANDARDS

Stack: **Node.js + Express + TypeScript**

### 9.1 Layer Responsibilities

```
Route        → Declare endpoint, attach middleware, delegate to controller
Controller   → Parse and validate request input, call one service method, return response
Service      → Execute business logic, enforce rules, orchestrate repositories
Repository   → Execute database queries, return typed plain objects
Middleware   → Cross-cutting concerns only: auth, logging, rate limiting, error handling
```

Each layer has exactly one job. Any code that belongs to two layers belongs in neither — create an abstraction that is correctly scoped.

### 9.2 Directory Structure

```
backend/src/
├── features/
│   └── <feature-name>/
│       ├── <feature>.routes.ts
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts
│       ├── <feature>.repository.ts
│       ├── <feature>.validators.ts
│       └── <feature>.types.ts
├── middleware/
├── config/
├── db/
│   ├── models/
│   └── connection.ts
├── shared/
│   ├── errors.ts
│   ├── logger.ts
│   └── types.ts
└── app.ts
```

### 9.3 Controller Rules

A controller method must do exactly three things:

1. Extract and validate input from `req` using the feature's validator
2. Call one service method
3. Return a formatted response

If a controller method exceeds 20 lines, it contains too much logic. Move logic to the service. Controllers must have zero awareness of database models, Mongoose, or query construction.

```ts
// CORRECT
async createMuteRequest(req: Request, res: Response): Promise<void> {
  const dto = validateCreateMuteRequest(req.body);
  const result = await muteRequestService.create(dto, req.user.id);
  res.status(201).json(successResponse(result));
}
```

### 9.4 Service Rules

Services contain all business logic. A service:

- Has no dependency on Express (`req`, `res`, `next` never appear)
- Calls repositories for all data access
- Throws typed `AppError` subclasses on rule violations
- Is fully testable in isolation with mocked repositories
- Does not construct raw database queries

### 9.5 Repository Rules

Repositories are the only layer permitted to interact with the database. A repository:

- Accepts plain typed objects as arguments
- Returns plain typed objects — never Mongoose documents
- Has exactly one responsibility: querying one collection
- Contains zero business logic
- Does not call other repositories

Cross-collection logic (joins, multi-collection writes) belongs in a service that coordinates multiple repositories, not in a repository that calls another.

```ts
// CORRECT — repository returns plain object
async findById(id: string): Promise<MuteRequest | null> {
  const doc = await MuteRequestModel.findById(id).lean();
  return doc ? (doc as MuteRequest) : null;
}

// FORBIDDEN — returning a Mongoose document
async findById(id: string) {
  return MuteRequestModel.findById(id); // returns Mongoose Document, not plain object
}
```

### 9.6 Validation

- All request inputs are validated before the controller body executes.
- Validation uses the library specified in ARCHITECTURE.md (e.g., Zod).
- Validation schemas live in `<feature>.validators.ts`.
- Validation errors return HTTP 400 with structured field-level details.
- Validation is the controller's responsibility — services assume their inputs are already valid.

### 9.7 Forbidden — Backend

- Business logic in routes, middleware, or validators
- Direct database access in controllers, routes, or services
- Raw MongoDB/Mongoose queries outside of repositories
- Returning Mongoose documents from repositories
- Untyped `req` or `res` objects
- `console.log` for application logging (use the structured logger)
- Hardcoded configuration values (use environment variables via `config/`)

---

## 10. DATABASE RULES

Database: **MongoDB with Mongoose**

### 10.1 Schema Requirements

Every Mongoose schema must have:

- **Explicit field types** — no implicit `Mixed` unless documented with justification
- **Validation** — `required`, `enum`, `min`, `max`, `match` constraints as appropriate
- **Timestamps** — `{ timestamps: true }` on all schemas without exception
- **Indexes** — declared on the schema, not applied ad-hoc or externally
- **Version key** — enabled by default; disabled only with documented justification

```ts
const MuteRequestSchema = new Schema({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status:      { type: String, enum: ['pending', 'active', 'resolved'], required: true, default: 'pending' },
  expiresAt:   { type: Date, required: true, index: true },
}, { timestamps: true });

// Compound index for the most common query pattern
MuteRequestSchema.index({ requesterId: 1, status: 1 });
```

### 10.2 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Collection names | Plural, camelCase | `muteRequests` |
| Field names | camelCase | `createdAt`, `requesterId` |
| Model names | PascalCase, singular | `MuteRequest` |
| Index names | Descriptive | `muteRequests_requesterId_status` |

### 10.3 Index Strategy

Every index must be justified by a named query. Document indexes like this:

```ts
// Supports: MuteRequestRepository.findActiveByRequester()
MuteRequestSchema.index({ requesterId: 1, status: 1 });
```

Rules:
- Index every field used in `find()`, `sort()`, or aggregation `$match` stages
- Use compound indexes for queries that filter on multiple fields together
- Review index coverage during every schema change
- Remove indexes that no longer correspond to active queries

### 10.4 Schema Change Protocol

Any change to a database schema requires:

1. A migration script in `scripts/migrations/` with a datestamped filename: `YYYYMMDD_<description>.ts`
2. Updated schema documentation in `docs/`
3. An ADR entry in `docs/DECISIONS.md` for any breaking or significant change
4. Explicit backward compatibility analysis — document what breaks and how it is handled

### 10.5 Forbidden — Database

- Storing secrets, credentials, or tokens in the database
- Using `Mixed` type without a documented justification
- Schema changes without a corresponding migration script
- Queries on large collections without index coverage
- Direct use of `db` or the MongoDB driver outside of Mongoose models

---

## 11. API DESIGN STANDARDS

### 11.1 URL Conventions

- Resources are plural nouns: `/users`, `/mute-requests`
- Kebab-case for multi-word resources: `/mute-requests`, not `/muteRequests`
- Nested resources for clear ownership: `/users/:userId/mute-requests`
- Non-CRUD actions use verb-noun on the resource: `/mute-requests/:id/resolve`

```
GET    /mute-requests              → List (paginated)
POST   /mute-requests              → Create
GET    /mute-requests/:id          → Get one
PATCH  /mute-requests/:id          → Update (partial)
DELETE /mute-requests/:id          → Delete
POST   /mute-requests/:id/resolve  → Named action
```

### 11.2 Response Envelope

All responses use this exact structure:

```ts
// Success
{
  "success": true,
  "data": { ... },
  "meta": {                // Required on all paginated list responses
    "page": 1,
    "pageSize": 20,
    "total": 143,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "MUTE_REQUEST_NOT_FOUND",       // Machine-readable, SCREAMING_SNAKE_CASE
    "message": "Mute request not found.",   // Human-readable, plain language
    "details": { "field": "reason" }        // Optional, for validation errors only
  }
}
```

### 11.3 HTTP Status Codes

| Situation | Code |
|---|---|
| Resource created | 201 |
| Success with body | 200 |
| Success, no body | 204 |
| Validation error | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict (duplicate, state violation) | 409 |
| Unhandled server error | 500 |

Never return 200 for an error. Never return 500 for a validation error.

### 11.4 Pagination

All list endpoints are paginated without exception. Required query parameters:

- `page` — integer, default: `1`
- `pageSize` — integer, default: `20`, max: `100`

Unbounded queries are forbidden in production endpoints.

### 11.5 API Versioning

The versioning strategy is defined in ARCHITECTURE.md. Follow it exactly. Do not invent ad-hoc versioning. If a breaking change is required, follow the versioning process — do not silently break existing clients.

---

## 12. STATE MANAGEMENT RULES

### 12.1 State Scope Hierarchy

Choose the smallest appropriate scope. Escalate only when the current scope is genuinely insufficient.

```
1. Local component state     → useState / useReducer
   Use for: UI state, form state, toggle state, transient interactions

2. Server / async state      → React Query (or per ARCHITECTURE.md)
   Use for: All data that originates from the API

3. Feature-scoped state      → Context scoped to a feature subtree
   Use for: State shared between components within a single feature

4. Global application state  → Global store (per ARCHITECTURE.md)
   Use for: Auth session, theme preference, global notification queue only
```

### 12.2 Rules

- Default to local state. Escalate only when local state is provably insufficient.
- All API-derived data lives in server state. Never copy it into global state.
- Global state must contain no derived data — derive at the point of use.
- State objects must be fully typed — no `any`, no implicit `object`.
- No manual re-implementation of caching logic — use the designated server state library.

### 12.3 Forbidden — State

- Storing API responses in global state instead of server state cache
- Prop drilling beyond 2 levels without using context
- UI toggle state (modal open/closed, tab selection) in global state
- Direct state mutation

---

## 13. UI & UX STANDARDS

### 13.1 Required States

Every screen and every data-dependent component must implement all four states. A component that is missing any state is incomplete and must not be merged.

| State | Requirement |
|---|---|
| **Loading** | Skeleton, shimmer, or activity indicator — never a blank or partially-rendered screen |
| **Empty** | Descriptive message explaining why the list is empty, plus an actionable CTA where appropriate |
| **Error** | Plain-language message, recovery action (retry, navigate back, contact support) |
| **Success** | Complete, correct data display |

### 13.2 Loading States

- Skeleton screens for content-heavy views (lists, profiles, feeds)
- Activity indicators only for user-triggered actions (submit, refresh)
- Loading states must not cause layout shift when they resolve
- Loading indicators must be accessible to screen readers

### 13.3 Empty States

- Explain why the list is empty, not just that it is
- Provide a CTA when the user can take an action to populate the state
- Copy tone must match DESIGN_SYSTEM.md

### 13.4 Error States

- Error messages are plain language — no stack traces, error codes, or database errors exposed to users
- Every error state offers at least one recovery path
- Error boundaries are implemented at the screen level, not just at the component level

### 13.5 Design System Compliance

- Every UI element uses tokens from DESIGN_SYSTEM.md
- Custom components not in the design system require a design review comment in the PR
- No pixel-level deviations from design specs without documented approval

---

## 14. DOCUMENTATION RULES

### 14.1 When Documentation Must Be Updated

Documentation must be updated in the same PR as the code change — never in a follow-up:

| Change Type | Required Documentation Update |
|---|---|
| New API endpoint | `docs/api/` |
| Changed API endpoint | `docs/api/` |
| Deleted API endpoint | `docs/api/` + deprecation notice |
| New database schema | Schema reference in `docs/` |
| Schema change | Migration notes + schema reference |
| Architectural change | `ARCHITECTURE.md` + `docs/DECISIONS.md` |
| New dependency | `docs/DECISIONS.md` |
| New environment variable | `.env.example` + README |
| New feature flag | `docs/` feature flag register |

### 14.2 Code Documentation Standards

- Complex business logic must have inline comments explaining **why**, not what — the code explains what
- Non-obvious decisions must have a comment referencing the constraint that drove them: `// Must check ownership before status — see PRD §4.2`
- TODOs must include owner context and a ticket reference: `// TODO(auth): handle token refresh race condition — #123`
- Do not add comments that simply restate what the code does

### 14.3 README Requirements

The root `README.md` must enable a new engineer to run the project locally in under 15 minutes. It must include:

- What Crewmute is (one paragraph)
- Prerequisites (Node version, environment dependencies)
- Step-by-step local setup
- Environment variable reference
- How to run tests
- Links to key documentation

A README that fails the 15-minute test is incomplete.

### 14.4 Forbidden — Documentation

- Merging any API change without updating API docs
- Stale documentation that contradicts current behavior
- Comments that describe what the code does instead of why

---

## 15. DEPENDENCY MANAGEMENT RULES

### 15.1 Adding a Dependency

No contributor may add a new runtime or development dependency without documenting all three:

1. **Justification**: What specific problem does this solve that cannot be solved adequately with existing dependencies or a modest custom implementation?

2. **Alternatives considered**: At least two alternatives evaluated and the concrete reasons they were rejected.

3. **Impact statement**: Bundle size impact, security surface addition, maintenance burden, and license compatibility.

This is documented in `docs/DECISIONS.md` as an ADR before the dependency is added.

### 15.2 Evaluation Criteria

Before adding any dependency:

- [ ] Is this functionality already covered by an existing dependency?
- [ ] Can this be implemented in under 50 lines without meaningful complexity?
- [ ] Has the library had commits in the last 6 months?
- [ ] Is the license compatible (MIT, Apache 2.0, BSD preferred — GPL requires explicit approval)?
- [ ] For mobile dependencies: is the bundle size impact acceptable?
- [ ] Is there an active issue tracker with reasonable response times?

### 15.3 Dependency Categories

| Category | Requirement |
|---|---|
| Core runtime dependency | Full ADR required |
| Development dependency | Brief written justification required |
| Type definitions (`@types/*`) | No justification required |

### 15.4 Forbidden — Dependencies

- Adding a dependency to solve a problem solvable in under 30 lines
- Adding two dependencies that solve the same problem
- Using `*` or `latest` version ranges
- Adding unmaintained or deprecated packages
- Introducing a GPL-licensed dependency without explicit legal review

---

## 16. DUPLICATE PREVENTION RULES

### 16.1 Search Before Create

Before creating any of the following, the agent must search the codebase for an existing implementation:

- React components
- Custom hooks
- Service functions
- Repository methods
- Utility functions
- Type definitions
- Constants and enums

### 16.2 Search Protocol

```bash
# Search by concept
grep -r "muteRequest" mobile/src/

# Search by type
find . -name "*.types.ts" | xargs grep "MuteRequest"

# Search by pattern (e.g., existing pagination hooks)
grep -r "usePagination\|useInfiniteScroll" mobile/src/hooks/
```

### 16.3 Extend Before Duplicate

If a similar implementation exists:

- **Extend it** if the new use case is a natural generalization
- **Parameterize it** if the difference is a configuration option
- **Compose it** if the new case combines existing pieces
- **Create new only if** the existing implementation would become demonstrably worse by accommodating the new case — and document why in the PR

### 16.4 Pre-Submission Check

Before submitting any PR, confirm:

- [ ] No component was created that duplicates an existing one
- [ ] No hook was created that duplicates an existing one
- [ ] No utility function was created that replicates something in the standard library or an existing utility
- [ ] No type was defined that is already defined elsewhere in the codebase

---

## 17. FILE CREATION RULES

### 17.1 Justification Required

Every new file must satisfy:

1. **What does this file do?** (one sentence, not "utilities" or "helpers")
2. **Why does it need to be a separate file?** (not inline in an existing file)
3. **Where exactly does it belong?** (specific path per the structure rules)

### 17.2 File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React component | PascalCase | `MuteRequestCard.tsx` |
| Hook | camelCase, `use` prefix | `useMuteRequest.ts` |
| Service | camelCase, `.service` suffix | `muteRequest.service.ts` |
| Repository | camelCase, `.repository` suffix | `muteRequest.repository.ts` |
| Controller | camelCase, `.controller` suffix | `muteRequest.controller.ts` |
| Route | camelCase, `.routes` suffix | `muteRequest.routes.ts` |
| Validator | camelCase, `.validators` suffix | `muteRequest.validators.ts` |
| Types | camelCase, `.types` suffix | `muteRequest.types.ts` |
| Test | Same as target, `.test` suffix | `muteRequest.service.test.ts` |
| Migration script | Date-prefixed, descriptive | `20240315_add_expires_at_to_mute_requests.ts` |

### 17.3 Anti-Fragmentation Rule

Do not create a separate file for a single small function, constant, or type that logically belongs in an existing file. Over-fragmentation increases cognitive load.

A file with fewer than 20 meaningful lines that has a natural home in an adjacent file should live there, not standalone.

---

## 18. PERFORMANCE STANDARDS

### 18.1 Mobile Performance

**Rendering:**
- `React.memo` for components that receive stable props and re-render in tight loops
- `useCallback` for functions passed as props to memoized children
- `useMemo` for genuinely expensive computations — not for every derived value
- Never memoize operations that cost less than the memoization overhead

**Lists:**
- Use `FlatList` or `FlashList` for all scrollable lists — `ScrollView` with `.map()` is forbidden for lists of unknown length
- `keyExtractor` is required on all list components
- `getItemLayout` for lists with known fixed item heights
- `removeClippedSubviews` on long-scrolling lists

**Images:**
- Lazy load images that are below the fold
- Never render an image at a larger native size than its display size

### 18.2 Backend Performance

**Queries:**
- Every query on a collection with more than a few hundred documents must have index coverage
- `.lean()` on all Mongoose queries that return read-only data
- `.select()` to limit returned fields to what is actually needed
- No N+1 query patterns — detect and resolve at development time

**Pagination:**
- All list endpoints paginate — no unbounded queries reach production
- Default page size ≤ 20

**Observability:**
- Slow queries (> 100ms) must be logged with query context
- Caching strategy follows ARCHITECTURE.md — no ad-hoc in-memory caching

### 18.3 Performance Optimization Protocol

Performance optimizations must be:

1. **Motivated by measurement**, not assumption. Record the baseline before optimizing.
2. **Documented with the data**: comment the optimization with the measured improvement.
3. **Proportionate**: do not add significant complexity for negligible gain.

---

## 19. SECURITY STANDARDS

### 19.1 Authentication and Authorization

- All protected routes use the auth middleware defined in ARCHITECTURE.md
- Authorization (can this user do this action?) is enforced in the service layer, not middleware
- Never trust client-provided user IDs for ownership checks — use the authenticated identity from the verified token
- Token handling follows the strategy in ARCHITECTURE.md exactly — no improvised alternatives

### 19.2 Input Validation and Sanitization

- All user input is validated before processing — without exception
- Validation errors never expose internal implementation details
- Never pass raw user input to a database query, file path, shell command, or template

### 19.3 Secret Management

- Secrets, API keys, credentials, and tokens never appear in source code
- All secrets are loaded from environment variables at runtime
- `.env` files are never committed — `.env.example` with placeholder values is committed and kept current
- Key rotation procedures are documented in `docs/`

### 19.4 Rate Limiting

- All public and authenticated endpoints are rate-limited per ARCHITECTURE.md
- Auth-adjacent endpoints (login, register, password reset, token refresh) have stricter limits than general endpoints
- Rate limit configuration is centralized in `config/` — not scattered inline per-route

### 19.5 Audit Logging

User actions that affect sensitive resources (account changes, permission changes, data deletion) must produce an audit log entry. Audit log schema and storage are defined in ARCHITECTURE.md.

### 19.6 Security Review Triggers

The following changes require an explicit security review comment in the PR before merging:

- Any change to authentication or authorization logic
- Any new endpoint that handles PII or sensitive data
- Any change to input validation for auth-adjacent flows
- Any addition of a new secret or credential type
- Any change to rate limiting
- Any dependency addition that handles cryptography, auth tokens, or network security

### 19.7 Forbidden — Security

- Storing passwords in plain text
- Hardcoded JWT secrets, API keys, or credentials anywhere in source
- Logging passwords, tokens, session IDs, or PII
- Disabling security middleware "temporarily"
- `eval()` or dynamic code execution with any user-supplied input

---

## 20. ERROR HANDLING STANDARDS

### 20.1 Error Architecture

All application errors are typed. A centralized error middleware in Express processes every unhandled error.

```ts
// backend/src/shared/errors.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} not found.`, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(action: string) {
    super('FORBIDDEN', `You are not permitted to ${action}.`, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}
```

### 20.2 Error Handling Rules

- Every `catch` block either handles the error or re-throws it. Silent swallowing is forbidden.
- Stack traces are never exposed to API consumers in production.
- All unhandled promise rejections are caught and logged before the process handles them.
- Client-facing error messages are plain language — no database error messages, query strings, or internal paths.

### 20.3 Structured Logging

- Use the centralized logger (`shared/logger.ts`) — `console.log`, `console.error`, and `console.warn` are forbidden in application code.
- Log levels: `error` for failures requiring attention, `warn` for degraded or unexpected-but-handled states, `info` for significant system events, `debug` for development-only detail.
- Every log entry includes: timestamp, log level, message, `requestId`, and relevant entity IDs (`userId`, `resourceId`).
- Never log: passwords, tokens, session data, or PII of any kind.

### 20.4 Mobile Error Handling

- React error boundaries are implemented at the screen level.
- Network errors are caught and presented with a retry action.
- Unexpected client-side errors are reported to the error tracking service defined in ARCHITECTURE.md.

---

## 21. OBSERVABILITY STANDARDS

Production systems require visibility. Observability is not optional and is not added later.

### 21.1 Logging Requirements

- All HTTP requests are logged with: method, path, status code, duration, and requestId.
- All unhandled errors are logged with full context before the error response is sent.
- Application startup logs the loaded configuration (without secrets) and confirms external service connectivity.

### 21.2 Health Endpoints

The backend exposes:

- `GET /health` — returns 200 if the process is running
- `GET /health/ready` — returns 200 only if the database connection and critical dependencies are healthy

These endpoints are excluded from auth middleware and rate limiting.

### 21.3 Error Tracking

Unexpected production errors are reported to the error tracking service defined in ARCHITECTURE.md. This integration is configured and verified before any feature is deployed to production.

### 21.4 Performance Monitoring

- API response time is measured and logged for every request.
- Queries exceeding 100ms are logged with the query context.
- Mobile app performance metrics (app start time, screen load time, crash rate) are tracked via the mobile observability tooling in ARCHITECTURE.md.

---

## 22. TESTING STANDARDS

### 22.1 Testing Pyramid

```
         /\
        /  \   E2E (critical user flows only)
       /----\
      /      \  Integration (all API endpoints)
     /--------\
    /          \ Unit (all business logic)
   /____________\
```

Every layer of the pyramid is maintained. Do not sacrifice lower layers for higher ones.

### 22.2 What Must Be Tested

| Test Type | Required Coverage | Tool |
|---|---|---|
| Unit | All service-layer functions | Jest |
| Unit | All repository methods (mocked DB) | Jest |
| Unit | All validation schemas | Jest |
| Integration | All API endpoints | Supertest + Jest |
| Component | Critical mobile UI components | React Native Testing Library |
| E2E | Core user flows: register, create mute request, resolve mute request | Defined in ARCHITECTURE.md |

### 22.3 Integration Test Coverage Per Endpoint

Every API endpoint must have integration tests covering at minimum:

- Happy path (correct input, expected output)
- Validation error (malformed input → 400)
- Auth error (missing or invalid token → 401)
- Authorization error (valid token, wrong user → 403)
- Not found (valid token, nonexistent resource → 404)

### 22.4 Coverage Thresholds

Coverage thresholds are defined in `jest.config.ts` and enforced in CI. They may not be disabled or lowered without an ADR. Current minimums:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

Coverage is a floor, not a goal. 80% coverage of meaningless tests is worth less than 60% coverage of meaningful ones.

### 22.5 Test Quality Rules

- Tests test observable behavior, not implementation details
- Mocks are used only for genuine external dependencies (database, third-party APIs, email, push notifications)
- Each test is fully independent — no shared mutable state between tests
- Tests clean up after themselves (database state, mocks, timers)
- Test names are complete English sentences: `it('returns 403 when the requesting user does not own the mute request')`

### 22.6 Forbidden — Testing

- Skipping tests with `xit`, `xdescribe`, or `test.skip` without a comment including a ticket reference
- Committing commented-out tests
- Tests that pass vacuously (no assertions, or assertions that can never fail)
- Testing library internals (Mongoose, Express) rather than application behavior
- Disabling coverage thresholds in CI

---

## 23. GIT AND BRANCHING STANDARDS

### 23.1 Branch Naming

```
feature/<ticket-id>-short-description     → New features
fix/<ticket-id>-short-description         → Bug fixes
refactor/<ticket-id>-short-description    → Refactors without behavior change
chore/<ticket-id>-short-description       → Maintenance, dependencies, config
docs/<ticket-id>-short-description        → Documentation only
```

### 23.2 Commit Standards

Commits follow Conventional Commits:

```
<type>(<scope>): <short imperative description>

[optional body: what and why, not how]

[optional footer: BREAKING CHANGE, closes #ticket]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`

Examples:
```
feat(mute-request): add expiry date field to mute request creation
fix(auth): handle token refresh race condition on app resume
refactor(user-service): extract getUserById to repository layer
test(mute-request): add integration tests for resolve endpoint
docs(api): update mute-request endpoint reference
```

### 23.3 Commit Rules

- Commits are atomic: one logical change, buildable and testable on its own
- Commit messages explain what changed and why — not how
- Never commit: debug code, commented-out code, `.env` files, build artifacts, `console.log` statements
- Review the full diff before committing — `git add .` followed by a blind commit is not acceptable

### 23.4 Branch Rules

- Feature branches are cut from `main`
- Feature branches are short-lived — rebase or merge frequently to avoid divergence
- Branches are deleted after merging
- No direct commits to `main` — all changes go through pull requests

### 23.5 Pull Request Standards

- One focused concern per PR (one feature, one fix, one refactor)
- PR description answers: What changed? Why? How was it tested? Any follow-up work?
- All CI checks pass before merging
- PR references the relevant ticket

---

## 24. ARCHITECTURAL DECISION RECORDS

All significant technical decisions are recorded in `docs/DECISIONS.md`.

### 24.1 When to Write an ADR

Write an ADR when:

- Adding any new runtime dependency
- Making a meaningful architectural change
- Choosing between two or more viable technical approaches
- Creating a new top-level directory
- Making a significant or breaking database schema change
- Introducing a new pattern to the codebase
- Making an irreversible decision of any kind

### 24.2 ADR Format

```markdown
## ADR-<NNN>: <Title>

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by ADR-NNN

### Decision
<One paragraph describing exactly what was decided>

### Context
<What problem exists? Why is a decision needed now?>

### Reasoning
<Why was this specific option chosen over the alternatives?>

### Alternatives Considered
- **Alternative A:** <Description> — Rejected because <specific reason>
- **Alternative B:** <Description> — Rejected because <specific reason>

### Consequences
- **Positive:** <Benefits of this decision>
- **Negative:** <Known trade-offs>
- **Risks:** <What could go wrong and how it would be detected>
- **Reversibility:** <How hard is this to undo, and what would that require?>
```

### 24.3 ADR Numbering

ADRs are numbered sequentially from `ADR-001`. Numbers are never reused. Superseded ADRs remain in the document with updated status and a reference to the superseding ADR.

---

## 25. CODE REVIEW CHECKLIST

Every pull request must be evaluated against this checklist before approval.

### Architecture
- [ ] Change is consistent with ARCHITECTURE.md
- [ ] No new patterns introduced without an ADR
- [ ] Dependency direction is correct — no inward violations
- [ ] No circular dependencies introduced
- [ ] Business logic is in the service layer, not the controller or UI

### Code Quality
- [ ] Code is readable without relying on comments to explain what it does
- [ ] No functions longer than 50 lines without justification
- [ ] No files longer than 300 lines without justification
- [ ] No magic numbers or strings — named constants used throughout
- [ ] No dead code, commented-out code, or debug statements
- [ ] No `any` types without suppression comments
- [ ] No existing code deleted without explicit justification

### Correctness
- [ ] All imports resolve to real paths
- [ ] No fabricated function signatures or module APIs
- [ ] Error cases are handled, not silently ignored
- [ ] Concurrency and race conditions considered where relevant

### Security
- [ ] No secrets or credentials in source code
- [ ] All inputs validated before use
- [ ] Auth and authorization logic is correct
- [ ] No sensitive data logged

### Performance
- [ ] No unbounded queries or list renders
- [ ] No unnecessary re-renders introduced
- [ ] No N+1 query patterns

### Testing
- [ ] Unit tests added for new business logic
- [ ] Integration tests added for new API endpoints, covering all required cases
- [ ] All existing tests pass

### Documentation
- [ ] API docs updated for any endpoint changes
- [ ] Schema docs updated for any schema changes
- [ ] ADR written for any significant decision
- [ ] Inline comments present for non-obvious logic

### UX Completeness (Mobile)
- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented
- [ ] Accessibility labels on all interactive elements

### Agent Integrity (when AI-generated)
- [ ] No hallucinated imports or nonexistent module references
- [ ] No unexplained deletion of existing code
- [ ] Incomplete work is marked with WIP comments, not silently omitted
- [ ] AGENT_RULES.md has not been modified

---

## 26. DEFINITION OF DONE

A task is complete only when every item below is true. There is no partial done.

### Build
- [ ] `npm run build` exits with code 0
- [ ] `npm run lint` passes with zero errors and zero warnings
- [ ] `npm run typecheck` passes with zero errors

### Tests
- [ ] All existing tests pass
- [ ] New unit tests written for all new business logic
- [ ] New integration tests written for all new API endpoints
- [ ] Coverage thresholds met

### Architecture
- [ ] Consistent with ARCHITECTURE.md
- [ ] No anti-patterns introduced
- [ ] ADR written for any significant decision or new dependency

### Documentation
- [ ] All relevant documentation updated in the same PR
- [ ] Comments added for non-obvious logic
- [ ] `.env.example` updated for any new environment variables

### UX (if applicable)
- [ ] All four UI states implemented: loading, empty, error, success
- [ ] Accessibility requirements met
- [ ] Design system tokens used exclusively

### Security (if applicable)
- [ ] Security review completed for auth-related changes
- [ ] No secrets in source

### Review
- [ ] Code review checklist in Section 25 fully cleared
- [ ] PR description answers: what, why, how tested, follow-up work

---

## 27. AGENT INTEGRITY RULES

This section exists because AI agents have specific failure modes that human engineers do not. These rules are non-negotiable and are the final check before any AI-generated change is accepted.

### 27.1 This Document Is Immutable to Agents

**AGENT_RULES.md may not be modified by any AI agent under any circumstances.**

An agent that modifies, softens, abbreviates, or rewrites any part of AGENT_RULES.md — for any stated reason — has violated the engineering constitution. The change must be reverted in full. Only human engineers may propose changes to AGENT_RULES.md, and those changes require an ADR.

### 27.2 No Hallucinated Imports or References

Before writing any `import` statement, the agent must verify that:

- The module path exists in the repository or in `node_modules`
- The named export being imported actually exists in that module
- The function signature matches the actual signature

Writing an import that cannot be resolved is a defect, not a draft. Do not assume a module or function exists because it would be logical for it to exist.

### 27.3 No Silent Code Deletion

Agents must not delete existing, non-test code without one of the following:

1. An explicit instruction from the task definition to remove that code
2. A written explanation in the PR description of why the deletion is safe and correct

Refactoring that happens to involve deletion is not an exception. Every deletion must be justified. When in doubt, comment out with a `// REMOVED: <reason>` note rather than deleting, and let a human engineer confirm.

### 27.4 Incomplete Work Must Be Marked

If an agent cannot complete a task — due to context limits, missing information, or unresolved ambiguity — it must not submit silently incomplete work. Every file left in an incomplete state must contain:

```ts
// WIP: <what is incomplete and why>
// BLOCKED: <what information or decision is needed to proceed>
```

The PR description must list every WIP marker left in the codebase.

Submitting a task as complete when it is not complete is a more serious failure than surfacing the incompleteness.

### 27.5 No Fabricated Completions

Agents must not write placeholder implementations that appear to work but do not. Examples of forbidden fabrications:

- A function that returns a hardcoded value and is labeled as complete
- A test that always passes because it has no meaningful assertions
- A migration script that logs "migration complete" without executing anything
- An API endpoint that returns mock data instead of real data, without a feature flag

If a real implementation is not yet possible, mark it as WIP per Section 27.4.

### 27.6 Verify Before Asserting

Agents must not assert in PR descriptions, commit messages, or comments that:

- Tests pass (without having run them)
- The build succeeds (without having verified it)
- A refactor is behavior-preserving (without having checked the diff carefully)

State what was done. Do not claim outcomes that were not verified.

---

## 28. THE GOLDEN RULE

> **Every change must leave the repository more correct, more reliable, and more maintainable than before.**
>
> **When in doubt, choose the simpler solution. When still in doubt, ask a human.**

This rule supersedes all others. If following any specific rule in this document would produce a result that is less correct, less reliable, or harder to maintain, escalate to a human engineer. Do not resolve the tension by lowering the standard.

The measure of good engineering on Crewmute is not the volume of code produced, nor the speed at which it was written. It is whether any engineer — human or AI — can open this repository six months from now, understand exactly what it does, change it safely, and trust that it will behave correctly in production.

That is the standard. Hold it without exception.

---

*AGENT_RULES.md — Crewmute Engineering Constitution*
*Version 2.0.0*
*All contributors — human and AI — are bound by this document.*
*Changes to this document require a human author, an ADR in docs/DECISIONS.md, and must not reduce any standard defined herein.*