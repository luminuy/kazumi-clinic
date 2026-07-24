# วิธี deploy Kazumi Clinic — สำหรับ AI Agent ทุกตัว (Antigravity, Cursor, Codex ฯลฯ)

> เขียนขึ้นเพราะ agent บางตัว **deploy ไม่ขึ้นสักที** ทั้งที่ Claude Code รันได้ปกติ · เอกสารนี้บอก **สาเหตุจริง** ว่าทำไมคำสั่ง deploy มาตรฐานถึงพังบนเครื่องนี้ และ **ลำดับที่ต้องทำเป๊ะๆ** เพื่อให้ขึ้นได้
>
> ค่าทุกอย่างในนี้ตรวจจากระบบจริง (2026-07-22) — แต่ก่อนอ้างสถานะกับ user ให้ยิงคำสั่งตรวจซ้ำเสมอ (CLAUDE.md §0.5)

---

## TL;DR — ถ้าจะรีบ อ่านแค่นี้

```bash
# 1. หยุด dev server ทุกตัวที่ใช้ working tree นี้ก่อน (สำคัญมาก — ดู §3)
pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null

# 2. deploy (คำสั่งเดียว — build + upload อยู่ในนี้แล้ว)
pnpm cf:deploy

# 3. รอจนเห็น "Current Version ID: xxxx" = อัปโหลดเสร็จ
#    แต่ยัง "ยังไม่" แปลว่าเว็บใช้งานได้ — ต้องยิง URL ตรวจ (ดู §4)
```

**อย่ารันคำสั่งพวกนี้ — มันจะพังบนเครื่องนี้ 100%:**

```bash
wrangler dev                        # ❌ ต้องรัน workerd → พัง (macOS เก่าเกิน)
pnpm cf:preview                     # ❌ เหตุผลเดียวกัน
opennextjs-cloudflare deploy        # ❌ wrapper นี้เรียก workerd ตอนอ่าน env → พัง
npx wrangler deploy                 # ❌ ไม่ได้ build .open-next ก่อน → deploy ของเก่า/ว่าง
```

---

## 1. ทำไม Antigravity deploy ไม่ขึ้น — สาเหตุจริง

เครื่อง dev นี้คือ **macOS 12.7.6**

```
$ sw_vers
ProductVersion: 12.7.6
```

แต่ `workerd` (runtime ของ Cloudflare ที่ `wrangler` / miniflare ใช้จำลอง Worker ในเครื่อง) **ต้องการ macOS 13.5.0 ขึ้นไป** ถ้าเรียกมันจะได้:

```
Error: Unsupported macOS version: 12.7.6 (workerd requires macOS 13.5.0+)
```

คำสั่ง deploy "ปกติ" ของ OpenNext คือ `opennextjs-cloudflare deploy` — **wrapper ตัวนี้เรียก workerd** ตอนอ่าน env ผ่าน `getPlatformProxy()` ก่อนจะ deploy จริง · พอ workerd start ไม่ได้ → deploy ตายกลางคัน

**นี่คือจุดที่ agent อื่นติด**: มันเห็น error เกี่ยวกับ macOS/workerd แล้วสรุปว่า "เครื่องนี้ deploy ไม่ได้" — **ผิด** · deploy ได้ แค่ต้อง **ข้าม wrapper** ที่เรียก workerd ทิ้ง

---

## 2. Trick ที่ทำให้ Claude deploy ผ่าน — `OPEN_NEXT_DEPLOY=true`

ดู `cf:deploy` ใน [package.json](../package.json):

```json
"cf:deploy": "opennextjs-cloudflare build && OPEN_NEXT_DEPLOY=true wrangler deploy"
```

แยกเป็น 2 ท่อน:

| ท่อน | ทำอะไร | ใช้ workerd ไหม |
| --- | --- | --- |
| `opennextjs-cloudflare build` | แปลง Next.js → Worker bundle ลงโฟลเดอร์ `.open-next/` | ❌ ไม่ใช้ (build อย่างเดียว) |
| `OPEN_NEXT_DEPLOY=true wrangler deploy` | อัปโหลด `.open-next/worker.js` + assets ขึ้น Cloudflare ผ่าน API | ❌ ไม่ใช้ |

**`OPEN_NEXT_DEPLOY=true` คือกุญแจ** — env var นี้บอก `wrangler` ว่า "อย่า delegate ไปให้ `opennextjs-cloudflare`'s deploy command" (ตัวที่เรียก workerd) แต่ให้รัน **plain `wrangler deploy`** ตรงๆ จาก bundle ที่ build ไว้แล้ว · การอัปโหลด asset ผ่าน Cloudflare API ล้วนๆ ไม่ต้องรัน Worker ในเครื่องเลย → เครื่อง macOS เก่าก็ทำได้

> พูดง่ายๆ: `build` ไม่ต้องใช้ workerd, `upload` ก็ไม่ต้องใช้ workerd — มีแค่ **wrapper ตรงกลาง** เท่านั้นที่เรียก และ `OPEN_NEXT_DEPLOY=true` ตัดมันทิ้ง

**เพราะงั้น: เรียก `pnpm cf:deploy` เท่านั้น อย่าเรียก sub-command แยกเอง** — script ผูก trick ไว้ให้แล้ว

---

## 3. ก่อน deploy ต้องทำ — ไม่งั้นเว็บพัง 500

### 3.1 หยุด dev server ทุกตัวก่อน (บทเรียนจริง 2026-07-17)

ถ้ามี `pnpm dev` / `next dev` รันอยู่บน working tree เดียวกันขณะ deploy → **มันเขียน `.next/` พร้อมกับที่ OpenNext build** ทำให้ development asset (`/_next/static/development/*`, `*.hot-update.js`) ปนขึ้น Worker · deploy จบเห็น `Current Version ID` ปกติ แต่ **เว็บจริงตอบ 500** เพราะ bundle มี dev artifact ปน

```bash
# เช็คก่อนว่ามี dev server ค้างไหม
ps aux | grep -E "next dev|next-server" | grep -v grep

# ถ้ามี → ฆ่าให้หมด
pkill -f "next dev"; pkill -f "next-server"
```

### 3.2 อย่าปล่อยไฟล์ขยะปนใน build

iCloud Drive ชอบสร้างสำเนา `* 2.ts` / `.next/* 2.*` — ทำ build/typecheck ล้มแบบงงๆ

```bash
find . -name '* 2.*' -not -path './node_modules/*'   # ต้องไม่มี output
```

### 3.3 verify โค้ดก่อน (CLAUDE.md §0.3)

```bash
pnpm lint && pnpm typecheck && pnpm build
```

ทั้ง 3 ต้อง exit 0 ก่อนคิดจะ deploy

---

## 4. หลัง deploy — `Current Version ID` **ไม่ได้แปลว่าเว็บใช้งานได้**

นี่คือกับดักข้อสองที่ทำให้ agent รายงานผิด

`pnpm cf:deploy` จบด้วยข้อความแบบนี้ = **อัปโหลดสำเร็จ**:

```
Uploaded kazumi-clinic (x.xx sec)
Deployed kazumi-clinic triggers (x.xx sec)
Current Version ID: 12ab34cd-...
```

แต่ `Current Version ID` ยืนยันแค่ว่า **ไฟล์ขึ้นไปแล้ว** ไม่ได้ยืนยันว่า **เว็บเสิร์ฟโค้ดใหม่** · ต้องยิง URL จริงตรวจ:

```bash
# ยิง 2 ครั้ง — ครั้งแรกมักได้ของเก่า
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "http/|x-nextjs-cache"
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "http/|x-nextjs-cache"
```

### ทำไมต้องยิง 2 ครั้ง — ISR + stale-while-revalidate (บทเรียนจริง 2026-07-17)

หน้าเว็บเป็น **ISR** · request แรกหลัง deploy จะเสิร์ฟ **HTML เก่าจาก KV cache** (`x-nextjs-cache: HIT`) แล้วค่อย regenerate เบื้องหลัง · **ยิงครั้งเดียวแล้วอ่านผล = อ่านของเก่า** แล้วจะนึกว่า deploy ไม่ขึ้น ทั้งที่ขึ้นแล้ว

- ยิงครั้งที่ 2 (หรือรอสักครู่แล้วยิง) → ได้เนื้อหาใหม่
- ดู header `x-nextjs-cache`: `HIT` = ของเก่าจาก cache, `MISS`/`STALE` = เพิ่ง regenerate

**สรุปกฎ:** เวลาผลตรวจขัดกับสิ่งที่เพิ่ง deploy ให้สงสัย **cache** ก่อน อย่าเพิ่งสรุปว่า build พัง · HTTP 200 อย่างเดียวไม่พอ — 200 มาจากของเก่าก็ได้

---

## 5. Deploy เปลี่ยน Worker + migration ที่กำหนดไว้ — ไม่แตะ KV/binding

`pnpm cf:deploy` push **โค้ด** พร้อมรัน D1 migration ที่ผูกไว้ทุก deploy 3 ตัว: `migrations/0007_tag_cache_revalidations.sql`, `migrations/0009_member_system.sql`, `migrations/0010_rate_limits.sql` — ทั้งหมดเป็น `CREATE TABLE IF NOT EXISTS` จึงรันซ้ำปลอดภัย · migration อื่นที่ยังไม่อยู่ใน chain (รวม `0001`–`0006`, `0008_add_en_columns.sql`, `0011_promotions_image.sql`, `0012_posts_category.sql` ณ ตอนนี้) ต้องรันแยก (เครื่องนี้รัน `--local` ไม่ได้ ใช้ `--remote` ผ่าน API):

```bash
npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file migrations/000X_xxx.sql
```

ไม่ใช่ทุก migration ใน repo ที่รันซ้ำปลอดภัย: `0008`/`0011`/`0012` เป็น `ALTER TABLE` หรือ table-rebuild จึงต้องรันมือครั้งเดียวอย่างระวัง และห้ามเพิ่มเข้า automatic chain เด็ดขาด · ถ้า feature ใหม่พึ่ง table ที่ยังไม่ได้ migrate → เว็บจะ error แม้ deploy โค้ดสำเร็จ

Binding (KV/D1/DO/Service), var (`SITE_ENV` ฯลฯ) อ่านจาก [wrangler.jsonc](../wrangler.jsonc) ตอน deploy — resource จริงสร้างไว้หมดแล้ว **ห้ามรันคำสั่งสร้าง resource ซ้ำ**

---

## 6. เช็คลิสต์ deploy ฉบับเต็ม (ทำตามลำดับ)

```bash
# ── ก่อน deploy ──
git status --short                                    # ไม่มีไฟล์ขยะ/* 2.*
find . -name '* 2.*' -not -path './node_modules/*'    # ต้องว่าง
ps aux | grep -E "next dev|next-server" | grep -v grep # ต้องไม่มี dev server ค้าง
pnpm lint && pnpm typecheck && pnpm build             # ทั้งหมด exit 0

# ── ถ้ามี migration ใหม่ ──
npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file migrations/000X_xxx.sql

# ── deploy ──
pnpm cf:deploy                                        # รอ "Current Version ID: ..."

# ── verify (ยิงอย่างน้อย 2 ครั้ง) ──
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "http/|x-nextjs-cache"
curl -sI https://kazumi-clinic.bankjack10452.workers.dev/ | grep -iE "http/|x-nextjs-cache"

# ── ดู deploy history ยืนยัน ──
npx wrangler deployments list | head -20
```

**รายงาน user ได้ว่า "deploy สำเร็จ" ต่อเมื่อ:** เห็น `Current Version ID` **และ** curl ได้ HTTP 200 จากเนื้อหาใหม่ · ถ้ายังไม่ได้ตรวจข้อไหน ให้เขียนตรงๆ ว่า "ยังไม่ได้ตรวจ" (CLAUDE.md §0.5)

---

## 7. Error ที่เจอบ่อย → สาเหตุ → วิธีแก้

| Error / อาการ | สาเหตุจริง | วิธีแก้ |
| --- | --- | --- |
| `Unsupported macOS version: 12.7.6` | เรียก workerd ตรงๆ (`wrangler dev`, `cf:preview`, `opennextjs-cloudflare deploy`) | ใช้ `pnpm cf:deploy` เท่านั้น — มัน bypass workerd (§2) |
| Deploy สำเร็จแต่เว็บ **500** | dev server เขียน `.next` ปนตอน build | `pkill -f "next dev"` แล้ว deploy ใหม่ (§3.1) |
| Deploy แล้วเว็บ **ยังเป็นของเก่า** | ISR เสิร์ฟ cache จาก KV | ยิงซ้ำครั้งที่ 2 + ดู `x-nextjs-cache` (§4) — ไม่ใช่บั๊ก |
| `Dummy queue is not implemented` (ตอน revalidate) | `open-next.config.ts` ไม่มี `queue`/`tagCache` override | อย่าแตะ config — มันตั้ง `doQueue`/`d1NextTagCache` ไว้แล้ว |
| `Please enable R2 ... code 10042` | บัญชียังไม่เปิด R2 | ใช้ KV อยู่แล้ว (config ตั้ง `kvIncrementalCache`) — เจ้าของบัญชีต้องกดเปิด R2 เองถ้าจะสลับ |
| `pnpm build` ล้ม `Duplicate identifier` | ไฟล์สำเนา `* 2.ts` จาก iCloud | `find . -name '* 2.*'` แล้วลบ (§3.2) |
| typecheck/lint ล้มด้วย error แปลกๆ | ไฟล์ขยะ / config หาย | อ่าน error จริง อย่าเดา — CLAUDE.md §0.5 |

---

## 8. สิ่งที่ Antigravity ต้องเลิกเข้าใจผิด

1. **"เครื่องนี้ deploy ไม่ได้เพราะ macOS เก่า" — ผิด** · deploy ได้ผ่าน `pnpm cf:deploy` แค่ห้ามเรียก workerd ตรงๆ
2. **"merge เข้า main แล้วเว็บ deploy เอง" — ผิด** · ไม่มี CI/CD, ไม่มี Cloudflare Git integration · `gh pr checks` ตอบ `no checks reported` เป็น **ปกติ** · deploy ต้องรัน `pnpm cf:deploy` **ด้วยมือ** ทุกครั้ง
3. **"เห็น Current Version ID = เว็บใช้งานได้" — ผิด** · ต้องยิง URL ตรวจ 2 ครั้ง (§4)
4. **"curl ได้ 200 = โค้ดใหม่ขึ้นแล้ว" — ผิด** · 200 มาจาก ISR cache ของเก่าได้
5. **โดเมนจริง `kazumiclinic.com` ยังไม่ขึ้น** · เว็บใช้งานจริงที่ `kazumi-clinic.bankjack10452.workers.dev` เท่านั้น · `SITE_ENV=preview` ยังต้องอยู่ (robots.txt = Disallow: /)

---

## 9. อ้างอิง

- [package.json](../package.json) — script `cf:deploy` ตัวจริง
- [open-next.config.ts](../open-next.config.ts) — queue/tagCache/incrementalCache override
- [wrangler.jsonc](../wrangler.jsonc) — binding + var
- [docs/infrastructure.md](./infrastructure.md) — เว็บอยู่ที่ไหน, ข้อจำกัดเครื่อง dev, ตาราง D1
- [CLAUDE.md](../CLAUDE.md) §0, §0.5, §11 — workflow + บทเรียนจริงเรื่อง deploy/cache
