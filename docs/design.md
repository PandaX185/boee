# Back-of-Envelope Estimator — Design

Date: 2026-10-09
Status: Accepted for v1

## Purpose

A mobile app that turns a few assumptions about a system (traffic, data shape,
non-functional targets) into the numbers that drive architecture — QPS, storage,
bandwidth, cache footprint, server count — plus plain-language design
implications. Its job is to be a fast, trustworthy starting point before
designing a new system.

## Guiding principle

**The model is deterministic; opinion is rule-based and cited.**

- The app never invents numbers. Every derived metric comes from a documented
  formula.
- Every implication is triggered by a rule crossing a known, editable threshold,
  and shows the assumption it relied on. The user can argue with it.

An optional future natural-language layer sits at the edges, never in the math.

## Scope

### In scope (v1)

- Grouped input form for the canonical back-of-envelope quantities.
- Live derived metrics.
- Rule-based implications grouped by category and severity.
- Presets to pre-fill realistic scenarios.
- Save, list, duplicate, and delete scenarios (local persistence).
- Side-by-side compare of two scenarios.
- Export a scenario as Markdown (assumptions, derived table, implications).

### Out of scope (v1)

- Accounts, backend, sync, or collaboration.
- AI advice or natural-language parsing (seam only — see below).
- Arbitrary formula/quantity builder (a secondary "custom quantity" escape hatch
  may be added later).
- Charts beyond metric cards.
- Native device features.

## Platform and stack

Target: installable iOS/Android app, with the option to ship to the stores.

- Expo (React Native) + TypeScript — one codebase, native feel, store-ready via
  EAS.
- Expo Router for navigation (routes under `src/app/`).
- Zustand + AsyncStorage for scenario state and local persistence.
- Zod for validating the input contract.
- Jest (`jest-expo`) + React Native Testing Library for tests.
- Styling with React Native `StyleSheet` and a small theme module (NativeWind can
  be layered later if desired).

The core (`src/core`, `src/domain`) is pure TypeScript with no UI or platform
imports, so it is testable in isolation and portable to another shell (web,
CLI) unchanged.

## Architecture

```
src/
  app/                      # Expo Router screens
    _layout.tsx             # Stack navigator
    index.tsx               # scenario list + entry points
    scenario/[id].tsx       # inputs -> live results + implications
    compare.tsx             # diff two scenarios
    settings.tsx            # edit capacity/latency constants
  core/                     # pure, UI-free
    estimate.ts             # Inputs + Constants -> DerivedMetrics
    rules.ts                # rule data -> Implication[]
    constants.ts            # default capacity numbers + sources
    presets.ts              # built-in scenarios
    export.ts               # Markdown serializer
    format.ts               # human-readable number formatting
    nlp.ts                  # NlpProvider interface (no implementation yet)
  domain/
    types.ts                # Inputs, DerivedMetrics, Implication, Scenario
    schema.ts               # Zod schemas (the input contract)
  store/
    scenarioStore.ts        # Zustand + AsyncStorage
  constants/theme.ts
```

### Data flow

`Inputs` (from the form) + `Constants` -> `estimate()` -> `DerivedMetrics`
-> `deriveImplications()` -> `Implication[]`. The pair `{ DerivedMetrics,
Implication[] }` is an `Evaluation`, the single unit the UI renders and the
exporter serializes.

## Data model

### Inputs

- **Traffic**: daily active users, actions per user per day, read:write ratio,
  peak multiplier.
- **Data shape**: average object size, objects written per action, objects read
  per action, retention days, replication factor.
- **Non-functional**: availability target (as a fraction), monthly growth rate.

### Derived metrics

Average and peak read/write QPS; storage per day, per year, and total for the
retention window; peak ingress and egress; cache hot-set size; server count;
allowed downtime per year; 6- and 12-month growth projections.

### Implications

Each has an `id`, a `category` (storage, scaling, caching, network, redundancy,
growth), a `severity` (info, warning), a human-readable `message`, and a
`trigger` naming the assumption that fired it.

## Implication engine

Rules are data, not hardcoded branches: each rule declares its metadata and an
`evaluate(context)` returning a finding or `null`. Adding a rule is a local
change and a new test.

Thresholds come from `constants.ts`, which records the source for each value so
the advice is auditable and adjustable. Default rules include: retained data
exceeds RAM budget; peak read/write exceeds a single node; peak ingress/egress
exceeds a NIC; hot set exceeds cache RAM; long retention suggests tiering; a
99.99% availability target demands multi-AZ; and a positive growth rate produces
a 12-month projection.

## Screens and flow

1. **Home** — list saved scenarios; buttons for New estimate, Compare, Constants.
2. **New / edit** — pick a preset or start blank, edit grouped inputs, watch
   results and implications update live.
3. **Results** — metric cards plus implications grouped by severity, each citing
   its trigger.
4. **Save / duplicate / delete** — persisted locally.
5. **Compare** — select two scenarios and diff derived metrics.
6. **Export** — copy or share the scenario as Markdown.
7. **Constants** — edit capacity/latency assumptions with sources.

## Testing

- `estimate()` validated against hand-computed cases.
- Each rule tested to fire at the right threshold (and not below it).
- Zod schema accepts every preset and rejects invalid inputs.
- Export serializer produces the expected sections.

Run with `npm test`. Lint and typecheck via `npm run lint` and
`npm run typecheck`.

## Future: natural-language layer (seam only)

Deferred. The app ships with an `NlpProvider` interface
(`parse(english) -> Inputs`, `narrate(Evaluation) -> english`) and no
implementation. When added, the LLM lives at the edges and feeds the same
deterministic core; it never computes metrics or invents advice. The input and
evaluation shapes are the frozen contract, so the provider can be:

- a hosted LLM via a thin proxy (fastest; TypeScript/Node backend keeps one
  language),
- a self-hosted or fine-tuned model (the case where Python is the right choice),
- or an on-device model (offline; no Python).

Because the core is UI-free and the contract is fixed, choosing among these
later costs only the provider, never the model.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test`
