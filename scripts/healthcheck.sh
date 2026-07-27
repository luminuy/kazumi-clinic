#!/usr/bin/env bash
# Health check — curl every public route and fail (exit 1) if any is not HTTP 200.
# Makes silent breakage loud: run after a deploy, or on a schedule (see .github/workflows/uptime.yml).
#
# Usage:  bash scripts/healthcheck.sh
#         BASE=https://kazumi-clinic.bankjack10452.workers.dev bash scripts/healthcheck.sh   # workers.dev instead
set -uo pipefail

BASE="${BASE:-https://kazumiclinic.skin}"
PAGES=(
  / /services /about /contact /reviews /blog /promotions
  /filler /botox /skin-booster /collagen-booster /thread-lift
  /mesotherapy /acne-care /laser-hifu /iv-drip
  /sitemap.xml /robots.txt
)

echo "Health check → $BASE"
fail=0
for p in "${PAGES[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE$p")
  if [ "$code" = "200" ]; then
    printf '  ok    %s  %s\n' "$code" "$p"
  else
    printf '  FAIL  %s  %s\n' "$code" "$p"
    fail=1
  fi
done

if [ "$fail" = "0" ]; then
  echo "All routes healthy ✓"
else
  echo "Some routes are unhealthy ✗"
  exit 1
fi
