# Contributing

## Setup

```bash
just setup     # installs deps, copies .env.example to .env
just start     # dev server
```

Requires Node 20+ (see `.nvmrc`) and `just` (optional but recommended).

## Ground rules

- Do not add comments to code unless asked.
- Keep the core pure: `src/core` and `src/domain` must stay free of UI and
  platform imports so they remain unit-testable and portable.
- Platform behavior (sharing, confirms, storage) lives in `src/services` and
  `src/store`.
- Reuse existing components, theme tokens, and patterns; keep changes minimal.

## Before pushing

```bash
just check     # lint + typecheck + tests with coverage
```

The same gate runs in CI on every PR, plus a web-bundle smoke test,
`expo-doctor`, and a secret scan.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add cache hit-ratio implication
fix: handle zero retention days in estimate
docs: explain hot working-set fraction
```

`commit-msg` rejects anything else, because GitHub's auto-generated release
notes group commits by these types. `pre-commit` auto-formats and lints staged
files; `pre-push` runs typecheck + tests.

## Releases

Cut a release from a clean, up-to-date `master`:

```bash
just release patch      # or minor | major
just release 1.2.0      # or an explicit version
just release-dry minor  # preview the target version, change nothing
```

The recipe bumps `package.json` + `app.json`, commits, tags `boee-vX.Y.Z`,
pushes, and publishes the GitHub Release (see `docs/ci-cd.md`).

## Tests

- Core and services: pure unit tests next to the source (`*.test.ts`).
- Components and screens: React Native Testing Library (`*.test.tsx`).
  `render` and `fireEvent` are **async** in RNTL v14 — always `await` them.
- Coverage thresholds live in `jest.config.js` and are enforced by
  `npm run test:coverage`. Add tests with features, not after.

## Secrets

Never commit `.env`, API keys, tokens, or credentials. `EXPO_PUBLIC_*` values
are inlined into the app bundle and are not secret. See `docs/secrets.md`.
