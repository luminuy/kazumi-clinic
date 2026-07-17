# รูปภาพทำงานยังไง — Kazumi Clinic

อ่านหน้านี้ก่อนแตะรูปทุกครั้ง · ตรวจกับระบบจริงแล้ว 2026-07-17

## กฎข้อเดียวที่สำคัญที่สุด

> **ห้ามเอาไฟล์รูปใส่ `public/` เด็ดขาด**

ไฟล์ใน `public/` ถูก **build ติดไปกับโค้ด** → คลินิก**เปลี่ยนเองผ่าน /admin ไม่ได้** ต้องแก้โค้ดแล้ว deploy เท่านั้น

เรื่องนี้เกิดมาแล้ว **2 รอบ** และต้องตามเก็บทั้งคู่:

1. รูปคุณหมอ + โปสเตอร์โปรฯ 7 ใบ → ย้ายขึ้น Cloudinary ใน PR #38
2. `kazumi-logo.jpg` / `kazumi-mark.jpg` → ถูกใส่กลับเข้า `public/` แล้ว Header/Footer ก็เปลี่ยนไปอ่านไฟล์นั้น ทำให้ **การ์ด "โลโก้" ใน /admin กลายเป็นของหลอก — กดเปลี่ยนแล้วไม่มีอะไรเกิดขึ้น** → ย้ายขึ้น Cloudinary ใน PR #45

**ถ้าจำเป็นต้องมีไฟล์ baked-in จริง ๆ** ให้ใส่ใน `bakedInImages` ใน [lib/site-images.ts](../lib/site-images.ts) เพื่อให้ /admin บอก user ตรง ๆ ว่าอันนี้แก้ไม่ได้ **อย่าปล่อยให้ /admin โกหก**

---

## ทางเดินของรูป (end-to-end)

```
คลินิกกดเปลี่ยนรูปที่ /admin
        ↓ POST /api/admin/images (multipart)
middleware.ts — verify Access JWT ก่อน ไม่ผ่าน = 404
        ↓
route handler — Zod ตรวจ key (ต้องอยู่ใน allowlist) + ไฟล์ (JPG/PNG/WebP/AVIF, ≤10MB)
        ↓
lib/cloudinary-upload.ts — อัปผ่าน unsigned preset จากฝั่ง Worker
        ↓  public id ใหม่ = `<key>-<timestamp>`
D1 ตาราง site_images — upsert ว่า key นี้ live ที่ public id ไหน
        ↓
revalidatePath() เฉพาะหน้าที่ใช้รูปนั้น
        ↓
หน้าเว็บ render ใหม่ → lib/site-images-store.ts อ่าน override จาก D1
```

### ทำไมอัปผ่าน Worker ไม่ให้เบราว์เซอร์ยิงตรงไป Cloudinary

**unsigned preset คือ write credential ของบัญชี** — ใครถือก็อัปไฟล์เข้าบัญชีได้ ถ้าเอาไปไว้ในโค้ดฝั่ง client มันจะโผล่ใน bundle ให้ทุกคนเห็น · จึงต้องอยู่ใน [lib/cloudinary-upload.ts](../lib/cloudinary-upload.ts) ที่มี `import 'server-only'` กำกับ

### ทำไม public id มี timestamp ต่อท้าย

**unsigned upload ทับของเดิมไม่ได้** (Cloudinary บล็อกไว้ — `Overwrite parameter is not allowed when using unsigned upload`) · แต่ละครั้งจึงเขียน id ใหม่ แล้ว **D1 เป็นคนบอกว่าอันไหน live**

ผลพลอยได้ที่ดี: **ของเก่าไม่หาย** → ปุ่ม "คืนรูปเดิม" = ลบแถวใน D1 เฉย ๆ · อัปผิดกู้คืนได้เสมอ

---

## ตาราง `site_images`

| คอลัมน์ | ความหมาย |
| --- | --- |
| `key` | ตรงกับ `SiteImageKey` ใน [lib/site-images.ts](../lib/site-images.ts) |
| `public_id` | Cloudinary public id ที่ live อยู่ |
| `updated_at` | epoch ms |
| `updated_by` | อีเมลจาก Access JWT |

> ⚠️ **`key` เป็นสัญญา** — เปลี่ยนชื่อ key ใน `lib/site-images.ts` = รูปที่คลินิกอัปไว้หลุดกลับไปเป็น default เงียบ ๆ · **เพิ่ม key ได้ ห้ามเปลี่ยนชื่อ**

ไม่มีแถว = เว็บใช้ `defaultPublicId` ที่ compile มากับโค้ด → **ตาราง `site_images` ว่าง = เว็บหน้าตาเหมือนเดิมเป๊ะ**

---

## เพิ่มรูปใหม่ให้ /admin จัดการได้ ต้องทำครบ 5 จุด

1. อัปไฟล์ขึ้น Cloudinary (ดูวิธีข้างล่าง) → ได้ public id
2. เพิ่มใน `cloudAssets` — [lib/cloud.ts](../lib/cloud.ts)
3. เพิ่ม key + entry ใน `siteImages` — [lib/site-images.ts](../lib/site-images.ts)
4. ทำให้ Server Component/metadata ที่ใช้รูปนั้นอ่านผ่าน `getImage()` หรือ `getImageOverrides()` แล้วค่อยส่ง public ID ให้ Client Component
5. เพิ่มทุก path ที่ใช้รูปนั้นใน `REVALIDATION_TARGETS` — [app/api/admin/images/route.ts](../app/api/admin/images/route.ts) (TypeScript จะฟ้องถ้าเพิ่ม key แล้วลืม mapping)

**แล้วต้องทำให้หน้าที่ใช้รูปนั้นอ่าน override ด้วย** ไม่งั้นเปลี่ยนใน admin แล้วเว็บไม่เปลี่ยน:

```tsx
const overrides = await getImageOverrides();
const src = overrides.get('my-key')?.public_id ?? cloudAssets.myDefault;
```

client component ห้าม import override layer เอง — ให้ server component resolve แล้วส่งเป็น prop (ดู `ServiceAtlas`, `PromotionCarousel`)

ถ้ารูปถูกใช้เป็น social preview ให้เรียก `siteSocialImage(key)` ภายใน **async `generateMetadata`** และใช้ URL เดียวกันทั้ง OpenGraph/Twitter ห้ามเขียน `const ogImage = cld(...)` ระดับโมดูล เพราะค่านั้นถูก freeze ตั้งแต่ build

---

## อัปไฟล์ขึ้น Cloudinary ด้วยมือ

**ไม่มี API secret ในโปรเจกต์นี้ และไม่ต้องมี** — ใช้ unsigned preset ของบัญชีเดียวกับ littlesmileflower

```bash
curl -s -X POST "https://api.cloudinary.com/v1_1/dvskwrapm/image/upload" \
  -F "file=@path/to/file.jpg" \
  -F "upload_preset=littlesmileflower" \
  -F "folder=kazumi-clinic" \
  -F "public_id=ชื่อที่ต้องการ"
```

ข้อจำกัด: **ทับ id เดิมไม่ได้** (`overwrite`/`invalidate` ใช้กับ unsigned ไม่ได้) → ถ้าต้องแทนที่ ให้ตั้ง id ใหม่แล้วชี้โค้ดไปที่ใหม่ ของเก่ากลายเป็น orphan ลบใน media library ทีหลังได้

---

## กับดักที่เจอมาแล้ว — อย่าเหยียบซ้ำ

**1. `unoptimized` + Cloudinary public id = 404**
`unoptimized` มีไว้ตอนเป็นไฟล์ใน `public/` ที่ Next เสิร์ฟตรง · พอเป็น public id แล้วยังใส่ next/image จะปล่อย id ดิบเป็น src → พัง · **ย้ายรูปออกจาก public/ ต้องถอด `unoptimized` ทุกที่**

**2. ต่อ URL เองด้วย `${site.url}${...}` = พัง**
`doctorSchema` และ `clinicSchema.logo` เคยทำแบบนี้ตอนค่าเป็น path · พอเป็น public id จะได้ `https://kazumiclinic.com/kazumi-clinic/brand-logo` · **ใช้ `cld()` เสมอ**

**3. `c_limit` ใน loader ห้ามถอด**
next/image ขอ candidate ถึง `w_3840` · ถ้าไม่มี crop mode Cloudinary จะขยายภาพจนเกินลิมิต 25 Megapixel ของบัญชี แล้วตอบ 400 (`hero-filler` 400×1750 → 3840×16800 = 64.5MP) · `c_limit` ทำให้ไม่ขยายเกินขนาดต้นฉบับ

**4. หน้า SSG อ่าน D1 ตอน build แล้วแช่ไว้**
`/[category]` เคยเป็น `generateStaticParams` ที่ไม่มี `revalidate` → เปลี่ยนรูปแล้วไม่ขึ้นตลอดกาล · ตอนนี้ใส่ `revalidate = 3600` เป็น ISR แล้ว · **หน้าไหนอ่าน override ต้อง regenerate ได้**

**5. รูปที่มีตัวหนังสือฝังในภาพ**
`hero-home` มีโลโก้ + คำโปรยฝังอยู่ในไฟล์ฝั่งขวา → หน้าแรกจึงใช้ `heroHomePortrait` ที่ครอปเอาเฉพาะซ้าย (`c_crop,w_1060,h_1080,x_0,y_0`)
**crop box นี้ผูกกับรูปนั้นรูปเดียว** — ถ้าคลินิกอัป hero ใหม่ หน้าแรกจะแสดง**เต็มใบ ไม่ครอป** (ดู `heroSrc` ใน `app/(site)/page.tsx`) เพราะเอา crop เดิมไปใช้กับรูปอื่นจะตัดมั่ว

**6. ไฟล์ต้นทางสลับกันได้**
`velvet-glow.jpg` เก็บภาพ KARISMA ส่วน `karisma-collagen.jpg` เก็บภาพ Velvet Glow — สลับกันมาตั้งแต่ต้นทาง และตอนย้ายขึ้น Cloudinary ก็ย้ายความผิดตามไปด้วย · **เปิดรูปดูด้วยตาก่อนเชื่อชื่อไฟล์**

---

## สถานะระบบ metadata

- OG/Twitter image ทุกหน้าที่มี social preview อ่าน image slot จาก D1 ผ่าน async `generateMetadata`
- หน้า `/services` ใช้ `hero-iv-drip-2` ทั้ง hero, OG และ Twitter; ห้ามย้อนกลับไปใช้ `hero-filler` หรือ homepage default
- `clinicSchema.image` / `clinicSchema.logo` และ `homePageSchema.primaryImageOfPage` อ่าน image slot เดียวกับหน้าเว็บ
- Header/Footer อ่าน `brand-mark` override จริง ไม่ใช่ค่า default ที่ compile ค้างไว้
- `getImageOverrides()` ครอบด้วย React `cache()` เพื่อให้ metadata/layout/page ใน render เดียวกันแชร์ D1 read

## Checklist เมื่อแตะรูป

- [ ] รูปจริงบนหน้าอ่าน override และมี fallback ถูก slot
- [ ] Alt text บรรยายสิ่งที่เห็นหลังเปิดรูปดู ไม่เดาจากชื่อไฟล์
- [ ] OG และ Twitter ใช้ image slot เดียวกับหน้าจริง
- [ ] JSON-LD ที่อ้างรูป/โลโก้รับ resolved public ID ไม่อ่าน default ค้าง
- [ ] Header/Footer อัปเดตด้วยถ้าเป็น brand slot
- [ ] `REVALIDATION_TARGETS` ครบทุกหน้าที่ใช้ slot รวมหน้า `/services`
- [ ] หน้า SSG/ISR มี `revalidate` และทดสอบหลัง admin save/reset
- [ ] Production ตรวจด้วย cache-busting URL; local dev ไม่มี D1/KV จึงพิสูจน์ override ไม่ได้

## ยังไม่ได้ทำ

- `cloudAssets.logo` (`kazumi-clinic/logo`) ไม่มีใครใช้แล้ว — เหลือไว้เฉย ๆ
- id ที่เป็น orphan: `promo-velvet-glow`, `promo-karisma-collagen` (เก็บภาพสลับกัน) — ลบใน media library ได้
