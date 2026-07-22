# ค่าตั้งค่าของเว็บ — Kazumi Clinic

ทุกค่าในหน้านี้ **ตรวจจากระบบจริงแล้ว** ไม่ได้คัดจากความจำหรือจากเอกสารอื่น · วันที่ตรวจ: **2026-07-17**

> ⚠️ ถ้าจะอ้างค่าใดในหน้านี้กับ user ให้ **ยิงคำสั่งตรวจซ้ำก่อนพูด** — เอกสารบอกว่า *ตั้งใจให้เป็นยังไง* ไม่ใช่ *ความจริงตอนนี้* (CLAUDE.md §0.5)

---

## เว็บอยู่ที่ไหน

| | ค่า |
| --- | --- |
| URL ที่ใช้งานจริงตอนนี้ | **https://kazumi-clinic.bankjack10452.workers.dev** |
| Worker name | `kazumi-clinic` |
| บัญชี Cloudflare | `bankjack10452@gmail.com` (account id `f5af6f66302ba6872d8f51aebf43d3fe`) |
| Deploy ครั้งแรก | 2026-07-17 (ก่อนหน้านั้น**ไม่เคย deploy เลย** ทั้งที่เอกสารเก่าบอกว่า deploy อัตโนมัติ) |
| CI/CD | **ไม่มี** — ไม่มี `.github/workflows`, ไม่มี Cloudflare Git integration · `gh pr checks` ตอบ `no checks reported` เป็นปกติ |
| วิธี deploy | `pnpm cf:deploy` **ด้วยมือเท่านั้น** · merge เข้า main ไม่ deploy อะไรทั้งสิ้น |

### Workflow หลัง merge

- งานที่เปลี่ยน public site/Worker และ user ไม่ได้ห้าม deploy: หลัง merge ให้ agent รัน `pnpm cf:deploy` ต่อเองตาม [CLAUDE.md](../CLAUDE.md) §0
- งานเอกสารล้วนไม่ต้อง deploy เพราะไม่มี runtime artifact เปลี่ยน
- ห้ามรายงานว่า deploy สำเร็จจน Wrangler แสดง `Current Version ID`; จากนั้นยิง URL จริงแบบ cache-busting และต้องได้ HTTP 200
- `Current Version ID` เปลี่ยนทุก deploy จึงห้ามบันทึกเลขล่าสุดแบบถาวรในเอกสารนี้ ให้รายงานจาก output ของงานนั้นเท่านั้น

### โดเมนจริง — ยังไม่ได้ใช้

`kazumiclinic.com` **ถูกจดไปแล้ว** แต่คลินิกบอกว่าไม่ได้ซื้อ — ยังไม่ยืนยันว่าเป็นของใคร

| ตรวจ | ผล (2026-07-17) |
| --- | --- |
| Registrar | Namecheap |
| จดเมื่อ | 2025-06-24 · หมดอายุ 2027-06-24 |
| Name servers | `dale.ns.cloudflare.com` / `kia.ns.cloudflare.com` |
| ยิง https | ต่อไม่ติด (มี A record ชี้ Cloudflare แต่ origin ตาย) |

`site.url` ใน [lib/site.ts](../lib/site.ts) **ยังชี้ `https://kazumiclinic.com`** → canonical / sitemap / JSON-LD `@id` ทุกตัวชี้ไปโดเมนนี้ ทั้งที่เว็บเสิร์ฟจาก workers.dev

**เพราะงั้น `SITE_ENV=preview` จึงบังคับ `robots.txt` เป็น `Disallow: /` ทั้งหมด** ([app/robots.ts](../app/robots.ts)) — ไม่งั้น Google จะเก็บ workers.dev แล้วอ่านว่าเนื้อหาเป็นของโดเมนที่เราไม่ได้คุม

> 🔴 **ตอนชี้โดเมนจริงมาแล้ว ต้องทำ 3 อย่าง**: เปลี่ยน `site.url`, **ลบ var `SITE_ENV`** (ไม่งั้นเว็บจริงห้าม Google เก็บ), เพิ่ม destination ของ Cloudflare Access ให้ครอบโดเมนใหม่

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

---

## Vars (ใน `wrangler.jsonc` — commit ลง git)

| Var | ค่า | หมายเหตุ |
| --- | --- | --- |
| `SITE_ENV` | `preview` | ทำให้ robots.txt = `Disallow: /` · **ลบเมื่อมีโดเมนจริง** |
| `CF_ACCESS_TEAM_DOMAIN` | `https://mute-wind-2c05.cloudflareaccess.com` | |
| `CF_ACCESS_AUD` | `e2a3d26d5b575e1290b4e5db4c438bab437e59e35d386c1a87e11242dffd6b35` | |

**ทำไม 2 ค่าหลังไม่ใช่ secret** — AUD เป็น public identifier ของ Access application, team domain เป็น hostname สาธารณะ · ความปลอดภัยมาจาก [lib/auth.ts](../lib/auth.ts) ที่ **verify ลายเซ็น JWT** กับ key set ของ Cloudflare → รู้ค่าพวกนี้ก็ปลอม JWT ไม่ได้ · อยู่ใน git ดีกว่าเพราะรีวิวได้

**ตอนนี้ไม่มี Worker secret สักตัว** — ถ้าจะเพิ่ม ใช้ `wrangler secret put <NAME>`

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
| Cloudinary cloud | `dvskwrapm` | **ใช้บัญชีเดียวกับ littlesmileflower** |
| โฟลเดอร์ | `kazumi-clinic/` | |
| Unsigned upload preset | `littlesmileflower` | **ไม่มี API secret ในโปรเจกต์นี้** ดู [images.md](./images.md) |
| LINE OA | `https://lin.ee/1tshhNn` | ใน `lib/site.ts` |

---

## ข้อจำกัดของเครื่อง dev (macOS 12.6)

| คำสั่ง | ใช้ได้ไหม |
| --- | --- |
| `pnpm dev` (next dev) | ✅ แต่ **ไม่มี binding D1/KV** → อ่านรูปได้เฉพาะค่า default |
| `pnpm build` | ✅ |
| `pnpm cf:build` | ✅ |
| `pnpm cf:deploy` | ✅ ผ่าน trick `OPEN_NEXT_DEPLOY=true wrangler deploy` (ข้าม wrapper ที่เรียก workerd) |
| `wrangler dev` / `cf:preview` | ❌ `Unsupported macOS version: 12.6.0 (ต้อง 13.5.0+)` |
| `wrangler d1 ... --local` | ❌ เหตุผลเดียวกัน (ใช้ workerd) |
| `wrangler d1 ... --remote` | ✅ ผ่าน API ไม่ใช้ workerd → **migration รันได้** |

**ผลที่ตามมา: โค้ดที่แตะ D1/KV ทดสอบในเครื่องไม่ได้เลย — ต้อง deploy แล้วยิงทดสอบบน Worker จริง**

---

## ตาราง D1

รันด้วย `npx wrangler d1 execute kazumi-clinic-tag-cache --remote --file migrations/xxxx.sql`

| ตาราง | ที่มา | ใช้ทำอะไร |
| --- | --- | --- |
| `site_images` | [migrations/0001_site_images.sql](../migrations/0001_site_images.sql) | รูปที่คลินิกเปลี่ยนเองผ่าน /admin |
| `service_products` | [migrations/0002_service_products.sql](../migrations/0002_service_products.sql) | สินค้าที่คลินิกเพิ่ม/แก้/ลบ/อัปรูปเองผ่าน `/admin/products` — เก็บ **ส่วนต่าง** บน catalogue ใน `lib/services.ts` (ตารางว่าง = เว็บเหมือนเดิม); รูปสินค้าเก็บเป็น `image_public_id` บน row เอง ไม่ใช่ image slot |
| `promotions` | [migrations/0003_promotions.sql](../migrations/0003_promotions.sql) | โปรโมชั่นที่คลินิกจัดการผ่าน `/admin/promotions` — เป็น **source of truth ทั้งหมด** ของหน้า `/promotions` (ตารางว่าง = แสดง empty state); โปรฯ เลย `valid_until` ซ่อนเอง · code list ใน `lib/promotions.ts` เหลือไว้เป็น fallback เฉพาะตอนไม่มี D1 binding |
| `reviews` | [migrations/0004_reviews.sql](../migrations/0004_reviews.sql) | รีวิว + ภาพก่อน-หลังจาก `/admin/reviews` — แสดงเฉพาะ row ที่ `consent=1` **และ** `published=1`; ภาพก่อน-หลังถูกซ่อนถ้าไม่มี consent (บังคับทั้ง read และ write · §0.2) |
| `posts` | [migrations/0005_posts.sql](../migrations/0005_posts.sql) | บทความจาก `/admin/blog` → หน้า `/blog` + `/blog/[slug]`; `slug` unique, `body` เป็น markdown subset render ผ่าน [components/prose.tsx](../components/prose.tsx) แบบไม่มี dangerouslySetInnerHTML |
| `leads` | [migrations/0006_leads.sql](../migrations/0006_leads.sql) | คำขอนัดหมายจากฟอร์มใน `/contact` — เขียนผ่าน **public endpoint เดียวของแอป** `POST /api/leads` (Zod + honeypot); admin ดู/จัดการสถานะที่ `/admin/leads` |
| ตารางอื่น | OpenNext สร้างเอง | tag cache ของ ISR — **ห้ามแตะ** |

> ⚠️ migration 0003–0006 ยังต้องรัน `wrangler d1 execute ... --remote --file` ให้ครบก่อน feature ทำงานบน production (ทุกไฟล์เป็น `CREATE TABLE IF NOT EXISTS` — รันซ้ำปลอดภัย)

**Var เสริม (ไม่บังคับ)**: `LEAD_WEBHOOK_URL` — ถ้าตั้งไว้ `POST /api/leads` จะยิง JSON แจ้งเตือน lead ใหม่ไปที่ URL นั้นแบบ fire-and-forget (LINE Notify ปิดบริการแล้ว จึงใช้ webhook ทั่วไปแทน) · ยังไม่ได้ตั้ง = ไม่แจ้งเตือน แค่บันทึกลง D1
