#!/usr/bin/env bash
# Publishes dist/ to the gh-pages branch. The source branch never carries build output.
# Refuses to publish if any gate fails.
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/check.mjs
REMOTE=$(git remote get-url origin)
rm -rf dist/.git
git -C dist init -q -b gh-pages
git -C dist add -A
git -C dist -c user.name="$(git config user.name || echo fietsenrekk)" -c user.email="$(git config user.email || echo noreply@users.noreply.github.com)" commit -q -m "deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git -C dist push -q -f "$REMOTE" gh-pages
rm -rf dist/.git
echo "pushed dist/ to gh-pages"
