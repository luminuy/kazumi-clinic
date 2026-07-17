# Design system — Kazumi Clinic

เอกสารนี้นำ design brief “Japanese Editorial Luxury” เข้ามาอยู่ใน repo และปรับให้ตรงกับ implementation บน `origin/main` วันที่ 2026-07-17 ใช้เป็น source of truth สำหรับงาน UI ร่วมกับ token จริงใน [app/globals.css](../app/globals.css)

## ลำดับอำนาจในการตัดสินใจ

1. รูป reference/screenshot ที่ user ส่ง กำหนด composition และจังหวะของหน้า
2. ไฟล์นี้กำหนดภาษาภาพและกฎ responsive ร่วมกันทั้งไซต์
3. `app/globals.css` กำหนดค่าจริงของสี ฟอนต์ และ reusable classes
4. `lib/site.ts`, `lib/doctor.ts`, `lib/services.ts`, `lib/promotions.ts` กำหนดเนื้อหาจริง ห้ามสร้างข้อมูลทดแทนเพื่อให้ layout ดูเต็ม

ถ้า reference กับข้อมูลจริงไม่พอดีกัน ให้รักษาโครงและอารมณ์ของ reference แล้วปรับจำนวน card/ข้อความตามข้อมูลจริง ห้ามตัดข้อมูลที่มีอยู่เพียงเพื่อให้จำนวน item เท่าตัวอย่าง

## Brand direction

แนวทางคือ **Refined Minimalism with Editorial Influence** หรือ “Quiet Confidence”:

- ใช้ _Ma_ (negative space) ให้แต่ละส่วนมีพื้นที่หายใจ
- วางองค์ประกอบแบบ asymmetrical แต่ยังมีแนว grid ที่ชัด
- สื่อความแม่นยำแบบคลินิกผ่านเส้นบาง มุมเหลี่ยม และ alignment ที่ตั้งใจ
- สร้าง depth ด้วย tonal surfaces/overlap เล็กน้อย ไม่ใช้เงาหนักหรือ glassmorphism
- หลีกเลี่ยงหน้าตา dashboard, card grid สำเร็จรูป และ decoration ที่ไม่มีหน้าที่

## สีและตัวอักษร

ใช้ semantic token ของโปรเจกต์ก่อน hex เสมอ:

| บทบาท | Token/ค่า |
| --- | --- |
| Primary | `olive` / `#4D573E` |
| Deep structure | `olive-deep` / `#3D4E46` |
| Secondary text | `olive-light` / `#7A7A5E` |
| Paper background | `sand` / `#EEE9DF` |
| Raised paper surface | `cream` |
| Main text | `ink` / `#26281F` |
| LINE action only | `line` / `#06C755` |

- Display/headline: **EB Garamond**, weight 400–500, line-height กระชับ
- Body/label ภาษาไทย: **Noto Sans Thai**, line-height ประมาณ 1.618
- Eyebrow/label ภาษาอังกฤษใช้ตัวเล็กและ letter spacing กว้างอย่างพอดี
- ห้ามเปลี่ยนกลับเป็น Geist หรือฟอนต์ Latin-only เพราะข้อความไทยจะ fallback แบบควบคุมไม่ได้

## Layout, spacing และรูปทรง

- ใช้ 8px base unit และจังหวะใกล้ลำดับ 5 / 13 / 21 / 34 / 55 / 89px
- Desktop ใช้ 12-column fluid grid และขอบข้างกว้าง; tablet 8 columns; mobile เป็น single column
- Mobile side margin เป้าหมายประมาณ 21px; implementation ใช้ `px-6` ได้เมื่อสอดคล้องกับ section รอบข้าง
- สัดส่วนหลักคือ 1:1.618 ทั้ง image card, column relationship และ vertical rhythm
- UI หลักใช้มุมเหลี่ยม (`rounded-none`/ไม่ใส่ radius) ปุ่มและ input ไม่ทำเป็น pill ยกเว้น control ที่มีเหตุผลเชิง interaction อยู่แล้ว
- ใช้ border 0.5–1px สี olive opacity ต่ำแทน box shadow
- ห้ามประคอง layout ด้วย `min-h`/`padding` หลายสิบ rem หรือ absolute positioning ที่ทำหน้าที่เป็น spacer; section ต้องอยู่ใน normal document flow

## Component rules

- Primary button: พื้น olive-deep, ตัวอักษร sand, มุมเหลี่ยม
- Secondary button: border olive-deep, พื้นโปร่ง, มุมเหลี่ยม
- Cards: ไม่มีเงา; แบ่งด้วย tonal surface, เส้นบาง หรือ left rule
- Lists: ใช้เส้นสั้น/จุดสี olive ที่ออกแบบเอง ไม่ใช้ bullet มาตรฐานเมื่อเป็นส่วน editorial
- Navigation: spacing กว้าง ตัวอักษร label ชัด และทุก internal link ใช้ Next.js `<Link>`
- shadcn ของโปรเจกต์เป็น Base UI: ใช้ prop `render`; ห้ามใช้ Radix `asChild`

## Imagery

- ภาพต้องมาจาก image slot/Cloudinary ตาม [images.md](./images.md); ห้ามใส่ไฟล์ใหม่ใน `public/`
- Alt text ต้องบรรยายสิ่งที่เห็นจริง ห้ามเดาจากชื่อไฟล์หรือชื่อหัตถการ
- ถ้าหมวดบริการยังไม่มีรูปจริง ให้แสดง tonal panel + `ServiceIcon`; ห้ามยืมรูปหมวดอื่นมาใส่และเขียน alt ให้ดูเหมือนตรงหมวด
- Hero ที่เป็น LCP ใช้ `priority` และ `fetchPriority="high"`; รูปอื่น lazy load
- รูป default ที่มีข้อความ/โลโก้ฝังอาจมี crop เฉพาะ asset นั้น ห้ามนำ crop เดิมไปใช้กับรูปที่ admin อัปใหม่

## หน้า Services — โครงปัจจุบันที่ต้องรักษา

[app/(site)/services/page.tsx](<../app/(site)/services/page.tsx>) ใช้โครง normal flow นี้:

1. **Hero** — breadcrumb, eyebrow “Clinical Services”, `<h1>` “Treatment Atlas”, คำอธิบาย, CTA และภาพ slot `hero-iv-drip-2`
2. **Treatment Atlas** — render `serviceCategories` ครบทั้ง 9 หมวด; รูปมีเฉพาะหมวดที่มี hero จริง ที่เหลือเป็น icon panel
3. **Doctor-led Assessment** — ข้อมูลจาก `lib/doctor.ts`, รูป slot `doctor-pratch`, แสดงเลขใบประกอบวิชาชีพและเลขใบอนุญาตสถานพยาบาล
4. **Curated Promotions** — ใช้ `PromotionCarousel` และ poster override จาก `lib/promotions.ts`/`posterKeyByDefaultId`; ต้องมีข้อความให้สอบถามราคาและช่วงเวลา
5. **Visit Kazumi** — ที่อยู่ เวลา เบอร์ แผนที่จาก `lib/site.ts`

ข้อบังคับของหน้านี้:

- มี `<h1>` เดียว
- แสดงครบทุกหมวดที่อยู่ใน `serviceCategories`; ห้าม hardcode รายชื่อ featured เพียงบางหมวดแทน catalogue
- ไม่แสดงราคาบนหน้ารวม เพราะบางราคายังเป็น promo-derived/unconfirmed
- มี `ItemList` ครบทุกหมวดและ `BreadcrumbList`; ไม่มี FAQ หรือ MedicalBusiness ซ้ำ
- OG/Twitter ใช้ `hero-iv-drip-2` slot เดียวกับ hero จริง
- สี section ใช้ `sand`/`cream`/olive tokens ไม่ hardcode เฉดที่ใกล้เคียงกันเอง

## Motion และ accessibility

- Motion ใช้เพื่อบอกลำดับและ feedback เท่านั้น; duration สั้นและ easing นุ่ม
- เคารพ `prefers-reduced-motion`; component ที่ scroll programmatically ต้องมี reduced-motion fallback
- Focus state ต้องมองเห็นได้ด้วย keyboard
- Text contrast ต้องอ่านได้บน sand/cream; อย่าใช้ opacity ต่ำกับ body copy สำคัญ
- Decorative image/icon ใช้ `alt=""` และ `aria-hidden="true"`; semantic image ต้องมี alt จริง
- ตรวจ horizontal overflow ที่ 375px และ layout desktop อย่างน้อยหนึ่ง viewport ก่อน ship

## Visual QA ก่อนจบงาน

- เทียบ reference ทั้ง silhouette, sequence, whitespace, typography และ image ratio ไม่ใช่ดูแค่สี
- ตรวจ mobile/desktop และเนื้อหาที่สั้น-ยาวกว่าตัวอย่าง
- ตรวจว่าข้อมูลครบตาม source of truth และไม่มีข้อความ/ราคา/รูปที่แต่งขึ้น
- ตรวจ `<h1>`, landmark, keyboard focus, alt text และ reduced motion
- ถ้าแก้รูป ตรวจ page + OG + Twitter + JSON-LD + admin override + revalidation ตาม [images.md](./images.md)
