# Kazumi Clinic — เว็บไซต์คลินิกความงาม

เว็บไซต์ทางการของ **Kazumi Clinic (คาซึมิ คลินิก)** สถานเสริมความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการหัตถการโดยแพทย์ — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ คอลลาเจนบูสเตอร์ และ IV Drip วิตามิน

เป็นเว็บ **การตลาด/แนะนำบริการ (marketing site)** ที่ออกแบบให้ **SEO เป็นแกนหลัก** — เน้นให้ค้นเจอบน Google และ AI search รวมถึงแสดงราคา บริการ และช่องทางติดต่อ (โทร / LINE / Instagram) โทนแบรนด์เป็นสไตล์ญี่ปุ่นมินิมอล สงบ (_"Where balance purity becomes eternal beauty" / 純粋さは永遠の美へ_)

> ⚠️ เนื้อหาทางการแพทย์อยู่ภายใต้ พ.ร.บ.สถานพยาบาล และประกาศ อย./สบส. — ห้ามอ้างสรรพคุณเกินจริง และต้องแสดงเลขใบอนุญาต (`มสพ.สบส.338/2569`) เสมอ ดูรายละเอียดใน [CLAUDE.md](CLAUDE.md) §0.2

---

## Tech Stack

| ชั้น | เทคโนโลยี |
| --- | --- |
| Framework | **Next.js 15.5** (App Router) + **React 19.2** |
| ภาษา | **TypeScript 5.6** |
| Styling | **Tailwind CSS v4** (config อยู่ใน `@theme` ของ `app/globals.css` — ไม่มี `tailwind.config.ts`) |
| UI components | **shadcn/ui บน Base UI** (`@base-ui/react`) — ไม่ใช่ Radix |
| Icons | `lucide-react` |
| Validation | **Zod** (ใช้ validate input ของ API route ก่อนแตะ DB) |
| Deploy | **Cloudflare Workers** ผ่าน **OpenNext** (`@opennextjs/cloudflare`) — Node.js runtime |
| ISR cache | **R2** (incremental cache) · **D1** (tag cache) · **Durable Object** (revalidation queue) |

**Backend:** ไม่แยก service ต่างหาก — ใช้ Next.js Route Handlers (`app/api/*/route.ts`) รันเป็นส่วนหนึ่งของ Worker เดียวกับหน้าเว็บ (share `lib/` และ D1 binding เดียวกัน)

---

## โครงสร้างโปรเจกต์

```
app/
├── layout.tsx          # root layout — inject MedicalBusiness JSON-LD + OG/Twitter defaults
├── page.tsx            # หน้าแรก (+ FAQPage schema — มีที่นี่ที่เดียว)
├── [category]/page.tsx # หน้าหมวดบริการ (dynamic) — generateStaticParams + generateMetadata
├── about/page.tsx      # เกี่ยวกับคลินิก
├── contact/page.tsx    # ติดต่อ
├── globals.css         # Tailwind v4 @theme — สี/ฟอนต์แบรนด์
├── sitemap.ts          # generate จาก lib/services.ts อัตโนมัติ
└── robots.ts           # disallow /admin, /api

components/
├── Header.tsx · Footer.tsx · service-icon.tsx
└── ui/                 # shadcn/Base UI primitives (button, badge, card, sheet)

lib/                    # ── Single source of truth ──
├── site.ts             # ชื่อ/เบอร์/ที่อยู่/เวลาทำการ/social/ใบอนุญาต
├── services.ts         # หมวดบริการ + ราคา (sitemap + schema + หน้า listing อ่านจากที่นี่)
├── schema.ts           # JSON-LD helpers (MedicalBusiness, ItemList, Breadcrumb, FAQ)
└── utils.ts

open-next.config.ts     # override queue + tagCache + incrementalCache (จำเป็น)
wrangler.jsonc          # Cloudflare bindings: DO queue + R2 + D1
```

### หลักการออกแบบสำคัญ

- **Single source of truth** — ข้อมูลธุรกิจอยู่ใน [lib/site.ts](lib/site.ts), บริการ+ราคาอยู่ใน [lib/services.ts](lib/services.ts) เพิ่มบริการใหม่ที่ไฟล์เดียว → **sitemap, JSON-LD schema, และหน้า listing generate ให้อัตโนมัติ** ห้าม hardcode ซ้ำ
- **SEO-first** — ทุกหน้ามี canonical (ไม่มี trailing slash), OG image เฉพาะหน้า, และ Schema.org JSON-LD ที่เหมาะกับประเภทหน้า (`MedicalBusiness` ที่ root, `ItemList` หน้าหมวด, `BreadcrumbList` หน้าลึก)
- **ISR บน edge** — หน้า static regenerate ผ่านคิว Durable Object เก็บ cache ใน R2 + tag ใน D1

---

## บริการที่ให้ (5 หมวด)

| Slug | หมวด | เริ่มต้น |
| --- | --- | --- |
| `/filler` | ฟิลเลอร์ | 3,990.- |
| `/botox` | โบท็อกซ์ | 8,990.- |
| `/iv-drip` | IV Drip วิตามิน | 2,590.- |
| `/skin-booster` | สกินบูสเตอร์ | 11,990.- |
| `/collagen-booster` | คอลลาเจนบูสเตอร์ | 18,990.- |

> ราคาข้างต้นเป็นโปรโมชั่น "May Exclusive Offer" — ยืนยันราคาปกติกับคลินิกก่อนใช้เป็นราคาถาวร (ดู [lib/services.ts](lib/services.ts))

---

## การพัฒนา

```bash
pnpm install        # ติดตั้ง dependencies
pnpm dev            # dev server (http://localhost:3000)
pnpm typecheck      # tsc --noEmit
pnpm build          # next build
pnpm lint           # eslint

# Cloudflare
pnpm cf:build       # build ผ่าน OpenNext adapter
pnpm cf:preview     # preview บน workerd (local)
pnpm cf:deploy      # build + deploy production
```

### ก่อน deploy จริงครั้งแรก

ต้องสร้าง Cloudflare resources แล้วแทนที่ placeholder ใน [wrangler.jsonc](wrangler.jsonc):

```bash
wrangler r2 bucket create kazumi-clinic-cache
wrangler d1 create kazumi-clinic-tag-cache   # เอา database_id มาใส่แทน REPLACE_WITH_D1_DATABASE_ID
```

---

## กติกาสำหรับผู้ร่วมพัฒนา (รวม AI agents)

อ่าน **[CLAUDE.md](CLAUDE.md)** ก่อนแก้โค้ดทุกครั้ง — เป็นกฎบังคับเรื่อง URL convention (ไม่มี trailing slash), JSON-LD, sitemap, เนื้อหาทางการแพทย์ และ workflow commit/PR ของ repo นี้
