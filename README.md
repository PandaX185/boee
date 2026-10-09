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
- Husky + lint-staged + commitlint + secretlint, Prettier, `just`

## Getting started

```bash
just setup        # npm ci + copy .env.example to .env
just start        # dev server (then press i / a / w)
```

Raw npm equivalents: `npm ci`, `npm start`, `npm run android|ios|web`.

## Checks

```bash
just check        # lint + typecheck + tests with coverage
just lint
just typecheck
just test
just coverage
just secrets      # local secret scan
just doctor       # expo diagnostics
just bundle-web   # production web-bundle smoke test
```

## Environment and secrets

Copy `.env.example` to `.env` for local development (`just env-init`). Only
`EXPO_PUBLIC_*` variables reach the app, and they are inlined into the bundle —
they are configuration, never secrets. See `docs/secrets.md`.

## Commits and releases

- Commits must follow [Conventional Commits](https://www.conventionalcommits.org/)
  (enforced by commitlint on `commit-msg`).
- `pre-commit` auto-formats/lints staged files and scans for secrets;
  `pre-push` runs typecheck + tests.
- `release-please` opens release PRs from conventional commits; merging one
  bumps `package.json` and `app.json`, updates `CHANGELOG.md`, tags `v*`, and
  publishes a GitHub Release with a web build attached. See `docs/ci-cd.md`.

## Project layout

```
src/
  app/            Expo Router screens (routes live here)
  components/     reusable UI
  config/         validated EXPO_PUBLIC_* env access
  core/           pure, UI-free engine: estimate, rules, constants, presets, export, format, metrics, nlp
  domain/         types and Zod schemas (the input contract)
  services/       platform glue (share, confirm)
  store/          Zustand scenario + settings stores backed by AsyncStorage
  constants/      theme
docs/
  design.md       full design spec
  decisions.md    decision log (ADRs)
  secrets.md      env and secret handling
  ci-cd.md        CI, releases, and repo automation
```

Only screens and layouts belong in `src/app`; everything else lives outside it.

## How it works

`Inputs + Constants -> estimate() -> DerivedMetrics -> deriveImplications()
-> Implication[]`. The `{ DerivedMetrics, Implication[] }` pair is what the UI
renders and the Markdown export serializes. The core has no UI or platform
imports, so it is unit-testable and portable to another shell later.

## Roadmap

- Optional natural-language layer behind the `NlpProvider` seam (see
  `docs/design.md`).
