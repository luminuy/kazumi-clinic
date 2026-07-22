const fs = require('fs');

const sqlFile = fs.readFileSync('seed-blogs.sql', 'utf8');
const lines = sqlFile.split('\n').filter(line => line.trim().startsWith('INSERT'));

const updates = lines.map(line => {
  // Extract id and body
  // Format: INSERT INTO posts (id, slug, title, excerpt, body, author, published, published_at, updated_at, updated_by) VALUES ('id', 'slug', 'title', 'excerpt', 'body', 'author', 1, 123, 123, 'sys');
  const match = line.match(/VALUES \('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/);
  if (!match) return null;
  
  const [_, id, slug, title, excerpt, oldBody] = match;
  
  const seoText = `ดูแลโดยทีมแพทย์ผู้เชี่ยวชาญ คลินิกความงามย่านสุขุมวิท พระโขนง ให้บริการด้วยตัวยาแท้ 100% ปลอดภัย ได้มาตรฐาน`;
  
  const cta = `

---

### สนใจปรึกษาปัญหาผิว หรือจองคิวรับบริการ
**Kazumi Clinic (คาซึมิ คลินิก)** คลินิกความงามย่านสุขุมวิท-พระโขนง ${seoText} พร้อมประเมินรูปหน้าและออกแบบการรักษาเฉพาะบุคคลฟรี!

✅ **ทักไลน์จองคิว / ปรึกษา:** [คลิกแอดไลน์ (@kazumiclinic)](https://lin.ee/1tshhNn)  
📞 **โทรสอบถามด่วน:** [081-712-7486](tel:+66817127486)  
📘 **ติดตามโปรโมชั่น:** [Facebook Kazumi Clinic Skin](https://www.facebook.com/kazumiclinicskin/)  
📍 **พิกัดคลินิก:** 1558 โครงการไดมอนด์คอนโด ถ.สุขุมวิท (เดินทางสะดวก ใกล้ BTS) [ดูแผนที่](https://www.google.com/maps/search/?api=1&query=Kazumi%20Clinic%201558%20Sukhumvit%20Road%20Bangkok)`;

  const newBody = oldBody + cta;
  
  return `UPDATE posts SET body = '${newBody.replace(/'/g, "''")}' WHERE id = '${id}';`;
});

fs.writeFileSync('update-blogs.sql', updates.filter(Boolean).join('\n'));
console.log('Created update-blogs.sql');
