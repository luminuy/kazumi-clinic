# AI Agents — Kazumi Clinic

ไฟล์นี้เป็น entrypoint สำหรับ Codex และ agent อื่นที่อ่าน `AGENTS.md` อัตโนมัติ กฎฉบับเต็มเก็บในเอกสาร tracked ชุดเดียวเพื่อไม่ให้สำเนาหลายไฟล์ drift คนละทิศ

## ต้องอ่านก่อนลงมือ

0. อ่าน [STATUS.md](STATUS.md) — ตอนนี้ถึงไหน, deploy อะไรอยู่, ใครทำอะไรค้าง (จุดส่งไม้ต่อ · อัปเดตมันตอนจบงานด้วย)
1. อ่าน [CLAUDE.md](CLAUDE.md) **ทั้งไฟล์** — workflow, medical compliance, SEO, lessons learned และข้อห้าม
2. อ่าน [docs/infrastructure.md](docs/infrastructure.md) เมื่อแตะ deploy, Cloudflare, cache, D1, Access, domain หรือรายงานสถานะ production
3. อ่าน [docs/images.md](docs/images.md) เมื่อแตะรูป, `/admin`, Cloudinary, metadata, JSON-LD หรือ revalidation
4. อ่าน [docs/design.md](docs/design.md) เมื่อแตะ UI/UX, layout, styling, responsive หรือหน้า Services

ถ้าเอกสารขัดกับ implementation ให้ตรวจ `origin/main` และ source files จริง (`package.json`, `open-next.config.ts`, `wrangler.jsonc`, `lib/services.ts`, `lib/site-images.ts`) ก่อนสรุป แล้วแก้เอกสารที่ล้าสมัยใน PR เดียวกัน

## กฎ fail-safe ที่ห้ามข้าม

- Fetch และระบุ ref ก่อน audit; ห้ามเรียกไฟล์บน branch ค้างว่า “main ล่าสุด”
- สำรวจก่อนแก้ วางแผน แล้ว verify ด้วย `pnpm lint` + `pnpm typecheck` + `pnpm build` + อ่าน diff
- Stage เฉพาะไฟล์งาน, commit, push, เปิด PR และ merge ตาม [CLAUDE.md](CLAUDE.md) §0
- **CRITICAL DEPLOY RULE**: ปกติ **ไม่ต้อง deploy เอง** — CD ทำให้แล้ว (ดูข้อ CD ด้านล่าง) · ห้ามรัน `pnpm cf:deploy` จาก local branch ที่ยังไม่ถูก merge โดยเด็ดขาด และ **ห้าม deploy มือชนกับ CD ที่กำลังรัน** (`wrangler deploy` สองตัวพร้อมกัน = prod ครึ่ง ๆ กลาง ๆ) · ถ้าจำเป็นต้อง deploy มือจริง ๆ: 1. รอ run ของ workflow `Deploy` จบก่อน (`gh run list --workflow=Deploy`) 2. `git switch main` + `git pull --rebase` ให้ได้โค้ดที่ merge แล้ว 3. หยุด `pnpm dev` ทุกตัวที่ใช้ working tree เดียวกัน 4. ค่อย `pnpm cf:deploy` — ไม่งั้นโค้ดเก่าจะทับโค้ดใหม่บนหน้าเว็บจริง (เคยเกิดปัญหาปุ่มกลับเป็นสีขาวมาแล้ว)
- **CRITICAL MERGE CONFLICT RULE**: ห้ามใช้ `git stash` แล้วตามด้วย `git pull --rebase` และ `git stash pop` แบบอัตโนมัติรวดเดียวเด็ดขาด! หากมีงานที่แก้ค้างไว้ ต้อง `git commit` ให้เรียบร้อยก่อนดึงโค้ดเสมอ หากมี Merge Conflict ต้องตรวจเช็คไฟล์และแก้ให้เสร็จสิ้นก่อน เพราะการปล่อยผ่านจะทำให้ไฟล์โดนย้อนกลับไปเป็นเวอร์ชันเก่า (เคยเกิดปัญหา Apple Header หายกลับไปเป็นปุ่มสีเขียวมาแล้ว)
- **CRITICAL HISTORY SYNC RULE**: มีการรื้อประวัติเซิร์ฟเวอร์ใหม่ทั้งหมดเมื่อ 2026-07-23 (เพื่อแก้ชื่อผู้ commit กว่า 100+ ตัว) หากคุณทำงานบนคอมพิวเตอร์หรือ Worktree อื่นที่เคยโคลนโปรเจกต์นี้ไว้ก่อนหน้า ต้อง `git fetch origin` แล้วเอาประวัติใหม่ลงมาทับ ป้องกันการ push ประวัติเก่ากลับขึ้นไปจนเกิด Merge Conflict ครั้งใหญ่ · ⚠️ **`git reset --hard` เป็นคำสั่งทำลายข้อมูล — ต้องเช็คก่อนเสมอ**: `git status --short` (มีงานค้างไหม) + `git stash list` (มี stash ของคนอื่นไหม เช่น `AG-contact-redesign-wip-2026-07-23`) + `git cherry -v origin/main` (มี commit ที่ยังไม่ขึ้น remote ไหม) · ถ้ามีอะไรค้าง **ให้ commit + push ขึ้น branch ก่อน** แล้วค่อย reset · worktree ของ agent ตัวอื่นใต้ `.claude/worktrees/*` ห้ามแตะ
- **`main` ถูกล็อกที่ฝั่ง GitHub แล้ว (2026-07-23) — push ตรงเข้าไปไม่ได้ทุกกรณี** ruleset `protect-main` ตั้ง `bypass_actors: []` ต้องผ่าน PR + check `verify` เขียวเท่านั้น · ลอง `--no-verify` ก็โดน `GH013: Repository rule violations found` ตีกลับ · **ถ้าเจอ error นี้ไม่ใช่ของพัง แปลว่าคุณกำลังทำผิดวิธี** — ให้ `git switch -c <branch>` แล้วเปิด PR
- **ห้าม commit บน `main`** — [.githooks/pre-commit](.githooks/pre-commit) บล็อกให้ตั้งแต่ต้นทาง และ [.githooks/pre-push](.githooks/pre-push) รัน `pnpm lint` + `pnpm typecheck` ให้ก่อน push ถ้ามีไฟล์โค้ดเปลี่ยน (เปิดใช้ตอน `pnpm install` หรือ `pnpm setup:hooks`) · hook ไม่ทำงานถ้าเครื่องมือของคุณใช้ git library ฝังในตัวแทนที่จะเรียก `git` จริง — แต่ ruleset ฝั่ง GitHub ดักอยู่ดี
- Repo **มีทั้ง CI และ CD แล้ว** — CI ([.github/workflows/ci.yml](.github/workflows/ci.yml): lint + typecheck + test + build ทุก PR และ push:main) · CD ([.github/workflows/deploy.yml](.github/workflows/deploy.yml), เปิด 2026-07-23): เมื่อ CI ผ่านบน `main` workflow `Deploy` จะรัน `pnpm cf:deploy` **ให้เองอัตโนมัติ** (gate ด้วย `workflow_run` → deploy เฉพาะ commit ที่ CI เขียว, concurrency `deploy-production` ไม่ cancel กลางคัน)
- 🔒 **merge เข้า `main` = เผยแพร่ขึ้นเว็บคลินิกทันที ไม่มีด่านมนุษย์คั่นอีกแล้ว** — ด่านตรวจความปลอดภัย/เนื้อหาจึงต้องเสร็จ **ก่อนกด merge** ไม่ใช่ก่อน deploy · ก่อน merge งานที่แตะ Worker/DB/auth/เนื้อหา ต้องผ่าน: ไม่มีความลับ hardcode · ไม่มีข้อมูลคนไข้จริงใน seed/migration (PDPA) · ราคา/สรรพคุณ/โปรผ่านการตรวจของคลินิกแล้ว · **งานที่ยังไม่พร้อมเผยแพร่ = อย่า merge** (กันไว้ที่ PR/branch คือทางเดียว)
- หลัง merge งานที่กระทบเว็บ: เฝ้า `gh run watch` / `gh run list --workflow=Deploy` แล้วยืนยันด้วย URL จริง **ยิงอย่างน้อย 2 ครั้ง** พร้อมดู `x-nextjs-cache` (ISR เสิร์ฟของเก่ารอบแรก — ยิงครั้งเดียวคือวัดแคช ไม่ใช่วัด build) แล้วอัปเดตตาราง Deployed ใน [STATUS.md](STATUS.md) · งาน docs-only ปล่อยผ่านได้ CD จะ redeploy ของเดิม ไม่กระทบ
- **ห้ามผูก migration ที่เป็น table-rebuild (`DROP`/`RENAME`/`INSERT..SELECT`) เข้า `cf:deploy`** — chain นี้รันทุก deploy ต้องเป็น migration ที่ idempotent จริง (`CREATE TABLE IF NOT EXISTS` ล้วน) เท่านั้น · เคยทำรูปโปรโมชั่นหายทุก deploy มาแล้ว (2026-07-24, `migrations/0011`) ต้องอ่าน SQL ให้จบก่อนใส่
- **Repo เป็น public ตั้งแต่ 2026-07-23** — โค้ดและประวัติทุก commit เปิดสาธารณะ · ห้ามใส่ค่าความลับลงไฟล์เด็ดขาด ใช้ `wrangler secret put` เท่านั้น · ห้ามเขียน `process.env.X || 'ค่า fallback'` ให้ความลับ (production ต้อง throw, dev ค่อยมี fallback) · ความลับที่ commit ไปแล้ว = หลุดถาวร ต้อง rotate ไม่ใช่ลบ commit
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
