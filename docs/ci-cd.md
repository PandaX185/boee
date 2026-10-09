# CI, releases, and repo automation

## CI (`.github/workflows/ci.yml`)

Runs on every pull request and every push to `master`:

| Job       | What it does                                                           |
| --------- | ---------------------------------------------------------------------- |
| `quality` | `format:check`, `lint`, `typecheck`, `test:coverage`; uploads coverage |
| `bundle`  | `expo export --platform web` smoke test                                |
| `doctor`  | `expo-doctor` dependency/config diagnostics                            |
| `secrets` | `gitleaks` full-history secret scan                                    |

`concurrency.cancel-in-progress` keeps stale runs from piling up on busy
branches. Node comes from `.nvmrc`; npm cache is enabled.

## Releases (GitHub Releases only)

Releases are automated with
[release-please](https://github.com/googleapis/release-please):

1. Write commits in [Conventional Commits](https://www.conventionalcommits.org/)
   format (`feat:`, `fix:`, `docs:`, …). commitlint enforces this locally.
2. On push to `master`, `release-please.yml` opens or updates a release PR
   with the changelog.
3. Merging the release PR bumps `package.json` **and** `app.json`
   (`expo.version`, via `extra-files`), writes `CHANGELOG.md`, creates the
   `v*` tag, and publishes a GitHub Release.
4. `release.yml` then builds the production web bundle and attaches it to the
   Release as `web-build.zip`.

There is intentionally no store pipeline: no EAS build/submit, no OTA update
step. If a store release is needed later, add an EAS workflow on top of the
same tags.

## Local gates (Husky)

| Hook         | Runs                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged`: ESLint `--fix` + Prettier on staged files, `secretlint` scan |
| `commit-msg` | `commitlint` (Conventional Commits)                                         |
| `pre-push`   | `typecheck` + full test suite                                               |

Bypass with `git commit --no-verify` / `git push --no-verify` when you know
what you are doing. Hooks run `husky` via the `prepare` script after
`npm ci`.

## Dependency updates

`.github/dependabot.yml` opens weekly PRs for npm (Expo packages grouped) and
GitHub Actions. Each PR runs the full CI gate before merge.

## Task runner

`justfile` wraps the common commands (`just setup|start|check|test|coverage|
secrets|bundle-web|…`). Run `just` with no arguments to list them.
