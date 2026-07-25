# Design system — Kazumi Clinic

เอกสารนี้คือ source of truth ของงาน UI คู่กับ token จริงใน [app/globals.css](../app/globals.css) · ทวนกับ implementation บน `origin/main` เมื่อ **2026-07-25**

> ⚠️ **ค่าสี/รูปทรงในเอกสาร ห้ามเชื่อโดยไม่เปิด `app/globals.css`** — ไฟล์นั้นคือค่าจริง เอกสารนี้บอกว่า *ใช้ token ไหนตอนไหน* · เคยเกิดแล้ว: เอกสารค้างค่า olive ยุคแรก (`#4D573E`) อยู่หลายเดือนหลังไซต์ถูก re-tone ทั้งหมด

## ไซต์ผ่านมาแล้ว 2 ยุค — อย่าสับสน

| ยุค | หน้าตา | สถานะ |
| --- | --- | --- |
| **1. Japanese Editorial (2026-07 ต้นเดือน)** | earthy olive/sand/cream, มุมเหลี่ยม, EB Garamond | ⚠️ เหลือแค่ *โครงและจังหวะ* (Ma, asymmetry, 1.618) — ค่าสี/มุมถูกแทนแล้ว |
| **2. Apple-style light + green action (ปัจจุบัน)** | พื้นขาว/เทา `#f5f5f7`, ตัวหนังสือ near-black `#1d1d1f`, เขียว `forest`/`mint` เป็นสี action, มุมมนจริง | ✅ ของจริงบนเว็บตอนนี้ |

ชื่อ token เดิม (`olive`, `sand`, `cream`) **ถูกใช้ต่อแต่ค่าถูก remap** เป็น Apple neutrals — จงใจ เพื่อ re-tone ทั้งไซต์จากที่เดียวโดยไม่ต้องไล่แก้ทุก component · แปลว่า **ชื่อคลาสไม่ได้บอกสีอีกต่อไป** ต้องเปิดดูค่าจริง

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

ใช้ semantic token ของโปรเจกต์ก่อน hex เสมอ · ค่าด้านล่างคัดจาก `:root` ใน [app/globals.css](../app/globals.css) (2026-07-25):

| บทบาท | Token | ค่าจริงตอนนี้ |
| --- | --- | --- |
| ตัวหนังสือหลัก / โครงเข้ม | `ink`, `olive-deep` | `#1d1d1f` |
| ตัวหนังสือรอง | `olive` | `#6e6e73` |
| ตัวหนังสือจาง / meta | `olive-light` | `#86868b` |
| พื้นรอง (section, การ์ดจม) | `sand` | `#f5f5f7` |
| พื้นยก (การ์ด, พื้นหลักของหน้า) | `cream` | `#ffffff` |
| เส้นขอบ | `border` / `input` | `#d2d2d7` |
| **สี action หลัก** (ปุ่มหลัก, LINE) | `mint` = `line` | `#06c755` |
| เขียวเข้ม (hover, heading เน้น, พื้นเข้ม) | `forest` | `#006e2b` |
| เขียวอ่อนบนพื้นเข้ม | `mint-glow` | `#3ee26c` |
| สีแพลตฟอร์ม (ใช้เฉพาะไอคอน/ปุ่มของแพลตฟอร์มนั้น) | `instagram` `#ff0069` · `facebook` `#0866ff` · `google-blue` `#4285f4` | — |

- `mint` กับ `line` เป็นค่าเดียวกันโดยตั้งใจ — ปุ่มหลักกับปุ่ม LINE ไม่แยกสีแล้ว
- Display/headline: **EB Garamond**, weight 400–500, line-height กระชับ
- Body/label ภาษาไทย: **Noto Sans Thai**, line-height ประมาณ 1.618
- Eyebrow/label ภาษาอังกฤษใช้ตัวเล็กและ letter spacing กว้างอย่างพอดี
- ห้ามเปลี่ยนกลับเป็น Geist หรือฟอนต์ Latin-only เพราะข้อความไทยจะ fallback แบบควบคุมไม่ได้
- ห้าม hardcode hex ใน component — ถ้าต้องการเฉดใหม่ ให้เพิ่ม token ใน `:root` + `@theme` แล้วค่อยใช้

## Layout, spacing และรูปทรง

- ใช้ 8px base unit และจังหวะใกล้ลำดับ 5 / 13 / 21 / 34 / 55 / 89px
- Desktop ใช้ 12-column fluid grid และขอบข้างกว้าง; tablet 8 columns; mobile เป็น single column
- Mobile side margin เป้าหมายประมาณ 21px; implementation ใช้ `px-6` ได้เมื่อสอดคล้องกับ section รอบข้าง
- สัดส่วนหลักคือ 1:1.618 ทั้ง image card, column relationship และ vertical rhythm
- **มุมมน** ตามยุคปัจจุบัน: `--radius: 0.75rem` เป็นค่ากลาง · การ์ดใหญ่ใช้ `rounded-[1.75rem]`/`rounded-2xl`/`rounded-3xl` · control กลม (avatar, ปุ่มไอคอน, chip) ใช้ `rounded-full` · **เลือกจากขนาดกล่อง ไม่ใช่จากรสนิยมรายหน้า** — กล่องใหญ่ radius ใหญ่ กล่องเล็ก radius เล็ก เพื่อให้เส้นโค้งดูสม่ำเสมอทั้งไซต์
- ใช้ border 1px สี `border` (`#d2d2d7`) หรือ tonal surface แทนเงาหนัก; เงาใช้ได้เบา ๆ เฉพาะ element ที่ลอยจริง (modal, popover)
- ห้ามประคอง layout ด้วย `min-h`/`padding` หลายสิบ rem หรือ absolute positioning ที่ทำหน้าที่เป็น spacer; section ต้องอยู่ใน normal document flow

## Component rules

- Primary button: พื้น `mint`/`forest`, ตัวอักษรขาว, มุมมนตามขนาดปุ่ม
- Secondary button: border `border`, พื้นโปร่ง/ขาว, ตัวอักษร `ink`
- ปุ่มชุดเดียวกัน (ตะกร้า/ซื้อเลย/LINE) ใช้ [components/service-item-actions.tsx](../components/service-item-actions.tsx) — **ห้ามเขียนปุ่มเองรายหน้า** (เคยทำให้ 9 หมวดมีปุ่มคนละแบบ คนละภาษา)
- Cards: เงาเบาหรือไม่มีเงา; แบ่งด้วย tonal surface, เส้นบาง หรือ left rule
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

[app/(site)/[locale]/services/page.tsx](<../app/(site)/[locale]/services/page.tsx>) ใช้โครง normal flow นี้:

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

## ข้อความบน UI — เว็บเป็น 2 ภาษา

ทุกหน้าสาธารณะอยู่ใต้ `app/(site)/[locale]/*` (ไทย = path เปล่า, อังกฤษ = `/en...`)

- ข้อความบน UI ต้องมาจาก [messages/th.json](../messages/th.json) + [messages/en.json](../messages/en.json) ผ่าน `useTranslations()` / `getTranslations()` — **ห้าม hardcode ข้อความไทยใน component ใหม่**
- เพิ่ม key ต้องเพิ่ม **ทั้งสองไฟล์** ในคอมมิตเดียว ไม่งั้นหน้า `/en` จะโชว์ key ดิบ
- เนื้อหา catalogue (ชื่อหมวด/โปรแกรม) อยู่ใน `lib/services.ts` ซึ่งมีคู่ `titleEn` อยู่แล้ว — ใช้จากตรงนั้น อย่าแปลซ้ำใน messages
- ออกแบบเผื่อ **ความยาวข้อความต่างกัน**: อังกฤษมักยาวกว่าไทย 20–40% ปุ่ม/การ์ดต้องไม่ล้นเมื่อสลับภาษา

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
- **ตรวจหน้าเดียวกันทั้ง `/` และ `/en`** — ข้อความอังกฤษยาวกว่ามักทำปุ่ม/การ์ดล้นเป็นที่แรก
- ถ้าแก้รูป ตรวจ page + OG + Twitter + JSON-LD + admin override + revalidation ตาม [images.md](./images.md)
- เทียบค่าสี/มุมที่ใช้กับ `app/globals.css` จริง ไม่ใช่กับตารางในเอกสารนี้ (เอกสารเคยค้างมาแล้ว)
