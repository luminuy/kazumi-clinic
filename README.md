# Kazumi Clinic — เว็บไซต์คลินิกความงาม

เว็บไซต์การตลาดและแนะนำบริการของ **Kazumi Clinic (คาซึมิ คลินิก)** ย่านสุขุมวิท กรุงเทพฯ สร้างด้วย Next.js App Router และ deploy บน Cloudflare Workers ผ่าน OpenNext

โทนแบรนด์: โครงและจังหวะแบบ editorial ญี่ปุ่น (พื้นที่ว่าง, asymmetry, สัดส่วน 1.618) บนผิว Apple-style light theme โดยใช้เขียว `mint`/`forest` เป็นสี action ภายใต้แนวคิด _“Where balance purity becomes eternal beauty” / 純粋さは永遠の美へ_ — ค่าจริงของ token อยู่ใน [app/globals.css](app/globals.css), กฎการใช้อยู่ใน [docs/design.md](docs/design.md)

> เนื้อหาทางการแพทย์อยู่ภายใต้ พ.ร.บ.สถานพยาบาล และประกาศ อย./สบส. ห้ามอ้างสรรพคุณเกินจริง ราคาที่มาจากโปรโมชั่นต้องระบุช่วงเวลา และต้องคงเลขใบอนุญาตสถานพยาบาลไว้เสมอ ดู [CLAUDE.md](CLAUDE.md) §0.2

## สถานะปัจจุบัน

| รายการ                   | ค่า                                                                                                             |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------- |
| URL ที่ใช้งาน            | `https://kazumiclinic.skin` (โดเมนจริง — ทางเข้าเดียว; workers.dev ปิดแล้วตั้งแต่ PR #277)                      |
| Production Worker        | `kazumi-clinic`                                                                                                 |
| CI/CD                    | มี CI/CD สมบูรณ์ผ่าน GitHub Actions — `lint`, `typecheck`, `test`, `build` ทุก PR                               |
| Deploy                   | อัตโนมัติเมื่อ merge เข้า `main` ผ่าน `pnpm cf:deploy` ใน workflow (รองรับ deploy ด้วยมือเมื่อจำเป็น)           |
| ภาษา                     | ไทย (default, path เปล่า) + อังกฤษ (`/en`) ผ่าน next-intl                                                       |
| Search indexing          | เปิดแล้ว (2026-07-27) — โดเมนจริงขึ้นแล้ว, `SITE_ENV=preview` ถูกลบ                                              |
| โดเมน canonical ปัจจุบัน | `site.url` = `https://kazumiclinic.skin`; ดูรายละเอียดใน [docs/infrastructure.md](docs/infrastructure.md)       |

## Tech stack

| ชั้น       | เทคโนโลยี                                                                           |
| :--------- | :---------------------------------------------------------------------------------- |
| Framework  | Next.js 16.2 App Router + React 19.2                                                |
| ภาษา       | TypeScript 5.6                                                                      |
| i18n       | next-intl — ไทย (default, path เปล่า) + อังกฤษ (`/en`), `localeDetection` ปิด        |
| Styling    | Tailwind CSS v4 ผ่าน `@theme` ใน `app/globals.css` — ไม่มี `tailwind.config.ts`     |
| UI         | shadcn/ui บน Base UI (`@base-ui/react`) — ใช้ prop `render`, ไม่ใช่ Radix `asChild` |
| Validation | Zod ก่อน Route Handler แตะ DB                                                       |
| สมาชิก     | auth เขียนเอง (session opaque token ใน D1) + ตะกร้า + checkout · ดู [docs/member-system.md](docs/member-system.md) |
| Runtime    | Cloudflare Workers + OpenNext, Node.js runtime compatibility                        |
| ISR        | KV incremental cache + D1 tag cache + Durable Object queue                          |
| รูปภาพ     | Cloudinary; image override เก็บในตาราง D1 `site_images`                             |
| สินค้า     | คลินิกเพิ่ม/แก้/ลบ/อัปรูปเองที่ `/admin/products`; override เก็บในตาราง D1 `service_products` (ส่วนต่างบน `lib/services.ts`) |
| โปรโมชั่น  | คลินิกจัดการเองที่ `/admin/promotions` รวมรูปภาพ; เก็บหลักในตาราง D1 `promotions` (ไม่มีระบบส่วนต่าง) |

Backend ใช้ Next.js Route Handlers (`app/api/*/route.ts`) ภายใน Worker เดียวกับหน้าเว็บ ไม่มี backend service แยก

## โครงสร้างโปรเจกต์

```text
app/
├── (site)/[locale]/            # หน้าสาธารณะทั้งหมด — ไทย = path เปล่า, อังกฤษ = /en/...
│   ├── layout.tsx             # document shell + Header/Footer + MedicalBusiness/WebSite JSON-LD
│   ├── page.tsx               # หน้าแรก + FAQPage schema
│   ├── services/page.tsx      # Treatment Atlas ครบทุกหมวด
│   ├── [category]/page.tsx    # หน้าหมวด dynamic + ItemList/Breadcrumb
│   ├── about/ contact/ reviews/ promotions/ search/
│   ├── blog/ blog/[slug]/     # บทความจาก D1
│   ├── account/               # login, register, orders, forgot/reset password
│   └── cart/ cart/checkout/   # ตะกร้า + checkout (มัดจำ/จ่ายที่คลินิก)
├── admin/                      # ไม่มี locale + root layout ของตัวเอง; force-dynamic
│   └── images/ products/ promotions/ reviews/ blog/ leads/
├── api/
│   ├── admin/*                # upload/reset รูป, สินค้า, โปรฯ, รีวิว, บทความ, leads
│   ├── account/* cart/* checkout/*   # ระบบสมาชิก
│   └── leads/route.ts         # public endpoint เดียวของแอป (Zod + honeypot)
├── sitemap.ts · robots.ts · llms.txt

i18n/routing.ts                 # locales, defaultLocale, localePrefix
messages/{th,en}.json           # ข้อความ UI ทุกชิ้น

lib/
├── site.ts                    # ข้อมูลธุรกิจ, ใบอนุญาต, localizedAlternates()
├── doctor.ts · services.ts    # ข้อมูลแพทย์ · 9 หมวด + โปรแกรม + ราคา
├── promotions.ts              # fallback ตอนไม่มี D1 (ของจริงอยู่ในตาราง promotions)
├── site-images.ts             # image slot contract และตำแหน่งที่ใช้
├── site-images-store.ts       # resolve Cloudinary public ID จาก D1
├── metadata-images.ts         # OG/Twitter 1200×630
├── schema.ts                  # JSON-LD helpers
├── auth.ts                    # verify Cloudflare Access JWT (ฝั่ง /admin)
└── members/                   # session, password, cart, orders, oauth, payments

open-next.config.ts            # KV incremental cache + DO queue + D1 tag cache
wrangler.jsonc                 # Worker bindings/vars ที่ใช้งานจริง
middleware.ts                  # Access JWT (/admin, /api/admin) + trailing-slash 308 + next-intl + CSRF cookie
```

## บริการ 9 หมวด

รายการทั้งหมดมาจาก `serviceCategories` ใน [lib/services.ts](lib/services.ts) และถูกใช้ร่วมกันโดยหน้า `/services`, dynamic routes, sitemap และ JSON-LD:

- `/filler` — ฟิลเลอร์
- `/botox` — โบท็อกซ์
- `/iv-drip` — IV Drip วิตามิน
- `/skin-booster` — สกินบูสเตอร์
- `/collagen-booster` — คอลลาเจนบูสเตอร์
- `/thread-lift` — ร้อยไหมกระชับใบหน้า
- `/mesotherapy` — เมโสบำรุงผิวและเมโสแฟต
- `/acne-care` — ดูแลสิวและหลุมสิว
- `/laser-hifu` — เลเซอร์และยกกระชับ

ราคาบางรายการมีที่มาจากสื่อโปรโมชั่นและยังไม่ควรถูกนำไปแสดงเป็น “ราคาปกติ” ในหน้ารวมบริการ หากจะเปลี่ยนราคาให้แก้ที่ `lib/services.ts` เท่านั้นและผ่านการตรวจเนื้อหาทางการแพทย์ก่อนเผยแพร่

## รูปและ metadata

- ห้ามเพิ่มรูปเว็บไซต์ใน `public/`; รูปที่คลินิกแก้เองต้องอยู่บน Cloudinary และมี slot ใน `lib/site-images.ts`
- `/admin` เขียน Cloudinary public ID ลง D1; Server Component resolve override แล้วส่งให้ Client Component
- รูปที่ admin เปลี่ยนได้ต้องใช้ async `generateMetadata`; ห้ามสร้าง `const ogImage = cld(...)` ระดับโมดูล
- OG/Twitter ใช้สัดส่วน 1200×630 และต้องอ้าง image slot เดียวกับภาพจริงของหน้า
- เพิ่มหรือย้ายจุดใช้รูปต้องอัปเดต `REVALIDATION_TARGETS` ใน `app/api/admin/images/route.ts`

รายละเอียด end-to-end อยู่ใน [docs/images.md](docs/images.md)

## การพัฒนาและตรวจสอบ

```bash
pnpm install
pnpm dev          # Next dev; ไม่มี D1/KV binding จึงเห็นเฉพาะค่า default
pnpm lint         # ESLint 9 ผ่าน flat config ของ repo
pnpm typecheck    # verification บังคับ
pnpm test         # vitest — รันบน Node ไม่ใช่ workerd (ดูคำเตือนล่าง)
pnpm build        # verification บังคับ; ต้อง generate ครบ 9 หมวด × 2 ภาษา
pnpm cf:build     # สร้าง OpenNext bundle (CI รันตัวนี้ด้วย)
pnpm cf:deploy    # build + migrate + deploy Worker จริง
pnpm health       # ยิงทุกหน้าบน production เช็ค 200
pnpm smoke        # สมัคร/ล็อกอินจริงบน Worker แล้วลบทิ้ง
```

**ข้อจำกัดเครื่องปัจจุบัน (macOS 12.7.6)**: `wrangler dev`, `pnpm cf:preview` และ `wrangler d1 --local` ใช้ไม่ได้เพราะ workerd ต้องการ macOS 13.5+ · `pnpm cf:deploy` ใช้ได้ผ่าน `OPEN_NEXT_DEPLOY=true` ที่ผูกไว้ใน script แล้ว (ดู [docs/deploy.md](docs/deploy.md))

> 🔴 **`pnpm test` ผ่าน ≠ ใช้งานได้บน Cloudflare** — vitest รันบน Node ซึ่งมี Web API/ลิมิตไม่เหมือน workerd · โค้ดที่แตะ crypto/D1/binding ต้องยิงของจริงหลัง deploy (`pnpm smoke`, `wrangler tail`) · เคยทำให้ระบบรหัสผ่านตายสนิทหลายวันโดย CI เขียวตลอด

## Deploy

Cloudflare resources ถูกสร้างและใส่ ID จริงไว้แล้ว ห้ามรันคำสั่งสร้าง KV/D1 ซ้ำ

โปรเจกต์มีการตั้งค่า **CI/CD อัตโนมัติ** หากคุณแก้ไขโค้ด:

1. สร้าง Branch ใหม่ (`git switch -c <branch>`)
2. Push และเปิด Pull Request (ห้าม push เข้า `main` ตรงๆ)
3. เมื่อ CI ผ่าน (`lint`, `typecheck`, `test`, `build`) และทำการ Merge
4. GitHub Actions จะทำการ Deploy โค้ดใหม่ขึ้นหน้าเว็บจริงให้โดยอัตโนมัติ

**Deploy ด้วยมือเป็นข้อยกเว้น** (ใช้เมื่อ CD เสีย/ถูกปิด) และ **ห้ามรันชนกับ CD ที่กำลังทำงาน** — ขั้นตอนเต็มอยู่ใน [docs/deploy.md](docs/deploy.md)

⚠️ **`Current Version ID` ไม่ได้แปลว่าเว็บใช้งานได้ และ HTTP 200 ก็ยังไม่พอ** — หน้าเว็บเป็น ISR + stale-while-revalidate จึงเสิร์ฟของเก่ารอบแรก ต้องยิง URL **อย่างน้อย 2 ครั้ง** พร้อมดู header `x-nextjs-cache` ก่อนสรุปว่าโค้ดใหม่ขึ้นแล้ว · งาน cache/ISR ต้องตรวจ runtime observability (`wrangler tail`) เพิ่ม เพราะ background error ไม่ปรากฏใน response

## เอกสาร

| ไฟล์ | เนื้อหา |
| :--- | :--- |
| [STATUS.md](STATUS.md) | **อ่านก่อนเริ่มงาน** — ตอนนี้ถึงไหน, deploy version ไหน, อะไรค้าง |
| [CLAUDE.md](CLAUDE.md) | กฎสำหรับ AI agents — workflow, SEO, medical compliance, i18n, บทเรียนจริง |
| [AGENTS.md](AGENTS.md) | entrypoint ย่อสำหรับ agent ที่อ่าน `AGENTS.md` (Codex ฯลฯ) |
| [docs/deploy.md](docs/deploy.md) | ขั้นตอน deploy, workerd/macOS, verify หลัง deploy |
| [docs/infrastructure.md](docs/infrastructure.md) | binding, secret, var, ตาราง D1, Access, โดเมน |
| [docs/images.md](docs/images.md) | Cloudinary/D1/admin/metadata/revalidation |
| [docs/design.md](docs/design.md) | design system, token จริง, โครงหน้า Services |
| [docs/member-system.md](docs/member-system.md) | สมาชิก, ตะกร้า, checkout, OAuth, payment |
| [docs/changelog.md](docs/changelog.md) | งานที่ปิดไปแล้ว พร้อมเหตุผลและบทเรียน |
| [docs/2026-07-local-version-mismatch.md](docs/2026-07-local-version-mismatch.md) | บันทึกเหตุการณ์: local branch ไม่ตรง `origin/main` |
