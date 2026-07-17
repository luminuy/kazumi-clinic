# คู่มือสำหรับ AI Agents — Kazumi Clinic

ไฟล์นี้เป็น **กฎที่ AI ทุกตัว** (Claude Code, Cursor, Copilot, Codex, etc.) ต้องทำตามเมื่อแก้โค้ดในโปรเจกต์นี้ เพื่อให้ SEO และ metadata สม่ำเสมอตลอดทั้งไซต์

**เอกสารที่ต้องอ่านก่อนลงมือ:**
- **[docs/infrastructure.md](docs/infrastructure.md)** — เว็บอยู่ที่ไหน, binding/vars จริงมีอะไร, deploy ยังไง, ข้อจำกัดของเครื่อง dev, สถานะโดเมน
- **[docs/images.md](docs/images.md)** — รูปทำงานยังไงตั้งแต่ /admin ถึงหน้าเว็บ, เพิ่มรูปใหม่ต้องแตะไฟล์ไหนบ้าง, กับดัก 6 ข้อที่เคยเหยียบมาแล้ว

Stack: Next.js App Router (React 19) + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI primitives) + Zod, deploy บน Cloudflare Workers ผ่าน OpenNext (D1 + R2 + Durable Object queue สำหรับ ISR)

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

- `gh pr checks <num>` — **ปัจจุบัน repo นี้ยังไม่มี CI ใด ๆ** จึงตอบ `no checks reported` เสมอ (ยืนยัน 2026-07-16: ไม่มี `.github/workflows`, ไม่มี Cloudflare Git integration) → นั่นคือสถานะปกติ **ไม่ใช่ว่า check กำลังรัน** · ถ้าวันหนึ่งมี check โผล่มาจริง ต้อง SUCCESS ก่อน merge
- ถ้ามี check และยัง in-progress → ใช้ `gh pr merge <num> --squash --auto --delete-branch`
- ถ้า build FAIL → หยุด, แจ้ง user, แก้ก่อน
- ก่อน `gh pr merge` ทุกครั้ง: เช็ค `gh pr view --json headRefOid` ให้ตรงกับ local HEAD ก่อน (sleep 2-3 วิ แล้วเช็คซ้ำถ้าไม่ตรง) — auto-merge ที่ยิงทันทีหลัง push อาจ squash แค่ commit เก่า
- หลัง merge แล้วรายงาน URL ของ commit บน main **เท่านั้น** — ⚠️ **ห้ามบอกว่า "Cloudflare กำลัง deploy production"** merge เข้า main **ไม่ได้ deploy อะไรทั้งสิ้น** ไม่มี pipeline ที่ทำให้ · deploy เกิดขึ้นเฉพาะตอนมีคนรัน `pnpm cf:deploy` ด้วยมือเท่านั้น (ดู §0.5 · 2026-07-16)

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
- [ ] **ทุกประโยคในรายงานที่อ้างสถานะ ต้องมีคำสั่งที่รันจริงรองรับ** — "deploy แล้ว" / "CI ผ่าน" / "รูปโหลดได้" / "หน้าใช้งานได้" ต้องมาจาก output จริง ไม่ใช่จากการอ่าน config หรือเดา (ดู §0.5 · 2026-07-16) · ถ้าไม่ได้ตรวจ → เขียนว่า "ยังไม่ได้ตรวจ"
- [ ] รายงานสั้น กระชับ — บอกสาเหตุจริง + วิธีแก้ + ผลกระทบ · ถ้ารายงานก่อนหน้าผิด ให้แก้ให้ชัดเจน ไม่กลบ

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

อ่านส่วนนี้ทุกครั้งก่อนเริ่มงาน

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
- **ห้ามลบ `eslint-disable`/guard/suppression โดยเชื่อ label "unused"** · ที่โน่นลบ directive 2 ตัวทั้งที่ lint บอกว่า unused **เฉพาะตัวที่สอง** → error โผล่ · **tool ที่ report ตำแหน่งเจาะจง (บรรทัด/ไฟล์) ให้แก้เฉพาะตำแหน่งนั้น ห้าม generalize ไปลบพี่น้องที่หน้าตาเหมือนกัน** · ถือว่าการลบ safety directive = destructive change ต้อง verify หลังลบทุกครั้ง · **เกี่ยวกับเราตรง ๆ**: `app/page.tsx`, `app/[category]/page.tsx` ฯลฯ มี `// eslint-disable-next-line react/no-danger` คุม JSON-LD อยู่ทุกไฟล์
- **`npx tsc --noEmit` ลอย ๆ ไม่นับเป็น verify — ใช้ `pnpm typecheck` ตาม `package.json` เสมอ** · และ iCloud Drive ชอบสร้างสำเนา `* 2.ts` / `* 2.tsx` / `.next/* 2.*` ค้างไว้ ทำให้ typecheck ล้มด้วย `Duplicate identifier` แบบงง ๆ · **เกิดกับเราแล้วจริง** (2026-07-16: `.next/types/routes.d 2.ts` ทำ `pnpm typecheck` ล้ม ทั้งที่โค้ดไม่ผิด) → เจอ error แปลก ๆ ให้ `find . -name '* 2.*' -not -path './node_modules/*'` ก่อนไล่แก้โค้ด
- **หน้าที่ตั้ง `robots: { index: false }` ต้อง `disallow` ใน [app/robots.ts](app/robots.ts) ด้วยเสมอ** · meta noindex = ห้าม index, robots.txt = ห้าม crawl เป็นคนละ layer ต้องใช้คู่กัน · **จะสำคัญตอนทำหน้า `/admin`** (robots.ts เรา disallow `/admin` ไว้แล้ว — ตอนสร้างหน้าจริงอย่าลืมใส่ `index: false` ใน metadata ด้วย)
- **ค่า enum/unit/code ใน JSON-LD ต้องเช็คกับเอกสารของ Google ไม่ใช่แค่ schema.org** · ที่โน่นใส่ `unitCode: 'HUR'` ซึ่ง valid ตาม schema.org แต่ Google ไม่รับ → GSC ขึ้น error ทั้ง 27 สินค้า · **Google จำกัด enum แคบกว่า schema.org เสมอ** → เพิ่ม field ใหม่ที่มีค่า fixed (`availability`, `priceCurrency`, `@type` ของ MedicalProcedure ฯลฯ) ให้เปิด doc ของ Google เช็ค "supported values" ก่อน ship แล้วทดสอบ 1 หน้าใน Rich Results Test

- 2026-07-16 — `wrangler dev`/`opennextjs-cloudflare deploy` พังบนเครื่องนี้ด้วย error macOS version (ต้องการ macOS 13.5+, เครื่อง dev เป็น 12.6.0) เพราะทั้งสองคำสั่งรัน local `workerd`/miniflare ก่อน (สำหรับ dev server จริง, และสำหรับ deploy ใช้อ่าน env ผ่าน `getPlatformProxy`) → **deploy จริงยังทำได้** โดยข้าม wrapper: ใช้ `OPEN_NEXT_DEPLOY=true wrangler deploy` แทน `opennextjs-cloudflare deploy` — env var นี้บอก wrangler ไม่ต้อง delegate ไปที่ opennextjs-cloudflare's deploy command (ซึ่งเป็นจุดที่เรียก workerd) แล้วรัน plain `wrangler deploy` ตรง ๆ จาก `.open-next/worker.js` ที่ build ไว้แล้วแทน (อัปโหลด asset ได้ปกติ ไม่ต้องรัน worker locally) — ผูกไว้ใน `cf:deploy` script ของ `package.json` แล้ว · `wrangler dev`/`cf:preview` (local preview ที่ต้องรัน worker จริง) ยังใช้ trick นี้ไม่ได้ เพราะจำเป็นต้องรัน workerd จริงเพื่อ serve request — ต้อง deploy จริงแล้วดูผลบน Cloudflare แทนถ้าจะ preview บนเครื่องนี้

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

- [ ] ไม่มี trailing slash ใน `href`, `canonical`, `url` ของ JSON-LD, sitemap — เช็คด้วยคำสั่งจริง ไม่ใช่ด้วยตา:
      ```bash
      grep -rn 'href="/[a-z][^"]*/"\|href={`/[^`]*/`}' app components   # ต้องไม่มี output
      ```
- [ ] หน้าใหม่มี `canonical`, `openGraph`, JSON-LD ที่เหมาะกับประเภทหน้า
- [ ] ถ้าเป็นหน้า service listing — มี `ItemList`
- [ ] ถ้าหน้าอยู่ลึกกว่า 1 ระดับ — มี `BreadcrumbList`
- [ ] รูป OG เฉพาะของหน้านั้น
- [ ] เพิ่ม URL/service ใหม่ใน `lib/services.ts` (sitemap อ่านจากตรงนี้)
- [ ] `pnpm typecheck` ผ่าน (script ของ repo เท่านั้น — ห้าม `npx tsc --noEmit` ลอย ๆ ดู §0.5)
- [ ] **JSON-LD ที่แก้/เพิ่ม ผ่าน [Schema.org Validator](https://validator.schema.org/) และ [Rich Results Test](https://search.google.com/test/rich-results) อย่างน้อย 1 หน้า** — ค่า enum ต้องเช็คกับ doc ของ Google ไม่ใช่ schema.org (ดู §0.5)
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
- ❌ **เอาไฟล์รูปใส่ `public/`** — จะถูก build ติดไปกับโค้ด ทำให้คลินิกเปลี่ยนเองผ่าน /admin ไม่ได้ · **เกิดมาแล้ว 2 รอบ** (รูปหมอ+โปสเตอร์ → PR #38, โลโก้ → PR #45) รอบหลังทำให้การ์ด "โลโก้" ใน /admin กลายเป็นของหลอกกดแล้วไม่มีอะไรเกิดขึ้น · รูปทุกใบต้องขึ้น Cloudinary (ดู [docs/images.md](docs/images.md)) · ถ้าจำเป็นต้อง baked-in จริง ๆ ต้องใส่ใน `bakedInImages` ให้ /admin บอก user ตรง ๆ ว่าแก้ไม่ได้
- ❌ ลบ var `SITE_ENV` โดยยังไม่มีโดเมนจริง (robots.txt จะเปิดให้ Google เก็บ workers.dev ที่ canonical ชี้ไปโดเมนคนอื่น) — และ **ห้ามลืมลบมันตอนมีโดเมนจริง** (เว็บจริงจะห้ามเก็บ) ดู [docs/infrastructure.md](docs/infrastructure.md)
- ❌ รัน `npx shadcn@latest init` ซ้ำ หรือสร้าง `tailwind.config.ts` กลับมา (Tailwind v4 ใช้ `@theme` ใน `app/globals.css`)

---

## ประวัติการตัดสินใจ

- **2026-07-09**: Scaffold โปรเจกต์เริ่มต้น — Next.js App Router + Tailwind + Cloudflare Workers/OpenNext (D1 + R2 + DO queue), convention พอร์ตมาจาก littlesmileflower v2 CLAUDE.md ปรับให้เข้ากับ MedicalBusiness/คลินิกความงาม
- **2026-07-17**: Audit ไฟล์นี้เทียบกับต้นฉบับ [littlesmileflower v2](../littlesmileflower%20v2/CLAUDE.md) อีกรอบ — พอร์ต **ของดี** ที่ตกหล่นตอน scaffold เข้ามา (กระบวนการบันทึกบทเรียนใน §0.5, บทเรียน stack-เดียวกัน 7 ข้อ, grep เช็ค trailing slash + Rich Results Test ใน §10) และแปลง **ข้อเสีย** ของต้นฉบับเป็นกฎ 3 ข้อ: (1) ห้ามพอร์ตข้อเท็จจริงเรื่อง infra โดยไม่ตรวจ — ต้นเหตุที่ §0 เดิมสั่งให้รายงาน deploy ที่ไม่มีจริง, (2) เพิ่มบทเรียนแล้วต้องไล่แก้ที่ที่ยังสอนตรงข้าม, (3) เพิ่ม/ย้ายหัวข้อแล้วต้องไล่อัปเดต cross-reference · **ไม่ได้ลอกของเขามาทั้งดุ้น** — ตัดสิ่งที่เป็นบริบทร้านดอกไม้ (Article schema, amphoe, Florist) ทิ้ง และตรวจทุกบทเรียนที่พอร์ตว่าเงื่อนไขมีจริงในโค้ดเราก่อน
