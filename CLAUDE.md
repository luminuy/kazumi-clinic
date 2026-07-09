# คู่มือสำหรับ AI Agents — Kazumi Clinic

ไฟล์นี้เป็น **กฎที่ AI ทุกตัว** (Claude Code, Cursor, Copilot, Codex, etc.) ต้องทำตามเมื่อแก้โค้ดในโปรเจกต์นี้ เพื่อให้ SEO และ metadata สม่ำเสมอตลอดทั้งไซต์

Stack: Next.js App Router (React 19) + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI primitives) + Zod, deploy บน Cloudflare Workers ผ่าน OpenNext (D1 + R2 + Durable Object queue สำหรับ ISR)

---

## 0. Workflow — Auto commit / push / PR

หลังแก้โค้ดเสร็จและ **verify ครบ** ให้ทำต่อให้อัตโนมัติทุกครั้ง **โดยไม่ต้องถามก่อน**:

1. `git add` เฉพาะไฟล์ที่แก้ (ห้าม `-A` / `.`)
2. `git commit` พร้อมข้อความที่อธิบาย what + why ตามสไตล์ของ repo (ดู `git log`)
3. `git push -u origin <branch>` ขึ้น remote
4. `gh pr create` พร้อม title + body (Summary / Test plan)
5. รายงาน URL ของ PR กลับให้ user

**Auto-merge เปิด** — หลังเปิด PR ให้ merge เข้า main ทันที **เมื่อ verify ครบ**:

- `gh pr checks <num>` — Cloudflare Workers build ต้อง SUCCESS ก่อน merge
- ถ้า build ยัง in-progress → ใช้ `gh pr merge <num> --squash --auto --delete-branch`
- ถ้า build FAIL → หยุด, แจ้ง user, แก้ก่อน
- ก่อน `gh pr merge` ทุกครั้ง: เช็ค `gh pr view --json headRefOid` ให้ตรงกับ local HEAD ก่อน (sleep 2-3 วิ แล้วเช็คซ้ำถ้าไม่ตรง) — auto-merge ที่ยิงทันทีหลัง push อาจ squash แค่ commit เก่า
  หลัง merge แล้วรายงาน URL ของ commit บน main + บอกว่า Cloudflare Workers กำลัง deploy production

ข้อยกเว้น: ถ้า user สั่งชัดว่า "ไม่ commit" / "ไม่ push" / "ไม่ PR" / "ไม่ merge" ให้หยุดที่ขั้นนั้น

### 0.1 Working method — มีขั้นตอน, มีระเบียบ, รอบคอบ

ทุกงาน (เล็กหรือใหญ่) เดินตามลำดับนี้เสมอ ห้ามข้ามขั้น:

1. **เข้าใจปัญหา** — อ่านคำสั่ง/รูป/error ให้ครบ จับ root cause ไม่ใช่อาการ
2. **สำรวจ** — อ่านไฟล์/โค้ดที่เกี่ยวข้องก่อนแก้ ห้ามเดา
3. **วางแผน** — รู้ว่าจะแก้ไฟล์ไหน บรรทัดไหน เพราะอะไร ก่อนลงมือ
4. **ลงมือ** — แก้ทีละจุด ชัดเจน ไม่แก้สะเปะสะปะ
5. **Verify** (ข้อ 0.3) — typecheck + build + อ่าน diff + คิด edge cases
6. **Commit + Push + PR** (ข้อ 0)
7. **รายงาน** — สั้น กระชับ ใจความ ระดับมืออาชีพ

**ทำงานเหมือนวิศวกรระดับโลก** — คิดรอบคอบ ลงมือชัดเจน ตอบสั้น เอาแต่เนื้อหาสำคัญ ไม่บรรยายซ้ำ ไม่เกริ่นยาว ไม่สรุปท้ายซ้ำสิ่งที่ user เห็นใน diff/URL อยู่แล้ว · 1-3 บรรทัดพอเป็นมาตรฐาน เกินนั้นเฉพาะตอนต้องอธิบาย root cause หรือ trade-off จริง

### 0.2 เนื้อหาทางการแพทย์ — ต้องระวังเป็นพิเศษ

คลินิกนี้ให้บริการหัตถการทางการแพทย์ (ฟิลเลอร์ โบท็อกซ์ ฯลฯ) ที่อยู่ภายใต้การกำกับของ พ.ร.บ.สถานพยาบาล และประกาศ อย./สบส. เรื่องการโฆษณา:

- ห้ามอ้างสรรพคุณเกินจริงหรือรับประกันผลลัพธ์ ("หายขาด", "การันตี 100%")
- ห้ามใช้คำที่เข้าข่ายโฆษณาเกินจริงตามประกาศกระทรวงสาธารณสุข
- ราคาที่แสดงต้องระบุให้ชัดว่าเป็นราคาโปรโมชั่นหรือราคาปกติ พร้อมช่วงเวลาที่ใช้ได้ ถ้าเป็นราคาโปรโมชั่น
- แสดงเลขใบอนุญาตสถานพยาบาล (`site.license`) ในหน้า footer/about เสมอ — ห้ามลบ
- ก่อนเผยแพร่ข้อความทางการตลาดใหม่ ให้ user (เจ้าของคลินิก/แพทย์) รีวิวเนื้อหาก่อน ไม่ publish เนื้อหาทางการแพทย์เองโดยไม่ผ่านการตรวจ

### 0.3 Pre-push verification — บังคับทุกครั้ง

ก่อน commit/push **ต้อง** ตรวจให้ครบ:

- [ ] `pnpm typecheck` ผ่าน
- [ ] `pnpm build` ผ่าน (static params ของ `/[category]` ต้อง generate ครบทุก slug ใน `lib/services.ts`)
- [ ] `git status` — ไม่มีไฟล์ untracked แปลกปลอม (`.DS_Store`, `* 2.*`, ฯลฯ) ก่อน push
- [ ] อ่าน diff ของตัวเอง (`git diff`) — ตรรกะถูก, ไม่มี debug code/log ค้าง
- [ ] ถ้าแตะ SEO/metadata/ราคา/บริการ → เช็ค Checklist ข้อ 10 และข้อ 0.2
- [ ] รายงานสั้น กระชับ — บอกสาเหตุจริง + วิธีแก้ + ผลกระทบ

### 0.4 Design authority — อนุญาตให้ออกแบบเอง

เมื่องานเกี่ยวกับ UI/UX ("ไม่สวย", "ปรับแต่ง", "ออกแบบ", "ดูตึง"):

- **ใช้ความสามารถออกแบบของ Claude ได้เต็มที่** — ไม่ต้องถามก่อนทุก step
- เรียก skill `anthropic-skills:frontend-design` เมื่อเหมาะ (สร้าง component, page, หรือ overhaul ครั้งใหญ่)
- ตัดสินใจเรื่อง spacing / typography / color / layout / motion ได้เอง โดยอิงโทนสีที่มีในโปรเจกต์: `#4B5740` olive (primary), `#333C2B` olive-deep, `#7C8A68` olive-light, `#F4F2EA` sand (background), `#1E211B` ink (text), `#06C755` LINE — ค่าจริงอยู่ใน `@theme`/`:root` ของ [app/globals.css](app/globals.css) (Tailwind v4 ไม่มี `tailwind.config.ts` แล้ว ห้ามสร้างไฟล์นั้นกลับมา)
- สไตล์แบรนด์: มินิมอล ญี่ปุ่น สงบ (ดู [lib/site.ts](lib/site.ts) tagline: "Where balance purity becomes eternal beauty" / 純粋さは永遠の美へ)
- ห้ามทำแค่ "ลด padding ให้พอผ่าน" — ถ้าจุดนั้นดูไม่ดี ให้คิดใหม่ทั้ง section
- กฎเดิม (§0.1, §0.3, §0 auto-merge) ยังบังคับใช้

### 0.4.1 UI component library — shadcn/ui บน Base UI (ไม่ใช่ Radix)

โปรเจกต์นี้ใช้ shadcn CLI เวอร์ชันที่ generate component บน **Base UI** (`@base-ui/react`) ไม่ใช่ Radix UI แบบที่คุ้นเคยจาก tutorial ทั่วไป — จุดต่างที่สำคัญที่สุด:

- **ไม่มี `asChild` prop** — Base UI ใช้ prop `render` แทน ต้องเขียนแบบนี้:

  ```tsx
  // ✓ ถูก — Base UI pattern
  <Button render={<a href="/foo" target="_blank" rel="noopener" />}>ข้อความ</Button>

  // ✗ ผิด — Radix asChild pattern ใช้ไม่ได้กับ component library นี้
  <Button asChild><a href="/foo">ข้อความ</a></Button>
  ```

  ใช้แบบเดียวกันกับ `SheetTrigger`, `SheetClose`, และ Base UI primitive อื่นทุกตัวใน `components/ui/`
- เพิ่ม component ใหม่ด้วย `npx shadcn@latest add <name>` — ห้ามเขียน component เองโดยไม่เช็ค registry ก่อน (จะได้ API ที่ไม่ตรงกับที่มีอยู่)
- ห้ามรัน `npx shadcn@latest init` ซ้ำ — จะ overwrite `app/globals.css`/`app/layout.tsx` ทับสี brand และฟอนต์ Thai ที่ตั้งไว้ (ครั้งก่อนมันเคยใส่ font `Geist` ทับ `Noto Sans Thai` มาแล้ว ทำให้ข้อความไทยพังเงียบ ๆ)

### 0.4.2 Cloudflare Workers runtime — ห้ามใส่ `export const runtime = 'edge'`

`@opennextjs/cloudflare` (adapter ที่ deploy โปรเจกต์นี้) ต้องใช้ **Node.js runtime** (ผ่าน `nodejs_compat` flag ใน [wrangler.jsonc](wrangler.jsonc)) — ต่างจาก `@cloudflare/next-on-pages` ที่บังคับ Edge runtime

- **ห้ามใส่** `export const runtime = 'edge';` ในหน้า Page หรือ Route Handler ใด ๆ — จะขัดกับ adapter และพังตอน build/deploy
- ทั้ง Worker รันที่ edge ของ Cloudflare อยู่แล้วโดยธรรมชาติ ไม่ต้องประกาศ runtime เพิ่ม ปล่อย default ไว้

### 0.5 Lessons learned — กฎจากความผิดพลาดจริง

อ่านส่วนนี้ทุกครั้งก่อนเริ่มงาน (ยังไม่มีบันทึก — โปรเจกต์เพิ่งเริ่ม)

<!-- รูปแบบ: - YYYY-MM-DD — สิ่งที่พลาด → กฎใหม่ -->

---

## 1. URL conventions — **ห้ามมี trailing slash**

มาตรฐานของไซต์นี้คือ **ไม่มี trailing slash** ทุกที่ (Next.js default)

### ถูก ✓

```tsx
<Link href="/filler">
<Link href={`/${service.slug}`}>
alternates: { canonical: `${site.url}/filler` }
```

### ผิด ✗

```tsx
<Link href="/filler/">
alternates: { canonical: `${site.url}/filler/` }
```

### ข้อยกเว้นเดียว

หน้าแรกใช้ `/` ตัวเดียวเสมอ (root path ไม่ใช่ trailing slash) — ใน sitemap ใช้ `${base}/` สำหรับหน้าแรกเท่านั้น

### ทำไม

Google มอง `/filler` กับ `/filler/` เป็น 2 URL ต่างกัน → duplicate content ตรงกับ Next.js/Cloudflare default

---

## 2. Canonical URLs

ทุกหน้าต้องมี canonical ที่ตรงกับ URL จริง — **ห้ามมี trailing slash**

```tsx
export const metadata: Metadata = {
  alternates: { canonical: `${site.url}/about` },
};
```

หน้า dynamic (`app/[category]/page.tsx`) ใช้ `generateMetadata` — canonical และ `openGraph.url` ต้องตรงกัน

---

## 3. JSON-LD / Schema.org rules

### 3.1 MedicalBusiness อยู่ที่ root layout เท่านั้น

`clinicSchema` ใน [lib/schema.ts](lib/schema.ts) ถูก inject ผ่าน root layout ทุกหน้า มี `@id: ${site.url}/#business`

**ห้าม** เขียน `MedicalBusiness`/`HealthAndBeautyBusiness` ซ้ำในหน้าอื่น — ใช้ `@id` ref แทน:

```ts
provider: { '@id': `${site.url}/#business` }   // ✓ ถูก
```

### 3.2 FAQ schema มีได้ที่เดียว

**FAQ schema (`@type: FAQPage`) อยู่ที่ home page เท่านั้น** ห้ามใส่ในหน้า service category หรือ about/contact

### 3.3 ItemList สำหรับหน้า service category

ทุก slug ใน `lib/services.ts` (`/filler` `/botox` `/iv-drip` `/skin-booster` `/collagen-booster`) ต้องมี `ItemList` schema ผ่าน `serviceItemListSchema()` — เพิ่มบริการใหม่ในหมวดเดิม แก้ที่ `lib/services.ts` เท่านั้น schema จะอัปเดตอัตโนมัติ

### 3.4 BreadcrumbList

หน้าที่ลึกกว่า 1 ระดับต้องมี `BreadcrumbList` (service category, about, contact) — ใช้ `breadcrumbSchema()` จาก `lib/schema.ts`

### 3.5 ราคาใน schema

`Offer.price` ใน `serviceItemListSchema` ดึงจาก `item.priceFrom` ใน `lib/services.ts` โดยตรง — ถ้าราคาเปลี่ยนแก้ที่ไฟล์นั้นที่เดียว ห้าม hardcode ราคาซ้ำในหน้า component

### 3.6 URL ใน JSON-LD

ใช้รูปแบบเดียวกับ canonical — ไม่มี trailing slash

---

## 4. Sitemap rules — [app/sitemap.ts](app/sitemap.ts)

- ทุก URL ต้อง **ไม่มี trailing slash** (ยกเว้นหน้าแรก `${base}/`)
- เพิ่มบริการใหม่ → เพิ่มใน `lib/services.ts` ก่อน sitemap จะ generate ให้อัตโนมัติจาก `serviceCategories`
- เพิ่มหน้า static ใหม่ (เช่น `/promotion`, `/doctor`) → เพิ่มใน `staticUrls` array ด้วยตนเอง
- `priority`: home 1.0, service category 0.9, about/contact 0.6

---

## 5. robots.ts — [app/robots.ts](app/robots.ts)

- `disallow: ['/admin', '/admin/', '/api/']` — ห้ามแก้ออก
- **ห้ามใส่** `host` directive (Yandex-only)
- **ห้ามใส่** `crawl-delay`

---

## 6. OpenGraph / Twitter card

- root layout ตั้ง default OG/Twitter ([app/layout.tsx](app/layout.tsx))
- หน้า service category ต้องมี OG image เฉพาะของหมวดนั้น (field `ogImage` ใน `lib/services.ts`) ไม่ใช้ของหน้าแรกซ้ำ
- ขนาดมาตรฐาน: **1200×630** (1.91:1)

---

## 7. Internal links — Next.js `<Link>`

- ใช้ `<Link>` จาก `next/link` ทุกครั้งสำหรับลิงก์ภายใน — `href` ห้ามมี trailing slash
- ลิงก์ภายนอก (LINE, Instagram, Facebook) ใช้ `<a target="_blank" rel="noopener">` เสมอ

---

## 8. Images / Accessibility

- Logo: `alt="Kazumi Clinic"` เสมอ
- รูปประกอบเนื้อหา: `alt` บรรยายสิ่งที่เห็นจริง ไม่ใช่ keyword stuffing
- รูปตกแต่งล้วน: `alt=""` + `aria-hidden="true"`
- LCP image (hero): ใช้ `priority` + `fetchPriority="high"` ผ่าน `next/image`
- รูปอื่น: `loading="lazy"`

---

## 9. Single source of truth

อย่า hardcode ค่าที่อยู่ใน data files แล้ว — import แทน:

| ข้อมูล                                     | ที่อยู่                             |
| ------------------------------------------ | ------------------------------------ |
| ชื่อร้าน, เบอร์, ที่อยู่, เวลาทำการ, social | [lib/site.ts](lib/site.ts)           |
| หมวดบริการ + ราคา                          | [lib/services.ts](lib/services.ts)   |
| MedicalBusiness JSON-LD + schema helpers   | [lib/schema.ts](lib/schema.ts)       |
| สี/ฟอนต์ของแบรนด์ (CSS variables)          | [app/globals.css](app/globals.css)   |

เพิ่มบริการ/หมวดใหม่ → แก้ `lib/services.ts` → sitemap + schema + หน้า listing generate อัตโนมัติ

---

## 10. Checklist ก่อน commit งาน SEO

- [ ] ไม่มี trailing slash ใน `href`, `canonical`, `url` ของ JSON-LD, sitemap
- [ ] หน้าใหม่มี `canonical`, `openGraph`, JSON-LD ที่เหมาะกับประเภทหน้า
- [ ] ถ้าเป็นหน้า service listing — มี `ItemList`
- [ ] ถ้าหน้าอยู่ลึกกว่า 1 ระดับ — มี `BreadcrumbList`
- [ ] รูป OG เฉพาะของหน้านั้น
- [ ] เพิ่ม URL/service ใหม่ใน `lib/services.ts` (sitemap อ่านจากตรงนี้)
- [ ] `pnpm typecheck` ผ่าน
- [ ] เนื้อหาทางการแพทย์ผ่านการตรวจตามข้อ 0.2

---

## 11. Cloudflare / OpenNext — ข้อควรระวัง

- `open-next.config.ts` ต้องมี `queue: doQueue` และ `tagCache: d1NextTagCache` เสมอ — ถ้าปล่อย default จะได้ dummy queue ที่ throw `"Dummy queue is not implemented"` ตอน revalidate พื้นหลัง ทำให้หน้า stale ไม่มีวัน regenerate (ดู [open-next.config.ts](open-next.config.ts))
- Binding ที่ต้องมีใน [wrangler.jsonc](wrangler.jsonc) คู่กัน: `NEXT_CACHE_DO_QUEUE` (Durable Object), `NEXT_INC_CACHE_R2_BUCKET` (R2), `NEXT_TAG_CACHE_D1` (D1) — ก่อน deploy จริงต้องรัน `wrangler r2 bucket create` และ `wrangler d1 create` แล้วแทนที่ placeholder id ในไฟล์นี้
- งานที่แตะ cache/ISR/revalidation — verify ที่ runtime observability (`wrangler tail`) เสมอ ไม่ใช่แค่ HTTP 200 — async error จาก background revalidation ไม่โผล่ใน response

---

## 12. สิ่งที่ AI **ห้ามทำ** เด็ดขาด

- ❌ เพิ่ม trailing slash กลับเข้าไป
- ❌ ใส่ FAQ schema บนหน้าที่ไม่ใช่ home
- ❌ ทำ `MedicalBusiness` JSON-LD ซ้ำในหน้าอื่น — ใช้ `@id` ref เท่านั้น
- ❌ ลบ `disallow: /admin` ออกจาก robots.ts
- ❌ ใส่ `host` directive กลับเข้า robots.ts
- ❌ ใช้ OG image ของหน้าแรกซ้ำในทุกหน้า
- ❌ Hardcode ชื่อคลินิก เบอร์ ที่อยู่ ราคา — import จาก `lib/site.ts` / `lib/services.ts` เท่านั้น
- ❌ ลบ `@id: ${site.url}/#business` ออกจาก clinicSchema
- ❌ ลบเลขใบอนุญาตสถานพยาบาลออกจาก footer/about
- ❌ อ้างสรรพคุณทางการแพทย์เกินจริงหรือรับประกันผลลัพธ์ (ดู §0.2)
- ❌ ปล่อย `open-next.config.ts` ไม่มี `queue`/`tagCache` override ก่อน deploy จริง
- ❌ ใส่ `export const runtime = 'edge'` ในหน้า/route ใด ๆ (ขัดกับ `@opennextjs/cloudflare`, ดู §0.4.2)
- ❌ ใช้ prop `asChild` กับ component ใน `components/ui/` — ต้องใช้ `render` (ดู §0.4.1)
- ❌ รัน `npx shadcn@latest init` ซ้ำ หรือสร้าง `tailwind.config.ts` กลับมา (Tailwind v4 ใช้ `@theme` ใน `app/globals.css`)

---

## ประวัติการตัดสินใจ

- **2026-07-09**: Scaffold โปรเจกต์เริ่มต้น — Next.js App Router + Tailwind + Cloudflare Workers/OpenNext (D1 + R2 + DO queue), convention พอร์ตมาจาก littlesmileflower v2 CLAUDE.md ปรับให้เข้ากับ MedicalBusiness/คลินิกความงาม
