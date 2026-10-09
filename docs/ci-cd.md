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

Releases are cut locally with `just release` (`scripts/release.sh`). There is
no release-please step and no release PR.

1. Write commits in [Conventional Commits](https://www.conventionalcommits.org/)
   format (`feat:`, `fix:`, `docs:`, …). commitlint enforces this locally.
2. From a clean, up-to-date `master`, run:

   ```bash
   just release patch      # or minor | major
   just release 1.2.0      # or an explicit version
   just release-dry minor  # preview the target version, change nothing
   ```

3. The recipe bumps `package.json` **and** `app.json` (`expo.version`),
   commits `chore(release): boee-vX.Y.Z`, tags `boee-vX.Y.Z`, and pushes both.
   The `pre-push` hook runs typecheck + tests before the push leaves.
4. It then publishes the GitHub Release (`gh release create --generate-notes`),
   which fires `release.yml` to build and attach the production web bundle and
   the Android APK.

> Release notes come from GitHub's auto-generated notes (grouped merged PRs and
> commits); there is no `CHANGELOG.md` to maintain.

To backfill assets for an already-published release (or test a build without
releasing), dispatch `release.yml` manually with the tag:

```bash
gh workflow run "Attach release assets" --repo PandaX185/boee \
  -f tag=boee-v1.2.0
```

(The pre-rename `v1.1.0` release is tagged `back-of-envelope-v1.1.0`.)

There is intentionally no store pipeline: no EAS submit, no OTA update step.
The Android job below builds an installable APK, but nothing uploads to
Google Play. If a store release is needed later, add `eas submit` on top of
the same tags.

## Android APK via EAS

Every published GitHub Release also gets an installable Android APK:

1. The `android` job in `release.yml` runs `eas build --platform android
--profile preview` (internal distribution, `buildType: apk` per `eas.json`).
2. It downloads the APK and attaches it to the Release as `boee-<tag>.apk`,
   and appends the EAS build-page link to the release notes.
3. `appVersionSource: remote` + `autoIncrement: true` in `eas.json` keep the
   Android `versionCode` bumping automatically while `just release` owns the
   human-readable `expo.version`.

One-time setup (all manual, needs an Expo account):

```bash
npx eas-cli login
npx eas-cli init        # creates the Expo project, writes extra.eas.projectId
npx eas-cli build --platform android --profile preview   # first build: generates the Android keystore, verifies the APK installs
```

Then create a token at `expo.dev/settings/access-tokens` and store it:

```bash
gh secret set EXPO_TOKEN --repo PandaX185/boee
```

Only the `android` job needs `EXPO_TOKEN` — `ci.yml` and the `web-build` job
do not. So CI on `master` and the web bundle can both succeed while the APK job
fails; a release with only `web-build.zip` means the Android job did not pass.
Re-run it against the published tag to attach the APK without cutting a new
release:

```bash
gh workflow run "Attach release assets" --repo PandaX185/boee -f tag=boee-v1.2.0
```

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
release|secrets|bundle-web|…`). Run `just` with no arguments to list them.
