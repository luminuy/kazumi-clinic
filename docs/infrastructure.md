# ค่าตั้งค่าของเว็บ — Kazumi Clinic

ทุกค่าในหน้านี้ **ตรวจจากระบบจริงแล้ว** ไม่ได้คัดจากความจำหรือจากเอกสารอื่น

| ส่วน | ตรวจล่าสุด | ตรวจซ้ำด้วย |
| --- | --- | --- |
| Secret, Cloudinary, ตาราง D1, CI/CD | **2026-07-25** | `wrangler secret list` · `ls migrations/` · `gh run list --workflow=Deploy` |
| Binding, var, Access, โดเมน, ข้อจำกัดเครื่อง | 2026-07-17 (ทวนโดเมน/เครื่อง 2026-07-25) | `wrangler.jsonc` · `sw_vers` · `dig` |

> ⚠️ ถ้าจะอ้างค่าใดในหน้านี้กับ user ให้ **ยิงคำสั่งตรวจซ้ำก่อนพูด** — เอกสารบอกว่า *ตั้งใจให้เป็นยังไง* ไม่ใช่ *ความจริงตอนนี้* (CLAUDE.md §0.5)
>
> วิธี deploy ทั้งหมดอยู่ที่ [deploy.md](./deploy.md) — หน้านี้บอกว่า **มีอะไรอยู่ตรงไหน** ไม่ใช่ขั้นตอน

---

## เว็บอยู่ที่ไหน

| | ค่า |
| --- | --- |
| URL ที่ใช้งานจริงตอนนี้ | **https://kazumi-clinic.bankjack10452.workers.dev** |
| Worker name | `kazumi-clinic` |
| บัญชี Cloudflare | `bankjack10452@gmail.com` (account id `f5af6f66302ba6872d8f51aebf43d3fe`) |
| Deploy ครั้งแรก | 2026-07-17 (ก่อนหน้านั้น**ไม่เคย deploy เลย** ทั้งที่เอกสารเก่าบอกว่า deploy อัตโนมัติ) |
| CI/CD | มี — CI [`.github/workflows/ci.yml`](../.github/workflows/ci.yml): lint + typecheck + test + build + `pnpm cf:build` ทุก PR/push เข้า main · CD [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml): หลัง CI ผ่านบน main จะ deploy อัตโนมัติ |
| วิธี deploy | merge PR เข้า main → workflow `Deploy` รัน `pnpm cf:deploy` อัตโนมัติหลัง CI ผ่าน · deploy มือเป็นข้อยกเว้นเมื่อ CD เสีย/ถูกปิด และต้องรอ CD จบก่อน |

### Workflow หลัง merge

- งานที่เปลี่ยน public site/Worker: หลัง merge ปล่อยให้ workflow `Deploy` รัน `pnpm cf:deploy` อัตโนมัติหลัง CI ผ่าน; deploy มือเป็นข้อยกเว้นเมื่อ CD เสีย/ถูกปิด และห้ามรันชนกับ CD
- งานเอกสารล้วนไม่ต้อง deploy มือ; workflow `Deploy` จะ redeploy artifact เดิมอัตโนมัติหลัง CI ผ่าน แต่ไม่มี runtime artifact เปลี่ยน
- ห้ามรายงานว่า deploy สำเร็จจน workflow `Deploy` สำเร็จและ Wrangler แสดง `Current Version ID`; จากนั้นยิง URL จริงอย่างน้อย 2 ครั้งพร้อมดู `x-nextjs-cache` เพราะครั้งแรกอาจได้ ISR cache เก่า
- `Current Version ID` เปลี่ยนทุก deploy จึงห้ามบันทึกเลขล่าสุดแบบถาวรในเอกสารนี้ ให้รายงานจาก output ของงานนั้นเท่านั้น

### โดเมนจริง — ซื้อแล้ว แต่ยังไม่ได้ชี้มา Cloudflare

**`kazumiclinic.com` ไม่ใช่โดเมนของคลินิก** — ถูกคนอื่นจดไปก่อนแล้ว (ตรวจ 2026-07-17: Namecheap,
name servers ชี้ Cloudflare อยู่แล้วแต่ origin ตาย) เป็นแค่บันทึกไว้กันสับสน **ห้ามใช้โดเมนนี้อ้างอิงอะไรอีก**

**โดเมนจริงของคลินิกคือ `kazumiclinic.skin`** — เจ้าของแจ้งด้วยวาจา 2026-07-27 ว่าซื้อแล้ว ตรวจซ้ำด้วย
`dig`/`whois` วันเดียวกัน:

| ตรวจ | ผล (2026-07-27) |
| --- | --- |
| Registrar | name.com |
| Name servers | `ns1djs.name.com` / `ns2jrt.name.com` / `ns3cpr.name.com` / `ns4dls.name.com` — **ยังไม่ใช่ของ Cloudflare** |
| A record ปัจจุบัน | `91.195.240.94` (หน้า parking ของ registrar ตามปกติ ไม่ใช่ Cloudflare) |
| MX / TXT | ว่างเปล่า — ยังไม่ได้ตั้งอะไรเลย รวมถึงที่ Resend ต้องการ (ดู [member-system.md](./member-system.md)) |

`site.url` ใน [lib/site.ts](../lib/site.ts) **ยังชี้ `https://kazumiclinic.com`** (ค่าเก่า ผิด) — **ห้ามแก้เป็น
`kazumiclinic.skin` จนกว่าโดเมนจะชี้มา Cloudflare จริงและเสิร์ฟเว็บได้แล้ว** เปลี่ยนตอนนี้จะทำให้
canonical/sitemap/JSON-LD `@id` ชี้ไปโดเมนที่ยังไม่เสิร์ฟอะไรเลย แย่กว่าสถานะปัจจุบัน

**เพราะงั้น `SITE_ENV=preview` จึงบังคับ `robots.txt` เป็น `Disallow: /` ทั้งหมด** ([app/robots.ts](../app/robots.ts)) — ไม่งั้น Google จะเก็บ workers.dev แล้วอ่านว่าเนื้อหาเป็นของโดเมนที่เราไม่ได้คุม

> 🔴 **ลำดับงานที่เหลือก่อนขึ้นโดเมนจริงได้**:
> 1. **เจ้าของ/ผู้ถือบัญชี Cloudflare ต้องเพิ่ม `kazumiclinic.skin` เป็น zone ใหม่ในบัญชี Cloudflare** (ผ่าน dashboard) แล้วเอา nameserver คู่ที่ Cloudflare ให้มา ไปตั้งที่ name.com (เปลี่ยน nameserver ระดับ registrar — action ที่กระทบ DNS ทั้งโดเมน ต้องทำโดยเจ้าของ/คนที่ถือบัญชี name.com เท่านั้น ไม่ใช่สิ่งที่ agent ควรทำแทน)
> 2. รอ nameserver propagate (มักไม่กี่ชั่วโมง)
> 3. เพิ่ม Worker route/custom domain ให้ zone ใหม่ใน `wrangler.jsonc` หรือ dashboard
> 4. เปลี่ยน `site.url`, **ลบ var `SITE_ENV`**, เพิ่ม destination ของ Cloudflare Access ให้ครอบโดเมนใหม่ — ทำได้เฉพาะ**หลัง**ข้อ 1-3 เสร็จและยิง `https://kazumiclinic.skin` ตอบ 200 จริงแล้วเท่านั้น
> 5. ตั้ง DNS TXT/CNAME ที่ Resend ต้องการเพื่อยืนยันโดเมนสำหรับส่งอีเมล (ดู [member-system.md](./member-system.md)) — ทำพร้อมกับข้อ 1-2 ได้เลยเพราะเป็นแค่ TXT record ไม่ต้องรอ nameserver เปลี่ยน

---

## Bindings ใน [wrangler.jsonc](../wrangler.jsonc)

| Binding | ชนิด | ค่า | ใช้ทำอะไร |
| --- | --- | --- | --- |
| `ASSETS` | Static assets | `.open-next/assets` | ไฟล์ static ของ Next |
| `WORKER_SELF_REFERENCE` | Service | `kazumi-clinic` | OpenNext เรียกตัวเองตอน revalidate |
| `NEXT_CACHE_DO_QUEUE` | Durable Object | class `DOQueueHandler` | คิว ISR revalidation |
| `NEXT_INC_CACHE_KV` | KV | `ab93a3d280094041aeab80a8d8f4f87d` (`kazumi-clinic-inc-cache`) | cache หน้า ISR |
| `NEXT_TAG_CACHE_D1` | D1 | `b6f4112b-ab0a-449c-9584-46066d82ef0d` (`kazumi-clinic-tag-cache`) | tag cache ของ OpenNext **+ ตาราง `site_images` ของเรา** |

**ทำไมใช้ KV ไม่ใช่ R2** — `open-next.config.ts` เดิมตั้ง `r2IncrementalCache` แต่ **R2 ยังไม่ได้เปิดใช้ในบัญชี** (API ตอบ `Please enable R2 through the Cloudflare Dashboard`, code 10042) ซึ่งเป็นเรื่องที่เจ้าของบัญชีต้องกดเอง → deploy ไม่ได้เลย จึงย้ายไป `kvIncrementalCache` · ถ้าวันหนึ่งเปิด R2 แล้ว R2 ดีกว่าสำหรับ payload ใหญ่ ค่อยสลับกลับ

`queue` + `tagCache` **ห้ามปล่อย default** — จะได้ dummy queue ที่ throw `"Dummy queue is not implemented"` แล้วหน้า ISR จะไม่มีวัน regenerate

⚠️ **`d1NextTagCache` ต้องมีตาราง `revalidations` (tag, revalidatedAt, stale, expire) ใน D1 นี้** — ปกติ `opennextjs-cloudflare populateCache` เป็นคนสร้าง แต่ `cf:deploy` ของเราข้าม populateCache (deploy ตรงด้วย `wrangler deploy` เลี่ยง workerd) จึงเป็นเจ้าของตารางเองใน [migrations/0007_tag_cache_revalidations.sql](../migrations/0007_tag_cache_revalidations.sql) และ `cf:deploy` รัน migration นี้ทุกครั้ง (idempotent) · **ถ้าตารางนี้หาย = on-demand revalidation ตายเงียบ**: `revalidatePath()` จาก /admin ไม่มีที่บันทึก หน้าเลยค้างรูปเก่าจน time-based `revalidate` ครบ (บั๊ก 2026-07-22 ที่เปลี่ยนรูปแล้วหน้าแรกไม่อัปเดต) · อย่าสับสนกับ schema ของ `d1TagCache` ตัวเก่า (2 คอลัมน์ + ตาราง `tags`) ที่ `.open-next/cloudflare/cache-assets-manifest.sql` สร้าง — คนละตัว ห้ามรันไฟล์นั้นกับ D1 นี้

---

## Vars (ใน `wrangler.jsonc` — commit ลง git)

| Var | ค่า | หมายเหตุ |
| --- | --- | --- |
| `CF_ACCESS_TEAM_DOMAIN` | `https://mute-wind-2c05.cloudflareaccess.com` | |
| `CF_ACCESS_AUD` | `e2a3d26d5b575e1290b4e5db4c438bab437e59e35d386c1a87e11242dffd6b35` | |
| `RESEND_FROM_EMAIL` | `Kazumi Clinic <noreply@kazumiclinic.skin>` | ไม่ใช่ความลับ แค่ string แสดงผล — ดูบทเรียนด้านล่างว่าทำไม**ต้อง**อยู่ตรงนี้ ไม่ใช่ dashboard-only var |

> ⚠️ **`SITE_ENV` ถูกลบออกแล้ว 2026-07-27** — โดเมนจริง `kazumiclinic.skin` ขึ้นแล้ว ไม่ต้อง block crawling อีกต่อไป (ดูหัวข้อโดเมนด้านบน)

**ทำไม `CF_ACCESS_*` ไม่ใช่ secret** — AUD เป็น public identifier ของ Access application, team domain เป็น hostname สาธารณะ · ความปลอดภัยมาจาก [lib/auth.ts](../lib/auth.ts) ที่ **verify ลายเซ็น JWT** กับ key set ของ Cloudflare → รู้ค่าพวกนี้ก็ปลอม JWT ไม่ได้ · อยู่ใน git ดีกว่าเพราะรีวิวได้

> 🔴 **ห้ามเพิ่ม plaintext var ผ่าน Cloudflare dashboard โดยไม่เพิ่มใน `wrangler.jsonc` ด้วย** — `wrangler deploy` ถือว่า `vars` block ใน config คือ "ชุดที่สมบูรณ์" ของ plaintext var ทั้งหมด แล้ว**ลบทุกตัวที่ dashboard เพิ่มเองแต่ไม่ได้อยู่ใน config ทิ้งแบบเงียบ ๆ** — เจอจริง 2026-07-27: เจ้าของเพิ่ม `RESEND_FROM_EMAIL` (type Plaintext) ผ่าน dashboard สำเร็จ ยืนยันว่าใช้งานได้ แต่พอ PR ถัดไป deploy (แก้คนละเรื่องเลย — แค่ `site.url`/`SITE_ENV`) ค่านั้นหายไปทันที เพราะไม่ได้อยู่ใน `vars` ของ `wrangler.jsonc` → ปุ่ม "ลืมรหัสผ่าน?" หายไปอีกครั้งทั้งที่ไม่ได้แตะโค้ดส่วนนั้นเลย · **ทางแก้ถาวร: ค่าที่ไม่ใช่ความลับต้อง commit ใน `wrangler.jsonc`'s `vars` เสมอ ไม่ใช้ dashboard-only plaintext var** (ค่าที่เป็นความลับจริงยังต้อง `wrangler secret put`/dashboard Secret เหมือนเดิม — secret ไม่โดนลบเพราะเป็นคนละ binding type จาก `vars`)

---

## Secrets (ตั้งด้วย `wrangler secret put` หรือ dashboard "Secret" type — ไม่อยู่ใน git)

ตรวจด้วย `npx wrangler secret list` เมื่อ **2026-07-27** ได้ 9 ตัว:

| Secret | ใช้ที่ไหน | ไม่ตั้งแล้วเกิดอะไร |
| --- | --- | --- |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | [lib/cloudinary-upload.ts](../lib/cloudinary-upload.ts) — signed upload | อัปรูปใน `/admin` ทุกช่อง throw ทันที (ไม่มี fallback โดยตั้งใจ) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [lib/members/oauth.ts](../lib/members/oauth.ts) | ปุ่ม Google **ไม่แสดง** บนหน้า login (`configuredProviders()` กรองออก) |
| `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` | เหมือนกัน | ปุ่ม LINE ไม่แสดง |
| `RESEND_API_KEY` | [lib/members/password-reset.ts](../lib/members/password-reset.ts), [lib/appointments/notify.ts](../lib/appointments/notify.ts) | `isEmailConfigured()` เป็น false — ลิงก์ "ลืมรหัสผ่าน?" ซ่อนอยู่, อีเมลนัดหมายไม่ส่ง ไม่มีอะไรพัง |
| `INTERNAL_TASK_SECRET` | [app/api/internal/appointment-reminders/route.ts](../app/api/internal/appointment-reminders/route.ts) | route ตอบ 401 ทุก request — GitHub Actions cron ([appointment-reminders.yml](../.github/workflows/appointment-reminders.yml)) ล้มให้เห็นชัดเจน ไม่ใช่พังเงียบ |
| `SESSION_SECRET` | ❌ **ไม่มีโค้ดไหนอ่านแล้ว** — ระบบ session ปัจจุบัน ([lib/members/session.ts](../lib/members/session.ts)) ใช้ opaque token 256-bit เก็บใน D1 ไม่มี signing secret · ไฟล์ JWT เก่าถูกลบใน PR #185 | ไม่มีผล — เป็นซากที่ลบได้ (`wrangler secret delete SESSION_SECRET`) |

`RESEND_FROM_EMAIL` **ไม่ใช่ secret** — ย้ายไปอยู่ใน `vars` ของ `wrangler.jsonc` แล้ว (ดูหัวข้อ Vars ด้านบน + บทเรียนว่าทำไม)

> 🔴 **ห้าม `process.env.X || 'ค่า fallback'` สำหรับความลับ** — repo เป็น public ค่านั้นจะหลุดถาวร และระบบจะ "ทำงานได้" ทั้งที่ config หาย = พังเงียบชนิดที่แย่ที่สุด · production ต้อง **throw**, dev ค่อยมี fallback · resolve **ตอนเรียก ไม่ใช่ตอน import** ไม่งั้น `next build` ที่ไม่มี secret จะพังทันที (บทเรียน 2026-07-23)

**Secret ของ GitHub Actions** (คนละที่กับ Worker — ตั้งใน repo settings): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (CD), `BACKUP_PASSPHRASE` (workflow backup D1)

---

## /admin ล็อกยังไง — 2 ชั้น

**ชั้นที่ 1 — Cloudflare Access (ที่ edge)**
Zero Trust → Access → Applications → app ชื่อ `kazumi-clinic-admin`
- Destination: `kazumi-clinic.bankjack10452.workers.dev/admin`
- Policy: `Admin only` (ใช้ร่วมกับ littlesmileflower)
- Session: 24 ชม.

**ชั้นที่ 2 — โค้ดเรา verify เอง** ([middleware.ts](../middleware.ts) + [lib/auth.ts](../lib/auth.ts))
Access ส่ง JWT มาใน header `cf-access-jwt-assertion` · เรา **verify ลายเซ็นเอง ไม่เชื่อ header** เพราะ request ที่เข้า Worker โดยไม่ผ่าน Access (เช่นยิงตรงมา workers.dev) ปลอม header อะไรก็ได้

**Fail closed** — ไม่มี env Access = ทุก route ตอบ **404** · deploy ที่ยังไม่ตั้งค่า = *ไม่มี admin* ไม่ใช่ *admin เปิดโล่ง* · ใช้ 404 ไม่ใช่ 401 เพราะคนแปลกหน้าไม่ควรรู้ว่ามี admin

middleware ครอบ `/admin/:path*` **และ** `/api/admin/:path*` — ถ้าเช็คใน layout อย่างเดียว route handler จะโล่ง

⚠️ **Access app คุมแค่ path `/admin` (ดู Destination ข้างบน) ไม่ครอบ `/api/admin`** → request ที่ยิงไป API **ไม่ถูกฉีด header `cf-access-jwt-assertion`** (พิสูจน์: `GET /admin` → 302 เด้ง login, แต่ `POST /api/admin/*` → หลุดถึง Worker) · ตอนแรกทำให้อัปรูป/บันทึกสินค้าพังด้วย 404 body ว่าง → หน้าเว็บขึ้น "Unexpected end of JSON input" · **แก้แล้ว (PR #117)**: middleware อ่าน JWT จาก header ก่อน แล้ว fallback ไป cookie `CF_Authorization` (Access ตั้งไว้ Path=/ ทั้งโฮสต์ browser จึงส่งไปที่ `/api/admin/*` ด้วย) — verify ลายเซ็นเหมือนเดิม ปลอดภัยเท่าเดิม · **ห้ามลบ fallback นี้** จนกว่าจะเพิ่ม `/api/admin` เข้า Access application

---

## บริการภายนอก

| บริการ | ค่า | หมายเหตุ |
| --- | --- | --- |
| Cloudinary cloud | `dvskwrapm` | **ใช้บัญชีเดียวกับ littlesmileflower** · แพลนฟรี → API key ต้อง role `Master Admin` (ไม่รองรับ scoped role) |
| โฟลเดอร์ | `kazumi-clinic/` | |
| วิธีอัป | **signed upload** ตั้งแต่ PR #220 — เซ็นด้วย `CLOUDINARY_API_KEY`/`_SECRET` ฝั่ง Worker | ดู [images.md](./images.md) |
| Unsigned preset `littlesmileflower` | โค้ด Kazumi **เลิกใช้แล้ว** (ชื่อหลุดใน git history สาธารณะ) | ⛔ **ห้ามลบ/ปิด preset** — โปรเจกต์ littlesmileflower ยังใช้อยู่บนบัญชีเดียวกัน |
| LINE OA | `https://lin.ee/1tshhNn` | ใน `lib/site.ts` |

---

## ข้อจำกัดของเครื่อง dev (macOS 12.7.6 — `sw_vers` 2026-07-25)

| คำสั่ง | ใช้ได้ไหม |
| --- | --- |
| `pnpm dev` (next dev) | ✅ แต่ **ไม่มี binding D1/KV** → อ่านรูปได้เฉพาะค่า default |
| `pnpm build` | ✅ |
| `pnpm cf:build` | ✅ |
| `pnpm cf:deploy` | ✅ ผ่าน trick `OPEN_NEXT_DEPLOY=true wrangler deploy` (ข้าม wrapper ที่เรียก workerd) |
| `wrangler dev` / `cf:preview` | ❌ `Unsupported macOS version: 12.7.6 (ต้อง 13.5.0+)` |
| `wrangler d1 ... --local` | ❌ เหตุผลเดียวกัน (ใช้ workerd) |
| `wrangler d1 ... --remote` | ✅ ผ่าน API ไม่ใช้ workerd → **migration รันได้** |

**ผลที่ตามมา: โค้ดที่แตะ D1/KV ทดสอบในเครื่องไม่ได้เลย — ต้อง deploy แล้วยิงทดสอบบน Worker จริง**

> 🔴 **และ `pnpm test` ก็ไม่ใช่หลักฐานเช่นกัน** — `vitest.config.ts` ตั้ง `environment: 'node'` ซึ่งมี Web API/ลิมิตไม่ตรงกับ workerd · PBKDF2 600k รอบผ่านบน Node แต่ workerd ปฏิเสธเกิน 100k → ระบบรหัสผ่านตายสนิทหลายวันโดย CI เขียวตลอด (2026-07-25) · โค้ดที่แตะ crypto/binding/Web API ต้องยิงบน Worker จริง (`pnpm smoke`, `wrangler tail`)

---

## ตาราง D1 (ทั้งหมดอยู่ใน `kazumi-clinic-tag-cache`)

รันด้วย `npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file migrations/xxxx.sql`

| ตาราง | ที่มา | ใช้ทำอะไร |
| --- | --- | --- |
| `site_images` | [migrations/0001_site_images.sql](../migrations/0001_site_images.sql) | รูปที่คลินิกเปลี่ยนเองผ่าน /admin |
| `service_products` | [migrations/0002_service_products.sql](../migrations/0002_service_products.sql) | สินค้าที่คลินิกเพิ่ม/แก้/ลบ/อัปรูปเองผ่าน `/admin/products` — เก็บ **ส่วนต่าง** บน catalogue ใน `lib/services.ts` (ตารางว่าง = เว็บเหมือนเดิม); รูปสินค้าเก็บเป็น `image_public_id` บน row เอง ไม่ใช่ image slot |
| `promotions` | [migrations/0003_promotions.sql](../migrations/0003_promotions.sql) | โปรโมชั่นที่คลินิกจัดการผ่าน `/admin/promotions` — เป็น **source of truth ทั้งหมด** ของหน้า `/promotions` (ตารางว่าง = แสดง empty state); โปรฯ เลย `valid_until` ซ่อนเอง · code list ใน `lib/promotions.ts` เหลือไว้เป็น fallback เฉพาะตอนไม่มี D1 binding |
| `reviews` | [migrations/0004_reviews.sql](../migrations/0004_reviews.sql) | รีวิว + ภาพก่อน-หลังจาก `/admin/reviews` — แสดงเฉพาะ row ที่ `consent=1` **และ** `published=1`; ภาพก่อน-หลังถูกซ่อนถ้าไม่มี consent (บังคับทั้ง read และ write · §0.2) |
| `posts` | [migrations/0005_posts.sql](../migrations/0005_posts.sql) | บทความจาก `/admin/blog` → หน้า `/blog` + `/blog/[slug]`; `slug` unique, `body` เป็น markdown subset render ผ่าน [components/prose.tsx](../components/prose.tsx) แบบไม่มี dangerouslySetInnerHTML |
| `leads` | [migrations/0006_leads.sql](../migrations/0006_leads.sql) | คำขอนัดหมายจากฟอร์มใน `/contact` — เขียนผ่าน **public endpoint เดียวของแอป** `POST /api/leads` (Zod + honeypot); admin ดู/จัดการสถานะที่ `/admin/leads` |
| `revalidations` | [migrations/0007_tag_cache_revalidations.sql](../migrations/0007_tag_cache_revalidations.sql) | tag cache ของ OpenNext — **ถ้าหาย on-demand ISR ตายเงียบ** (ดูหัวข้อ binding ด้านบน) |
| `members`, `member_sessions`, `carts`, `cart_items`, `orders`, `order_items`, `password_resets` | [migrations/0009_member_system.sql](../migrations/0009_member_system.sql) | ระบบสมาชิก/ตะกร้า/คำสั่งซื้อ — เงินเก็บเป็น **satang** ทุกคอลัมน์ · ดู [member-system.md](./member-system.md) |
| `rate_limits` | [migrations/0010_rate_limits.sql](../migrations/0010_rate_limits.sql) | นับ request ต่อ IP ของ register/login/lead/checkout/cart/admin |
| ตารางอื่น | OpenNext สร้างเอง | cache ภายในของ ISR — **ห้ามแตะ** |

### migration ตัวไหนรันเอง / ตัวไหนต้องรันมือ

| กลุ่ม | ไฟล์ | สถานะ |
| --- | --- | --- |
| อยู่ใน `cf:deploy` (รันทุก deploy) | `0007`, `0009`, `0010` | `CREATE TABLE IF NOT EXISTS` ล้วน — idempotent จริง |
| ต้องรันมือครั้งเดียว | `0001`–`0006` | `CREATE TABLE IF NOT EXISTS` — รันซ้ำปลอดภัย แต่ไม่ต้องผูก |
| ต้องรันมือ **อย่างระวัง** | `0008_add_en_columns` (ALTER), `0011_promotions_image` (table rebuild), `0012_posts_category` | ⛔ **ห้ามผูกเข้า `cf:deploy` เด็ดขาด** |

> 🔴 `0011` เคยถูกผูกใน `cf:deploy` — มันเป็น rebuild ที่ `INSERT ... SELECT` ไม่ครบคอลัมน์ ทำให้ **รูปโปรโมชั่นถูกล้างเป็น null ทุก deploy** ผู้ใช้เห็นเป็น "อัปรูปแล้วหายเอง" (2026-07-24 · CLAUDE.md §0.5) · ก่อนใส่อะไรเข้า chain ต้องอ่าน SQL ให้จบว่ามี `DROP`/`RENAME`/`ALTER`/`INSERT..SELECT` ไหม

**Var เสริม (ไม่บังคับ)**: `LEAD_WEBHOOK_URL` — ถ้าตั้งไว้ `POST /api/leads` จะยิง JSON แจ้งเตือน lead ใหม่ไปที่ URL นั้นแบบ fire-and-forget (LINE Notify ปิดบริการแล้ว จึงใช้ webhook ทั่วไปแทน) · ยังไม่ได้ตั้ง = ไม่แจ้งเตือน แค่บันทึกลง D1
