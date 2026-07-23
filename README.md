# Kazumi Clinic — เว็บไซต์คลินิกความงาม

เว็บไซต์การตลาดและแนะนำบริการของ **Kazumi Clinic (คาซึมิ คลินิก)** ย่านสุขุมวิท กรุงเทพฯ สร้างด้วย Next.js App Router และ deploy บน Cloudflare Workers ผ่าน OpenNext

โทนแบรนด์คือ Japanese Editorial Luxury: สงบ แม่นยำ ใช้พื้นที่ว่างและสัดส่วน 1.618 ภายใต้แนวคิด _“Where balance purity becomes eternal beauty” / 純粋さは永遠の美へ_ ดูกฎ UI ที่ [docs/design.md](docs/design.md)

> เนื้อหาทางการแพทย์อยู่ภายใต้ พ.ร.บ.สถานพยาบาล และประกาศ อย./สบส. ห้ามอ้างสรรพคุณเกินจริง ราคาที่มาจากโปรโมชั่นต้องระบุช่วงเวลา และต้องคงเลขใบอนุญาตสถานพยาบาลไว้เสมอ ดู [CLAUDE.md](CLAUDE.md) §0.2

## สถานะปัจจุบัน

| รายการ                   | ค่า                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| URL ที่ใช้งาน            | `https://kazumi-clinic.bankjack10452.workers.dev`                                                               |
| Production Worker        | `kazumi-clinic`                                                                                                 |
| CI/CD                    | มี CI/CD สมบูรณ์ผ่าน GitHub Actions — `lint`, `typecheck`, `test`, `build` ทุก PR                               |
| Deploy                   | อัตโนมัติเมื่อ merge เข้า `main` ผ่าน `pnpm cf:deploy` ใน workflow (รองรับ deploy ด้วยมือเมื่อจำเป็น)           |
| Search indexing          | ปิดด้วย `SITE_ENV=preview` จนกว่าจะมีโดเมนจริง                                                                  |
| โดเมน canonical ปัจจุบัน | `site.url` ยังเป็น `https://kazumiclinic.com`; ดูข้อควรระวังใน [docs/infrastructure.md](docs/infrastructure.md) |

## Tech stack

| ชั้น       | เทคโนโลยี                                                                           |
| ---------- | ----------------------------------------------------------------------------------- |
| Framework  | Next.js 15.5 App Router + React 19.2                                                |
| ภาษา       | TypeScript 5.6                                                                      |
| Styling    | Tailwind CSS v4 ผ่าน `@theme` ใน `app/globals.css` — ไม่มี `tailwind.config.ts`     |
| UI         | shadcn/ui บน Base UI (`@base-ui/react`) — ใช้ prop `render`, ไม่ใช่ Radix `asChild` |
| Validation | Zod ก่อน Route Handler แตะ DB                                                       |
| Runtime    | Cloudflare Workers + OpenNext, Node.js runtime compatibility                        |
| ISR        | KV incremental cache + D1 tag cache + Durable Object queue                          |
| รูปภาพ     | Cloudinary; image override เก็บในตาราง D1 `site_images`                             |
| สินค้า     | คลินิกเพิ่ม/แก้/ลบ/อัปรูปเองที่ `/admin/products`; override เก็บในตาราง D1 `service_products` (ส่วนต่างบน `lib/services.ts`) |
| โปรโมชั่น  | คลินิกจัดการเองที่ `/admin/promotions` รวมรูปภาพ; เก็บหลักในตาราง D1 `promotions` (ไม่มีระบบส่วนต่าง) |

Backend ใช้ Next.js Route Handlers (`app/api/*/route.ts`) ภายใน Worker เดียวกับหน้าเว็บ ไม่มี backend service แยก

## โครงสร้างโปรเจกต์

```text
app/
├── layout.tsx                  # document shell + default async OG/Twitter
├── (site)/
│   ├── layout.tsx             # Header/Footer + MedicalBusiness/WebSite JSON-LD
│   ├── page.tsx               # หน้าแรก + FAQPage schema
│   ├── services/page.tsx      # Treatment Atlas ครบทุกหมวด
│   ├── [category]/page.tsx    # หน้าหมวด dynamic + ItemList/Breadcrumb
│   ├── about/ contact/ reviews/ promotions/
├── admin/page.tsx             # จัดการ image slots; force-dynamic
├── api/admin/images/route.ts  # upload/reset + exhaustive revalidation
├── sitemap.ts
└── robots.ts

lib/
├── site.ts                    # ข้อมูลธุรกิจและใบอนุญาต
├── doctor.ts                  # ข้อมูลแพทย์
├── services.ts                # 9 หมวด + โปรแกรม + ราคา
├── promotions.ts              # โปรโมชั่นและโปสเตอร์
├── site-images.ts             # image slot contract และตำแหน่งที่ใช้
├── site-images-store.ts       # resolve Cloudinary public ID จาก D1
├── metadata-images.ts         # OG/Twitter 1200×630
└── schema.ts                  # JSON-LD helpers

open-next.config.ts            # KV incremental cache + DO queue + D1 tag cache
wrangler.jsonc                 # Worker bindings/vars ที่ใช้งานจริง
middleware.ts                  # verify Cloudflare Access JWT สำหรับ /admin และ /api/admin
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
pnpm dev          # Next dev; ไม่มี D1/KV binding จึงเห็นเฉพาะรูป default
pnpm lint         # ESLint 9 ผ่าน flat config ของ repo
pnpm typecheck    # verification บังคับ
pnpm test         # รัน vitest
pnpm build        # verification บังคับ; ต้อง generate ครบ 9 category routes
pnpm cf:build     # สร้าง OpenNext bundle
pnpm cf:deploy    # build + deploy Worker จริง
```

ข้อจำกัดเครื่องปัจจุบัน (macOS 12.6): `wrangler dev`, `pnpm cf:preview` และ D1 local ใช้ไม่ได้เพราะ workerd ต้องการ macOS 13.5+ ส่วน `pnpm cf:deploy` ใช้ได้ผ่าน `OPEN_NEXT_DEPLOY=true` ที่ผูกไว้ใน script แล้ว

## Deploy

Cloudflare resources ถูกสร้างและใส่ ID จริงไว้แล้ว ห้ามรันคำสั่งสร้าง KV/D1 ซ้ำ

โปรเจกต์มีการตั้งค่า **CI/CD อัตโนมัติ** หากคุณแก้ไขโค้ด:

1. สร้าง Branch ใหม่ (`git switch -c <branch>`)
2. Push และเปิด Pull Request (ห้าม push เข้า `main` ตรงๆ)
3. เมื่อ CI ผ่าน (`lint`, `typecheck`, `test`, `build`) และทำการ Merge
4. GitHub Actions จะทำการ Deploy โค้ดใหม่ขึ้นหน้าเว็บจริงให้โดยอัตโนมัติ

หากต้องการ deploy ด้วยมือ:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm cf:deploy
```

ถือว่า deploy สำเร็จเมื่อ Wrangler คืน `Current Version ID` แล้วตรวจ URL จริงได้ HTTP 200 เท่านั้น งาน cache/ISR ต้องตรวจ runtime observability เพิ่ม เพราะ background error อาจไม่ปรากฏใน response

## เอกสารบังคับ

- [CLAUDE.md](CLAUDE.md) — workflow, SEO, medical compliance และข้อห้ามสำหรับ agents
- [docs/design.md](docs/design.md) — design system และโครงหน้า Services
- [docs/images.md](docs/images.md) — Cloudinary/D1/admin/metadata/revalidation
- [docs/infrastructure.md](docs/infrastructure.md) — URL, bindings, Access, deploy และข้อจำกัดเครื่อง
- [docs/2026-07-local-version-mismatch.md](docs/2026-07-local-version-mismatch.md) — บทเรียนเรื่อง local branch ไม่ตรง `origin/main`
