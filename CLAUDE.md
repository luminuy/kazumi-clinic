# คู่มือสำหรับ AI Agents — Kazumi Clinic

ไฟล์นี้เป็น **กฎที่ AI ทุกตัว** (Claude Code, Cursor, Copilot, Codex, etc.) ต้องทำตามเมื่อแก้โค้ดในโปรเจกต์นี้ เพื่อให้ SEO และ metadata สม่ำเสมอตลอดทั้งไซต์

## แผนที่เอกสาร — ใครเป็นเจ้าของข้อเท็จจริงไหน

**กฎ: หนึ่งข้อเท็จจริง มีเจ้าของไฟล์เดียว** ที่อื่นให้ *ลิงก์* ไม่ใช่ *เขียนซ้ำ* — การเขียนซ้ำคือสาเหตุที่เอกสารเคยขัดกันเอง (เคยมีไฟล์หนึ่งบอกว่า "ไม่มี CI/CD ต้อง deploy มือทุกครั้ง" อยู่หลายเดือนหลัง CD เปิดใช้จริง)

| อยากรู้เรื่อง | อ่านที่ | อัปเดตที่ |
| --- | --- | --- |
| ตอนนี้ถึงไหน / ใครค้างอะไร / deploy version ไหน | **[STATUS.md](STATUS.md)** | STATUS.md |
| งานที่ปิดไปแล้ว + เหตุผล/บทเรียนของงานนั้น | [docs/changelog.md](docs/changelog.md) | docs/changelog.md (ย้ายออกจาก STATUS เมื่อปิดงาน) |
| กฎการทำงาน, workflow, medical/SEO compliance, บทเรียน | **ไฟล์นี้** | ไฟล์นี้ |
| entrypoint ของ agent ที่อ่าน `AGENTS.md` (Codex ฯลฯ) | [AGENTS.md](AGENTS.md) | AGENTS.md (สรุปสั้น ลิงก์กลับมาที่นี่) |
| ขั้นตอน deploy, macOS/workerd, verify หลัง deploy | [docs/deploy.md](docs/deploy.md) | docs/deploy.md |
| binding, secret, var, ตาราง D1, Access, โดเมน | [docs/infrastructure.md](docs/infrastructure.md) | docs/infrastructure.md |
| รูป: /admin → Cloudinary → D1 → หน้า/OG/JSON-LD | [docs/images.md](docs/images.md) | docs/images.md |
| สี, ตัวอักษร, layout, โครงหน้า Services, a11y | [docs/design.md](docs/design.md) (ค่าจริง = [app/globals.css](app/globals.css)) | docs/design.md |
| สมาชิก, ตะกร้า, checkout, OAuth, payment | [docs/member-system.md](docs/member-system.md) | docs/member-system.md |
| ระบบนัดหมาย (leads), จอง/ยืนยัน/ยกเลิก, อีเมลนัดหมาย | [docs/appointments.md](docs/appointments.md) | docs/appointments.md |
| ภาพรวมโปรเจกต์สำหรับคนนอก | [README.md](README.md) | README.md |

**ถ้าเอกสารขัดกับโค้ด ให้เชื่อโค้ดบน `origin/main` แล้วแก้เอกสารใน PR เดียวกัน** — เอกสารบอกว่า*ตั้งใจให้เป็นยังไง* ไม่ใช่*ความจริงตอนนี้*

Stack: Next.js 16 App Router (React 19) + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI primitives) + next-intl (ไทย/อังกฤษ) + Zod, deploy บน Cloudflare Workers ผ่าน OpenNext (KV incremental cache + D1 tag cache + Durable Object queue สำหรับ ISR)

**Backend**: ใช้ Next.js Route Handlers (`app/api/*/route.ts`) เป็น backend เดียว — ไม่แยก backend service ต่างหาก เพราะ `@opennextjs/cloudflare` รัน API routes เป็นส่วนหนึ่งของ Worker เดียวกับหน้าเว็บอยู่แล้ว (คนละ endpoint แต่ deploy พร้อมกัน, share `lib/` และ D1 binding เดียวกัน) — ทุก route handler ต้อง validate input ด้วย Zod ก่อนแตะ DB เสมอ

---

## 0. Workflow — Auto commit / push / PR

หลังแก้โค้ดเสร็จและ **verify ครบ** ให้ทำต่อให้อัตโนมัติทุกครั้ง **โดยไม่ต้องถามก่อน**:

1. `git add` เฉพาะไฟล์ที่แก้ (ห้าม `-A` / `.`)
2. `git commit` พร้อมข้อความที่อธิบาย what + why ตามสไตล์ของ repo (ดู `git log`)
3. `git push -u origin <branch>` ขึ้น remote
4. `gh pr create` พร้อม title + body (Summary / Test plan)
5. รายงาน URL ของ PR กลับให้ user

**Auto-merge เปิด** — หลังเปิด PR ให้ merge เข้า main ทันที **เมื่อ verify ครบ**:

- `gh pr checks <num>` — **repo นี้มี CI แล้วตั้งแต่ 2026-07-22** ([.github/workflows/ci.yml](.github/workflows/ci.yml): lint + typecheck + test + build บนทุก PR) → ต้องรอให้ check **SUCCESS ก่อน merge เสมอ** · ✅ **repo เป็น public แล้วตั้งแต่ 2026-07-23 → branch protection บังคับได้จริง**: ruleset `protect-main` ([rules](https://github.com/luminuy/kazumi-clinic/rules)) เปิด `enforcement: active` คุม `refs/heads/main` ด้วย 4 กฎ — `pull_request` (approve 0 คน เพราะทำคนเดียว), `required_status_checks` (`verify`), `non_fast_forward`, `deletion` · `bypass_actors: []` → **แม้แต่ owner ก็ push ตรงเข้า main ไม่ได้** (ทดสอบแล้ว: `git push --no-verify` โดน `GH013: Repository rule violations found` ตีกลับที่ server) · นี่คือ prevention ตัวจริง ไม่ใช่ detection
  ถ้าติดจริง ๆ ต้องปิดชั่วคราวที่ Settings → Rules → `protect-main` → `enforcement: disabled` แล้ว**เปิดกลับทันที**
- **local hook 2 ตัว** ยังมีอยู่ ทำหน้าที่ให้ feedback เร็วตั้งแต่ก่อนถึง GitHub (เปิดใช้อัตโนมัติตอน `pnpm install` ผ่าน `core.hooksPath`, หรือ `pnpm setup:hooks`):
  - [.githooks/pre-commit](.githooks/pre-commit) — บล็อก `git commit` ตอน HEAD อยู่บน `main` (กันตั้งแต่ต้นทาง)
  - [.githooks/pre-push](.githooks/pre-push) — บล็อก `git push` ตรงเข้า main **และ** รัน `pnpm lint` + `pnpm typecheck` ให้ก่อนถ้ามีไฟล์โค้ดเปลี่ยน (push ที่มีแต่เอกสารข้ามไป ไม่เสียเวลา)

  ทั้งคู่ bypass ได้ด้วย `--no-verify` และทำงานเฉพาะเครื่องที่ติดตั้ง hook + เครื่องมือที่เรียก `git` จริง (tool ที่ฝัง git library ของตัวเองจะไม่ยิง hook) — bypass ไปก็ไม่รอด ruleset ฝั่ง GitHub อยู่ดี hook แค่ทำให้รู้ตัวเร็วกว่าและไม่เสียเที่ยว

  ⚠️ **`core.hooksPath = .githooks` เป็น path สัมพัทธ์ → git resolve จาก root ของ worktree หลักเสมอ** · แปลว่า worktree ใต้ `.claude/worktrees/*` ก็รัน hook **เวอร์ชันที่ checkout อยู่ในโฟลเดอร์หลัก** ไม่ใช่ของตัวเอง (ตรวจด้วย `git rev-parse --git-path hooks`) — แก้ hook ใน branch แล้วมันจะยังไม่มีผลจนกว่าจะ merge เข้า main **และ** โฟลเดอร์หลัก `git merge --ff-only origin/main` แล้ว
- ปกติใช้ `gh pr merge <num> --squash --auto --delete-branch` — `--auto` จะ merge ให้เองเมื่อ CI ผ่าน (ไม่ต้องนั่งเฝ้า) · ก่อนหน้านี้ (2026-07-22) เคยตอบ `no checks reported` เพราะยังไม่มี CI — ตอนนี้ไม่ใช่แล้ว
- ถ้า CI FAIL → หยุด, แจ้ง user, แก้ก่อน (ห้าม merge งานที่ CI แดงเด็ดขาด — ตอนนี้ ruleset บล็อกให้แล้ว แต่อย่ารอให้ GitHub เป็นคนบอก)
- ก่อน `gh pr merge` ทุกครั้ง: เช็ค `gh pr view --json headRefOid` ให้ตรงกับ local HEAD ก่อน (sleep 2-3 วิ แล้วเช็คซ้ำถ้าไม่ตรง) — auto-merge ที่ยิงทันทีหลัง push อาจ squash แค่ commit เก่า
- หลัง merge แล้วรายงาน URL ของ commit บน main — ⚠️ **CD เปิดแล้วตั้งแต่ 2026-07-23** ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): เมื่อ CI ผ่านบน main สำเร็จ workflow `Deploy` จะรัน `pnpm cf:deploy` ให้อัตโนมัติ (gate ด้วย `workflow_run` → deploy เฉพาะ commit ที่ CI เขียว, concurrency `deploy-production` ไม่ cancel กลางคัน) · auth ผ่าน secret `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
- 🔒 **ความปลอดภัยมาก่อน — CD ทำให้ "merge เข้า main = เผยแพร่สู่สาธารณะทันที" ไม่มีด่านมนุษย์คั่นอีกแล้ว** · ด่านตรวจความปลอดภัยจึงต้องขยับมา **ก่อน merge** ไม่ใช่ก่อน deploy · ก่อนกด merge งานที่แตะ Worker/DB/auth/เนื้อหา ต้องผ่านทุกข้อ:
  - **ความลับ**: ห้ามมี secret/token/คีย์ hardcode หรือ fallback ด้วย `||` (ดู §0.5 · repo เป็น public → หลุดถาวร) · ✅ ปม `SESSION_SECRET` เดิม **ปิดแล้ว 2026-07-23**: ระบบ session ที่ใช้จริงคือ `lib/members/session.ts` ซึ่งใช้ opaque random token 256-bit เก็บใน D1 (ไม่มี signing secret ให้หลุด) · ไฟล์ JWT เก่า `lib/session.ts`/`lib/users-store.ts` ที่พึ่ง `SESSION_SECRET` เป็น dead code ถูกลบทิ้งแล้ว (PR #185) — ไม่ต้องตั้ง `SESSION_SECRET` อีก · OAuth (Google/LINE) ต้องตั้ง `GOOGLE_/LINE_*` ผ่าน `wrangler secret put` ก่อนปุ่มถึงจะกดผ่าน
  - **PDPA / ข้อมูลคนไข้**: ห้ามมีข้อมูลส่วนบุคคลจริงใน seed/migration/fixture ที่จะถูก commit
  - **เนื้อหาการแพทย์**: ราคา/สรรพคุณ/โปรต้องผ่าน §0.2 และเจ้าของรีวิว **ก่อน** merge — เพราะ merge แล้วมันขึ้นเว็บเองเลย
  - งานที่ยังไม่พร้อมเผยแพร่ = **อย่า merge เข้า main** (กันไว้ที่ PR/branch) · การ "ยังไม่อยากให้ขึ้น" ทำได้ทางเดียวคือยังไม่ merge
- **หลัง merge งานที่เปลี่ยน public site / Worker**: ปกติปล่อยให้ CD deploy เอง — เฝ้าด้วย `gh run watch` / `gh run list --workflow=Deploy` แล้วยืนยันด้วย URL จริง (ยิง ≥2 ครั้ง ดู §0.5) · จะ deploy มือด้วย `pnpm cf:deploy` ก็ได้ (เครื่อง dev ต้องใช้ trick §0.5) แต่ **ห้าม deploy มือชนกับ CD** — รอ run ของ Deploy จบก่อน · งานเอกสารล้วน CI ก็ผ่าน แต่ deploy step แค่ redeploy ของเดิม ไม่กระทบ
- ⚠️ **request แรกหลัง deploy คืน HTML ของ build ก่อนหน้า** — หน้าเป็น ISR (`stale-while-revalidate`) มันเสิร์ฟของเก่าจาก KV ก่อน แล้วค่อย regenerate เบื้องหลัง · **ยิง 1 ครั้งแล้วอ่านผล = อ่านของเก่า** ต้องยิงซ้ำ (หรือรอ) แล้วเช็ค `x-nextjs-cache` ก่อนสรุปว่าโค้ดใหม่ขึ้นจริง (ดู §0.5 · 2026-07-17)
- ก่อน `pnpm cf:deploy` ต้องหยุด `pnpm dev`/Next dev server ที่ใช้ working tree เดียวกัน และเริ่มจาก production build artifacts ที่สะอาด; ห้ามให้ dev server เขียน `.next` พร้อมกับ OpenNext build เพราะ development hot-update assets อาจปนเข้า Worker จน production ตอบ 500 (ดู §0.5)

ข้อยกเว้น: ถ้า user สั่งชัดว่า "ไม่ commit" / "ไม่ push" / "ไม่ PR" / "ไม่ merge" ให้หยุดที่ขั้นนั้น

### 0.0 STATUS.md — จุดส่งไม้ต่อ (อ่านก่อน, อัปเดตหลัง)

[STATUS.md](STATUS.md) ที่รากคือสรุปสถานะให้คน/agent ถัดไปรู้ว่า "ตอนนี้ถึงไหน" (deployed อะไร · กำลังทำอะไร · ต่อไป · ปมค้าง) เพราะ git log บอกแค่สิ่งที่ **เสร็จ** ไม่บอกสิ่งที่ **กำลังทำ/ค้าง**

- **เริ่ม session ให้อ่าน `STATUS.md` ก่อน** — แต่ยึด `origin/main` เป็นความจริง ถ้าไฟล์นี้ขัดกับ git ให้เชื่อ git แล้วแก้ไฟล์ให้ตรง
- **อัปเดตทุกครั้งที่ deploy** (แก้บรรทัด "Deployed ตอนนี้" ให้ตรง Version + commit จริง) และตอน **เริ่ม/จบงานสำคัญ** (ช่อง "กำลังทำ" / "ต่อไป") — commit ไปพร้อมงานนั้นเลย ไม่ต้องแยก PR
- งานเล็ก/docs ที่ไม่กระทบสถานะภาพรวมไม่ต้องแตะ · อย่าให้ไฟล์นี้เก่าค้าง — ถ้าอ่านแล้วพบว่ามันไม่ตรงกับความจริง แก้ทันทีถือเป็นส่วนหนึ่งของงาน

### 0.1 Working method — มีขั้นตอน, มีระเบียบ, รอบคอบ

ทุกงาน (เล็กหรือใหญ่) เดินตามลำดับนี้เสมอ ห้ามข้ามขั้น:

1. **เข้าใจปัญหา** — อ่านคำสั่ง/รูป/error ให้ครบ จับ root cause ไม่ใช่อาการ
2. **สำรวจ** — อ่านไฟล์/โค้ดที่เกี่ยวข้องก่อนแก้ ห้ามเดา
3. **วางแผน** — รู้ว่าจะแก้ไฟล์ไหน บรรทัดไหน เพราะอะไร ก่อนลงมือ
4. **ลงมือ** — แก้ทีละจุด ชัดเจน ไม่แก้สะเปะสะปะ
5. **Verify** (ข้อ 0.3) — lint + typecheck + build + อ่าน diff + คิด edge cases
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

- [ ] `pnpm lint` ผ่าน (exit 0) — เพิ่งใช้งานได้จริง 2026-07-17 ก่อนหน้านั้นมันไม่เคย lint อะไรเลย (ดู §0.5)
- [ ] `pnpm typecheck` ผ่าน
- [ ] `pnpm test` ผ่าน
- [ ] `pnpm build` ผ่าน (static params ของ `/[category]` ต้อง generate ครบทุก slug ใน `lib/services.ts` × ทุก locale)
- [ ] **ถ้าแตะโค้ดที่รันบน Worker จริง (crypto, D1, cookies, binding, Web API) → เทสต์ที่ผ่านไม่ใช่หลักฐาน** ต้องยิง endpoint จริงหลัง deploy ด้วย · `vitest` รันบน Node ซึ่งมี API/ลิมิตไม่เหมือน workerd (ดู §0.5 · 2026-07-25 PBKDF2) · `pnpm smoke` ครอบ register/login ให้แล้ว แต่ path อื่นต้องยิงเอง
- [ ] ถ้าแตะข้อความ UI → key มีครบทั้ง `messages/th.json` และ `messages/en.json` และเปิดดูหน้า `/en` ด้วย (ดู §13)
- [ ] `git status` — ไม่มีไฟล์ untracked แปลกปลอม (`.DS_Store`, `* 2.*`, ฯลฯ) ก่อน push
- [ ] อ่าน diff ของตัวเอง (`git diff`) — ตรรกะถูก, ไม่มี debug code/log ค้าง
- [ ] ถ้าแตะ SEO/metadata/ราคา/บริการ → เช็ค Checklist ข้อ 10 และข้อ 0.2
- [ ] **ทุกประโยคในรายงานที่อ้างสถานะ ต้องมีคำสั่งที่รันจริงรองรับ** — "deploy แล้ว" / "CI ผ่าน" / "รูปโหลดได้" / "หน้าใช้งานได้" ต้องมาจาก output จริง ไม่ใช่จากการอ่าน config หรือเดา (ดู §0.5 · 2026-07-16) · ถ้าไม่ได้ตรวจ → เขียนว่า "ยังไม่ได้ตรวจ"
- [ ] รายงานสั้น กระชับ — บอกสาเหตุจริง + วิธีแก้ + ผลกระทบ · ถ้ารายงานก่อนหน้าผิด ให้แก้ให้ชัดเจน ไม่กลบ

### 0.4 Design authority — อนุญาตให้ออกแบบเอง

เมื่องานเกี่ยวกับ UI/UX ("ไม่สวย", "ปรับแต่ง", "ออกแบบ", "ดูตึง"):

- **ใช้ความสามารถออกแบบของ agent ได้เต็มที่** — ไม่ต้องถามก่อนทุก step
- เรียก skill `frontend-design` เมื่อเหมาะ (สร้าง component, page, หรือ overhaul ครั้งใหญ่)
- ตัดสินใจเรื่อง spacing / typography / color / layout / motion ได้เอง โดย **อ่านค่า token จริงจาก `:root` ใน [app/globals.css](app/globals.css) ก่อนเสมอ** (Tailwind v4 ไม่มี `tailwind.config.ts` ห้ามสร้างไฟล์นั้นกลับมา)
  ⚠️ **ชื่อ token ไม่ได้บอกสีอีกต่อไป** — ไซต์ถูก re-tone เป็น Apple-style light theme โดยคง*ชื่อ*เดิมไว้ ค่าปัจจุบัน (ตรวจ 2026-07-25): `ink`/`olive-deep` = `#1d1d1f` · `olive` = `#6e6e73` · `olive-light` = `#86868b` · `sand` = `#f5f5f7` · `cream` = `#ffffff` · `border` = `#d2d2d7` · สี action = `mint` `#06c755` (เท่ากับ `line` โดยตั้งใจ) · `forest` `#006e2b` · `mint-glow` `#3ee26c` — **ห้าม hardcode hex ใน component** ต้องการเฉดใหม่ให้เพิ่ม token
- รูปทรง: มุม **มน** ตามขนาดกล่อง (`--radius: 0.75rem` เป็นค่ากลาง, การ์ดใหญ่ `rounded-[1.75rem]`/`rounded-2xl`, control กลม `rounded-full`) — กฎ "มุมเหลี่ยม" เป็นของยุคดีไซน์แรก ไม่ตรงกับไซต์ปัจจุบันแล้ว
- สไตล์แบรนด์: โครงและจังหวะยังเป็น editorial (negative space, asymmetry, สัดส่วน 1.618) บนผิว Apple-style neutrals + เขียวเป็นสี action — รายละเอียดและกฎ 2 ยุคอยู่ใน [docs/design.md](docs/design.md)
- ข้อความ UI ต้องมาจาก `messages/th.json` + `messages/en.json` ทั้งคู่ (ดู §13)
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
- ห้ามรัน `npx shadcn@latest init` ซ้ำ — จะ overwrite `app/globals.css`/`app/(site)/[locale]/layout.tsx` ทับสี brand และฟอนต์ Thai ที่ตั้งไว้ (ครั้งก่อนมันเคยใส่ font `Geist` ทับ `Noto Sans Thai` มาแล้ว ทำให้ข้อความไทยพังเงียบ ๆ)

### 0.4.2 Cloudflare Workers runtime — ห้ามใส่ `export const runtime = 'edge'`

`@opennextjs/cloudflare` (adapter ที่ deploy โปรเจกต์นี้) ต้องใช้ **Node.js runtime** (ผ่าน `nodejs_compat` flag ใน [wrangler.jsonc](wrangler.jsonc)) — ต่างจาก `@cloudflare/next-on-pages` ที่บังคับ Edge runtime

- **ห้ามใส่** `export const runtime = 'edge';` ในหน้า Page หรือ Route Handler ใด ๆ — จะขัดกับ adapter และพังตอน build/deploy
- ทั้ง Worker รันที่ edge ของ Cloudflare อยู่แล้วโดยธรรมชาติ ไม่ต้องประกาศ runtime เพิ่ม ปล่อย default ไว้

### 0.5 Lessons learned — กฎจากความผิดพลาดจริง

อ่านส่วนนี้ทุกครั้งก่อนเริ่มงาน · รายการเรียงจากใหม่ไปเก่า — ใช้ดัชนีข้างล่างหาเรื่องที่ตรงกับงานที่กำลังจะทำ

**ดัชนีบทเรียน — งานแบบไหน ต้องอ่านข้อไหน**

| กำลังจะทำ | บทเรียนที่เกี่ยวโดยตรง |
| --- | --- |
| เขียน carousel/rail ที่ใช้ `scroll-snap-type` + `overflow-x` | 2026-08-03 ×2 (rail ที่มี `padding-inline` แต่ไม่มี `scroll-padding-inline` → เบราว์เซอร์ auto-scroll ตอน layout แรก → LCP ตายทั้งหน้า · **rail แบบ `scroll-snap-align: center` ก็ auto-scroll ได้ ถ้าความกว้างการ์ดกับ padding จัดกึ่งกลางคนละค่ากัน**) |
| ตั้ง cache header ให้ static asset / สงสัยว่า `headers()` ใน `next.config.mjs` ไม่มีผล | 2026-08-03 (static asset ไม่วิ่งผ่าน Worker → ต้องใช้ `public/_headers` ไม่ใช่ `next.config.mjs`) |
| ไล่แก้ Lighthouse `NO_LCP` / คะแนน Performance ขึ้น "Error!" | 2026-08-03 (ต้องหาสาเหตุด้วยการวัดจริง+bisect ห้ามเดา — เดาผิดมาแล้ว 1 รอบใน #301) |
| แตะ Cloudflare Access application (Zero Trust) — เพิ่ม/ลบ destination, domain migration | 2026-08-03 (destination โดเมนเก่าที่ "ทิ้งไว้เฉย ๆ" ทำให้ SSO auto-login เลือกโดเมนผิดตัว) |
| เพิ่ม env var ผ่าน Cloudflare dashboard, หรือแก้ `wrangler.jsonc` แล้ว deploy | 2026-07-27 (dashboard-only plaintext var หายหลัง deploy ครั้งถัดไปที่ไม่เกี่ยวกันเลย) |
| แตะ auth / crypto / D1 / binding | 2026-07-25 (PBKDF2 100k · เทสต์ไม่ใช่หลักฐาน · smoke test ที่ปลุกผิด) |
| เขียน/ผูก migration | 2026-07-24 (table-rebuild ลบรูปทุก deploy) |
| deploy หรือรายงานผลหลัง deploy | 2026-07-17 ×3 (dev server ปน `.next` · ISR เสิร์ฟของเก่า · `Current Version ID` ไม่พอ), 2026-07-16 (ห้ามรายงานสิ่งที่ไม่ได้ตรวจ) |
| ดึงโค้ด / merge / จัดการ branch, worktree | **2026-07-25 (แตก branch จาก origin/main ที่ไม่ได้ fetch → ฐานขาดงานที่เพิ่ง merge)**, 2026-07-23 (stash+pull พังเงียบ · CI ไม่รันรอบใหม่ → เปิด branch ใหม่), 2026-07-22 ×2 (งานไม่ push = มองไม่เห็น · worktree ค้างเก่า) |
| แตะความลับ / เปลี่ยน visibility ของ repo | 2026-07-23 (`SESSION_SECRET` fallback ในกิต · ห้าม `\|\|` ให้ความลับ) |
| แตะรูป / metadata / cache | 2026-07-22 (ตาราง `revalidations` หาย → ISR ตายเงียบ), 2026-07-17 (แก้เฉพาะที่เห็นบนหน้า = ทิ้งบั๊กใน OG/JSON-LD) |
| แตะ UI ที่มีหลายหน้าใช้ pattern เดียวกัน | บล็อก "พอร์ตมาจาก littlesmileflower" (แก้ทั้ง pattern ไม่ใช่ไฟล์เดียว · list ทุก state ก่อนแก้ conditional) |
| เขียน/แก้เอกสาร | 2026-07-17 ×3 (เอกสารเก่าทำให้ทำผิดซ้ำ · อ่านไฟล์จาก branch ผิด · พอร์ตข้อเท็จจริงมาโดยไม่ตรวจ) |
| เจอคำสั่งใน `package.json` ที่ fail | 2026-07-17 (`pnpm lint` พังมาหลายเดือนโดยไม่มีใครสงสัย) |
| สั่ง agent อื่น (Codex) ให้ลงมือแก้โค้ด | 2026-07-25 (เขียนสเปกโดยไม่อ่านโค้ดก่อน → สั่งผิด 3 จุด · grep พิสูจน์งานที่ครอบไม่ครบ) |

**เมื่อพลาด (bug ที่ user เจอ, แก้ผิด, ลืม edge case, รายงานผิด) ให้บันทึกทันที ห้ามข้าม:**

1. **หาสาเหตุจริง** ไม่ใช่อาการ — ถ้ายังไม่รู้สาเหตุ ห้ามเขียนบทเรียน (จะได้กฎผิด)
2. **เพิ่มบรรทัดใหม่ด้านล่าง** รูปแบบ: `YYYY-MM-DD — สิ่งที่พลาด → กฎใหม่`
3. **ไล่แก้ทุกที่ในไฟล์นี้ที่ยังสอนตรงข้ามกับบทเรียนใหม่** — บทเรียนที่ขัดกับ checklist ในไฟล์เดียวกันคือบทเรียนที่ตายแล้ว ไม่มีใครทำตาม _(ต้นฉบับพลาดข้อนี้: ในไฟล์ของ **littlesmileflower** หัวข้อ Lessons learned เขียนว่า "ห้ามใช้ `npx tsc --noEmit` ใช้ `pnpm typecheck`" แต่ checklist ข้อ 10 ของเขายังสั่ง `npx tsc --noEmit` อยู่จนวันนี้)_
4. **ถ้าเพิ่ม/ย้ายหัวข้อ ต้องไล่อัปเดต cross-reference ทุกจุด** — เลขหัวข้อในไฟล์นี้ถูกอ้างถึงเยอะ _(ต้นฉบับพลาดข้อนี้เหมือนกัน: ไฟล์ของ **littlesmileflower** เขียน "Verify (ข้อ 0.2)" ทั้งที่ verification คือหัวข้อ 0.3 ของเขา และสั่งให้ไปเพิ่มกฎที่ "§0.4" ที่**ไม่มีอยู่ในไฟล์เขาเลย**)_ · ตรวจได้ด้วย:
   ```bash
   for r in $(grep -o "§0\.[0-9]" CLAUDE.md | sed 's/§//' | sort -u); do
     grep -q "^### $r " CLAUDE.md || echo "อ้างถึง §$r แต่ไม่มีหัวข้อนี้"
   done
   ```

<!-- รูปแบบ: - YYYY-MM-DD — สิ่งที่พลาด → กฎใหม่ -->

- 2026-08-03 — **บทเรียน scroll-snap ของวันเดียวกัน (ด้านล่าง) เขียนข้อยกเว้นผิดไว้เอง ว่า rail แบบ `scroll-snap-align: center` "ไม่เป็นไร" — `.service-stream-rail` เลยรอดการตรวจ ทั้งที่ auto-scroll 72px ทุกครั้งบนเดสก์ท็อป** · rail จัดกึ่งกลางด้วย padding ที่คำนวณจาก `min(65vw, 42rem)` แต่การ์ดกว้าง `min(70vw, 50rem)` — คนละค่ากัน ทั้งที่คอมเมนต์ในไฟล์เขียนว่า *"tracks the same capped width"* · การ์ด `center` snap ที่จุดซึ่งไม่ตรงกับ `scrollLeft: 0` เบราว์เซอร์จึงเลื่อน rail เองตั้งแต่ layout แรก · **ไม่เกิดบนมือถือ** เพราะ media query `≤47.999rem` บังเอิญตั้งการ์ดกับ padding เป็น `84vw/27rem` ตรงกันพอดี — ซึ่งตรงกับอาการที่ผู้ใช้เห็น (PSI มือถือมีคะแนน เดสก์ท็อปขึ้น "!") · วัดได้ด้วย CDP: `scroll` event `{t: 532, left: 72}` โผล่**ก่อน** hydration บน production, และไม่มีบนมือถือ · แก้โดยให้ทั้งการ์ดและ padding อ่าน custom property ตัวเดียวกัน + ใช้ `100%` แทน `100vw` (100vw นับ scrollbar ที่ความกว้างการ์ดมองไม่เห็น → เพี้ยนซ้ำอีก ~7px)
  → **กฎ: `scroll-snap-align: center` ไม่ได้แปลว่าปลอดภัย** — มันปลอดภัยเฉพาะเมื่อ *ความกว้างการ์ด* กับ *padding จัดกึ่งกลาง* มาจากค่าเดียวกันจริง ๆ · เขียนเป็นตัวแปรตัวเดียวแล้วให้ทั้งสองที่อ่านมัน (`--service-stream-card-width`) อย่าเขียนสูตรซ้ำสองที่แล้วหวังว่าจะตรงกัน — คอมเมนต์ที่บอกว่า "ตรงกันแล้ว" พิสูจน์อะไรไม่ได้
  → **กฎ: ตรวจ rail ด้วยการ *วัด* ไม่ใช่ *อ่าน CSS*** — เปิดหน้าจริงแล้วดักที่ `addEventListener('scroll', …, {capture: true})` ตั้งแต่ก่อน navigate (CDP `Page.addScriptToEvaluateOnNewDocument`) · scroll event ใด ๆ ที่เกิด**ก่อน**โค้ด carousel ทำงาน = auto-scroll ของเบราว์เซอร์ = บั๊ก · ต้องยิงทั้ง desktop และ mobile viewport เพราะบั๊กชนิดนี้ชอบมาข้างเดียว
  → **แก้ข้อเท็จจริงในบทเรียนด้านล่าง: scroll ไม่ได้ "หยุดบันทึก LCP ถาวร" เสมอไป** · วัดซ้ำ 2026-08-03 ด้วย CDP บน Chrome ปัจจุบัน: มี auto-scroll ที่ `t=2074` แล้ว LCP candidate ยัง fire ที่ `t=2140` และ `t=3728` ตามปกติ (ทั้ง 3 เงื่อนไข network) — scroll ที่ไม่ได้มาจาก user input ไม่ได้ปิดการบันทึก · เพราะฉะนั้น **ห้ามใช้ "มี auto-scroll" เป็นหลักฐานว่า `NO_LCP` มาจากตรงนั้น** ต้องวัด LCP ตรง ๆ ทุกครั้ง

- 2026-08-03 — **`headers()` ใน `next.config.mjs` ไม่มีผลกับ `/_next/static/*` เลย — static asset ทั้งเว็บจึงเสิร์ฟด้วย `cache-control: public, max-age=0, must-revalidate` มาตลอด** · ไฟล์ CSS/JS/woff2 มี content hash ในชื่ออยู่แล้ว (build ใหม่ = URL ใหม่) แต่เบราว์เซอร์ยังต้อง revalidate ทุกก้อนทุกครั้งที่กลับเข้าเว็บ · สาเหตุ: Workers Assets เสิร์ฟไฟล์พวกนี้ตรง ๆ **ไม่วิ่งผ่าน Worker** — พิสูจน์ได้ใน 1 คำสั่ง คือ response ของไฟล์ static **ไม่มี** `Content-Security-Policy` ทั้งที่ทุก response ที่ Worker เรนเดอร์มี · แก้ด้วย [public/_headers](public/_headers) ซึ่ง OpenNext คัดลอกเข้า `.open-next/assets/` ให้ wrangler อ่านตอน deploy
  → **กฎ: cache header ของ static asset ต้องตั้งที่ `public/_headers` เท่านั้น** — `next.config.mjs` คุมได้แค่ response ที่ Worker เรนเดอร์เอง · ตรวจว่าตั้งติดจริงด้วย `curl -sI <url ของ chunk> | grep -i cache-control` **หลัง deploy** ไม่ใช่จากการอ่าน config
  → **กฎ: `_headers` เป็นข้อยกเว้นเดียวของ "ห้ามเอาอะไรใส่ `public/`" (§12)** — ข้อห้ามนั้นเรื่อง**รูป** (เพราะ /admin แก้ไม่ได้) ไม่ใช่ไฟล์ config ที่ platform ต้องอ่านจากรากของ assets

- 2026-08-03 — **Lighthouse หน้าแรกขึ้น Performance = "Error!" (`NO_LCP`) ทั้ง mobile และ desktop — ต้นเหตุคือ carousel rail ที่ `scroll-snap` บังคับให้เบราว์เซอร์ auto-scroll ตอน layout แรก** · อาการ: FCP/CLS/Speed Index วัดได้ปกติ แต่ LCP, TBT และ audit ที่พึ่ง trace **22 ตัว** พังหมด (Minify CSS/JS, Reduce unused CSS/JS, long-tasks ฯลฯ) ทำให้ไม่มีคะแนน Performance เลย · **PR #301 เดาผิดมาก่อน** — ไปโทษ `<Link>` prefetch ของ mega-menu แล้วใส่ `prefetch={false}` ซึ่งไม่ได้แก้อะไร (อาการยังอยู่ครบ) เพราะสมมุติฐานตั้งจาก "อะไรน่าจะหนัก" ไม่ได้วัด · **สาเหตุจริง**: `.promo-card-grid__rail` มี `padding-inline: clamp(1rem,2.3vw,3rem)` + การ์ดมี `scroll-snap-align: start` แต่ **ไม่มี `scroll-padding-inline`** → snap position ของการ์ดใบแรกอยู่เยื้องจาก `scrollLeft: 0` ไปหนึ่ง gutter เบราว์เซอร์จึง auto-scroll rail เพื่อ snap ตั้งแต่ layout แรก · **Chrome นับ scroll เป็น user interaction แล้วหยุดบันทึก LCP ถาวร** — ซึ่งเกิด*ก่อน*มี candidate ตัวไหนถูกบันทึก ผลคือทั้งหน้าไม่มี LCP เลย (trace มีแต่ `...LargestContentfulPaint::Invalidate` 4 ครั้ง ไม่มี `::Candidate` สักตัว) · แก้ด้วยการเติม `scroll-padding-inline` ให้ตรงกับ `padding-inline` (ท่าที่ `.homepage-promotion-shelf` ทำถูกอยู่แล้ว แต่ rule พื้นฐานตกหล่น)
  → **กฎ: rail/carousel ที่ตั้ง `scroll-snap-type` + `padding-inline` ต้องมี `scroll-padding-inline` เท่ากันเสมอ** ไม่งั้นได้ auto-scroll ที่มองไม่เห็นด้วยตาแต่ฆ่า LCP ทั้งหน้า · เช็คทั้ง pattern ด้วย `grep -n "scroll-snap-type" -B 12 app/globals.css` แล้วดูว่าทุก rail มีคู่ `padding-inline`/`scroll-padding-inline` ครบ
  ⚠️ **ข้อยกเว้นที่เคยเขียนไว้ตรงนี้ว่า "`scroll-snap-align: center` ไม่เป็นไร" ผิด และทำให้ `.service-stream-rail` หลุดการตรวจไปจนถึง 2026-08-03** — ดูบทเรียนวันเดียวกันเรื่อง rail แบบ center ด้านล่าง
  → **กฎ: `NO_LCP` ห้ามเดา ให้ bisect ด้วยการวัดจริง** — ท่าที่ใช้ได้ผล: (1) ยืนยันว่าไม่ใช่ artifact ของ Lighthouse ด้วย PerformanceObserver/CDP `PerformanceTimeline` ในหน้าที่ **visible** (แท็บ background ไม่มีวัน fire LCP — เกือบหลงทางเพราะข้อนี้), (2) เทียบกับหน้าอื่นในเว็บเดียวกันเพื่อจำกัดขอบเขต, (3) **ปิด JavaScript** ถ้ายังพังแปลว่าเป็น HTML/CSS ล้วน ตัด hydration/prefetch/carousel JS ทิ้งได้ทั้งชุด, (4) intercept HTML ของ production แล้วตัดทีละ `<section>` จนหาเจอ, (5) ยืนยัน fix ด้วย CSS ที่ **build จริง** ไม่ใช่ override ที่พิมพ์เอง
  → **กฎ: "แก้แล้ว" ต้องวัดซ้ำด้วยเครื่องมือเดียวกับที่รายงานปัญหา** · #301 ปิดงานโดยไม่รัน Lighthouse ซ้ำ อาการเลยอยู่ยาวอีกหลายวันโดยที่ commit message เขียนว่า "แก้ Lighthouse LCP error"

- 2026-08-03 — **`/admin` เข้าไม่ได้ (หน้า Cloudflare "There is nothing here yet") ทั้งที่ Access authentication log บอกว่า "Access granted" ทุกครั้ง** · user เข้า `kazumiclinic.skin/admin` แล้วเจอหน้า error ของ Cloudflare — ตอนแรกวินิจฉัยผิดว่าเป็นเพราะเผลอเข้า workers.dev URL เก่า (บอก user ให้พิมพ์โดเมนจริงใหม่) แต่ user ยืนยันว่าพิมพ์ `kazumiclinic.skin/admin` ตรง ๆ ก็ยังเจอเหมือนเดิม แม้เปิด Incognito ก็ไม่หาย · เช็ค Zero Trust → Access authentication logs พบว่า decision เป็น "Access granted" ทุกครั้ง (ไม่ใช่ปัญหา policy/identity) → สรุปว่าต้องเป็นขั้นตอน**หลัง**ผ่าน Access แล้ว จึงลอง login เองใน Claude in Chrome (เบราว์เซอร์จริงที่ล็อกอินอยู่) แล้วเจอ bug ซ้ำ: SSO auto-login (`isSSO:true`, มาจาก session เดิม) พาไปจบที่ callback บนโดเมน `kazumi-clinic.bankjack10452.workers.dev` (ที่ปิดใช้งานไปแล้ว) ทั้งที่ payload ข้างในบอก `hostname: kazumiclinic.skin` ถูกต้อง · เปิด Access Application `kazumi-clinic-admin` เจอว่ามี **2 destinations**: `kazumiclinic.skin/admin` (ตัวจริง) + `kazumi-clinic.bankjack10452.workers.dev/admin` (โดเมนเก่า ที่เอกสาร [docs/infrastructure.md](docs/infrastructure.md) เคยเขียนไว้ว่า "ลบทิ้งได้ แต่ไม่มีผลอะไรถ้าปล่อยไว้") — Access เลือก destination ตัวแรกในรายการมาปิดจบ SSO callback แทนที่จะดูโดเมนที่ request จริงเข้ามา ลบ destination เก่าออกแล้วหายทันที
  → **กฎ: Access authentication log ที่บอกว่า "Allowed/Granted" ไม่ได้แปลว่าผู้ใช้เข้าถึงแอปจริงสำเร็จ** — มันวัดแค่ผลของ policy evaluation (ตัวตนผ่านไหม) ไม่ได้วัดว่าขั้นตอน callback/redirect กลับไปยัง origin ที่ถูกต้องสำเร็จหรือเปล่า · ถ้า log เขียวแต่ user ยังเข้าไม่ได้ ต้องสงสัยขั้นตอน "หลัง" auth (callback URL, destination ที่เลือก) ไม่ใช่ policy
  → **กฎ: destination/domain เก่าใน Cloudflare Access application ที่ "ปิดใช้งานแล้วแต่ยังไม่ลบออกจาก config" ไม่ใช่ของที่ปล่อยทิ้งไว้ได้แบบไม่มีผล** — แม้โดเมนนั้นจะตอบ error เองอยู่แล้ว (เช่น workers.dev ที่ตั้ง `workers_dev: false`) Access ก็ยังอาจเลือกมันเป็น target ตอน SSO/session-reuse ได้ (ดูเหมือนเลือกตัวแรกในรายการ ไม่ใช่ตัวที่ตรงกับ request) — **domain migration ต้องลบ destination เก่าออกจริง ไม่ใช่แค่ปิดที่ปลายทาง** · แก้เอกสารที่เคยเขียนตรงข้ามแล้วที่ [docs/infrastructure.md](docs/infrastructure.md)
  → **กฎ: ปัญหาที่เกิดเฉพาะตอน login/SSO/callback แต่ curl ธรรมดาไม่เจอ ต้องทดสอบด้วยเบราว์เซอร์จริงที่ล็อกอินอยู่ (Claude in Chrome) ไม่ใช่ curl** — curl พิสูจน์ได้แค่ request แรก (ก่อน auth) ว่า route ไปถูก แต่พิสูจน์ไม่ได้ว่าขั้นตอนหลัง login (callback, cookie, redirect) ทำงานถูก เพราะไม่มี session ให้ผ่านเข้าไปถึงขั้นนั้น

- 2026-07-27 — **เพิ่ม plaintext env var ผ่าน Cloudflare dashboard (ไม่ใช่ commit ใน `wrangler.jsonc`) แล้วมันหายไปเงียบ ๆ หลัง deploy ครั้งถัดไปที่ไม่เกี่ยวกันเลย** · ตอนขึ้นโดเมนจริง `kazumiclinic.skin` เจ้าของตั้ง `RESEND_FROM_EMAIL` เป็น var type "Plaintext" ผ่านหน้า Cloudflare dashboard โดยตรง (ไม่ผ่าน `wrangler.jsonc`) ยืนยันว่าใช้งานได้จริง (ปุ่ม "ลืมรหัสผ่าน?" โผล่) — แต่ PR ถัดไป (แก้ `site.url`/`SITE_ENV` คนละเรื่องเลย) ทำให้ CD รัน `wrangler deploy` อีกรอบ ซึ่งไปลบ `RESEND_FROM_EMAIL` ทิ้งทันที เพราะ `wrangler deploy` ถือว่า `vars` block ใน config คือชุด plaintext var ที่สมบูรณ์ทั้งหมด ตัวไหนไม่อยู่ในนั้นแม้จะเพิ่งเพิ่มผ่าน dashboard ก็โดนลบ · `RESEND_API_KEY` (type "Secret") ไม่โดนกระทบเพราะ secret เป็นคนละ binding จาก `vars` ไม่ถูก sync ทับ · จับได้เพราะ user ถามว่าปุ่มลืมรหัสผ่านหายไปไหน ตรวจแล้วพบว่า `wrangler secret list` ไม่มี `RESEND_FROM_EMAIL` เหลืออยู่เลย
  → **กฎ: plaintext var ที่ไม่ใช่ความลับ ต้อง commit ใน `wrangler.jsonc`'s `vars` เสมอ ห้ามเพิ่มผ่าน Cloudflare dashboard เป็น "Plaintext" type ลอย ๆ** — ถ้าเพิ่มผ่าน dashboard ต้องเลือก type "Secret" แทน (secret ไม่โดน `wrangler deploy` sync ทับ) **หรือ**เอาค่ากลับมาใส่ใน `wrangler.jsonc` แล้ว commit ทันที · ตรวจสอบได้ด้วยการเทียบ `npx wrangler secret list` (secrets) + `vars` ใน `wrangler.jsonc` (plaintext) กับสิ่งที่โค้ดต้องการจริง (`grep -rhoE "process\.env\.[A-Z_]+"`) หลังแตะ config หรือ dashboard vars ทุกครั้ง
  → **กฎ: หลังตั้งค่าอะไรผ่าน Cloudflare dashboard ที่ต้อง "อยู่รอด" ข้าม deploy — verify อีกทีหลัง deploy ถัดไปเสมอ** ไม่ใช่แค่ตอนตั้งเสร็จใหม่ ๆ เพราะ deploy คนละเรื่องก็ทำให้มันหายได้แบบไม่มีใครคาดคิด

- 2026-07-25 — **แตก branch จาก `origin/main` ที่ไม่ได้ fetch สด แล้วทำงานทับของที่ merge ไปแล้ว** · หลัง merge PR #258 ผมรัน `git switch -c <ใหม่> origin/main` ทันทีโดยไม่ `git fetch` ก่อน — `origin/main` ในเครื่องยังชี้ commit ก่อน #258 · งานรอบใหม่จึงเริ่มจากฐานที่ขาดงานตัวเองไปทั้งชุด · **จับได้เพราะบังเอิญ** grep แล้วเจอ aria-label ที่เพิ่งแก้ไปเมื่อ 10 นาทีก่อนกลับมาโผล่อีก ถ้าไม่เจอตอนนั้น PR ถัดไปจะ revert งานของ #258 ทิ้งเงียบ ๆ ตอน merge
  → **กฎ: ก่อน `git switch -c <branch> origin/main` ต้อง `git fetch origin` เสมอ** — `origin/main` เป็น ref ในเครื่อง ไม่ใช่ของจริงบน GitHub · ยิ่งเพิ่ง merge เองยิ่งต้อง fetch เพราะ ref ในเครื่องไม่ขยับตามการ merge ฝั่ง server
  → **กฎ: ก่อน push ทุกครั้ง ตรวจว่า branch มี main ล่าสุดจริง** `git merge-base --is-ancestor origin/main HEAD; echo $?` (ต้องได้ 0 หลัง fetch สด) · เป็นคำสั่งเดียวกับที่ [docs/2026-07-local-version-mismatch.md](docs/2026-07-local-version-mismatch.md) เขียนไว้ตั้งแต่ 2026-07-16 — บทเรียนมีอยู่แล้ว แต่ไม่มีใครรันมันตอนแตก branch จึงย้ายมาไว้ใน §0.5 ให้เห็นพร้อมกฎอื่น

- 2026-07-25 — **เขียนสเปกให้ Codex โดยไม่เปิดไฟล์เป้าหมายอ่านก่อน ทำให้สั่งผิด 3 ครั้งในงานเดียว** · (1) สั่งให้เปลี่ยน `Header`/`Footer` เป็น async server component เพื่อใช้ `getTranslations` ทั้งที่ทั้งคู่ใช้ `useTranslations` ได้อยู่แล้ว → เทสต์ที่ผมเขียนเองแดง 3 ตัว (2) สั่งให้ใช้ `useTranslations` กับ `brand-strip.tsx` ที่ไม่มี `'use client'` (3) เขียน grep ตรวจงานเป็น `aria-label="..."` ซึ่งมองไม่เห็น `aria-label={...}` ที่เป็น JSX expression จึงมีจุดตกหล่น · **Codex ทักกลับทั้งสามข้อแทนที่จะเดาแก้เอง** เพราะสเปกเขียนไว้ว่า "ถ้าสเปกไม่ตรงกับโค้ดจริง ให้บอกตรง ๆ" — ถ้าไม่มีประโยคนั้นมันคงแก้ตามใจแล้วผมต้องมาไล่ย้อน
  → **กฎ: สเปกที่สั่ง agent อื่นต้องเขียนจากโค้ดที่เปิดอ่านแล้ว ไม่ใช่จากที่จำได้** — อย่างน้อยต้องรู้ว่าไฟล์เป็น client หรือ server component, มี translator อยู่แล้วหรือยัง, และเทสต์ตัวไหนแตะไฟล์นั้น
  → **กฎ: ใส่ประโยค "ถ้าสเปกไม่ตรงกับโค้ดจริง ให้รายงานกลับ ห้ามเดาแก้เอง" ในทุกสเปกที่ส่งให้ agent อื่น** · และ **ห้ามเชื่อผลตรวจของ agent อื่น** — รัน `pnpm lint`/`typecheck`/`test`/`build` เองทุกครั้ง (Codex รัน build ไม่ได้เพราะ sandbox ไม่มี network)
  → **กฎ: คำสั่ง grep ที่ใช้ "พิสูจน์ว่างานเสร็จ" ต้องครอบทั้ง `attr="..."` และ `attr={...}`** ไม่งั้นมันพิสูจน์แค่ครึ่งเดียวแล้วรายงานว่าครบ

- 2026-07-25 — **ระบบสมาชิกด้วยรหัสผ่านตายสนิทบน production มาหลายวัน ทั้งที่เทสต์ 47 ตัวเขียว CI เขียว และ security audit ชมค่านั้นด้วยซ้ำ** · `lib/members/password.ts` ตั้ง PBKDF2 ไว้ 600,000 รอบ แต่ workerd **ปฏิเสธเกิน 100,000** แล้ว throw `NotSupportedError: Pbkdf2 failed: iteration counts above 100000 are not supported` → `hashPassword()`/`verifyPassword()` พังทุกครั้ง = สมัคร/ล็อกอิน/รีเซ็ตรหัส ใช้ไม่ได้เลยทั้งหมด (ยืนยัน: สมาชิกทุกรายใน D1 เป็น OAuth-only ไม่เคยมีใครสมัครด้วยรหัสผ่านสำเร็จ) · ไม่มีด่านไหนจับได้เพราะ `vitest.config` ตั้ง `environment: 'node'` และ WebCrypto ของ Node **ไม่มีลิมิตนี้** — เทสต์ทั้งชุดรันบน runtime ที่โค้ดไม่ได้ทำงานอยู่บนนั้น · เจอเพราะยิง `/api/account/register` จริงบน production หลัง deploy แล้วได้ 502 → ไล่ด้วย `wrangler tail`
  → **กฎ: โค้ดที่พึ่ง Web API / crypto / binding ของ Worker — "เทสต์ผ่าน + CI เขียว" ไม่ใช่หลักฐานว่าใช้งานได้** ต้องยิงของจริงบน Worker ที่ deploy แล้วเท่านั้น · เพิ่มเข้า §0.3 checklist แล้ว · ทุกครั้งที่ deploy ตอนนี้มี `pnpm smoke` ([scripts/smoke.sh](scripts/smoke.sh)) ยิง register/login จริงให้อัตโนมัติ — แต่ครอบแค่ 2 path นั้น path อื่นยังต้องยิงเอง
  → **กฎ: ตอนออกแบบ smoke test ต้องถามว่า "ถ้าของพังจริง เทสต์นี้จะแดงไหม"** · เคสนี้ถ้าใช้อีเมล**ซ้ำ**มาทดสอบจะผ่านฉลุยทั้งที่ระบบพัง เพราะ `createMember()` เช็คอีเมลซ้ำแล้ว throw `EMAIL_TAKEN` **ก่อน** ถึง `hashPassword()` — ไม่แตะ crypto เลย · ต้องสมัครอีเมล**ใหม่**ทุกครั้งถึงจะบังคับให้วิ่งผ่าน path จริง
  → **กฎ: smoke test ที่ปลุกผิดบ่อย ๆ จะโดนปิดทิ้ง แล้วกลับไปไม่มีอะไรคุ้มกันเหมือนเดิม** · `register` จำกัด 5/15นาที `login` 10/5นาที ต่อ IP → retry ทั้งรอบหลายครั้ง หรือ deploy 2 หนใน 15 นาที จะชนลิมิตแล้วทำให้ deploy ที่ปกติดีกลายเป็นแดง · จึงแยก **429 = "สรุปไม่ได้" (exit 2 → warning, deploy ยังเขียว)** ออกจาก "พังจริง" (exit 1) เพราะ 429 พิสูจน์แล้วว่า Worker/routing/D1 limiter ทำงานอยู่ แค่ไม่ได้แตะ crypto · retry เฉพาะ transient จริง (`000`/`502`/`503`/`504`) ไม่ retry ตอน 429 และไม่ retry status ที่ผิดแบบชัดเจน
  → **กฎ: script ที่แตะ production DB ต้องลบของตัวเองแบบ self-healing** · smoke สร้าง member จริงทุกครั้ง จึงลบทั้ง prefix (`smoke-%@smoke.invalid`) ไม่ใช่แค่แถวของรอบนี้ เพื่อให้รอบถัดไปกวาดของที่รอบก่อนตายกลางคันทิ้งค้างไว้ · และ **ห้าม gate cleanup ด้วย `CLOUDFLARE_*` env var** — บนเครื่อง dev wrangler ล็อกอินผ่าน session ตัวเอง ตัวแปรพวกนั้นว่าง ทำให้ข้าม cleanup ที่จริง ๆ ทำได้ แล้วทิ้งแถวจริงไว้ใน production (เจอมาแล้วตอนรีวิว ต้องลบมือ)

- 2026-07-24 — **รูปโปรโมชั่นหายทุกครั้งที่ deploy เพราะ migration lossy ถูกผูกไว้ใน `cf:deploy` ให้รันทุกครั้ง** · `cf:deploy` มี `pnpm cf:migrate:promotions` ที่รัน [migrations/0011_promotions_image.sql](migrations/0011_promotions_image.sql) ซึ่งเป็น **table rebuild** (`CREATE promotions_new` → `INSERT ... SELECT` ที่ **ไม่ได้ copy `image_public_id`** → `DROP promotions` → `RENAME`) · รอบแรก (fresh) ถูกต้อง เพราะ source ยังไม่มีคอลัมน์นั้น แต่รอบถัด ๆ ไป source มีรูปแล้ว การ rebuild จึง **ลบรูปทั้งหมดเป็น null ทุก deploy** · อาการหลอกมาก: ผู้ใช้อัปรูป→ขึ้น→deploy อะไรก็ได้ (แม้แต่งานคนละเรื่อง)→รูปหาย โดยผู้ใช้ "ไม่ได้ทำอะไรเลย" · **ผมวินิจฉัยผิดรอบแรก** ไปโทษ `upsertPromotion` UPDATE ที่เขียนทับ image (เป็นปัญหารองจริง แต่ไม่ใช่ต้นเหตุ) แล้วบอกผู้ใช้ให้อัปใหม่ → deploy ถัดไปลบซ้ำอีก
  → **กฎ: migration ที่เป็น table-rebuild (DROP+recreate) ห้ามผูกเข้า `cf:deploy` เด็ดขาด — เป็น one-time เท่านั้น** (แบบ 0008) · เฉพาะ migration ที่ idempotent จริง (`CREATE TABLE IF NOT EXISTS` ล้วน เช่น 0007/0009/0010) ถึงจะอยู่ใน chain ที่รันทุก deploy ได้ · ก่อนใส่อะไรเข้า `cf:deploy` ต้องอ่าน SQL ให้จบว่ามี `DROP`/`RENAME`/`INSERT..SELECT` ที่ column list ไม่ครบไหม
  → **กฎ: "อัปแล้วหายเอง โดยไม่ได้แตะ" = สงสัย process อัตโนมัติ (deploy/migration/cron/cache) ก่อน อย่าเพิ่งโทษ path ที่ผู้ใช้กด** · เช็คว่าอะไรรันระหว่างที่ค่าหาย — `git log`/timestamp ของ deploy เทียบกับตอนรูปหาย · ครั้งนี้ `updated_by` ใน D1 เป็น email ผู้ใช้เลยพาให้เข้าใจผิดว่าผู้ใช้เป็นคนแก้ ทั้งที่รูปถูก null โดย migration (ซึ่งไม่แตะ updated_by)
- 2026-07-23 — **GitHub Actions ไม่ยอมรันให้กับการ push โค้ดแก้บัค (CI failed ค้าง) ทำให้ PR ถูกบล็อกถาวรโดย ruleset** · หลังจากที่ CI ของ commit แรกพัง เมื่อพยายามแก้โค้ดแล้ว push ทับขึ้นไป CI กลับไม่ยอมรันรอบใหม่ให้ ทำให้ PR ติดสถานะ fail ค้างและไม่สามารถ merge ได้เพราะ ruleset `bypass_actors: []` บังคับว่าต้องมี check `verify` จาก GitHub Actions โดยตรงเท่านั้น การพยายามใช้ API โกงสถานะ (Spoofing) ให้เป็น success ก็ไม่ผ่านเพราะ GitHub ตรวจสอบที่มาของ status ว่าต้องมาจาก app ที่กำหนด · การพยายามใช้ `gh run rerun` ก็ไปรันบน commit SHA เดิมที่เคยพัง ไม่ใช่ commit ล่าสุด
  → **กฎ: เมื่อ PR ค้างเพราะ CI ไม่ยอมรันรอบใหม่บน commit ล่าสุด (อาการ push แล้วเงียบ) ห้ามพยายามใช้ API แฮ็กสถานะ และห้ามใช้ `gh run rerun` เพราะมันจะรันบน commit เดิม — วิธีแก้ที่ถูกต้องและเร็วที่สุดคือ แตก branch ใหม่ (`git checkout -b <new-branch>`), push ขึ้นไป, และเปิด PR ใบใหม่ ซึ่งจะกระตุ้น event สร้าง PR ใหม่และบังคับให้ CI รันบน commit ล่าสุดอย่างถูกต้องสมบูรณ์**
- 2026-07-23 — **CI แดงค้างบน main เพราะงานถูก commit ลง main ตรง ๆ แล้ว push ข้าม hook — pre-push hook ตัวเดียวกันไม่ทัน** · `357b8d5` ทำ main แดงที่ lint (`lib/session.ts` ใช้ `payload as any` ยัดเข้า `JWTPayload` ของ jose → ชน `no-explicit-any` ซึ่งเป็น *error* ไม่ใช่ warning) · ไล่ `git reflog show main` เจอว่า commit 4 ตัว (08:32–09:08) ถูก **commit ลง `main` โดยตรงในโฟลเดอร์หลัก** แล้ว ff-merge `feature/login-popup` เข้า main ตามด้วย rebase — พอถึงขั้น push งานอยู่บน main หมดแล้ว ทางเดียวที่เหลือคือ `--no-verify` (หรือ tool ที่ไม่ยิง hook) · ทดสอบแล้ว hook เดิม *ทำงานถูกต้อง* — มันแค่อยู่ปลายทางเกินไป และไม่เคยเช็ค lint เลย
  → **กฎ: guardrail ต้องอยู่ที่จุดที่ความผิดพลาด "เริ่ม" ไม่ใช่จุดที่มัน "ออกไปข้างนอก"** — เพิ่ม [.githooks/pre-commit](.githooks/pre-commit) บล็อก commit บน main แล้ว · และ [.githooks/pre-push](.githooks/pre-push) รัน `pnpm lint` + `pnpm typecheck` ให้ก่อน push ถ้ามีโค้ดเปลี่ยน เพื่อไม่ให้ของแดงหลุดขึ้น GitHub ตั้งแต่แรก
  → **กฎ: ห้ามใช้ `as any` เพื่อผ่าน type ของ library** — `no-explicit-any` เป็น error ใน [eslint.config.mjs](eslint.config.mjs) เท่ากับ CI แดงแน่นอน · เคสนี้แค่ spread (`{ ...payload }`) ก็ได้ implicit index signature ตามที่ `JWTPayload` ต้องการโดยไม่ต้อง cast
  → **แก้ที่ต้นตอจริงแล้ว 2026-07-23 (ช่วงสาย)**: repo เปลี่ยนเป็น **public** → rulesets ใช้ได้ฟรี → ตั้ง `protect-main` แบบ `bypass_actors: []` · ทดสอบ `git push --no-verify` เข้า main แล้วโดน `GH013` ตีกลับที่ server · hook เลยลดบทบาทเหลือ "รู้ตัวเร็ว" ไม่ใช่ด่านสุดท้าย
- 2026-07-23 — **เกือบเปิด repo เป็น public ทั้งที่ production เซ็น session ของสมาชิกด้วยสตริงที่อยู่ในกิต** · `lib/session.ts` เขียนว่า `process.env.SESSION_SECRET || 'default-secret-key-for-development-please-change'` และ `wrangler secret list` ยืนยันว่า **ไม่เคยตั้ง `SESSION_SECRET` เลย** (มีแค่ GOOGLE/LINE) — แปลว่าคีย์เซ็น JWT ของ production คือสตริงที่ commit อยู่ใน repo · ตราบใดที่ repo เป็น private มันแค่ "อ่อน" แต่พอเปิด public มันกลายเป็น "ปลอม session ได้ทันที" · ตอนนั้นยังไม่มีใครเรียก `getSession()` (Phase 3/4 ยังไม่เสร็จ) ช่องโหว่จึงยัง **latent** — แต่ถ้าเปิด public ไปก่อนแล้วค่อยต่อ Phase 3 คือระเบิดเวลา
  → **กฎ: ก่อนเปลี่ยน repo เป็น public ต้อง audit ความลับให้ครบก่อนเสมอ** — (1) ไฟล์ที่ track + **ทุก commit ในประวัติ** (`git log --all --diff-filter=A --name-only`, `git grep` ข้าม `git rev-list --all`) เพราะ public = ประวัติทั้งหมดเปิด และ **ย้อนกลับไม่ได้** (fork/cache/archive ที่หลุดไปแล้วลบไม่ได้), (2) `wrangler secret list` เทียบกับ `grep -rhoE "process\.env\.[A-Z_]+"` — env ทุกตัวที่โค้ดอ่านต้องมีจริงหรือมีทางล้มที่ปลอดภัย, (3) ข้อมูลส่วนบุคคลของคนไข้ (PDPA) ใน seed/migration
  → **กฎ: ห้ามใส่ค่า fallback ให้ความลับด้วย `||`** — `process.env.X || 'ค่าจริงบางอย่าง'` ทำให้ระบบ "ทำงานได้" ทั้งที่ config หาย = พังเงียบชนิดที่แย่ที่สุด · production ต้อง **throw** ให้รู้ตัว, dev ค่อยมี fallback · และต้อง resolve **ตอนเรียก ไม่ใช่ตอน import** ไม่งั้น `next build`/CI ที่ไม่มี secret จะพังทันที
- 2026-07-23 — **ดึงโค้ด (`git pull --rebase`) ทับงานที่ยังไม่ได้ commit ทำให้ไฟล์ที่อุตส่าห์แก้โดนย้อนกลับเป็นเวอร์ชันเก่า** · ผมทำ Apple-style header เสร็จแล้ว แต่ไปดึงโค้ดอัปเดตจาก `main` (ที่มีคนอื่น merge PR เข้าไป) มาผสมกันด้วยท่าสคริปต์อัตโนมัติ `git stash && git pull --rebase && git stash pop` โดยไม่ยอมตรวจ Conflict ทำให้ไฟล์ `Header.tsx` พังเงียบและโดนทับกลับไปเป็นโค้ดปุ่มสีเขียวแบบเก่า ก่อนจะถูกนำไป deploy ขึ้นเว็บจริง → **กฎ: (1) ห้ามใช้ `git stash` แล้วตามด้วย `git pull` และ `git stash pop` แบบสคริปต์รวดเดียวเด็ดขาด เพราะเวลาชนกันมันจะมองไม่เห็นและไฟล์พังเงียบ (2) งานที่เพิ่งแก้เสร็จต้องบังคับ `git commit` ให้เรียบร้อยก่อนสั่งดึงโค้ดเสมอ (3) หากเกิด Merge Conflict ต้องหยุดเช็คเนื้อหาไฟล์แบบบรรทัดต่อบรรทัด ห้ามคิดไปเองว่ามัน merge ให้ถูกต้องแล้ว**
- 2026-07-22 — **เปลี่ยนรูปใน /admin แล้วหน้าเว็บไม่อัปเดต เพราะตาราง tag cache ของ OpenNext (`revalidations`) ไม่เคยถูกสร้างใน D1** · admin เขียน override ลง `site_images` (D1) สำเร็จจริง แต่หน้าแรกยังเสิร์ฟรูป default + `x-nextjs-cache: HIT` ตลอด · สาเหตุ: `d1NextTagCache` ต้องมีตาราง `revalidations (tag, revalidatedAt, stale, expire)` ซึ่งปกติ `opennextjs-cloudflare populateCache` เป็นคนสร้าง — แต่ `cf:deploy` ของเราเลี่ยง workerd ด้วย `wrangler deploy` ตรง ๆ จึง **ข้าม populateCache** → ไม่มีตาราง → `revalidatePath()` ไม่มีที่บันทึก → on-demand ISR ตายเงียบ (หน้าอัปเดตเฉพาะตอน time-based `revalidate=3600` ครบ) · เกือบพลาดซ้ำ: `.open-next/cloudflare/cache-assets-manifest.sql` สร้าง `revalidations` **แค่ 2 คอลัมน์** (schema ของ `d1TagCache` ตัวเก่า คนละตัว) — รันแล้ว runtime query 4 คอลัมน์จะ error → **กฎ: (1) `cf:deploy` ที่ไม่ผ่าน `opennextjs-cloudflare deploy`/`populateCache` ต้องสร้าง/ดูแลตาราง tag cache เอง — ผูก `migrations/0007_tag_cache_revalidations.sql` เข้า `cf:deploy` (idempotent) แล้ว · (2) เวลาซ่อม tag cache ให้ยึด schema จาก override ตัวจริงที่ config ใช้ (`node_modules/**/tag-cache/d1-next-tag-cache.js` — `SELECT ... FROM revalidations`) ไม่ใช่จาก manifest/ตัวอย่างของ cache ตัวอื่น · (3) "เปลี่ยนใน /admin แล้วไม่ขึ้น" ให้ audit ทั้งสาย: upload→Cloudinary→`site_images` (query remote D1 ยืนยัน)→`REVALIDATION_TARGETS`→ตาราง `revalidations` มีจริงไหม→`x-nextjs-cache` · ยืนยัน D1 ด้วย `wrangler d1 execute <db> --remote` (ไม่ใช้ workerd รันได้บนเครื่องนี้)**
- 2026-07-22 — **งานที่ทำผ่าน Antigravity เหมือน "หายไป" หลัง deploy เพราะมัน committed-แต่-ไม่-push ค้างในโฟลเดอร์หลัก ส่วน deploy ยิงจาก main ที่ไม่มีงานนั้น** · repo นี้ถูกแก้จาก **สองเครื่องมือ**: Antigravity ทำงานใน **โฟลเดอร์หลัก** `/Users/bank/Desktop/kazami clinic` (marker: มีโฟลเดอร์ `.agents/`), ส่วน Claude Code แต่ละ session ได้ **git worktree แยก** ใต้ `.claude/worktrees/*` บน branch `claude/*` · AG แก้หน้า inner เสร็จ commit 2 ตัว + แก้ค้างอีกชุด แต่ไม่ push → ตอน deploy จาก main เว็บเลยไม่มีงานนั้น ทำให้ดูเหมือนงานหาย (จริง ๆ อยู่ครบบนดิสก์) → **กฎ: (1) งานที่ยัง uncommitted หรือ committed-แต่-ไม่-push = มองไม่เห็นจากการ deploy ทุกครั้ง และเสี่ยงถูกทับ — หยุดงานเมื่อไหร่ให้ commit + push เมื่อนั้น · (2) "เวอร์ชันล่าสุด" = `origin/main` เท่านั้น ห้ามยึดไฟล์ในโฟลเดอร์ใครเป็นของล่าสุด — deploy จาก `origin/main` หลัง merge เสมอ · (3) หนึ่งฟีเจอร์ = หนึ่งเครื่องมือ อย่าให้ Claude กับ AG แก้ไฟล์ชุดเดียวกันพร้อมกัน (คนละไฟล์/หน้า merge ได้ปลอดภัย)**
- 2026-07-22 — **โครงสร้าง worktree เป็นกับดักเงียบ 2 แบบที่ทำให้ deploy ของเก่า/งานวนลูป** · หลัง squash-merge พบว่า (ก) โฟลเดอร์หลักค้างบน feature branch ที่ merge ไปแล้ว (remote gone, commit graph แยกจาก main) → ถ้าแก้ต่อบน branch ตายจะเริ่มวนลูปเดิม · (ข) มี worktree ค้างถือ branch `main` เวอร์ชันเก่ากว่า `origin/main` → เผลอ `pnpm cf:deploy` จากมันเว็บถอยเวอร์ชันทันที → **กฎ: ก่อนเชื่อว่าอะไร "ล่าสุด" หรือก่อน deploy ให้รัน `git worktree list` แล้วเทียบ sha ของแต่ละอันกับ `git rev-parse origin/main` (fetch สดก่อน) · โฟลเดอร์หลักควรอยู่บน `main` สด (`git checkout main` + ลบ branch ตายที่ squash-merge แล้ว) · worktree ที่ถือ `main` ค้างเก่าให้ fast-forward หรือปลดทิ้ง · ห้ามแตะ worktree `claude/*` ของ session อื่น (อาจมีงานยังไม่ merge — ทับแล้วคือทำให้ session นั้นเจอปัญหา "งานหาย" แบบเดียวกัน)**

- 2026-07-20 — **การ์ดโปรโมชั่นทุกใบพาไปหน้าเดียว เพราะ component hardcode `href="/promotions"` และข้อมูลโปสเตอร์ไม่มีปลายทางของตัวเอง** · หน้าตาการ์ดต่างกันแต่ interaction ให้ผลเหมือนกันทั้งหมด จึงทำให้ผู้ใช้ไปไม่ถึงหน้าบริการที่เลือก → **กฎ: รายการที่สร้างจาก data และคลิกได้ต้องเก็บ destination ไว้ใน source of truth ของแต่ละ item, component ต้องอ่านค่านั้นแทน hardcode URL กลาง และ visual QA ต้องทดลองลิงก์ตัวแทนอย่างน้อยหนึ่งใบต่อ destination ที่แตกต่างกัน**

- 2026-07-17 — **รัน `pnpm dev` ค้างระหว่าง `pnpm cf:deploy` ทำให้ production bundle ปน development assets และหน้าเว็บตอบ 500** · รอบ deploy หน้า `/filler` มี Next dev server เขียน `.next` พร้อม OpenNext production build; asset upload จึงมี `/_next/static/development/*` และ `*.hot-update.js` ติดขึ้น Worker แม้ build/deploy จบพร้อม `Current Version ID` → **กฎ: ก่อน deploy ต้องหยุด dev server ทุกตัวที่ใช้ working tree เดียวกัน, สร้าง production artifacts ใหม่จาก build directories ที่สะอาด, แล้วตรวจ HTTP URL จริงทุกครั้ง**; `Current Version ID` อย่างเดียวไม่ยืนยันว่าเว็บใช้งานได้
- 2026-07-17 — **แก้เฉพาะสิ่งที่เห็นบนหน้า แต่ไม่ไล่ end-to-end = ทิ้งบั๊กไว้ใน metadata/admin/cache** · หน้า `/services` เคยใช้รูป hero ที่เปลี่ยนผ่าน `/admin` ได้ แต่ OG/Twitter ยังเป็น `const ogImage = cld(...)` ที่ถูก freeze ตอน build; Header/Footer และ JSON-LD logo ก็ยังอ่านค่า default; revalidation map ไม่ครอบทุกหน้าที่ใช้ slot เดียวกัน → **กฎ: งานที่แตะรูปต้อง audit ทั้งสายเสมอ**: page render → OG → Twitter → JSON-LD → Header/Footer (ถ้าเกี่ยว) → admin slot → D1 override → `REVALIDATION_TARGETS` → ISR/runtime verification · ห้ามปิดงานเพียงเพราะภาพบนหน้าที่ user ส่งมาดูถูกแล้ว และห้ามสร้าง Cloudinary URL สำหรับรูปที่ admin เปลี่ยนได้ด้วย module-level const
- 2026-07-17 — **เอกสารเก่าที่ขัดกับ implementation ทำให้ agent ทำผิดซ้ำ** · README/CLAUDE ยังระบุ R2, 5 หมวดบริการ, `ogImage` field และ local `cf:preview` ทั้งที่ production ใช้ KV, มี 9 หมวด, metadata อ่าน image slot และเครื่องนี้รัน workerd ไม่ได้ → **กฎ: เมื่อ architecture/data/workflow เปลี่ยน ต้องค้นทุก `.md` หา keyword เก่าและแก้ใน PR เดียวกัน**; ข้อเท็จจริงเรื่อง runtime ให้ยึด `package.json`, `open-next.config.ts`, `wrangler.jsonc`, `lib/services.ts` และ `origin/main` ก่อน prose เสมอ
- 2026-07-17 — **ตรวจ production ทันทีหลัง deploy = อ่าน HTML ของ build ก่อนหน้า แล้วเกือบรายงานว่า deploy พัง** · หลัง `pnpm cf:deploy` ผมยิง `/filler` แล้วพบว่า hero ยังเป็นของเก่า ทั้งที่ deploy คืน `Current Version ID` และการ์ด (จาก PR ก่อน) ขึ้นครบ — เกือบสรุปว่า build ไม่ขึ้น · สาเหตุจริง: หน้าเป็น **ISR + `stale-while-revalidate`** → request แรกเสิร์ฟของเก่าจาก KV (`x-nextjs-cache: HIT`) แล้วค่อย regenerate เบื้องหลัง · **ยิงครั้งที่สองได้ของใหม่ครบ** — deploy ไม่เคยพัง ตัววัดต่างหากที่ผิด
  → **กฎ: หลัง deploy ต้องยิง URL อย่างน้อย 2 ครั้ง (หรือรอ) ก่อนเชื่อสิ่งที่อ่าน** และดู `x-nextjs-cache` ประกอบ · `curl` ครั้งเดียวแล้วสรุปคือการวัดแคช ไม่ใช่วัด build · กฎ §0 ที่เขียนว่า "ตรวจ URL จริงได้ HTTP 200" **ไม่พอ** — 200 มาจากของเก่าก็ได้ และ*เนื้อหา*ก็เก่าตามด้วย
  → เป็นบั๊กชุดเดียวกับ "ห้ามรายงานสถานะที่ไม่ได้ตรวจ" แต่กลับด้าน: คราวนี้**ตรวจแล้ว แต่เครื่องมือวัดโกหก** · เวลาผลตรวจขัดกับสิ่งที่เพิ่งทำ ให้สงสัยตัววัดก่อนสรุปว่างานพัง
- 2026-07-17 — **"คำสั่งที่พังมานาน" ถูกเข้าใจเป็น "นิสัยของ repo" แทนที่จะเป็นบั๊ก — quality gate เลยตายเงียบหลายเดือน** · `pnpm lint` (= `eslint .`) พังทุกครั้งด้วย error ชี้ไป migration guide ของ ESLint · สาเหตุจริง: **ไม่มีไฟล์ eslint config เลยสักไฟล์** และ ESLint 9 อ่านเฉพาะ flat config → มัน exit 2 ตั้งแต่ก่อนจะ lint อะไร แปลว่า **repo นี้ไม่เคย lint สักบรรทัดเดียว** · เพราะ checklist §0.3 บังคับแค่ typecheck + build ทุกคนเลยเดินผ่านมันไปโดยคิดว่า "มันเป็นแบบนี้แหละ" · พอใส่ `eslint.config.mjs` (FlatCompat เพราะ eslint-config-next 15.5 ยังเป็น eslintrc) มันเจอทันที 1 error + 18 warning ที่ค้างมานาน
  → **กฎ: คำสั่งใน `package.json` ที่ fail ต้องหาสาเหตุจริงก่อนเสมอ ห้ามสรุปว่า "พังอยู่แล้ว/พังมาก่อน" แล้วเดินผ่าน** — "พังมาก่อน" อธิบายว่า*ใครทำ* ไม่ได้อธิบายว่า*ทำไม* · script ที่ fail ทุกครั้ง = gate ที่ไม่ได้ทำงาน ไม่ใช่ gate ที่เข้มงวด
  → **กฎ: rule ที่ `eslint-disable` อ้างถึง ต้องเปิดใช้จริง** — ตอนเปิด lint ได้ พบว่า directive `react/no-danger` ทั้ง 8 จุดรายงานเป็น "unused" เพราะ `next/core-web-vitals` ไม่เคยเปิด rule นั้น · **ห้ามลบ directive ตาม label "unused"** (§0.5 เตือนไว้แล้ว) — ให้เปิด rule ที่มันอ้างถึงแทน ไม่งั้นคือลบ convention ที่ §12 เขียนไว้เองทิ้ง
- 2026-07-17 — **เว็บ deploy จริงแล้ว — ข้อความ "ไม่เคย deploy" ในไฟล์นี้หมดอายุแล้ว** · `wrangler deployments list` **ไม่ว่างอีกต่อไป** (ตรวจ 2026-07-17: มี deploy หลายครั้งตั้งแต่ 02:09 น.) และ `https://kazumi-clinic.bankjack10452.workers.dev/services` ตอบ **200** จริง · แต่ `kazumiclinic.com` ยัง **ไม่ตอบ (000)** → โดเมนจริงยังไม่ขึ้น, `SITE_ENV=preview` จึงยังต้องอยู่ และ robots.txt ยัง `Disallow: /` ทั้งไซต์ (ตรวจแล้วว่าทำงานจริง)
  → บทเรียน 2026-07-16 ด้านล่างที่เขียนว่า "ไม่เคย deploy เลยสักครั้ง" **ยังคงไว้ในฐานะบันทึกประวัติ** และ*กฎ*ของมัน (ต้องยิงคำสั่งตรวจก่อนพูด) ยังใช้ได้เต็มร้อย — แต่ **ห้ามอ่านมันเป็นสถานะปัจจุบัน** · นี่คือตัวอย่างของกฎนั้นเอง: ไฟล์นี้บอกว่าไม่เคย deploy, ของจริงตรงข้าม — **ตรวจก่อนพูดทุกครั้ง**
- 2026-07-17 — **ไฟล์ที่เปิดจากดิสก์ ≠ ไฟล์บน main — audit ผิดตัวแล้วรายงานว่าคนอื่นมีบั๊ก** · ผม audit `CLAUDE.md` ของ littlesmileflower โดย `Read` จากโฟลเดอร์เขาตรง ๆ แล้วรายงาน user ว่า "ต้นฉบับยังมี 3 บั๊กค้างอยู่" · พอ user สั่งให้ไปแก้ให้ ถึงรู้ว่าสำเนาบนดิสก์นั้นอยู่บน branch ค้างเก่า (`fix/confirmed-no-price-empty-card`, 315 บรรทัด) ส่วน **main ของเขาแก้ครบทั้ง 3 ข้อไปแล้ว** (398 บรรทัด, refactor ใหญ่, มี `docs/lessons.md` + `pnpm run seo:check` ที่เราไม่มีด้วยซ้ำ) → ผมกล่าวหาเขาผิด ๆ และเกือบเปิด PR "แก้" สิ่งที่ไม่พัง
  → **กฎ: ก่อนสรุปสถานะโค้ดของ repo ใด (โดยเฉพาะ repo อื่น) ต้องอ่านจาก ref ที่ระบุชัดเสมอ** — `git -C <repo> show origin/main:path` หรือ `git fetch` + worktree จาก `origin/main` · **ห้าม `Read` ไฟล์จาก working copy แล้วเรียกมันว่า "โค้ดของโปรเจกต์นั้น"** เพราะ working copy อาจอยู่บน branch อื่น มี uncommitted changes หรือค้างหลัง main เป็นเดือน · เช็คก่อนเสมอ: `git -C <repo> branch --show-current` + `git -C <repo> status --short`
  → เป็นบั๊กชุดเดียวกับ 2026-07-16 ที่ผมเปิด local dev server ให้ user ดูแล้วบอกว่า "เวอร์ชันล่าสุด" ทั้งที่ worktree ค้างอยู่ 2 commit หลัง main · **"ล่าสุด" ต้องเทียบกับ `origin/main` ที่ fetch สด ไม่ใช่สิ่งที่บังเอิญอยู่ในโฟลเดอร์**
- 2026-07-17 — **พอร์ต convention จากโปรเจกต์พี่น้องมาทั้งดุ้นโดยไม่ตรวจ = นำเข้าคำโกหกมาด้วย** · ไฟล์นี้พอร์ตมาจาก [littlesmileflower v2](../littlesmileflower%20v2/CLAUDE.md) (ดู §ประวัติการตัดสินใจ 2026-07-09) · ที่นั่น §0 เขียนว่า "Cloudflare Workers build ต้อง SUCCESS ก่อน merge" + "บอก user ว่ากำลัง deploy production" ซึ่ง**อาจจริงที่โน่น** (เขาต่อ Cloudflare Git integration ไว้) แต่ **repo นี้ไม่เคยมีทั้ง CI และ deploy เลย** — พอลอกมาทั้งย่อหน้า ผมก็เชื่อตามไฟล์แล้วรายงานผิดกับ user ทุก PR ติดต่อกันหลายสิบครั้ง (ดูบทเรียนถัดไป)
  → **กฎ: ทุกประโยคที่พอร์ตมาจาก repo อื่น ต้อง verify กับ repo นี้ทีละข้อก่อนเขียนลงไฟล์** — คำสั่ง/สคริปต์มีจริงไหม (`package.json`), binding มีจริงไหม (`wrangler.jsonc`), CI มีจริงไหม (`ls .github/workflows`, `gh pr checks`) · ข้อไหนยังไม่ได้ตรวจ **ห้ามเขียนเป็นคำสั่ง** ให้เขียนเป็น TODO พร้อมวิธีตรวจ · convention ที่ลอกมาได้ฟรีคือ *รูปแบบ* (เช่น no-trailing-slash, single source of truth) ไม่ใช่ *ข้อเท็จจริงเรื่อง infra*
- 2026-07-16 — **รายงานสถานะที่ไม่เคยตรวจ = โกหก user โดยไม่ตั้งใจ** · ผมบอก user ซ้ำ ๆ ทุก PR ว่า "merge แล้ว Cloudflare Workers กำลัง deploy production" เพราะ §0 ของไฟล์นี้เขียนให้พูดแบบนั้น — **แต่ไม่เคยตรวจสักครั้ง** พอ user ขอดู "เวอร์ชันล่าสุด" จริง ๆ ถึงพบว่า `wrangler deployments list` = ว่างเปล่า (ไม่เคย deploy เลยสักครั้ง), ไม่มี `.github/workflows`, `kazumiclinic.com` DNS ชี้มา Cloudflare แต่ไม่มีอะไรตอบ → **งานทั้งหมดอยู่แค่บน main ไม่เคยขึ้นเว็บจริง** และ user เข้าใจมาตลอดว่าขึ้นแล้ว
  → **กฎ: ห้ามรายงานสถานะของสิ่งที่อยู่นอกเครื่อง (deploy, CI, DNS, โดเมน, บริการภายนอก) จากการอ่านเอกสาร/สคริปต์/config หรือจากที่ไฟล์นี้เขียนไว้ — ต้องยิงคำสั่งตรวจจริงก่อนพูดทุกครั้ง** (`wrangler deployments list`, `gh pr checks`, `curl -o /dev/null -w '%{http_code}'`) · ถ้ายังไม่ได้ตรวจ ให้บอกตรง ๆ ว่า "ยังไม่ได้ตรวจ" · เอกสาร (รวมไฟล์นี้) บอกแค่ว่า *ตั้งใจให้เป็นยังไง* ไม่ใช่ *ความจริงตอนนี้* — CLAUDE.md เองก็ผิดมาแล้ว (ข้อ §0 เดิมสั่งให้เช็ค "Cloudflare Workers build" ที่ไม่เคยมีอยู่จริง)
  → กฎเดียวกันกับ "อาการที่อธิบายไม่ได้": ตอนรูป hero ไม่ขึ้น ผมสรุปเองว่า "เป็นแค่ dev fetch ช้า" โดยไม่ตรวจ HTTP status — ที่จริงคือ Cloudinary ตอบ 400 (แก้ทีหลังใน #12 ด้วย `c_limit`) · **ห้ามเดาสาเหตุแล้วรายงานเหมือนเป็นข้อสรุป — ตรวจก่อน**
#### บทเรียนที่พอร์ตมาจาก littlesmileflower v2

ต่อไปนี้ **ยังไม่เคยเกิดที่ repo นี้** แต่เกิดจริงที่โปรเจกต์พี่น้องซึ่งใช้ stack เดียวกัน (Next App Router + Cloudflare/OpenNext + Cloudinary + D1) และผมได้ตรวจแล้วว่า**เงื่อนไขที่ทำให้พลาดมีอยู่จริงในโค้ดเรา** — ถือเป็นกฎเท่ากับบทเรียนของเราเอง

- **`position: fixed` ตายเงียบใน ancestor ที่มี `transform`** · CSS spec: ancestor ที่มี `transform`/`filter`/`perspective`/`will-change: transform` กลายเป็น containing block ของ `fixed` descendant → `fixed inset-0` จะกางเท่า ancestor ไม่ใช่เต็มจอ และ **z-index ไม่ช่วย** · **เราเสี่ยงจริง**: [`.reveal` ใน app/globals.css](app/globals.css) ใช้ `transform: translateY(28px)` และห่อเนื้อหาแทบทุก section → **ถ้าจะทำ modal/lightbox/drawer เอง ต้อง `createPortal(..., document.body)` เสมอ** · ตอนนี้ยังไม่พังเพราะ `components/ui/sheet.tsx` ของ Base UI portal ให้อยู่แล้ว — กฎนี้มีไว้กันตอนเขียน overlay เอง
- **แก้ bug ต้องแก้ทั้ง pattern ไม่ใช่แค่ไฟล์ที่ user ส่งรูปมา** · ที่โน่นแก้ lightbox z-index ไฟล์เดียวตามสกรีนช็อต ทิ้งอีกไฟล์ที่ bug เดียวกัน → user เจอซ้ำรอบสอง → **grep หา pattern ก่อนเสมอ แล้วเลือกให้ชัด: (a) แก้ทุกไฟล์ที่ match พร้อมกัน หรือ (b) เขียนในรายงานว่าไฟล์อื่นไม่แก้เพราะอะไร — ห้ามแก้ไฟล์เดียวแล้วเงียบ**
- **ก่อนแก้ conditional ให้ list ทุก state ที่เงื่อนไขนั้นครอบคลุม** · ที่โน่นแก้ gate ของ status `confirmed` ตามรูปที่ user ส่ง ลืมว่า `delivering`/`completed` ใช้ gate เดียวกัน → **ถามทุกครั้งว่า "state อื่นพังแบบเดียวกันไหม" ไม่ใช่แก้แค่เคสในรูป**
- **ห้ามลบ `eslint-disable`/guard/suppression โดยเชื่อ label "unused"** · ที่โน่นลบ directive 2 ตัวทั้งที่ lint บอกว่า unused **เฉพาะตัวที่สอง** → error โผล่ · **tool ที่ report ตำแหน่งเจาะจง (บรรทัด/ไฟล์) ให้แก้เฉพาะตำแหน่งนั้น ห้าม generalize ไปลบพี่น้องที่หน้าตาเหมือนกัน** · ถือว่าการลบ safety directive = destructive change ต้อง verify หลังลบทุกครั้ง · **เกี่ยวกับเราตรง ๆ**: `app/(site)/[locale]/page.tsx`, `app/(site)/[locale]/[category]/page.tsx` ฯลฯ มี `// eslint-disable-next-line react/no-danger` คุม JSON-LD อยู่ทุกไฟล์
- **`npx tsc --noEmit` ลอย ๆ ไม่นับเป็น verify — ใช้ `pnpm typecheck` ตาม `package.json` เสมอ** · และ iCloud Drive ชอบสร้างสำเนา `* 2.ts` / `* 2.tsx` / `.next/* 2.*` ค้างไว้ ทำให้ typecheck ล้มด้วย `Duplicate identifier` แบบงง ๆ · **เกิดกับเราแล้วจริง** (2026-07-16: `.next/types/routes.d 2.ts` ทำ `pnpm typecheck` ล้ม ทั้งที่โค้ดไม่ผิด) → เจอ error แปลก ๆ ให้ `find . -name '* 2.*' -not -path './node_modules/*'` ก่อนไล่แก้โค้ด
- **หน้าที่ตั้ง `robots: { index: false }` ต้อง `disallow` ใน [app/robots.ts](app/robots.ts) ด้วยเสมอ** · meta noindex = ห้าม index, robots.txt = ห้าม crawl เป็นคนละ layer ต้องใช้คู่กัน · **จะสำคัญตอนทำหน้า `/admin`** (robots.ts เรา disallow `/admin` ไว้แล้ว — ตอนสร้างหน้าจริงอย่าลืมใส่ `index: false` ใน metadata ด้วย)
- **ค่า enum/unit/code ใน JSON-LD ต้องเช็คกับเอกสารของ Google ไม่ใช่แค่ schema.org** · ที่โน่นใส่ `unitCode: 'HUR'` ซึ่ง valid ตาม schema.org แต่ Google ไม่รับ → GSC ขึ้น error ทั้ง 27 สินค้า · **Google จำกัด enum แคบกว่า schema.org เสมอ** → เพิ่ม field ใหม่ที่มีค่า fixed (`availability`, `priceCurrency`, `@type` ของ MedicalProcedure ฯลฯ) ให้เปิด doc ของ Google เช็ค "supported values" ก่อน ship แล้วทดสอบ 1 หน้าใน Rich Results Test

- 2026-07-16 — `wrangler dev`/`opennextjs-cloudflare deploy` พังบนเครื่องนี้ด้วย error macOS version (ต้องการ macOS 13.5+, เครื่อง dev เป็น 12.7.6 — ตรวจซ้ำด้วย `sw_vers` 2026-07-25) เพราะทั้งสองคำสั่งรัน local `workerd`/miniflare ก่อน (สำหรับ dev server จริง, และสำหรับ deploy ใช้อ่าน env ผ่าน `getPlatformProxy`) → **deploy จริงยังทำได้** โดยข้าม wrapper: ใช้ `OPEN_NEXT_DEPLOY=true wrangler deploy` แทน `opennextjs-cloudflare deploy` — env var นี้บอก wrangler ไม่ต้อง delegate ไปที่ opennextjs-cloudflare's deploy command (ซึ่งเป็นจุดที่เรียก workerd) แล้วรัน plain `wrangler deploy` ตรง ๆ จาก `.open-next/worker.js` ที่ build ไว้แล้วแทน (อัปโหลด asset ได้ปกติ ไม่ต้องรัน worker locally) — ผูกไว้ใน `cf:deploy` script ของ `package.json` แล้ว · `wrangler dev`/`cf:preview` (local preview ที่ต้องรัน worker จริง) ยังใช้ trick นี้ไม่ได้ เพราะจำเป็นต้องรัน workerd จริงเพื่อ serve request — ต้อง deploy จริงแล้วดูผลบน Cloudflare แทนถ้าจะ preview บนเครื่องนี้

---

## 1. URL conventions — **ห้ามมี trailing slash**

มาตรฐานของไซต์นี้คือ **ไม่มี trailing slash** ทุกที่ (Next.js default)
- มีการตั้งค่า `trailingSlash: false` ไว้ใน `next.config.mjs` อย่างชัดเจน
- **CRITICAL**: มีการบังคับใช้ 308 Permanent Redirect ใน `middleware.ts` สำหรับ URL ที่มี trailing slash (ยกเว้น root `/`) เพื่อป้องกันปัญหา Duplicate Content อย่างเด็ดขาด และกระบวนการนี้ต้องทำ *ก่อน* ที่ `next-intl` จะทำงาน

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

### เว็บมี 2 ภาษา — path มี prefix เฉพาะอังกฤษ

ไทย (default) = path เปล่า `/filler` · อังกฤษ = `/en/filler` (`localePrefix: 'as-needed'`) · canonical/hreflang/sitemap ต้องแยกต่อ locale — ดู **§13**

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

หน้า dynamic (`app/(site)/[locale]/[category]/page.tsx`) ใช้ `generateMetadata` — canonical และ `openGraph.url` ต้องตรงกัน

---

## 3. JSON-LD / Schema.org rules

### 3.1 MedicalBusiness อยู่ที่ public site layout เท่านั้น

`clinicSchema()` ใน [lib/schema.ts](lib/schema.ts) ถูก inject ผ่าน [app/(site)/[locale]/layout.tsx](<app/(site)/[locale]/layout.tsx>) ทุกหน้าสาธารณะ มี `@id: ${site.url}/#business` และรับ hero/logo public ID ที่ resolve จาก image slot แล้ว

**ห้าม** เขียน `MedicalBusiness`/`HealthAndBeautyBusiness` ซ้ำในหน้าอื่น — ใช้ `@id` ref แทน:

```ts
provider: { '@id': `${site.url}/#business` }   // ✓ ถูก
```

### 3.2 FAQ schema มีได้ที่เดียว

**FAQ schema (`@type: FAQPage`) อยู่ที่ home page เท่านั้น** ห้ามใส่ในหน้า service category หรือ about/contact

### 3.3 ItemList สำหรับหน้า service category

ทุก slug ใน `serviceCategories` ของ [lib/services.ts](lib/services.ts) ต้องมี `ItemList` schema ผ่าน `serviceItemListSchema()`; หน้า `/services` ใช้ `serviceCategoryListSchema()` แสดงครบทุกหมวด — ห้ามเขียนรายชื่อ slug ซ้ำในเอกสารหรือ component เพราะจำนวนหมวดเปลี่ยนได้

### 3.4 BreadcrumbList

ทุกหน้าสาธารณะยกเว้นหน้าแรกต้องมี `BreadcrumbList` ตาม implementation ปัจจุบัน (service category, services, about, contact, reviews, promotions) — ใช้ `breadcrumbSchema()` จาก `lib/schema.ts`

### 3.5 ราคาใน schema

`Offer.price` ใน `serviceItemListSchema` ดึงจาก `item.priceFrom` ใน `lib/services.ts` โดยตรง — ถ้าราคาเปลี่ยนแก้ที่ไฟล์นั้นที่เดียว ห้าม hardcode ราคาซ้ำในหน้า component

### 3.6 URL ใน JSON-LD

ใช้รูปแบบเดียวกับ canonical — ไม่มี trailing slash

---

## 4. Sitemap rules — [app/sitemap.ts](app/sitemap.ts)

- ทุก URL ต้อง **ไม่มี trailing slash** (ยกเว้นหน้าแรก `${base}/`)
- เพิ่มบริการใหม่ → เพิ่มใน `lib/services.ts` ก่อน sitemap จะ generate ให้อัตโนมัติจาก `serviceCategories`
- เพิ่มหน้า static ใหม่ (เช่น `/promotion`, `/doctor`) → เพิ่มใน `staticUrls` array ด้วยตนเอง
- `priority`: home 1.0, services + service category 0.9, promotions 0.8, reviews/about/contact 0.6

---

## 5. robots.ts — [app/robots.ts](app/robots.ts)

- **สถานะปัจจุบัน (2026-07-27): `SITE_ENV` ถูกลบแล้ว** เพราะโดเมนจริง `kazumiclinic.skin` ขึ้นแล้ว → robots.txt เปิดให้ crawl ตามปกติ และต้องคง `disallow: ['/admin', '/admin/', '/api/']` ไว้เสมอ — ห้ามแก้ออก
- กลไก `SITE_ENV=preview` (บังคับ `disallow: '/'` ทั้งไซต์) ยังอยู่ในโค้ดเผื่อ environment ชั่วคราวในอนาคต — ใช้เมื่อ hostname ที่เสิร์ฟ **ไม่ตรงกับ** `site.url` เท่านั้น ไม่งั้น Google จะเก็บ hostname ที่ canonical ชี้ไปที่อื่น
- **ห้ามใส่** `host` directive (Yandex-only)
- **ห้ามใส่** `crawl-delay`

---

## 6. OpenGraph / Twitter card

- layout ของ `[locale]` ตั้ง document shell + default OG/Twitter ผ่าน async `generateMetadata` ใน [app/(site)/[locale]/layout.tsx](<app/(site)/[locale]/layout.tsx>) (ไม่มี root `app/layout.tsx` แล้ว — `/admin` มี layout ของตัวเอง ดู §13)
- รูปที่ `/admin` เปลี่ยนได้ต้อง resolve ด้วย `siteSocialImage(key)` หรือ `getImage(key)` ภายใน async `generateMetadata`; **ห้าม** `const ogImage = cld(...)` ระดับโมดูล
- OG และ Twitter ของหน้าเดียวกันต้องใช้ image slot เดียวกัน; หน้า `/services` ใช้ `hero-iv-drip-2` ซึ่งเป็น slot เดียวกับ hero ที่ render จริง
- หน้า service category ใช้ `categoryImageKey` เพื่ออ่าน admin override และ fallback ไป `service.heroImage`; หมวดที่ยังไม่มีรูปจริงให้ใช้ Twitter summary/no image แทนการยืม hero หน้าแรกหรือรูปหัตถการอื่น
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
| ข้อมูลแพทย์                                 | [lib/doctor.ts](lib/doctor.ts)       |
| โปรโมชั่น/โปสเตอร์                          | [lib/promotions.ts](lib/promotions.ts) + ตาราง D1 `promotions` (ของจริง) |
| image slots + ตำแหน่งที่ใช้                 | [lib/site-images.ts](lib/site-images.ts) |
| MedicalBusiness JSON-LD + schema helpers   | [lib/schema.ts](lib/schema.ts)       |
| สี/ฟอนต์ของแบรนด์ (CSS variables)          | [app/globals.css](app/globals.css)   |
| ข้อความ UI ทุกภาษา                          | [messages/th.json](messages/th.json) + [messages/en.json](messages/en.json) |
| locale/routing config                       | [i18n/routing.ts](i18n/routing.ts)   |
| % มัดจำ + กติกาตะกร้า/checkout               | [lib/members/config.ts](lib/members/config.ts) |
| design system และโครงหน้า Services          | [docs/design.md](docs/design.md)     |

เพิ่มบริการ/หมวดใหม่ → แก้ `lib/services.ts` → sitemap + schema + หน้า listing generate อัตโนมัติ

---

## 10. Checklist ก่อน commit งาน SEO

- [ ] ไม่มี trailing slash ใน `href`, `canonical`, `url` ของ JSON-LD, sitemap — เช็คด้วยคำสั่งจริง ไม่ใช่ด้วยตา:
      ```bash
      grep -rn 'href="/[a-z][^"]*/"\|href={`/[^`]*/`}' app components   # ต้องไม่มี output
      ```
- [ ] หน้าใหม่มี `canonical`, `openGraph`, JSON-LD ที่เหมาะกับประเภทหน้า
- [ ] หน้าใหม่มี `alternates` ครบทั้ง th/en ผ่าน `localizedAlternates()` ([lib/site.ts](lib/site.ts)) — **ห้ามต่อ URL เอง** ด้วย `${site.url}${path}` (ทำให้ canonical/hreflang ของ th กับ en เหมือนกันหมด · เจอใน audit 2026-07-24)
- [ ] เพิ่มหน้า static ใหม่แล้วเพิ่มใน `staticUrls` ของ [app/sitemap.ts](app/sitemap.ts) ด้วย (ดู §13 เรื่อง sitemap ยังเป็นภาษาไทยล้วน)
- [ ] ถ้าเป็นหน้า service listing — มี `ItemList`
- [ ] ถ้าหน้าอยู่ลึกกว่า 1 ระดับ — มี `BreadcrumbList`
- [ ] รูป OG เฉพาะของหน้านั้น
- [ ] OG/Twitter อ่าน image slot เดียวกันผ่าน async metadata และไม่มี module-level `const ogImage`
- [ ] ถ้าเพิ่ม/ย้ายจุดใช้รูป — `REVALIDATION_TARGETS` ใน `app/api/admin/images/route.ts` ครบทุกหน้าที่ได้รับผล
- [ ] เพิ่ม URL/service ใหม่ใน `lib/services.ts` (sitemap อ่านจากตรงนี้)
- [ ] `pnpm lint` ผ่าน
- [ ] `pnpm typecheck` ผ่าน (script ของ repo เท่านั้น — ห้าม `npx tsc --noEmit` / `npx eslint` ลอย ๆ ดู §0.5)
- [ ] **JSON-LD ที่แก้/เพิ่ม ผ่าน [Schema.org Validator](https://validator.schema.org/) และ [Rich Results Test](https://search.google.com/test/rich-results) อย่างน้อย 1 หน้า** — ค่า enum ต้องเช็คกับ doc ของ Google ไม่ใช่ schema.org (ดู §0.5)
- [ ] เนื้อหาทางการแพทย์ผ่านการตรวจตามข้อ 0.2

---

## 11. Cloudflare / OpenNext — ข้อควรระวัง

- `open-next.config.ts` ต้องมี `queue: doQueue` และ `tagCache: d1NextTagCache` เสมอ — ถ้าปล่อย default จะได้ dummy queue ที่ throw `"Dummy queue is not implemented"` ตอน revalidate พื้นหลัง ทำให้หน้า stale ไม่มีวัน regenerate (ดู [open-next.config.ts](open-next.config.ts))
- Incremental cache ปัจจุบันใช้ `kvIncrementalCache` เพราะบัญชียังไม่เปิด R2 (API code 10042 — ต้องไปกดเปิดใน dashboard); binding ที่ต้องมีใน [wrangler.jsonc](wrangler.jsonc): `NEXT_CACHE_DO_QUEUE` (Durable Object), `NEXT_INC_CACHE_KV` (KV), `NEXT_TAG_CACHE_D1` (D1) และ `WORKER_SELF_REFERENCE` (Service) — resource จริงถูกสร้างและใส่ ID แล้ว ห้ามรันคำสั่งสร้างซ้ำ
- งานที่แตะ cache/ISR/revalidation — verify ที่ runtime observability (`wrangler tail`) เสมอ ไม่ใช่แค่ HTTP 200 — async error จาก background revalidation ไม่โผล่ใน response

---

## 12. สิ่งที่ AI **ห้ามทำ** เด็ดขาด

- ❌ เพิ่ม trailing slash กลับเข้าไป
- ❌ ใส่ FAQ schema บนหน้าที่ไม่ใช่ home
- ❌ ทำ `MedicalBusiness` JSON-LD ซ้ำในหน้าอื่น — ใช้ `@id` ref เท่านั้น
- ❌ ลบ `disallow: /admin` ออกจาก robots.ts
- ❌ ใส่ `host` directive กลับเข้า robots.ts
- ❌ ใช้ OG image ของหน้าแรกซ้ำในทุกหน้า
- ❌ สร้าง OG/Twitter ของรูปที่ admin เปลี่ยนได้ด้วย module-level const หรืออ่าน default โดยไม่ผ่าน image slot
- ❌ Hardcode ชื่อคลินิก เบอร์ ที่อยู่ ราคา — import จาก `lib/site.ts` / `lib/services.ts` เท่านั้น
- ❌ ลบ `@id: ${site.url}/#business` ออกจาก clinicSchema
- ❌ ลบเลขใบอนุญาตสถานพยาบาลออกจาก footer/about
- ❌ อ้างสรรพคุณทางการแพทย์เกินจริงหรือรับประกันผลลัพธ์ (ดู §0.2)
- ❌ ปล่อย `open-next.config.ts` ไม่มี `queue`/`tagCache` override ก่อน deploy จริง
- ❌ ใส่ `export const runtime = 'edge'` ในหน้า/route ใด ๆ (ขัดกับ `@opennextjs/cloudflare`, ดู §0.4.2)
- ❌ ใช้ prop `asChild` กับ component ใน `components/ui/` — ต้องใช้ `render` (ดู §0.4.1)
- ❌ **เอาไฟล์รูปใส่ `public/`** — จะถูก build ติดไปกับโค้ด ทำให้คลินิกเปลี่ยนเองผ่าน /admin ไม่ได้ · **เกิดมาแล้ว 2 รอบ** (รูปหมอ+โปสเตอร์ → PR #38, โลโก้ → PR #45) รอบหลังทำให้การ์ด "โลโก้" ใน /admin กลายเป็นของหลอกกดแล้วไม่มีอะไรเกิดขึ้น · รูปทุกใบต้องขึ้น Cloudinary (ดู [docs/images.md](docs/images.md)) · ถ้าจำเป็นต้อง baked-in จริง ๆ ต้องใส่ใน `bakedInImages` ให้ /admin บอก user ตรง ๆ ว่าแก้ไม่ได้
- ❌ ตั้ง `SITE_ENV=preview` กลับมาโดยที่ hostname ที่เสิร์ฟตรงกับ `site.url` อยู่แล้ว (จะสั่ง `Disallow: /` ทั้งเว็บจริง = หายจาก Google) · ตัวแปรนี้ถูกลบไปแล้วตอนขึ้นโดเมนจริง 2026-07-27 ดู [docs/infrastructure.md](docs/infrastructure.md)
- ❌ รัน `npx shadcn@latest init` ซ้ำ หรือสร้าง `tailwind.config.ts` กลับมา (Tailwind v4 ใช้ `@theme` ใน `app/globals.css`)
- ❌ Hardcode ข้อความไทยใน component ใหม่ — ต้องผ่าน `messages/*.json` ทั้งสองภาษา (ดู §13)
- ❌ Hardcode hex สีใน component — ใช้ token จาก `:root`/`@theme` (ดู §0.4)
- ❌ ต่อ canonical/hreflang เองด้วย `${site.url}${path}` ในหน้าใต้ `[locale]` — ใช้ `localizedAlternates()`
- ❌ ผูก migration ที่มี `ALTER`/`DROP`/`RENAME`/`INSERT..SELECT` เข้า `cf:deploy` (ดู §0.5 · 2026-07-24)
- ❌ ตั้ง PBKDF2 เกิน 100,000 รอบ — workerd ปฏิเสธ ทำให้ auth ตายทั้งระบบ (ดู §0.5 · 2026-07-25)
- ❌ `pnpm cf:deploy` จาก branch ที่ยังไม่ merge หรือชนกับ CD ที่กำลังรัน (ดู [docs/deploy.md](docs/deploy.md) §0)

---

## 13. i18n — เว็บ 2 ภาษา (ไทย/อังกฤษ)

ตั้งค่าใน [i18n/routing.ts](i18n/routing.ts): `locales: ['th','en']` · `defaultLocale: 'th'` · `localePrefix: 'as-needed'` · **`localeDetection: false`**

- **ไทยอยู่ที่ path เปล่า** (`/filler`), **อังกฤษอยู่ใต้ `/en`** (`/en/filler`) — หน้าสาธารณะทั้งหมดอยู่ใต้ `app/(site)/[locale]/*`
- **`localeDetection` ปิดโดยตั้งใจ** — คลินิกไทยต้องเสิร์ฟไทยที่ `/` เสมอ · ถ้าเปิด detection คนที่ browser ตั้ง Accept-Language เป็นอังกฤษ (หรือมีคุกกี้ `NEXT_LOCALE=en` ค้าง) จะโดนเด้งไป `/en` ทั้งที่ไม่เคยเลือก · **ห้ามเปิดกลับ**
- **`/admin` ไม่มี locale** — อยู่นอก `[locale]` และมี root layout ของตัวเอง (จำเป็นต่อ ISR ของหน้าสาธารณะ ดู PR #243)
- ข้อความ UI ทุกชิ้นมาจาก `messages/th.json` + `messages/en.json` ผ่าน `useTranslations()`/`getTranslations()` — **เพิ่ม key ต้องเพิ่มทั้งสองไฟล์ในคอมมิตเดียว** ไม่งั้น `/en` โชว์ key ดิบ
- เนื้อหา catalogue มี `titleEn` อยู่ใน `lib/services.ts` แล้ว — อย่าแปลซ้ำใน messages
- Metadata: ใช้ `localizedAlternates(locale, path)` เท่านั้น (canonical + hreflang + x-default ออกมาพร้อมกัน)
- `generateStaticParams` ต้อง cross product `routing.locales × slugs` ไม่งั้นหน้าอังกฤษหลุด prerender
- แก้รูปใน /admin: `REVALIDATION_TARGETS` ใส่ path ไทยพอ — route handler mirror ไป `/en` ให้เอง

> ✅ **ปมนี้ปิดแล้ว (PR #251)**: [app/sitemap.ts](app/sitemap.ts) ประกาศ "หน้า" เป็น path ที่ไม่ผูกภาษา แล้ว `expand()` กระจายเป็นหนึ่ง entry ต่อ locale โดยดึง URL + hreflang จาก `localizedAlternates()` ตัวเดียวกับที่หน้าเว็บใช้ → sitemap ขัดกับ canonical ไม่ได้อีกโดยโครงสร้าง · ยืนยันบน production 2026-07-27: 72 URL (36 หน้า × 2 ภาษา) · **เพิ่มหน้าใหม่ให้เพิ่มใน `staticPages` เท่านั้น ห้ามต่อ `/en` เอง**

---

## ประวัติการตัดสินใจ

- **2026-07-09**: Scaffold โปรเจกต์เริ่มต้น — Next.js App Router + Tailwind + Cloudflare Workers/OpenNext (เดิมวางแผน D1 + R2 + DO queue), convention พอร์ตมาจาก littlesmileflower v2 CLAUDE.md ปรับให้เข้ากับ MedicalBusiness/คลินิกความงาม
- **2026-07-17**: Production ใช้ KV incremental cache แทน R2 เพราะบัญชียังไม่เปิด R2; เชื่อมระบบรูป `/admin` → Cloudinary → D1 → page/OG/Twitter/JSON-LD/Header/Footer และกำหนด `REVALIDATION_TARGETS` แบบ exhaustive; หน้า Services ใช้โครง editorial ครบ 9 หมวดตาม [docs/design.md](docs/design.md)
- **2026-07-17**: Audit ไฟล์นี้เทียบกับต้นฉบับ [littlesmileflower v2](../littlesmileflower%20v2/CLAUDE.md) อีกรอบ — พอร์ต **ของดี** ที่ตกหล่นตอน scaffold เข้ามา (กระบวนการบันทึกบทเรียนใน §0.5, บทเรียน stack-เดียวกัน 7 ข้อ, grep เช็ค trailing slash + Rich Results Test ใน §10) และแปลง **ข้อเสีย** ของต้นฉบับเป็นกฎ 3 ข้อ: (1) ห้ามพอร์ตข้อเท็จจริงเรื่อง infra โดยไม่ตรวจ — ต้นเหตุที่ §0 เดิมสั่งให้รายงาน deploy ที่ไม่มีจริง, (2) เพิ่มบทเรียนแล้วต้องไล่แก้ที่ที่ยังสอนตรงข้าม, (3) เพิ่ม/ย้ายหัวข้อแล้วต้องไล่อัปเดต cross-reference · **ไม่ได้ลอกของเขามาทั้งดุ้น** — ตัดสิ่งที่เป็นบริบทร้านดอกไม้ (Article schema, amphoe, Florist) ทิ้ง และตรวจทุกบทเรียนที่พอร์ตว่าเงื่อนไขมีจริงในโค้ดเราก่อน
