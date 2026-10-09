# Secrets and environment variables

## The hard rule

This app is **client-only**. Everything bundled into the app can be extracted
from the shipped binary. In particular, Expo inlines every variable prefixed
with `EXPO_PUBLIC_` into the JavaScript bundle at build time.

> `EXPO_PUBLIC_*` variables are **public by definition**. They are configuration,
> not secrets.

Never put an API key, token, password, cookie, or private key in:

- `.env` (or any `EXPO_PUBLIC_*` variable),
- source code,
- `app.json`.

## Where secrets belong

True secrets (for example a future LLM provider key) must live **server-side**,
behind a small backend or proxy that the app calls. The app then talks only to
your backend using a public base URL:

```
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

The backend holds the real key in its own secret store and never ships it to the
client.

## Local development

1. Copy the template: `just env-init` (or `cp .env.example .env`).
2. Edit `.env`. It is git-ignored.
3. Public config is read and validated in `src/config/env.ts`.

`.env.example` is the only env file committed to git. Everything else matching
`.env` / `.env.*` is ignored.

## Automated scanning

Secrets are scanned in two places:

- **Locally**, on every commit, by `secretlint` (see `.husky/pre-commit`).
- **In CI**, by the `gitleaks` job in `.github/workflows/ci.yml`.

If a scan fails, remove the secret, rotate it, and add the pattern to the ignore
config only if it is a confirmed false positive.

## If a secret leaks

1. Rotate the credential immediately — assume it is compromised.
2. Remove it from the code and from git history (`git filter-repo` or
   [BFG](https://rtyley.github.io/bfg-repo-cleaner/)).
3. Add a rule so the scan catches the same pattern in future.
