#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: just release <patch|minor|major|x.y.z>

Bumps package.json and app.json (expo.version) to the next version,
commits "chore(release): boee-vX.Y.Z", tags it, pushes master and the
tag, then publishes a GitHub Release with auto-generated notes. The
release event triggers "Attach release assets", which builds and
attaches the web bundle and the Android APK.

The pre-push hook runs typecheck + tests before the commit leaves the
machine.

Options:
  -n, --dry-run   Print the target version and exit without changes.
  -h, --help      Show this help.
EOF
}

DRY_RUN=0
BUMP=""

while [ $# -gt 0 ]; do
  case "$1" in
    -n | --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*)
      echo "release: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      BUMP="$1"
      shift
      ;;
  esac
done

fail() {
  echo "release: $*" >&2
  exit 1
}

if [ -z "$BUMP" ]; then
  usage >&2
  exit 2
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "not inside a git repository"
cd "$ROOT"

command -v git >/dev/null 2>&1 || fail "git is required"
command -v node >/dev/null 2>&1 || fail "node is required"
command -v gh >/dev/null 2>&1 || fail "gh (GitHub CLI) is required"

[ -f package.json ] || fail "package.json not found in $ROOT"

CURRENT="$(node -p "require('./package.json').version")"

case "$BUMP" in
  patch | minor | major)
    NEXT="$(
      node -e '
        const [maj, min, pat] = require("./package.json").version.split(".").map(Number);
        const which = process.argv[1];
        let next;
        if (which === "major") next = [maj + 1, 0, 0];
        else if (which === "minor") next = [maj, min + 1, 0];
        else next = [maj, min, pat + 1];
        process.stdout.write(next.join("."));
      ' "$BUMP"
    )"
    ;;
  *)
    [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] ||
      fail "invalid version: $BUMP (use patch|minor|major or x.y.z)"
    NEXT="$BUMP"
    ;;
esac

node -e '
  const cmp = (a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i += 1) if (pa[i] !== pb[i]) return pa[i] - pb[i];
    return 0;
  };
  if (cmp(process.argv[1], process.argv[2]) >= 0) {
    console.error(`release: ${process.argv[2]} is not greater than current ${process.argv[1]}`);
    process.exit(1);
  }
' "$CURRENT" "$NEXT" || exit 1

TAG="boee-v${NEXT}"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "release(dry-run): $CURRENT -> $NEXT  (tag $TAG)"
  exit 0
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "master" ] || fail "must be on 'master' (currently '$BRANCH')"

[ -z "$(git status --porcelain)" ] || fail "working tree is dirty; commit or stash changes first"

git fetch --quiet origin master
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/master)" ] ||
  fail "local master is not in sync with origin/master"

gh auth status >/dev/null 2>&1 || fail "gh is not authenticated (run: gh auth login)"

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  fail "tag $TAG already exists locally"
fi
if git ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null 2>&1; then
  fail "tag $TAG already exists on origin"
fi

npm version "$NEXT" --no-git-tag-version >/dev/null
node -e '
  const fs = require("fs");
  const app = JSON.parse(fs.readFileSync("app.json", "utf8"));
  app.expo.version = process.argv[1];
  fs.writeFileSync("app.json", JSON.stringify(app, null, 2) + "\n");
' "$NEXT"
npx prettier --write package.json app.json >/dev/null

git add package.json app.json
git commit -m "chore(release): $TAG"
git tag -a "$TAG" -m "$TAG"

if ! git push origin master; then
  fail "push of the commit failed. Recover with:
    git reset --hard origin/master
    git tag -d $TAG"
fi
if ! git push origin "$TAG"; then
  fail "push of tag $TAG failed. Recover with:
    git push origin :refs/tags/$TAG
    git tag -d $TAG"
fi

gh release create "$TAG" --title "$TAG" --generate-notes --verify-tag

echo "release: published $TAG"
echo "release: 'Attach release assets' will now build the web bundle and Android APK"
