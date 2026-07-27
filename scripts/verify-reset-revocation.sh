#!/usr/bin/env bash
# Runtime proof that a password reset revokes EVERY session (PR #244), against the deployed Worker.
# vitest runs on Node, so nothing local can prove D1 + workerd behaviour — see CLAUDE.md §0.5.
#
# Creates one throwaway member, opens two sessions, forges a reset token straight into D1 (the
# email provider that would normally deliver it does not exist yet), resets, then checks both
# sessions are gone. Cleans up after itself, including leftovers from an earlier aborted run.
set -uo pipefail

BASE="${BASE:-https://kazumiclinic.skin}"
DB="kazumi-clinic-tag-cache"
EMAIL="reset-probe-$(date +%s)@smoke.invalid"
PASS_OLD="probe-old-password-1"
PASS_NEW="probe-new-password-2"
TMP=$(mktemp -d)
JAR_A="$TMP/a.txt"; JAR_B="$TMP/b.txt"
fail=0

d1() { npx wrangler d1 execute "$DB" --remote -y --command "$1" --json 2>/dev/null; }
# wrangler pretty-prints its JSON, so squash whitespace before pulling the count out.
d1num() { d1 "$1" | tr -d ' \n' | grep -o '"n":[0-9]*' | head -1 | cut -d: -f2; }
say() { printf '%s\n' "$*"; }

cleanup() {
  say "── cleanup ──"
  d1 "DELETE FROM member_sessions WHERE member_id IN (SELECT id FROM members WHERE email LIKE 'reset-probe-%@smoke.invalid');
      DELETE FROM member_tokens   WHERE member_id IN (SELECT id FROM members WHERE email LIKE 'reset-probe-%@smoke.invalid');
      DELETE FROM carts           WHERE member_id IN (SELECT id FROM members WHERE email LIKE 'reset-probe-%@smoke.invalid');
      DELETE FROM members WHERE email LIKE 'reset-probe-%@smoke.invalid';" >/dev/null
  rm -rf "$TMP"
}
trap cleanup EXIT

say "1. สมัครสมาชิกใหม่ → session A"
code=$(curl -s -o "$TMP/reg.json" -w '%{http_code}' -c "$JAR_A" -X POST "$BASE/api/account/register" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS_OLD\",\"name\":\"reset probe\"}")
say "   register → $code"
[ "$code" = "429" ] && { say "   rate limited — สรุปไม่ได้"; exit 2; }
[ "$code" = "200" ] || { say "   FAIL: $(cat "$TMP/reg.json")"; exit 1; }

say "2. ล็อกอินอีกเครื่อง → session B"
code=$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR_B" -X POST "$BASE/api/account/login" \
  -H 'content-type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS_OLD\"}")
say "   login → $code"
[ "$code" = "429" ] && { say "   rate limited — สรุปไม่ได้"; exit 2; }
[ "$code" = "200" ] || { say "   FAIL"; exit 1; }

# The register call may or may not have set a cookie depending on the deployed build; session B is
# the one this test needs, and D1 is the source of truth for how many are open.
before=$(d1num "SELECT COUNT(*) AS n FROM member_sessions WHERE member_id = (SELECT id FROM members WHERE email = '$EMAIL');")
say "3. session ใน D1 ก่อนรีเซ็ต: ${before:-?}"
[ "${before:-0}" -ge 1 ] || { say "   FAIL: ไม่มี session ให้ทดสอบ"; exit 1; }

for jar in "$JAR_A" "$JAR_B"; do
  logged=$(curl -s -b "$jar" "$BASE/api/account/me" | grep -o '"isLoggedIn":[a-z]*' | cut -d: -f2)
  say "   $(basename "$jar") isLoggedIn=$logged"
done

say "4. ปลอม reset token ลง D1 (ยังไม่มี email provider)"
TOKEN=$(node -e "console.log([...require('crypto').randomBytes(32)].map(b=>b.toString(16).padStart(2,'0')).join(''))")
TOKEN_ID=$(node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "$TOKEN")
NOW=$(node -e 'console.log(Date.now())')
EXP=$((NOW + 3600000))
d1 "INSERT INTO member_tokens (id, member_id, type, expires_at, created_at)
    SELECT '$TOKEN_ID', id, 'password_reset', $EXP, $NOW FROM members WHERE email = '$EMAIL';" >/dev/null

say "5. POST /api/account/reset-password"
code=$(curl -s -o "$TMP/reset.json" -w '%{http_code}' -X POST "$BASE/api/account/reset-password" \
  -H 'content-type: application/json' -d "{\"token\":\"$TOKEN\",\"password\":\"$PASS_NEW\"}")
say "   reset → $code $(cat "$TMP/reset.json")"
[ "$code" = "429" ] && { say "   rate limited — สรุปไม่ได้"; exit 2; }
[ "$code" = "200" ] || { say "   FAIL"; exit 1; }

say "6. ตรวจผล"
after=$(d1num "SELECT COUNT(*) AS n FROM member_sessions WHERE member_id = (SELECT id FROM members WHERE email = '$EMAIL');")
say "   session ใน D1 หลังรีเซ็ต: ${after:-?} (ต้องเป็น 0)"
[ "${after:-1}" = "0" ] || { say "   FAIL: ยังมี session ค้าง"; fail=1; }

for jar in "$JAR_A" "$JAR_B"; do
  logged=$(curl -s -b "$jar" "$BASE/api/account/me" | grep -o '"isLoggedIn":[a-z]*' | cut -d: -f2)
  say "   $(basename "$jar") isLoggedIn=$logged (ต้องเป็น false)"
  [ "$logged" = "false" ] || fail=1
done

tokens=$(d1num "SELECT COUNT(*) AS n FROM member_tokens WHERE id = '$TOKEN_ID';")
say "   reset token เหลือ: ${tokens:-?} (ต้องเป็น 0 — ใช้ครั้งเดียว)"
[ "${tokens:-1}" = "0" ] || fail=1

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/account/login" \
  -H 'content-type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS_OLD\"}")
say "   ล็อกอินด้วยรหัสเก่า → $code (ต้องเป็น 401)"
[ "$code" = "401" ] || { [ "$code" = "429" ] && say "   (429 — ข้ามข้อนี้)" || fail=1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/account/login" \
  -H 'content-type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS_NEW\"}")
say "   ล็อกอินด้วยรหัสใหม่ → $code (ต้องเป็น 200)"
[ "$code" = "200" ] || { [ "$code" = "429" ] && say "   (429 — ข้ามข้อนี้)" || fail=1; }

[ "$fail" = "0" ] && say "✅ ผ่านทุกข้อ" || say "❌ มีข้อที่ไม่ผ่าน"
exit "$fail"
