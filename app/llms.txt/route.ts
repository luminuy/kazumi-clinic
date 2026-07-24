import { site, isPreviewDeploy } from '@/lib/site';

// llms.txt (https://llmstxt.org) — a plain-text primer for AI assistants/crawlers that read a
// site's own summary instead of (or alongside) crawling it. No Next.js file convention exists for
// this, unlike robots.txt/sitemap.xml, so it's a plain route handler under a folder literally
// named `llms.txt`. Mirrors app/robots.ts's preview gate: the workers.dev host must not describe
// itself as kazumiclinic.com to any crawler while the real domain isn't confirmed ours yet.
export const dynamic = 'force-static';

export function GET() {
  if (isPreviewDeploy()) {
    return new Response('# Preview deployment — not yet ready for indexing.\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const body = `# ${site.name}

> ${site.description}

${site.name} เป็นคลินิกความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์ โดยแพทย์ประเมินและวางแผนการดูแลเฉพาะบุคคล ใบอนุญาตสถานพยาบาลเลขที่ ${site.license}

## หน้าหลัก

- [บริการทั้งหมด](${site.url}/services): รายการหัตถการทุกหมวดพร้อมราคาเริ่มต้น
- [โปรโมชั่น](${site.url}/promotions): โปรโมชั่นและแพ็กเกจปัจจุบัน
- [รีวิว](${site.url}/reviews): ผลลัพธ์ก่อน-หลังจากลูกค้าจริง
- [เกี่ยวกับเรา](${site.url}/about): ข้อมูลแพทย์และคลินิก
- [บทความ](${site.url}/blog): สาระความรู้ด้านผิวและความงาม
- [ติดต่อเรา](${site.url}/contact): ที่อยู่ เบอร์โทร แผนที่ เวลาทำการ

ราคาที่แสดงบนเว็บไซต์อาจมีการเปลี่ยนแปลง กรุณาตรวจสอบราคาปัจจุบันและเงื่อนไขกับคลินิกโดยตรงก่อนเข้ารับบริการ ผลลัพธ์ของหัตถการแตกต่างกันในแต่ละบุคคลขึ้นอยู่กับการประเมินของแพทย์
`;

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
