#!/usr/bin/env bash
# Smoke test — exercise deployed Worker write paths that Node-based tests cannot faithfully cover.
# A runtime-only crypto failure should become visible immediately after deploy, not days later.
#
# Usage:  bash scripts/smoke.sh
#         BASE=https://kazumi-clinic.bankjack10452.workers.dev bash scripts/smoke.sh   # workers.dev instead
# Exit:   0 = healthy, 1 = broken, 2 = inconclusive because an account endpoint rate-limited the run
set -uo pipefail

BASE="${BASE:-https://kazumiclinic.skin}"
EMAIL="smoke-$(date +%s)-$RANDOM@smoke.invalid"
PASSWORD="worker-smoke-$RANDOM-$RANDOM"

cleanup() {
  local exit_status="$1"
  trap - EXIT

  # A cleanup failure is safe to warn on: this prefix-wide sweep lets the next successful run
  # collect leftovers from any earlier run whose delete failed or whose process missed its trap.
  if npx wrangler d1 execute kazumi-clinic-tag-cache --remote -y \
    --command "DELETE FROM members WHERE email LIKE 'smoke-%@smoke.invalid'" >/dev/null; then
    echo "  ok    cleanup  smoke member prefix"
  else
    echo "  WARN  cleanup failed: smoke member prefix may contain leftovers" >&2
  fi

  case "$exit_status" in
    0) echo "Worker write paths healthy ✓" ;;
    2) echo "Worker write paths inconclusive — rate limited, not failed" ;;
    *) echo "Worker write paths unhealthy ✗" ;;
  esac
  exit "$exit_status"
}
trap 'cleanup "$?"' EXIT

assert_status() {
  local expected="$1"
  local endpoint="$2"
  local description="$3"
  local body="$4"
  local code=""
  local attempt
  # One retry covers deploy-settle transients without repeating the full register/login cycle.
  local attempts=2

  for attempt in $(seq 1 "$attempts"); do
    if ! code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
      -H 'Content-Type: application/json' \
      --data "$body" \
      "$BASE/api/account/$endpoint"); then
      code="000"
    fi

    if [ "$code" = "$expected" ]; then
      printf '  ok    %s  POST /api/account/%s (%s)\n' "$code" "$endpoint" "$description"
      return
    fi

    if [ "$code" = "429" ]; then
      printf '  WARN  %s  POST /api/account/%s (%s; expected %s)\n' \
        "$code" "$endpoint" "$description" "$expected"
      echo "Smoke test inconclusive: rate limiting confirms the Worker, routing, and D1 limiter are responding, but it does not exercise the crypto path."
      exit 2
    fi

    # A settle delay can help only when transport or the Worker edge is transiently unavailable.
    case "$code" in
      000|502|503|504)
        if [ "$attempt" -lt "$attempts" ]; then
          printf '  WARN  %s  POST /api/account/%s (%s; retrying %s/%s after settle delay)\n' \
            "$code" "$endpoint" "$description" "$attempt" "$attempts"
          sleep 10
          continue
        fi
        ;;
    esac

    printf '  FAIL  %s  POST /api/account/%s (%s; expected %s)\n' \
      "$code" "$endpoint" "$description" "$expected"
    exit 1
  done
}

echo "Worker smoke test → $BASE"

# A duplicate email answers 200 as well (the endpoint refuses to say who has an account), so only a
# fresh address proves the real create-and-hash path ran. Every run must register a new one.
assert_status "200" "register" "fresh member" \
  "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
assert_status "200" "login" "correct password" \
  "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
assert_status "401" "login" "wrong password rejected" \
  "{\"email\":\"$EMAIL\",\"password\":\"deliberately-wrong\"}"
