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
