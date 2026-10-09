default:
    @just --list

# Install dependencies and initialise local env
setup:
    npm ci
    just env-init

# Copy .env.example to .env (never overwrites)
env-init:
    @cp -n .env.example .env && echo "Created .env (kept existing file if present)."

# Start the Expo dev server
start:
    npm start

# Start targeting Android / iOS / web
android:
    npm run android

ios:
    npm run ios

web:
    npm run web

# Lint, format, and typecheck
lint:
    npm run lint

format:
    npm run format

format-check:
    npm run format:check

typecheck:
    npm run typecheck

# Run tests once / in watch mode / with coverage
test:
    npm test

test-watch:
    npm run test:watch

coverage:
    npm run test:coverage

# Full local gate: lint + typecheck + tests with coverage
check:
    npm run check

# Expo environment diagnostics
doctor:
    npm run doctor

# Scan the repo for leaked secrets
secrets:
    npm run secrets

# Smoke-test the production web bundle
bundle-web:
    npm run bundle-web

# Remove generated artifacts and dependencies
clean:
    npm run clean
