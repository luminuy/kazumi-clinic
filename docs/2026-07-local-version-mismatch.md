# บันทึกเหตุการณ์: Local แสดงหน้าเว็บคนละเวอร์ชัน

วันที่: 16 กรกฎาคม 2026 (เดือนกรกฎาคม 2569)

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

## กฎป้องกันไม่ให้เกิดซ้ำ

ก่อนเปิดหรือส่งต่อ local preview หลัง merge ทุกครั้ง:

```bash
git fetch origin main
git rev-parse --short HEAD
git rev-parse --short origin/main
```

ถ้า commit ไม่ตรงกัน ให้หยุดเปิด preview แล้ว sync ก่อน:

```bash
git status --short
git rebase origin/main
```

จากนั้นค่อย reload browser และตรวจ URL/branch/commit อีกครั้ง ไม่ควรสรุปจากภาพใน browser เพียงอย่างเดียวว่าเป็นเวอร์ชันล่าสุด

## บทเรียน

การ merge สำเร็จบน remote ไม่ได้แปลว่า working tree ของ local จะอัปเดตตามเสมอ โดยเฉพาะเมื่อ CLI สลับ branch หลัง merge หรือ local มี commit ที่ remote ไม่มี การตรวจ commit ให้ตรงกันเป็นขั้นตอนบังคับก่อน QA ทุกครั้ง
