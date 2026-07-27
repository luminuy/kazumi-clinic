#!/usr/bin/env bash
# Translates the service catalogue Thai → English with Gemini CLI.
#
#   npx tsx scripts/i18n/catalogue-extract.mts > /tmp/catalogue-th.json
#   bash scripts/i18n/translate-catalogue.sh /tmp/catalogue-th.json > /tmp/catalogue-en.json
#
# The rules live in prompt-catalogue.md and are sent inline with the payload: the model has no
# reason to open a file it was not handed, and a run that silently skipped the compliance rules is
# the expensive failure here (CLAUDE.md §0.2 — the English must never claim more than the Thai).
#
# Requires GEMINI_API_KEY in ~/.gemini/.env. --skip-trust is needed because the CLI will not load
# that .env inside a directory it has not been told to trust, and a headless run has nobody to ask.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PAYLOAD="${1:-/tmp/catalogue-th.json}"

if [ ! -f "$PAYLOAD" ]; then
  echo "missing payload: $PAYLOAD" >&2
  echo "run: npx tsx scripts/i18n/catalogue-extract.mts > $PAYLOAD" >&2
  exit 1
fi

cd "$HERE/../.."
exec gemini --skip-trust -p "$(cat "$HERE/prompt-catalogue.md")

$(cat "$PAYLOAD")"
