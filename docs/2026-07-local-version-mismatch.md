# บันทึกเหตุการณ์: Local แสดงหน้าเว็บคนละเวอร์ชัน

วันที่: 16 กรกฎาคม 2026 (เดือนกรกฎาคม 2569)

> เอกสารนี้เป็นบันทึกเหตุการณ์ ค่า commit ด้านล่างเป็นค่าประวัติศาสตร์ ไม่ใช่ commit ล่าสุดของโปรเจกต์ กฎปัจจุบันคือ fetch `origin/main` สดและระบุให้ชัดว่ากำลังตรวจ main หรือ feature branch

## อาการ

เปิด `http://localhost:3002/` แล้วเห็นหน้าแรกเวอร์ชันเดิม ขณะที่หน้าใน PR/เวอร์ชันที่ merge แล้วเป็น hero แบบ editorial รุ่นใหม่

## สาเหตุจริง

หลัง merge PR ระบบสลับ checkout กลับไปที่ branch `main` ในเครื่อง แต่ local `main` ยังชี้ไปที่ commit เก่า `2fbc0f4` (favicon) และไม่ได้ fast-forward ตาม `origin/main` ที่มี commit ล่าสุด `ce6f5b8` อยู่แล้ว

dev server ที่พอร์ต 3002 อ่านไฟล์จาก working tree ในเครื่อง จึงแสดงโค้ดเก่า แม้โค้ดเวอร์ชันใหม่จะถูก merge ขึ้น remote แล้ว ปัญหานี้เป็นความคลาดเคลื่อนของ git checkout/local state ไม่ใช่ปัญหาจาก React, Next.js หรือ cache ของหน้าเว็บ

## วิธีแก้ที่ใช้

1. ตรวจสอบ branch และ commit ที่ server อ่านจริงด้วย `git branch --show-current`, `git rev-parse HEAD` และ `git rev-parse origin/main`
2. ยืนยันว่า local `HEAD` ไม่ตรงกับ `origin/main`
3. รัน `git rebase origin/main` บน local `main` ที่ไม่มี tracked changes
4. ตรวจซ้ำให้ `HEAD` และ `origin/main` เป็น commit เดียวกัน
5. reload หน้า local และตรวจ marker ของเวอร์ชันใหม่ เช่น `.hero-section`

## กฎป้องกันไม่ให้เกิดซ้ำ (ฉบับปัจจุบัน)

ก่อนอ้างว่าโค้ดหรือ preview เป็น “เวอร์ชันล่าสุด”:

```bash
git fetch origin main
git branch --show-current
git status --short
git rev-parse --short HEAD
git rev-parse --short origin/main
```

- ถ้าตรวจ **main**: อ่านจาก `git show origin/main:<path>` หรือใช้ clean worktree ที่สร้างจาก `origin/main`; local `main` ที่ล้าหลังให้ fast-forward ด้วย `git pull --ff-only` เมื่อไม่มี tracked changes
- ถ้าตรวจ **feature branch**: `HEAD` ไม่จำเป็นต้องเท่ากับ `origin/main`; ให้ตรวจว่า branch รวม main ล่าสุดแล้วด้วยคำสั่งด้านล่าง
- ถ้า main ถูก checkout อยู่ใน worktree อื่น ห้าม force checkout/reset; ใช้ `git show origin/main:<path>` หรือสร้าง worktree ใหม่
- ถ้า working tree มี tracked changes ห้าม rebase/เปลี่ยน branch ก่อนระบุว่าไฟล์เป็นของใครและเก็บงานให้ปลอดภัย

```bash
git merge-base --is-ancestor origin/main HEAD
echo $?  # 0 = branch มี origin/main ล่าสุดอยู่แล้ว
```

จากนั้นค่อยเปิด preview โดยรายงาน branch + commit + URL ให้ชัด และตรวจ marker จาก HTML/DOM จริง ไม่สรุปจากภาพใน browser เพียงอย่างเดียว

## บทเรียน

การ merge สำเร็จบน remote ไม่ได้แปลว่า working tree ของ local จะอัปเดตตามเสมอ และ “ล่าสุด” มีความหมายต่างกันระหว่าง main กับ feature branch การ QA ต้องระบุ ref ที่ตรวจ ไม่ใช้ไฟล์ที่บังเอิญเปิดอยู่บนดิสก์เป็นตัวแทนของ `origin/main`
