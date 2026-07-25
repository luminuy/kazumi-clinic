# Deploy — Kazumi Clinic

> **อ่านบรรทัดนี้ก่อน: ปกติคุณ "ไม่ต้อง" deploy เอง**
> CD เปิดตั้งแต่ 2026-07-23 — merge PR เข้า `main` → CI ผ่าน → workflow `Deploy` รัน `pnpm cf:deploy` ให้อัตโนมัติ
> เอกสารนี้มีไว้เพื่อ (ก) เข้าใจว่า deploy ทำงานยังไง (ข) **ทางหนีทีไล่** ตอน CD เสีย/ถูกปิดและต้อง deploy มือจริง ๆ

ค่าทุกอย่างในนี้ตรวจจากระบบจริง (ล่าสุด **2026-07-25**) — แต่ก่อนอ้างสถานะกับ user ให้ยิงคำสั่งตรวจซ้ำเสมอ (CLAUDE.md §0.5)

---

## 0. ตัดสินใจก่อน: ต้อง deploy มือไหม

| สถานการณ์ | ทำอะไร |
| --- | --- |
| merge PR เข้า main ตามปกติ | **ไม่ต้องทำอะไร** — เฝ้า `gh run watch` / `gh run list --workflow=Deploy` แล้ว verify (§4) |
| CD run แดง | อ่าน log ของ run นั้นก่อน แก้ที่ต้นเหตุ แล้ว re-run — อย่ารีบ deploy มือทับ |
| CD ถูกปิด / secret ของ Actions หาย | deploy มือตาม §3–§6 |
| อยากดูงานที่ยังไม่ merge บนเว็บจริง | **ห้ามทำ** — deploy จาก branch ที่ยังไม่ merge = โค้ดบน main จะทับกลับรอบหน้า และเว็บคลินิกจะโชว์ของที่ยังไม่ผ่านรีวิว |

> ⛔ **ห้าม deploy มือชนกับ CD ที่กำลังรัน** — `wrangler deploy` สองตัวพร้อมกันได้ production ครึ่ง ๆ กลาง ๆ
> เช็คก่อนเสมอ: `gh run list --workflow=Deploy -L 3` ต้องไม่มี run สถานะ `in_progress`

---

## 1. ทำไมคำสั่ง deploy มาตรฐานพังบนเครื่องนี้

เครื่อง dev คือ **macOS 12.7.6** (`sw_vers`) แต่ `workerd` — runtime ที่ `wrangler`/miniflare ใช้จำลอง Worker ในเครื่อง — **ต้องการ macOS 13.5.0+**

```
Error: Unsupported macOS version: 12.7.6 (workerd requires macOS 13.5.0+)
```

คำสั่ง deploy "ปกติ" ของ OpenNext คือ `opennextjs-cloudflare deploy` — **wrapper ตัวนี้เรียก workerd** ตอนอ่าน env ผ่าน `getPlatformProxy()` ก่อนจะ deploy จริง พอ workerd start ไม่ได้ → ตายกลางคัน

**นี่คือจุดที่ agent อื่นติดแล้วสรุปผิดว่า "เครื่องนี้ deploy ไม่ได้"** — deploy ได้ แค่ต้องข้าม wrapper ที่เรียก workerd (§2)

**คำสั่งที่จะพัง 100% บนเครื่องนี้:**

```bash
wrangler dev                        # ❌ ต้องรัน workerd
pnpm cf:preview                     # ❌ เหตุผลเดียวกัน
opennextjs-cloudflare deploy        # ❌ wrapper เรียก workerd ตอนอ่าน env
npx wrangler deploy                 # ❌ ไม่ได้ build .open-next ก่อน → deploy ของเก่า/ว่าง
wrangler d1 ... --local             # ❌ workerd เหมือนกัน (ใช้ --remote แทน)
```

ข้อจำกัดนี้เป็นของ **เครื่อง dev** เท่านั้น — GitHub runner ของ CD เป็น Linux จึงไม่เจอปัญหานี้ (แต่ก็รัน `pnpm cf:deploy` ตัวเดียวกัน)

---

## 2. Trick ที่ทำให้ deploy ผ่าน — `OPEN_NEXT_DEPLOY=true`

`cf:deploy` ใน [package.json](../package.json) (ณ 2026-07-25):

```json
"cf:deploy": "opennextjs-cloudflare build && pnpm cf:tagcache && pnpm cf:migrate:members && pnpm cf:migrate:ratelimit && OPEN_NEXT_DEPLOY=true wrangler deploy"
```

| ท่อน | ทำอะไร | ใช้ workerd ไหม |
| --- | --- | --- |
| `opennextjs-cloudflare build` | แปลง Next.js → Worker bundle ลง `.open-next/` | ❌ |
| `cf:tagcache` / `cf:migrate:members` / `cf:migrate:ratelimit` | รัน migration ผ่าน D1 HTTP API (`--remote`) | ❌ |
| `OPEN_NEXT_DEPLOY=true wrangler deploy` | อัปโหลด `.open-next/worker.js` + assets ผ่าน Cloudflare API | ❌ |

**`OPEN_NEXT_DEPLOY=true` คือกุญแจ** — บอก `wrangler` ว่าอย่า delegate ไปให้ deploy command ของ `opennextjs-cloudflare` (ตัวที่เรียก workerd) แต่ให้รัน plain `wrangler deploy` จาก bundle ที่ build ไว้แล้ว

> build ไม่ต้องใช้ workerd · upload ไม่ต้องใช้ workerd · มีแค่ **wrapper ตรงกลาง** ที่เรียก และ env var นี้ตัดมันทิ้ง

**เพราะงั้น: เรียก `pnpm cf:deploy` เท่านั้น อย่าเรียก sub-command แยกเอง**

### migration ที่ผูกใน `cf:deploy` — 3 ตัวนี้เท่านั้น

`0007_tag_cache_revalidations`, `0009_member_system`, `0010_rate_limits` — เป็น `CREATE TABLE IF NOT EXISTS` ล้วน จึงรันซ้ำทุก deploy ได้ปลอดภัย

> 🔴 **ห้ามผูก migration ที่เป็น `ALTER TABLE` หรือ table-rebuild (`DROP`/`RENAME`/`INSERT..SELECT`) เข้า chain นี้เด็ดขาด**
> `0011_promotions_image.sql` เคยถูกผูกไว้ → rebuild ตาราง `promotions` โดยไม่ copy `image_public_id` → **รูปโปรโมชั่นหายทุก deploy** (บทเรียน 2026-07-24 · CLAUDE.md §0.5)
> migration นอก chain (`0001`–`0006`, `0008`, `0011`, `0012`) = รันมือครั้งเดียว อ่าน SQL ให้จบก่อนรัน

```bash
npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file migrations/000X_xxx.sql
```

---

## 3. ก่อน deploy มือ — 4 ข้อ ข้ามไม่ได้

### 3.1 ต้องอยู่บน `main` ที่ merge แล้ว

```bash
git switch main && git pull --ff-only
git rev-parse --short HEAD origin/main   # ต้องเท่ากัน
```

deploy จาก branch ที่ยังไม่ merge = เว็บจริงได้โค้ดที่ยังไม่ผ่าน CI/รีวิว แล้ว CD รอบหน้าจะทับกลับ (เคยเกิด: ปุ่มกลับเป็นสไตล์เดิม)

### 3.2 หยุด dev server ทุกตัวก่อน (บทเรียนจริง 2026-07-17)

ถ้ามี `pnpm dev` / `next dev` รันอยู่บน working tree เดียวกันขณะ deploy → **มันเขียน `.next/` พร้อมกับที่ OpenNext build** ทำให้ development asset (`/_next/static/development/*`, `*.hot-update.js`) ปนขึ้น Worker · deploy จบเห็น `Current Version ID` ปกติ แต่ **เว็บจริงตอบ 500**

```bash
ps aux | grep -E "next dev|next-server" | grep -v grep   # ต้องว่าง
pkill -f "next dev"; pkill -f "next-server"
```

### 3.3 อย่าปล่อยไฟล์ขยะปนใน build

iCloud Drive ชอบสร้างสำเนา `* 2.ts` / `.next/* 2.*` — ทำ build/typecheck ล้มด้วย `Duplicate identifier` แบบงง ๆ

```bash
find . -name '* 2.*' -not -path './node_modules/*'   # ต้องไม่มี output
```

### 3.4 verify โค้ดให้ครบ 4 คำสั่ง (CLAUDE.md §0.3)

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

ทั้ง 4 ต้อง exit 0 — `pnpm test` ขาดไม่ได้ (CI รันด้วย ข้ามในเครื่องก็แค่ไปแดงทีหลัง) · CI รัน `pnpm cf:build` เพิ่มอีกตัว เพราะ `next build` ผ่านไม่ได้แปลว่า OpenNext bundle จะผ่าน

---

## 4. หลัง deploy — `Current Version ID` **ไม่ได้แปลว่าเว็บใช้งานได้**

`pnpm cf:deploy` จบด้วย:

```
Uploaded kazumi-clinic (x.xx sec)
Deployed kazumi-clinic triggers (x.xx sec)
Current Version ID: 12ab34cd-...
```

นั่นยืนยันแค่ว่า **ไฟล์ขึ้นไปแล้ว** ไม่ได้ยืนยันว่า **เว็บเสิร์ฟโค้ดใหม่** ต้องตรวจเป็นชั้น ๆ:

**ชั้น 1 — หน้าเว็บ (ยิงอย่างน้อย 2 ครั้ง)**

```bash
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "^http/|x-nextjs-cache"
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "^http/|x-nextjs-cache"
```

หน้าเว็บเป็น **ISR + stale-while-revalidate** · request แรกหลัง deploy เสิร์ฟ HTML เก่าจาก KV (`x-nextjs-cache: HIT`) แล้วค่อย regenerate เบื้องหลัง · **ยิงครั้งเดียวแล้วอ่านผล = อ่านของเก่า** แล้วจะนึกว่า deploy ไม่ขึ้นทั้งที่ขึ้นแล้ว (บทเรียน 2026-07-17)

- `HIT` = ของเก่าจาก cache · `MISS`/`STALE` = เพิ่ง regenerate

**ชั้น 2 — ทุกหน้าตอบ 200**

```bash
pnpm health          # scripts/healthcheck.sh — ไล่ยิงทุกหน้า
```

**ชั้น 3 — write path จริง (บังคับถ้าแตะ auth/D1/crypto)**

```bash
pnpm smoke           # scripts/smoke.sh — สมัคร/ล็อกอินจริงบน Worker แล้วลบทิ้ง
```

> 🔴 **เทสต์เขียว + CI เขียว ≠ ใช้งานได้** — `vitest` รันบน Node ซึ่งมี Web API/ลิมิตไม่เหมือน workerd
> เคสจริง 2026-07-25: PBKDF2 600k รอบผ่านเทสต์หมด แต่ workerd ปฏิเสธเกิน 100k → สมัคร/ล็อกอินตายสนิทหลายวันโดยไม่มีด่านไหนจับได้
> `pnpm smoke` ครอบแค่ register/login — path อื่นที่แตะ crypto/D1/binding **ต้องยิงเอง**
> exit code: `0` ผ่าน · `1` พังจริง · `2` สรุปไม่ได้ (เจอ rate limit 429 — Worker ทำงานอยู่ แค่ไม่ได้แตะ crypto)

**ชั้น 4 — ISR/revalidation** ตรวจที่ runtime observability (`npx wrangler tail`) เท่านั้น — error จาก background revalidation ไม่โผล่ใน response

---

## 5. Deploy เปลี่ยนอะไร / ไม่เปลี่ยนอะไร

| เปลี่ยน | ไม่เปลี่ยน |
| --- | --- |
| โค้ด Worker + static assets | Binding (KV/D1/DO/Service) — resource สร้างไว้หมดแล้ว **ห้ามรันคำสั่งสร้างซ้ำ** |
| schema จาก 3 migration ใน chain (§2) | Secret — ตั้งด้วย `wrangler secret put` ต่างหาก (ดู [infrastructure.md](./infrastructure.md)) |
| Var ใน [wrangler.jsonc](../wrangler.jsonc) (แก้ไฟล์แล้ว deploy ถึงมีผล) | migration นอก chain — ต้องรันมือ |

ถ้า feature ใหม่พึ่งตารางที่ยังไม่ได้ migrate → **เว็บ error แม้ deploy โค้ดสำเร็จ**

---

## 6. เช็คลิสต์ deploy มือฉบับเต็ม

```bash
# ── 0. CD ต้องไม่กำลังรัน ──
gh run list --workflow=Deploy -L 3                     # ต้องไม่มี in_progress

# ── 1. อยู่บน main ที่ merge แล้ว ──
git switch main && git pull --ff-only
git rev-parse --short HEAD origin/main                 # ต้องเท่ากัน

# ── 2. สภาพแวดล้อมสะอาด ──
git status --short                                     # ไม่มีไฟล์ขยะ
find . -name '* 2.*' -not -path './node_modules/*'     # ต้องว่าง
ps aux | grep -E "next dev|next-server" | grep -v grep # ต้องว่าง

# ── 3. verify ──
pnpm lint && pnpm typecheck && pnpm test && pnpm build # ทั้งหมด exit 0

# ── 4. migration นอก chain (ถ้ามีใหม่ — อ่าน SQL ก่อน!) ──
npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file migrations/000X_xxx.sql

# ── 5. deploy ──
pnpm cf:deploy                                         # รอ "Current Version ID: ..."

# ── 6. verify ปลายทาง ──
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "^http/|x-nextjs-cache"
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "^http/|x-nextjs-cache"
pnpm health
pnpm smoke                                             # ถ้าแตะ auth/D1/crypto
npx wrangler deployments list | tail -6

# ── 7. บันทึก ──
# อัปเดตตาราง "Deployed ตอนนี้" ใน STATUS.md ด้วย Version ID + commit จริง
```

**รายงาน user ว่า "deploy สำเร็จ" ได้ต่อเมื่อ**: เห็น `Current Version ID` **และ** curl ได้ 200 จากเนื้อหาใหม่ · ข้อไหนไม่ได้ตรวจ ให้เขียนตรง ๆ ว่า "ยังไม่ได้ตรวจ" (CLAUDE.md §0.5)

---

## 7. Error ที่เจอบ่อย → สาเหตุ → วิธีแก้

| Error / อาการ | สาเหตุจริง | วิธีแก้ |
| --- | --- | --- |
| `Unsupported macOS version: 12.7.6` | เรียก workerd ตรง ๆ (`wrangler dev`, `cf:preview`, `opennextjs-cloudflare deploy`, `d1 --local`) | ใช้ `pnpm cf:deploy` / `d1 --remote` (§1–2) |
| `GH013: Repository rule violations found` | พยายาม push เข้า `main` | ไม่ใช่ของพัง — `git switch -c <branch>` แล้วเปิด PR |
| Deploy สำเร็จแต่เว็บ **500** | dev server เขียน `.next` ปนตอน build | `pkill -f "next dev"` แล้ว deploy ใหม่ (§3.2) |
| Deploy แล้วเว็บ **ยังเป็นของเก่า** | ISR เสิร์ฟ cache จาก KV | ยิงซ้ำครั้งที่ 2 + ดู `x-nextjs-cache` (§4) — ไม่ใช่บั๊ก |
| เปลี่ยนรูปใน /admin แล้วหน้าไม่อัปเดต | ตาราง `revalidations` ใน D1 หาย → `revalidatePath()` ไม่มีที่บันทึก | เช็คตาราง แล้วรัน `pnpm cf:tagcache` ([infrastructure.md](./infrastructure.md)) |
| สมัคร/ล็อกอินตอบ 502 ทั้งที่เทสต์เขียว | โค้ดใช้ Web API ที่ workerd ไม่รองรับ (เช่น PBKDF2 > 100k) | `npx wrangler tail` อ่าน error จริง (§4 ชั้น 3) |
| รูปโปรโมชั่นหายหลัง deploy | migration table-rebuild อยู่ใน `cf:deploy` chain | เอาออกจาก chain (§2) |
| `Dummy queue is not implemented` | `open-next.config.ts` ไม่มี `queue`/`tagCache` override | อย่าแตะ config — ตั้ง `doQueue`/`d1NextTagCache` ไว้แล้ว |
| `Please enable R2 ... code 10042` | บัญชียังไม่เปิด R2 | ใช้ KV อยู่แล้ว — เจ้าของบัญชีต้องกดเปิดเองถ้าจะสลับ |
| `pnpm build` ล้ม `Duplicate identifier` | ไฟล์สำเนา `* 2.ts` จาก iCloud | `find . -name '* 2.*'` แล้วลบ (§3.3) |

---

## 8. ความเข้าใจผิดที่เจอซ้ำ ๆ

1. **"เครื่องนี้ deploy ไม่ได้เพราะ macOS เก่า" — ผิด** · deploy ได้ผ่าน `pnpm cf:deploy` แค่ห้ามเรียก workerd ตรง ๆ
2. **"ต้อง deploy มือทุกครั้ง" — ผิดตั้งแต่ 2026-07-23** · CD ทำให้แล้ว · deploy มือคือ **ข้อยกเว้น** และห้ามชนกับ CD
3. **"เห็น Current Version ID = เว็บใช้งานได้" — ผิด** · ต้องยิง URL ตรวจ (§4)
4. **"curl ได้ 200 = โค้ดใหม่ขึ้นแล้ว" — ผิด** · 200 มาจาก ISR cache ของเก่าได้ ต้องยิง 2 ครั้ง + ดู `x-nextjs-cache`
5. **"เทสต์ผ่าน = ใช้งานได้บน Worker" — ผิด** · vitest รันบน Node ไม่ใช่ workerd (§4 ชั้น 3)
6. **โดเมนจริง `kazumiclinic.com` ยังไม่ขึ้น** · ใช้งานจริงที่ `kazumi-clinic.bankjack10452.workers.dev` เท่านั้น · `SITE_ENV=preview` ยังต้องอยู่ (robots.txt = `Disallow: /`)

---

## 9. อ้างอิง

- [package.json](../package.json) — script `cf:deploy` ตัวจริง
- [.github/workflows/ci.yml](../.github/workflows/ci.yml) · [deploy.yml](../.github/workflows/deploy.yml) — CI/CD ที่รันจริง
- [open-next.config.ts](../open-next.config.ts) — queue/tagCache/incrementalCache override
- [wrangler.jsonc](../wrangler.jsonc) — binding + var
- [docs/infrastructure.md](./infrastructure.md) — เว็บอยู่ที่ไหน, secret, ตาราง D1, ข้อจำกัดเครื่อง dev
- [CLAUDE.md](../CLAUDE.md) §0, §0.3, §0.5, §11 — workflow + บทเรียนจริงเรื่อง deploy/cache
