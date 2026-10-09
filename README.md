# Back-of-Envelope Estimator

A mobile app for quick, trustworthy system-design estimates. Feed it a few
assumptions — traffic, data shape, availability targets — and it derives the
numbers that drive architecture (QPS, storage, bandwidth, cache footprint,
server count) plus plain-language implications that cite the assumption behind
them.

The math is deterministic and the advice is rule-based, so the output is a
starting point you can argue with, not a black box.

## Stack

- Expo (React Native) + TypeScript
- Expo Router, Zustand, AsyncStorage, Zod
- Jest (`jest-expo`) + React Native Testing Library

## Getting started

```bash
npm install
npm start        # dev server (then press i / a / w)
npm run android
npm run ios
npm run web
```

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

## Project layout

```
src/
  app/            Expo Router screens (routes live here)
  core/           pure, UI-free engine: estimate, rules, constants, presets, export, format, nlp
  domain/         types and Zod schemas (the input contract)
  store/          Zustand scenario store backed by AsyncStorage
  constants/      theme
docs/
  design.md       full design spec
  decisions.md    decision log (ADRs)
```

Only screens and layouts belong in `src/app`; everything else lives outside it.

## How it works

`Inputs + Constants -> estimate() -> DerivedMetrics -> deriveImplications()
-> Implication[]`. The `{ DerivedMetrics, Implication[] }` pair is what the UI
renders and the Markdown export serializes. The core has no UI or platform
imports, so it is unit-testable and portable to another shell later.

## Roadmap

- Wire the input form and results UI to the core.
- Save / duplicate / compare / export flows.
- Editable constants screen with sources.
- Optional natural-language layer behind the `NlpProvider` seam (see
  `docs/design.md`).
