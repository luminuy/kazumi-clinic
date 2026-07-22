# AI Agents — Kazumi Clinic

ไฟล์นี้เป็น entrypoint สำหรับ Codex และ agent อื่นที่อ่าน `AGENTS.md` อัตโนมัติ กฎฉบับเต็มเก็บในเอกสาร tracked ชุดเดียวเพื่อไม่ให้สำเนาหลายไฟล์ drift คนละทิศ

## ต้องอ่านก่อนลงมือ

1. อ่าน [CLAUDE.md](CLAUDE.md) **ทั้งไฟล์** — workflow, medical compliance, SEO, lessons learned และข้อห้าม
2. อ่าน [docs/infrastructure.md](docs/infrastructure.md) เมื่อแตะ deploy, Cloudflare, cache, D1, Access, domain หรือรายงานสถานะ production
3. อ่าน [docs/images.md](docs/images.md) เมื่อแตะรูป, `/admin`, Cloudinary, metadata, JSON-LD หรือ revalidation
4. อ่าน [docs/design.md](docs/design.md) เมื่อแตะ UI/UX, layout, styling, responsive หรือหน้า Services

ถ้าเอกสารขัดกับ implementation ให้ตรวจ `origin/main` และ source files จริง (`package.json`, `open-next.config.ts`, `wrangler.jsonc`, `lib/services.ts`, `lib/site-images.ts`) ก่อนสรุป แล้วแก้เอกสารที่ล้าสมัยใน PR เดียวกัน

## กฎ fail-safe ที่ห้ามข้าม

- Fetch และระบุ ref ก่อน audit; ห้ามเรียกไฟล์บน branch ค้างว่า “main ล่าสุด”
- สำรวจก่อนแก้ วางแผน แล้ว verify ด้วย `pnpm lint` + `pnpm typecheck` + `pnpm build` + อ่าน diff
- Stage เฉพาะไฟล์งาน, commit, push, เปิด PR และ merge ตาม [CLAUDE.md](CLAUDE.md) §0
- **CRITICAL DEPLOY RULE**: ห้ามรัน `pnpm cf:deploy` จาก local branch ที่ยังไม่ถูก merge โดยเด็ดขาด ขั้นตอนที่ถูกต้องคือ: 1. Push เข้า branch 2. เปิด PR 3. รอ CI ผ่านแล้ว Merge 4. กลับมาที่ main แล้วรัน `git pull --rebase` เสมอ เพื่อรับโค้ดที่ merge แล้ว 5. ค่อยสั่ง `pnpm cf:deploy` เพื่อป้องกันโค้ดเก่าทับโค้ดใหม่บนหน้าเว็บจริง (เคยเกิดปัญหาปุ่มกลับเป็นสีขาวมาแล้ว)
- Repo ไม่มี CI/CD; merge ไม่ deploy งาน public site/Worker ต้องรัน `pnpm cf:deploy` หลัง merge เสร็จ และตรวจ `Current Version ID` + HTTP จริง งาน docs-only ไม่ต้อง deploy
- Backend ใช้ Next.js Route Handlers และต้อง Zod-validate ก่อนแตะ DB
- ห้าม `export const runtime = 'edge'`; OpenNext ใช้ Node.js compatibility บน Worker
- shadcn ใช้ Base UI prop `render`; ห้าม Radix `asChild`
- ห้ามสร้าง `tailwind.config.ts` หรือรัน shadcn init ซ้ำ
- URL ภายใน/canonical/JSON-LD ไม่มี trailing slash ยกเว้น root `/`
- MedicalBusiness มีเฉพาะ public site layout; FAQ มีเฉพาะ home; หน้า service ใช้ ItemList/Breadcrumb ตาม [CLAUDE.md](CLAUDE.md)
- ห้าม hardcode ข้อมูลที่มี source of truth ใน `lib/site.ts`, `lib/doctor.ts`, `lib/services.ts`, `lib/promotions.ts`
- ห้ามอ้างสรรพคุณเกินจริงหรือเผยแพร่ข้อความทางการแพทย์ใหม่โดยไม่ผ่านการตรวจของคลินิก/แพทย์
- ห้ามนำรูปเว็บไซต์เข้า `public/`; ใช้ Cloudinary + D1 image slots
- ห้าม module-level `const ogImage` สำหรับรูปที่ admin เปลี่ยนได้; ใช้ async metadata และ slot เดียวกันสำหรับ page/OG/Twitter/JSON-LD
- เพิ่มหรือย้ายจุดใช้รูปต้องอัปเดต exhaustive `REVALIDATION_TARGETS`
- หน้า Services ต้องแสดงครบทุก `serviceCategories`, ใช้โครงใน [docs/design.md](docs/design.md), ไม่ยืมรูปหมวดอื่น และไม่แสดงราคา promo-derived เป็นราคาปกติ
- ทุกข้อความที่รายงานว่า deploy/CI/URL/cache “สำเร็จ” ต้องมีผลคำสั่งจริงรองรับ; ถ้าไม่ได้ตรวจให้เขียนว่าไม่ได้ตรวจ
