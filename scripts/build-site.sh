#!/usr/bin/env bash
# Compose the static site for GitHub Pages deploy.
#
# Output tree (under _site/):
#   _site/index.html           ← web/index.html (with iframes pointing to ./demos/...)
#   _site/style.css            ← web/style.css
#   _site/sessions/s1/...      ← Slidev-built deck for S1
#   _site/demos/<name>/...     ← Vite-built standalone demo apps
#
# The deck's iframe URLs (currently hardcoded localhost:517N for dev) are rewritten
# to point at ../../demos/<name>/ — relative paths that work both when the deck
# is served from /life-of-an-agent/sessions/s1/ on Pages AND when previewed
# locally via `pnpm preview`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$ROOT/_site"
BASE_PATH="${PAGES_BASE-/life-of-an-agent}"   # Override via env when testing locally. Use `-` (not `:-`) so PAGES_BASE="" is honored.

echo "==> clean previous build output"
rm -rf "$SITE"
mkdir -p "$SITE/sessions" "$SITE/demos"

echo "==> build each demo (Vite, --base ./)"
for demo in agent-loop tokenizer-explorer embedding-scatter residual-stream-animator; do
  echo "  - $demo"
  pushd "$ROOT/demos/$demo" > /dev/null
  pnpm build > /dev/null
  cp -r dist "$SITE/demos/$demo"
  popd > /dev/null
done

echo "==> rewrite iframe URLs in the deck for production"
DECK_DIR="$ROOT/sessions/01-foundations-i"
TMP_SLIDES="$DECK_DIR/slides.prod.md"
# Replace http://localhost:517N/ with ../../demos/<name>/ — order matters; do longest first.
sed \
  -e 's|http://localhost:5174/|../../demos/agent-loop/|g' \
  -e 's|http://localhost:5175/|../../demos/tokenizer-explorer/|g' \
  -e 's|http://localhost:5176/|../../demos/embedding-scatter/|g' \
  -e 's|http://localhost:5177/|../../demos/residual-stream-animator/|g' \
  "$DECK_DIR/slides.md" > "$TMP_SLIDES"

echo "==> build Slidev deck for S1 (--base $BASE_PATH/sessions/s1/)"
pushd "$DECK_DIR" > /dev/null
pnpm slidev build slides.prod.md --base "$BASE_PATH/sessions/s1/" --out dist > /dev/null
mkdir -p "$SITE/sessions/s1"
cp -r dist/. "$SITE/sessions/s1/"
rm -f "$TMP_SLIDES"
popd > /dev/null

# /presenter/ is a client-side route inside the Slidev app. GitHub Pages
# only uses the site-root 404.html for missing URLs (never subdirectory
# 404s), so we stamp a presenter/index.html that re-boots the same SPA.
# Slidev's own dist/404.html is already an SPA fallback copy of index.html.
echo "==> stamp presenter SPA entry for GH Pages"
mkdir -p "$SITE/sessions/s1/presenter"
cp "$SITE/sessions/s1/404.html" "$SITE/sessions/s1/presenter/index.html"

echo "==> build landing page (Vite, --base ./)"
pushd "$ROOT/web" > /dev/null
pnpm build > /dev/null
# Vite outputs to web/dist; flatten into _site/ root.
cp -r dist/. "$SITE/"
popd > /dev/null

# A bare 404 helps GH Pages SPAs and bad links land somewhere readable.
cp "$SITE/index.html" "$SITE/404.html"

# Pages disables Jekyll processing only when this file exists.
touch "$SITE/.nojekyll"

echo
echo "Site composed at: $SITE"
echo "Top-level entries:"
ls -la "$SITE" | sed 's/^/  /'
