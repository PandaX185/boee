# Decision Log

Short, append-only record of the significant choices behind this app.

## ADR-001: Mobile app on Expo (React Native)

- Context: the app should be installable on a phone and possibly shipped to the
  app stores.
- Decision: build on Expo (React Native) + TypeScript in a single codebase.
- Alternatives: Tauri (Rust, young mobile support, no native need here);
  Capacitor (reuses a web app but weaker native feel and no dedicated benefits
  here); PWA (no store distribution).
- Consequence: one codebase for iOS/Android, store-ready via EAS.

## ADR-002: Deterministic core with rule-based implications

- Context: the tool must be a trustworthy starting point, not an oracle.
- Decision: derive all metrics with documented formulas; produce implications
  from data-defined rules that cite the assumption and threshold they crossed.
- Alternatives: a free-form formula builder (loses the implications layer); an
  LLM-generated estimate (unauditable, hallucination-prone).
- Consequence: thresholds and capacity numbers are editable constants with
  recorded sources.

## ADR-003: Pure, UI-free core package

- Context: the logic should be testable and portable across shells.
- Decision: keep `src/core` and `src/domain` free of UI/platform imports.
- Consequence: fast unit tests; the same core can back a future web or CLI
  shell.

## ADR-004: Local-only persistence

- Context: v1 is a personal planning aid.
- Decision: store scenarios on-device with AsyncStorage via Zustand; no backend.
- Consequence: no accounts or sync; export (Markdown) is the sharing path.

## ADR-005: Defer the natural-language layer behind a seam

- Context: a future feature should parse English into inputs and phrase results
  in English.
- Decision: ship only the `NlpProvider` interface and freeze the `Inputs` /
  `Evaluation` contract now; implement no provider in v1.
- Alternatives considered for later: hosted LLM via proxy, self-hosted or
  fine-tuned model (Python), on-device model.
- Consequence: the model, backend, and language can be chosen later without
  touching the core. Python applies only to the self-hosted case.

## ADR-006: Dark-first design token system

- Context: the app grew from a functional light UI; we want a cohesive,
  premium, "engineering workbench" feel.
- Decision: make `src/constants/theme.ts` the single source of visual truth
  (palette, color roles, spacing, radius, typography, elevation, motion) and
  switch the default to a dark-first palette. Components reference roles, not
  raw hex.
- Consequence: re-theming is a token change; components stay behavior-identical
  and keep passing their existing tests. Light mode can be added later as an
  alternate token set.

## ADR-007: 2.5D isometric scene behind an R3F-ready seam

- Context: an interactive architecture visualization would make estimates
  tangible, but native 3D (`expo-gl` + `@react-three/fiber`) cannot be visually
  verified in this environment and adds device/perf risk.
- Decision: render a perspective/isometric 2.5D scene with the already-installed
  Reanimated + Gesture Handler stack, behind a `SystemScene` seam with a
  swappable renderer, error boundary and accessible fallback. R3F can replace
  the renderer later without changing consumers.
- Alternatives: full 3D now (unverifiable here, heavier); static diagram
  (less engaging); custom canvas (reinvents a renderer).
- Consequence: fully unit-testable and web-exportable; every critical action
  also works from the text UI.

## ADR-008: Scene is a pure projection of existing metrics

- Context: the visualization must never become a second source of truth.
- Decision: `src/core/scene.ts` is pure and maps an `Evaluation` (+ inputs +
  constants) to a `SceneModel` of nodes, edges, pressure levels and attached
  implication ids. It computes no new formulas; it reuses derived metrics and
  the same thresholds as `rules.ts`.
- Consequence: node detail panels show exactly the numbers the text UI shows,
  and implication citations stay traceable to their rule ids.

## ADR-009: Settle-based number transitions, not digit rolling

- Context: animating metric values can feel alive but risks obscuring precision
  and burning the JS thread.
- Decision: `AnimatedNumber` animates the presentation (settle/opacity) for
  formatted values and only interpolates plain integer metrics, emitting
  bounded updates (one per visible integer step) on the JS thread. Exact
  formatted values always match the current calculation.
- Consequence: readable, honest numbers with purposeful motion.
