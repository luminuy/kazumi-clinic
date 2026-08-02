# STATUS — โปรเจกต์อยู่ตรงไหนแล้ว

> **อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง** เพื่อรู้ว่าตอนนี้ถึงไหน ใครทำอะไรค้างไว้
> **"ล่าสุด" = `origin/main` เสมอ** (ดู CLAUDE.md §0.5) — ไฟล์นี้แค่สรุปให้อ่านเร็ว ถ้าขัดกับ git ให้เชื่อ git
> อัปเดตไฟล์นี้เป็นส่วนหนึ่งของ workflow: หลัง **deploy** และตอน **เริ่ม/จบงานสำคัญ** (ดู CLAUDE.md §0)
> งานที่ปิดไปแล้วย้ายไป [docs/changelog.md](docs/changelog.md) — ไฟล์นี้เก็บแค่ **ตอนนี้ · ต่อไป · ค้าง**

**อัปเดตล่าสุด:** 2026-08-02 (หลัง PR #287, ระหว่างรอรีวิว #288) · โดย: Claude Code

---

## 🚀 Deployed ตอนนี้ (เว็บจริง)

| | |
|---|---|
| **โดเมนจริง** (`kazumiclinic.skin`) | ✅ **ขึ้นแล้ว** — nameserver ชี้ Cloudflare สำเร็จ, Custom Domain ผูก Worker แล้ว, SSL Active · `site.url` เปลี่ยนแล้ว, `SITE_ENV=preview` ลบแล้ว → `robots.txt`/`sitemap.xml` ใช้โดเมนจริงและอนุญาต crawl (ไม่ block ทั้งเว็บอีกต่อไป) · Cloudflare Access เพิ่ม destination `kazumiclinic.skin/admin` แล้ว ยิงจริงตอบ 302 ไปหน้า login ของ Access ถูกต้อง (PR [#271](https://github.com/luminuy/kazumi-clinic/pull/271)) |
| **workers.dev** | ❌ **ปิดแล้ว** — `workers_dev: false` + `preview_urls: false` ใน [wrangler.jsonc](wrangler.jsonc) ตั้งแต่ PR [#277](https://github.com/luminuy/kazumi-clinic/pull/277) · ยิงจริง 2026-07-27: `https://kazumi-clinic.bankjack10452.workers.dev/` ตอบ **404** · เหลือทางเข้าเดียวคือโดเมนจริง |
| **Resend (อีเมลระบบ)** | ✅ ยืนยันโดเมน `kazumiclinic.skin` กับ Resend สำเร็จแล้ว (auto-configure ผ่าน Cloudflare integration) · `RESEND_API_KEY` (secret) + `RESEND_FROM_EMAIL` (var ใน wrangler.jsonc) ตั้งครบ · ยิงจริง: ปุ่ม "ลืมรหัสผ่าน?" โผล่ที่ `/account/login` แล้ว (พิสูจน์ `isEmailConfigured()` = true) — **ยังไม่มีใครยืนยันว่าอีเมลจริงส่งถึงกล่องจดหมาย** (ทดสอบแค่ว่าโค้ดคิดว่าตั้งค่าครบ ไม่ใช่ delivery จริง) |
| **URL ตรวจ** | https://kazumiclinic.skin — ตรวจ 2026-07-27: HTTP 200 · **ไม่มี URL สำรองแล้ว** (workers.dev ปิด) |

> วิธียืนยันว่าเว็บ = main: `git rev-parse origin/main` เทียบ commit ข้างบน · Version ID จริงเอาจาก `npx wrangler deployments list` หรือ log ของ workflow `Deploy`
>
> ⚡ **merge เข้า main = ขึ้นเว็บจริงอัตโนมัติ** (CD ตั้งแต่ 2026-07-23) → security/medical review ต้องเสร็จ **ก่อน merge** · agent ที่ merge ควรอัปเดตตารางนี้หลัง CD เสร็จ

---

## 🔨 กำลังทำ (in progress)

- **2026-08-02 audit fix ชุดด่วน** (5 ข้อจาก user):
  | ข้อ | สถานะ |
  | --- | --- |
  | เลข ว.75302 (ใบประกอบวิชาชีพแพทย์) ไม่อยู่บนหน้าบริการ | ✅ merged [#287](https://github.com/luminuy/kazumi-clinic/pull/287) — เพิ่มทุกหน้า (8 component + fallback template ที่ `/botox` ใช้) |
  | ราคา SKU ติดป้าย "ราคาโปรโมชัน" โดยไม่มีวันหมดเขต (fake urgency, §0.2) | ✅ merged [#287](https://github.com/luminuy/kazumi-clinic/pull/287) — เปลี่ยนเป็น "ราคาเริ่มต้น" |
  | หน้าบริการ 9 หมวดเนื้อหาบางมาก (22–64 คำ) ไม่มี aftercare/ข้อห้าม/downtime | 🔨 ร่างแล้วครบ 9 หมวด (TH+EN) — PR [#288](https://github.com/luminuy/kazumi-clinic/pull/288) **ห้าม merge จนกว่าแพทย์/เจ้าของจะอนุมัติเนื้อหา** (§0.2) |
  | บทความ 20 ชิ้น ยังไม่มีฉบับอังกฤษใน D1 (ระบบพร้อมตั้งแต่เฟส 4) | ✅ แปลครบ 20 ชิ้นแล้ว (2026-08-02) — เขียนตรงเข้า production D1 ผ่าน `wrangler d1 execute --remote` (ดูรายละเอียดที่เฟส 4b ด้านล่าง) |
  | `www.kazumiclinic.skin` ไม่ resolve เลย (ไม่ใช่ redirect, เป็น DNS error) | ✅ แก้แล้ว (2026-08-02) — เจ้าของกด Add Domain ใน Workers → kazumi-clinic → Domains เอง ยืนยันด้วย `dig`/`curl` จริงว่า resolve และตอบ 200 แล้ว |


- **แปลเว็บอังกฤษให้ครบและถูกหลักภาษา** (Claude วางแผน/ตรวจ · Codex แก้โค้ด · Gemini CLI แปล) — ทำเป็นเฟส:
  | เฟส | สถานะ |
  | --- | --- |
  | 0 · ตัววัด+glossary (`pnpm i18n:check`, [docs/i18n-glossary.md](docs/i18n-glossary.md)) | ✅ merged (#279) |
  | 1 · ถอนไทยที่ hardcode ออกจากหน้าสาธารณะ 15 ไฟล์ | ✅ merged (#280) — หนี้ 151 → 84 บรรทัด |
  | 2 · catalogue สองภาษา ([lib/services-en.ts](lib/services-en.ts) + [lib/services-locale.ts](lib/services-locale.ts)) | 🔨 PR นี้ |
  | 3 · `components/*-service-page.tsx` 9 ไฟล์ (83 บรรทัด) | ⏳ เนื้อหาการแพทย์ ต้องให้เจ้าของรีวิวก่อน (§0.2) |
  | 4 · **ระบบ**สองภาษาสำหรับเนื้อหาใน D1 | ✅ PR #284 — `migrations/0014_content_en.sql` **รันบน production D1 แล้ว** (12 คอลัมน์ nullable, ข้อมูลเดิมครบ 20 บทความ), read path fallback เป็นไทย, `/admin` มีช่อง EN แล้ว (ไม่บังคับกรอก) |
  | 4b · **แปลเนื้อหาที่มีอยู่** (20 บทความ · 17 สินค้า · 2 โปรฯ) | ✅ **ครบทั้งหมดแล้ว** (2026-08-02) — บทความ: pipeline ใหม่ [scripts/i18n/blog-extract.sh](scripts/i18n/blog-extract.sh) → [translate-blog.sh](scripts/i18n/translate-blog.sh) (Gemini) → [blog-validate.mjs](scripts/i18n/blog-validate.mjs) → [blog-apply.mjs](scripts/i18n/blog-apply.mjs) · สินค้า 17 ชิ้น: เจอบั๊กแฝงระหว่างทาง — แถว `service_products` ที่ /admin สร้างไว้ (เช่น ตอนแนบรูป) จะบัง fallback ภาษาอังกฤษที่มีอยู่แล้วใน `lib/services-en.ts` ด้วย `name_en`/`detail_en` ที่เป็น `null` เสมอ (ดู `rowToItem`/`localizeProduct`) ทำให้ /en เคยเห็นชื่อสินค้าเป็นไทยเงียบๆ — [scripts/i18n/products-sync-from-catalogue.mts](scripts/i18n/products-sync-from-catalogue.mts) copy ค่าอังกฤษที่มีอยู่แล้วเข้า D1 แก้ครบ 17/17 · โปรโมชั่น 2 รายการ: แปลได้ 1 (`ฟิลเลอร์` → `Filler`) อีก 1 ชื่อ `สี` บนโปรโมชั่นโบท็อกซ์กำกวมเกินจะเดา (อาจเป็นค่าทดสอบที่เจ้าของกรอกไม่ครบ) — **รอเจ้าของยืนยันความหมายก่อนแปล** (`promo-item-mrxlzdpd`, valid_until 2026-08-08) · สังเกตด้วยว่า `promo-11-mrxlxdn5` (ฟิลเลอร์) `valid_until` คือ 2026-07-25 ซึ่งผ่านมาแล้ว — เจ้าของอาจอยากลบหรือต่ออายุ |
  | 5 · ข้อมูลคลินิก/แพทย์ + JSON-LD เลือกตาม locale | ✅ merged (#283) — `/en` เหลือไทยเฉพาะชื่อแพทย์ เลขใบอนุญาต และที่อยู่ ซึ่ง**ตั้งใจคงไว้** |

  วัดจากเว็บจริงหลังเฟส 1-3 ขึ้น: `/en/services` 286 → 39 คำ · `/en/filler` 272 → 31 · `/en/about` 217 → 52 · `/en/blog` 343 → 82 (ที่เหลือของ blog คือเนื้อหาใน D1 = เฟส 4)

  Gemini CLI: **login ด้วยบัญชี Google ส่วนตัวใช้ไม่ได้แล้ว** (Google ตัด free tier ออกจาก Code Assist → `UNSUPPORTED_CLIENT`) ใช้ API key จาก AI Studio ใน `~/.gemini/.env` แทน และต้องเรียกด้วย `--skip-trust` ไม่งั้น CLI ไม่โหลด `.env`

> ก่อนเริ่มงานที่กินหลายไฟล์ ให้จดที่นี่: **อะไร · เครื่องมือไหน (Claude / Antigravity / Codex) · branch ไหน** — กันชนกันและกัน "งานหาย" (CLAUDE.md §0.5 · dual-agent)

---

## ⚠️ ค้างไว้ให้คนถัดไป

| เรื่อง | รายละเอียด |
|---|---|
| **Password reset + อีเมลนัดหมาย — ตั้งค่าครบแล้ว ยังไม่มีใครทดสอบ delivery จริง** | Resend ยืนยันโดเมน `kazumiclinic.skin` แล้ว, `RESEND_API_KEY`/`RESEND_FROM_EMAIL` ตั้งครบ, `isEmailConfigured()` = true ยืนยันจาก production จริง (ปุ่ม "ลืมรหัสผ่าน?" โผล่แล้ว) — **สิ่งที่เหลือคือลองกดจริงแล้วเช็คว่าอีเมลถึงกล่องจดหมายจริงไหม** (ยังไม่มีใครทำ) ดู [docs/member-system.md](docs/member-system.md) + [docs/appointments.md](docs/appointments.md) |
| **`blog/[slug]` ไม่ prerender ตอน build — ตั้งใจ ไม่ใช่ของค้าง** | slug อยู่ใน D1 ซึ่ง CI เข้าไม่ถึง · `generateStaticParams` คืน list ว่างเพื่อให้เข้า ISR ตอน on-demand (คนแรกที่เปิดจ่ายค่า render, ที่เหลือได้ cache) · จะ prerender จริงต้องให้ CI ถือ Cloudflare API token ไปอ่าน D1 ตอน build = เพิ่ม secret + ทำให้ build ล้มได้เมื่อ D1 ล่ม แลกกับ latency ของ request แรกเท่านั้น — **ไม่คุ้ม อย่าเปลี่ยนโดยไม่มีเหตุใหม่** |

---

## 📋 ต่อไป / TODO

- [x] **ระบบนัดหมาย Part A + B เสร็จและ deploy แล้ว** (ดู [docs/appointments.md](docs/appointments.md)) — จอง/ยืนยัน/ยกเลิก, อีเมลยืนยัน/ยกเลิก/เตือน, แนบ `.ics`, reminder 24 ชม. ผ่าน `app/api/internal/appointment-reminders` + GitHub Actions cron รายชั่วโมง, เรียง `/admin/leads` ตามเวลานัดใกล้สุด · `INTERNAL_TASK_SECRET` ตั้งแล้วทั้ง `wrangler secret put`/`gh secret set` และยิงจริงผ่าน (200 ด้วย secret ถูก, 401 ด้วย secret ผิด/ไม่มี) · **ยังไม่มีใครทดสอบว่าอีเมล (ยืนยัน/ยกเลิก/เตือน) ส่งถึงกล่องจดหมายจริง** — ดูแถวบนสุดของตาราง "ค้าง"
- [x] **ขึ้นโดเมนจริง `kazumiclinic.skin` เสร็จแล้ว** (2026-07-27) — nameserver ชี้ Cloudflare, Custom Domain ผูก Worker, SSL Active, `site.url` เปลี่ยนแล้ว, `SITE_ENV` ลบแล้ว, Cloudflare Access destination เพิ่มแล้ว, Resend ยืนยันโดเมนแล้ว — ดูตาราง "Deployed ตอนนี้" ด้านบน
- [x] **เพิ่ม Custom Domain สำหรับ `www.kazumiclinic.skin`** — เจ้าของกด Add Domain ใน Workers → kazumi-clinic → Domains เอง (2026-08-02, agent ทำให้ไม่ได้เพราะ wrangler token มีแค่ `zone: read`) ยืนยันด้วย `dig`/`curl` จริงว่า resolve ตรงกับ IP เดียวกับ root domain และตอบ HTTP 200 แล้ว
- [ ] **เชื่อม payment gateway**: แก้ `lib/members/payments.ts` (`initiatePayment`) — ตอนนี้จองก่อนจ่ายที่คลินิกได้เต็ม, ชำระออนไลน์เป็น placeholder (ดู [docs/member-system.md](docs/member-system.md))
- [ ] **เจ้าของอัปรูปเข้า /admin/images** — ตรวจของจริง 2026-07-25: มี **36 slot** · มีรูปจริง **6** (`about-hero`, `brand-mark`, `collagen-booster-editorial`, `hero-collagen-booster`, `hero-contact`, `hero-home` — โหลดได้ 200 ทุกใบ) + `brand-logo` ที่ใช้ default `kazumi-clinic/logo` · **ที่เหลือว่าง** จึงขึ้นกล่องไอคอน (ไม่ใช่รูปแตก) · ที่ควรอัปก่อนเพราะเห็นบ่อยสุด: `doctor-pratch`, `og-about` (รูปตอนแชร์ลิงก์), `hero-filler`, `hero-botox`, `hero-iv-drip-2` (ใช้ทั้ง /services และการ์ดแชร์ /blog)
- [ ] **เจ้าของทดสอบ**: เปลี่ยนรูปสักช่องใน /admin → รีเฟรชหน้านั้น ควรอัปเดตใน ~ไม่กี่วินาที (ยืนยัน on-demand revalidation หลังแก้ tag cache 2026-07-22)
- [ ] **เจ้าของลบ orphan บน Cloudinary** (ไม่เร่ง): `kazumi-clinic/promo-velvet-glow`, `kazumi-clinic/promo-karisma-collagen` — เก็บภาพสลับกันมาแต่ต้น ไม่มีโค้ดไหนอ้างถึงแล้ว · ลบที่ Media Library ของบัญชี `dvskwrapm` เท่านั้น (agent ไม่มีและไม่ควรถือคีย์ Master Admin ของบัญชีที่ใช้ร่วมกับ littlesmileflower)
- [ ] **เปิด R2** (ตอนนี้ใช้ KV แทน) — ต้องกดเปิดใน Cloudflare dashboard เอง
- [x] **`BACKUP_PASSPHRASE`** ตั้งแล้วตั้งแต่ 2026-07-23 — backup D1 รันจริงทุกวัน (ตรวจ 2026-07-25: `gh secret list` + 3 run ล่าสุด success · artifact ล่าสุด 43,932 bytes หมดอายุ 2026-08-23) · **เก็บ passphrase ไว้ให้ดี ถ้าหาย backup ทุกก้อนอ่านไม่ได้**
- [x] เปิด Google/LINE Login — secret ตั้งครบแล้ว (ยืนยัน `wrangler secret list` 2026-07-25)

---

## ⚠️ ปมค้าง / รู้ไว้

- **สองเครื่องมือแก้ร่วมกัน** (Claude ใน worktree · Antigravity ในโฟลเดอร์หลัก · Codex CLI): งานที่ไม่ push = มองไม่เห็นตอน deploy — commit+push ทุกครั้งที่หยุด · `main` บังคับด้วย ruleset แล้ว push ตรงไม่ได้ทุกกรณี
- **repo เป็น public** (2026-07-23) — โค้ดและประวัติทั้งหมดเปิดสาธารณะ · ห้าม commit ความลับเด็ดขาด ใช้ `wrangler secret put` · ความลับที่หลุดไปแล้วถือว่าหลุดถาวร **ต้อง rotate ไม่ใช่ลบ commit**
- **งาน contact ของ Antigravity ถูก park** — เก็บใน git stash ของโฟลเดอร์หลักชื่อ `AG-contact-redesign-wip-2026-07-23` (ดู [docs/changelog.md](docs/changelog.md))
- **Codex CLI: ใช้ `-m gpt-5.6-sol` เสมอ** — default `gpt-5.6-terra` อ่อนกว่าและเคยค้าง 40 นาทีกับงานแก้ 3 บรรทัด · **แต่ `sol` ก็ค้างได้** (เคยค้าง 27 นาที) → จับว่าค้างจริงด้วย: มีไฟล์ rollout ใหม่ใน `~/.codex/sessions/<yyyy>/<mm>/<dd>/` ไหม + log file ยังโตอยู่ไหม (`stat -f %m`) — process อยู่แต่ log ไม่ขยับเกิน ~3 นาที = ค้าง ให้ kill แล้วรันใหม่
- ⚠️ **Codex ชอบแก้ `STATUS.md` เองโดยไม่ได้สั่ง** และเนื้อหาที่มันเขียนมักเก่า — ตรวจ `git status` ทุกครั้งหลัง Codex จบ ถ้ามันแตะ STATUS.md ให้ `git checkout -- STATUS.md` แล้วเขียนเอง
- **Codex เป็นคนลงมือแก้โค้ด, Claude วางแผน/ตรวจ** (เจ้าของสั่งตั้งแต่ 2026-07-24) · sandbox ของ Codex ไม่มี network → งานที่ต้อง curl/fetch ต้องให้ Claude ทำ · Claude ต้อง verify เองทุกครั้งด้วย lint/typecheck/test/build ไม่เชื่อคำอ้าง "ผ่านแล้ว"
- **Cloudinary account (`dvskwrapm`) เป็นแพลนฟรี** — ไม่รองรับ scoped API key role ต้องใช้ Master Admin · ใช้ร่วมกับ littlesmileflower → **ห้ามลบ/ปิด unsigned preset `littlesmileflower`** แม้ Kazumi เลิกใช้แล้ว (PR #220)
- **CI ค้างสถานะ `queued` (0 steps) นาน ๆ ได้โดยไม่ใช่ของเราพัง** — เจอจริง 2026-07-25 (PR #264): job ค้าง queued **1 ชั่วโมงเต็ม** ทั้งที่ run อื่นก่อน/หลังวิ่งปกติ ~1-2 นาที (repo public → ไม่ใช่ปัญหา billing minutes) แล้วอยู่ ๆ ก็เริ่มรันเองและผ่านปกติ · น่าจะเป็น backlog ฝั่ง GitHub Actions runner ที่พ้นการควบคุมเรา · ก่อนสงสัยว่า repo/PR มีปัญหา ให้เช็คก่อนว่า run อื่นในช่วงเวลาเดียวกันค้างเหมือนกันไหม (`gh run list -L 5`) ถ้าค้างเฉพาะตัวเดียวก็แค่รอ ไม่ต้อง debug โค้ด

---

## 🧰 เครื่องมือ

| เครื่องมือ | ทำอะไร |
|---|---|
| **CI** ([ci.yml](.github/workflows/ci.yml)) | lint + typecheck + test + build + `cf:build` บนทุก PR และ push:main |
| **CD** ([deploy.yml](.github/workflows/deploy.yml)) | CI ผ่านบน main → `pnpm cf:deploy` อัตโนมัติ (gate ด้วย `workflow_run`) |
| **Branch protection** | ruleset `protect-main` ([rules](https://github.com/luminuy/kazumi-clinic/rules)) `bypass_actors: []` → ต้องผ่าน PR + check `verify` เขียว · owner ก็ข้ามไม่ได้ |
| **Git hooks** ([.githooks/](.githooks/)) | `pre-commit` กัน commit บน main · `pre-push` กัน push เข้า main + รัน lint/typecheck ถ้ามีโค้ดเปลี่ยน (เปิดตอน `pnpm install`) |
| **Test** | `pnpm test` (vitest) — invariant tests + member/cart/password · ⚠️ รันบน Node ไม่ใช่ workerd |
| **Health** | `pnpm health` เช็คทุกหน้า 200 · uptime workflow ยิงทุก 6 ชม. ([uptime.yml](.github/workflows/uptime.yml)) |
| **Smoke** | `pnpm smoke` สมัคร/ล็อกอินจริงบน Worker หลัง deploy (exit 2 = 429 สรุปไม่ได้ ไม่ใช่ fail) |
| **DB Backup** ([backup.yml](.github/workflows/backup.yml)) | export D1 ทุกวัน 02:00 (Asia/Bangkok) → encrypt GPG → artifact 30 วัน · ✅ ทำงานอยู่จริง (ตรวจ 2026-07-25) · restore: `gpg --batch --decrypt --passphrase "$BACKUP_PASSPHRASE" -o restore.sql <ไฟล์>.gpg` แล้ว `wrangler d1 execute --file` |
