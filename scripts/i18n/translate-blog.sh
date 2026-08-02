#!/usr/bin/env bash
# Translates blog posts (title/excerpt/body) Thai → English with Gemini CLI.
#
#   node scripts/i18n/blog-extract.mjs > /tmp/blog-th.json
#   bash scripts/i18n/translate-blog.sh /tmp/blog-th.json > /tmp/blog-en.json
#
# Same shape as translate-catalogue.sh — see that file for the runtime requirements
# (GEMINI_API_KEY in ~/.gemini/.env, --skip-trust).

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PAYLOAD="${1:-/tmp/blog-th.json}"

if [ ! -f "$PAYLOAD" ]; then
  echo "missing payload: $PAYLOAD" >&2
  exit 1
fi

cd "$HERE/../.."
exec gemini --skip-trust -p "$(cat "$HERE/prompt-blog.md")

$(cat "$PAYLOAD")"
