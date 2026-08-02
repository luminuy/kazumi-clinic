// Single source of truth for service categories — import instead of hardcoding.
// Prices where present came from clinic promo posters — confirm the standard (non-promo) price
// list with the clinic before treating them as permanent (see CLAUDE.md §0.2). Items without a
// price (e.g. IV Drip programs) render as "สอบถามราคา" until the clinic publishes one.

export type ServiceItem = {
  /**
   * Stable id, and the primary key of the `service_products` D1 table the clinic edits through
   * /admin. Every hardcoded item carries one so an admin edit/delete can target it; renaming one
   * silently orphans the clinic's edits and uploaded photo for that product. Add ids freely;
   * don't rename them. Optional only so brand-new drafts can be built before an id is assigned.
   */
  id?: string;
  name: string;
  /**
   * Cloudinary public ID for this product's own photo, when the clinic has uploaded one through
   * /admin. Never set in the hardcoded defaults — it's populated by the product override layer
   * (lib/service-products-store.ts) at request time, same idea as the site image overrides.
   */
  imagePublicId?: string;
  detail?: string;
  /** English tagline from the program poster, shown under the name. */
  tagline?: string;
  /** Bullet benefits from the clinic's own program material. */
  benefits?: string[];
  /** Omit when the clinic hasn't published a fixed price — the UI shows "สอบถามราคา" instead. */
  priceFrom?: number;
  unit: string;
  /** Sub-heading this item sits under, e.g. the IV Drip "Essential Glow Collection". */
  collection?: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  description: string;
  /**
   * Cloudinary public ID for the category page's PageHero background, if one exists.
   * Also the fallback source of the page's OG image when no admin override exists.
   */
  heroImage?: string;
  /** Describes what `heroImage` actually shows — required alongside it (CLAUDE.md §8). */
  heroAlt?: string;
  items: ServiceItem[];
  /**
   * DRAFT medical copy (2026-08-02 thin-content audit) — general, non-brand-specific aftercare
   * guidance. Written to CLAUDE.md §0.2 rules (no overclaiming, no guarantees) but NOT yet
   * reviewed by the clinic's physician/owner. Do not merge to main until that review happens —
   * see docs/changelog.md and the PR this shipped on for the review request.
   */
  aftercare?: string[];
  /** DRAFT — same review gate as `aftercare` above. Who should consult a doctor before booking. */
  contraindications?: string[];
  /** DRAFT — same review gate as `aftercare` above. Typical downtime, in one sentence. */
  downtime?: string;
};

// Categories are grouped by intent so the home carousel, sitemap, and schema ItemList all
// read as a coherent journey: face-shaping injectables first (highest demand), then skin
// rejuvenation, then targeted treatments. Reordering here reorders every one of those surfaces —
// slugs are the stable SEO identity and must not change with the order.
//
// อย. caveat (carried from the "Kazumi NavBar Structure Final" spec, 2026-07-16): thread-lift,
// mesotherapy, acne-care, and laser-hifu still list generic programme names, not brand SKUs —
// swap in real SKUs only once the clinic confirms each one's อย. registration (see CLAUDE.md §0.2).
export const serviceCategories: ServiceCategory[] = [
  // ── Group 1 · Face shaping & anti-aging injectables ──────────────────────────
  {
    slug: 'filler',
    title: 'ฟิลเลอร์',
    titleEn: 'Filler',
    shortDescription: 'เติมเต็มร่องลึก ปรับรูปหน้าและริมฝีปากให้ดูเป็นธรรมชาติ ประเมินโดยแพทย์',
    description:
      'บริการฉีดฟิลเลอร์กรดไฮยาลูรอนิกจากแบรนด์คุณภาพ ดูแลร่องแก้ม ร่องน้ำหมาก ใต้ตา และริมฝีปาก แพทย์ของ Kazumi Clinic ประเมินโครงหน้าและออกแบบปริมาณให้เหมาะกับแต่ละบุคคลก่อนรับบริการ',
    aftercare: [
      'หลีกเลี่ยงการนวด กด หรือคลึงบริเวณที่ฉีดอย่างน้อย 24–48 ชั่วโมง',
      'งดออกกำลังกายหนัก ซาวน่า อบไอน้ำ และดื่มแอลกอฮอล์ในวันที่ทำหัตถการ',
      'หลีกเลี่ยงความร้อนจัดบริเวณใบหน้า เช่น แดดจัดหรือเตียงอบผิว อย่างน้อย 1 สัปดาห์',
      'หากมีอาการบวม ช้ำ หรือเจ็บผิดปกตินานเกิน 3–5 วัน ควรติดต่อคลินิก',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีการติดเชื้อหรือผื่นอักเสบบริเวณที่จะฉีด',
      'มีประวัติแพ้กรดไฮยาลูรอนิกหรือส่วนประกอบของฟิลเลอร์',
      'มีภาวะเลือดออกง่ายหรือรับประทานยาละลายลิ่มเลือด ควรแจ้งแพทย์ก่อนประเมิน',
    ],
    downtime: 'บวมแดงหรือช้ำเล็กน้อยบริเวณที่ฉีดได้ 2–5 วัน แต่งหน้าปกปิดได้หลัง 24 ชั่วโมงหากไม่มีแผล',
    items: [
      {
        id: 'filler-neura-deep-1cc',
        name: 'Neura Deep',
        detail: '1 CC',
        priceFrom: 3990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-neura-deep-3cc',
        name: 'Neura Deep',
        detail: '3 CC',
        priceFrom: 9990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-neura-volume-1cc',
        name: 'Neura Volume',
        detail: '1 CC',
        priceFrom: 5990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-neura-volume-3cc',
        name: 'Neura Volume',
        detail: '3 CC',
        priceFrom: 11990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-lip-neura-deep-1cc',
        name: 'Filler Lip (Neura Deep)',
        detail: '1 CC',
        priceFrom: 4990,
        unit: 'ครั้ง',
      },
      {
        id: 'filler-resty-1cc',
        name: 'Filler Resty',
        detail: 'Vital Light & Classic, 1 CC',
        priceFrom: 8990,
        unit: 'ครั้ง',
      },
    ],
  },
  {
    slug: 'botox',
    title: 'โบท็อกซ์',
    titleEn: 'Botulinum Toxin',
    shortDescription: 'ลดริ้วรอย ปรับกรอบหน้า กรามเรียว และลดเหงื่อ ฉีดโดยแพทย์',
    description:
      'ฉีดโบทูลินั่มท็อกซินโดยแพทย์ ลดริ้วรอยหน้าผาก หางตา และร่องระหว่างคิ้ว ปรับกรามให้เรียว ยกหางคิ้ว และลดเหงื่อ กำหนดขนาดยาเฉพาะบุคคลตามการประเมินของแพทย์',
    aftercare: [
      'งดนวดหรือนอนกดทับบริเวณที่ฉีดอย่างน้อย 4–6 ชั่วโมง',
      'หลีกเลี่ยงการก้มศีรษะต่ำหรือออกกำลังกายหนักในวันที่ฉีด',
      'งดซาวน่า อบไอน้ำ และดื่มแอลกอฮอล์อย่างน้อย 24 ชั่วโมง',
      'ผลลัพธ์เริ่มเห็นภายใน 3–14 วัน หากยังไม่เป็นไปตามที่ประเมินไว้ควรนัดติดตามผลกับแพทย์',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีโรคกล้ามเนื้ออ่อนแรงหรือโรคทางระบบประสาทที่มีผลต่อการทำงานของกล้ามเนื้อ',
      'มีประวัติแพ้โบทูลินั่มท็อกซิน',
      'มีการติดเชื้อบริเวณที่จะฉีด',
    ],
    downtime: 'อาจมีรอยแดงหรือบวมเล็กน้อยจากรอยเข็มไม่กี่ชั่วโมงถึง 1 วัน ทำกิจวัตรประจำวันต่อได้ทันที',
    // No clinic-supplied hero yet; image listings intentionally render the category icon instead
    // of borrowing an unrelated treatment photo.
    items: [
      { id: 'botox-neuro-100u', name: 'Botulinum Toxin Neuro', detail: '100 U', priceFrom: 8990, unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'thread-lift',
    title: 'ร้อยไหมกระชับใบหน้า',
    titleEn: 'Thread Lift',
    shortDescription: 'ยกกระชับกรอบหน้าและแก้มด้วยไหมละลาย PDO ประเมินโดยแพทย์',
    description:
      'โปรแกรมร้อยไหมกระชับใบหน้าด้วยไหมละลาย PDO ช่วยยกกระชับแก้ม กรอบหน้า และใต้คาง แพทย์ประเมินจำนวนเส้นและตำแหน่งตามโครงหน้าของแต่ละบุคคลก่อนทำหัตถการ',
    aftercare: [
      'งดนวดหน้า กดคลึง หรือทำทรีตเมนต์ใบหน้าอื่นบริเวณที่ร้อยไหมอย่างน้อย 2 สัปดาห์',
      'หลีกเลี่ยงการอ้าปากกว้าง เคี้ยวแรง หรือขยับใบหน้ามากในช่วง 3–5 วันแรก',
      'นอนหงายและหลีกเลี่ยงการนอนคว่ำกดทับใบหน้าในสัปดาห์แรก',
      'งดออกกำลังกายหนักและซาวน่าประมาณ 1–2 สัปดาห์',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีการติดเชื้อหรือแผลเปิดบริเวณใบหน้าที่จะร้อยไหม',
      'มีภาวะเลือดออกง่ายหรือรับประทานยาละลายลิ่มเลือด',
      'มีโรคผิวหนังเรื้อรังบริเวณใบหน้าที่ยังไม่สงบ ควรแจ้งแพทย์ก่อนประเมิน',
    ],
    downtime:
      'บวม ตึง หรือมีรอยช้ำตามแนวไหมได้ 3–7 วัน บางรายอาจรู้สึกตึงหรือดึงรั้งใบหน้านานถึง 2 สัปดาห์',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { id: 'thread-lift-pdo-4', name: 'ไหมก้างปลา PDO', detail: '4 เส้น', unit: 'ครั้ง' },
      { id: 'thread-lift-pdo-6', name: 'ไหมก้างปลา PDO', detail: '6 เส้น', unit: 'ครั้ง' },
      { id: 'thread-lift-pdo-8', name: 'ไหมก้างปลา PDO', detail: '8 เส้น', unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'collagen-booster',
    title: 'คอลลาเจนบูสเตอร์',
    titleEn: 'Collagen Booster',
    shortDescription: 'เติมคอลลาเจนสด ลดเลือนริ้วรอย ฟื้นโครงสร้างผิวให้ดูอ่อนเยาว์',
    description:
      'โปรแกรมเติมคอลลาเจนสด Karisma Rh Collagen ช่วยฟื้นโครงสร้างผิว ลดเลือนร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา พร้อมกระตุ้นการสร้างคอลลาเจนใหม่ ดูแลและประเมินโดยแพทย์',
    aftercare: [
      'หลีกเลี่ยงการนวดหรือกดคลึงบริเวณที่ฉีดอย่างน้อย 24–48 ชั่วโมง',
      'งดออกกำลังกายหนัก ซาวน่า และแอลกอฮอล์ในวันที่ทำหัตถการ',
      'ทาครีมกันแดดและหลีกเลี่ยงแดดจัดบริเวณใบหน้าในช่วงพักฟื้น',
      'หากมีอาการบวมหรือแดงผิดปกตินานเกิน 5 วัน ควรติดต่อคลินิก',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีประวัติแพ้คอลลาเจนหรือส่วนประกอบของผลิตภัณฑ์',
      'มีการติดเชื้อหรือผื่นอักเสบบริเวณที่จะฉีด',
      'มีภาวะภูมิคุ้มกันผิดปกติ ควรแจ้งแพทย์ก่อนประเมิน',
    ],
    downtime: 'บวมแดงเล็กน้อยบริเวณที่ฉีดได้ 2–4 วัน แต่งหน้าปกปิดได้หลัง 24 ชั่วโมง',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      {
        id: 'collagen-karisma-rh',
        name: 'Karisma Rh Collagen',
        detail: 'Made in Italy',
        tagline: 'Rh Collagen',
        // "English title — Thai description" so the collagen page's benefit cards can show the
        // reference's feature title above our approved Thai copy (see skin-booster's splitBenefit).
        benefits: [
          'Human Collagen Type 1 — คอลลาเจนโครงสร้างถอดแบบจาก Collagen Type 1 ในผิวมนุษย์ 100%',
          '99.99% Compatibility — เข้ากับร่างกายได้ดีถึง 99.99% ลดความเสี่ยงในการแพ้',
          'Restoration — เติมเต็มคอลลาเจน พร้อมกระตุ้นการสร้างคอลลาเจนใหม่',
          'Targeted Solution — ลดเลือนริ้วรอย ร่องแก้ม ร่องน้ำหมาก และถุงใต้ตา',
        ],
        unit: 'ครั้ง',
      },
    ],
  },
  // ── Group 2 · Skin rejuvenation & glow ───────────────────────────────────────
  {
    slug: 'skin-booster',
    title: 'สกินบูสเตอร์',
    titleEn: 'Skin Booster',
    shortDescription: 'เติมความชุ่มชื้นเชิงลึก ฟื้นผิวโทรมให้เนียนนุ่มดูมีน้ำมีนวล',
    description:
      'สกินบูสเตอร์เกรดพรีเมียม เติมความชุ่มชื้นและฟื้นฟูเซลล์ผิวจากภายใน กระตุ้นการสร้างคอลลาเจนใหม่ เหมาะกับผิวโทรม ผิวขาดน้ำ และรูขุมขนกว้าง ประเมินความเหมาะสมโดยแพทย์',
    aftercare: [
      'งดแตะต้อง นวด หรือกดคลึงผิวหน้าอย่างน้อย 24 ชั่วโมง',
      'หลีกเลี่ยงการแต่งหน้าหนักและการขัดผิวหน้าใน 24 ชั่วโมงแรก',
      'ทาครีมกันแดดสม่ำเสมอและหลีกเลี่ยงแดดจัดหลังทำหัตถการ',
      'งดซาวน่า อบไอน้ำ และแอลกอฮอล์ในวันที่ทำหัตถการ',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีการติดเชื้อหรือผื่นอักเสบบริเวณผิวที่จะทำหัตถการ',
      'มีประวัติแพ้ส่วนประกอบของผลิตภัณฑ์สกินบูสเตอร์',
      'มีแผลเปิดหรือผิวอักเสบรุนแรงบริเวณใบหน้า',
    ],
    downtime: 'อาจมีรอยแดงหรือตุ่มเล็กจากรอยเข็มได้ 1–2 วัน แต่งหน้าปกปิดได้หลัง 24 ชั่วโมง',
    items: [
      {
        id: 'skin-booster-oxelle',
        name: 'Oxelle Skin Booster',
        detail: 'Product from Italy',
        tagline: 'Skin Boosters',
        benefits: [
          'Revitalizing — กระตุ้นการสร้างคอลลาเจนให้ผิวอิ่มฟูและยืดหยุ่น',
          'Bio-Stimulating — เร่งการสร้างเซลล์ผิวใหม่ เบลอรูขุมขน ปรับผิวให้เรียบเนียน',
          'Antioxidant — ปกป้องผิวจากมลภาวะ และชะลอการเกิดริ้วรอย',
          'Whitening — ลดเลือนฝ้า กระ จุดด่างดำ ปรับสีผิวให้สว่างกระจ่างใสสม่ำเสมอ',
        ],
        unit: 'ครั้ง',
      },
    ],
  },
  {
    slug: 'iv-drip',
    title: 'IV Drip วิตามิน',
    titleEn: 'IV Drip / Vitamin',
    shortDescription: 'ดริปวิตามินทางหลอดเลือด ฟื้นฟูผิวจากภายในให้ดูกระจ่างใส',
    description:
      'โปรแกรม IV Drip วิตามินสูตรเฉพาะของ Kazumi Clinic ช่วยปรับโทนผิวให้ดูกระจ่างใส ลดเลือนเม็ดสี กระตุ้นคอลลาเจน และฟื้นฟูผิวที่อ่อนล้าจากแสงแดดและมลภาวะ ดูแลโดยแพทย์',
    aftercare: [
      'ดื่มน้ำให้เพียงพอหลังรับดริปวิตามินเพื่อช่วยการดูดซึม',
      'พักที่จุดให้น้ำเกลือประมาณ 5–10 นาทีก่อนลุกเดินหากรู้สึกหน้ามืด',
      'แจ้งพยาบาลหรือแพทย์ทันทีหากรู้สึกคัน ผื่นขึ้น หรือแน่นหน้าอกระหว่างหรือหลังให้น้ำเกลือ',
      'หลีกเลี่ยงการงอแขนบริเวณที่แทงเข็มแรง ๆ ในวันที่ทำหัตถการ',
    ],
    contraindications: [
      'มีประวัติแพ้วิตามินหรือส่วนประกอบในสูตรที่เลือก',
      'มีโรคไตหรือโรคหัวใจที่จำกัดปริมาณสารน้ำ ควรแจ้งแพทย์ก่อนประเมิน',
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร ควรปรึกษาแพทย์ก่อน',
      'มีภาวะพร่องเอนไซม์ G6PD สำหรับสูตรที่มีวิตามินซีขนาดสูง ควรแจ้งแพทย์',
    ],
    downtime:
      'ไม่มีระยะพักฟื้น ทำกิจวัตรประจำวันต่อได้ทันทีหลังให้น้ำเกลือเสร็จ อาจมีรอยช้ำเล็กน้อยบริเวณที่แทงเข็ม',
    // The seven programs and prices below replace the clinic's older IV menu (Signature
    // Flawless / Radiant Bright / Active & Refresh / Velvet Glow). Per the NavBar spec this
    // collection is "verified ครบ 100%" from Kazumi's own poster, and unlike the filler and
    // botox figures these are catalogue prices, not May promo prices — so they're safe to show.
    items: [
      {
        id: 'iv-aura-bright-express',
        collection: 'Essential Glow Collection',
        name: 'Aura Bright Express',
        detail: 'IV Drip Vitamin',
        priceFrom: 499,
        unit: 'ครั้ง',
      },
      {
        id: 'iv-snow-white-intensive',
        collection: 'Essential Glow Collection',
        name: 'Snow White Intensive',
        detail: 'IV Drip Vitamin',
        priceFrom: 699,
        unit: 'ครั้ง',
      },
      {
        id: 'iv-detox-restore',
        collection: 'Essential Glow Collection',
        name: 'Detox Restore',
        detail: 'IV Drip Vitamin',
        priceFrom: 690,
        unit: 'ครั้ง',
      },
      {
        id: 'iv-energy-reset',
        collection: 'Recovery & Energy Collection',
        name: 'Energy Reset',
        detail: 'IV Drip Vitamin',
        priceFrom: 690,
        unit: 'ครั้ง',
      },
      {
        id: 'iv-ala-metabolic-glow',
        collection: 'Recovery & Energy Collection',
        name: 'ALA Metabolic Glow',
        detail: 'IV Drip Vitamin',
        priceFrom: 990,
        unit: 'ครั้ง',
      },
      {
        id: 'iv-super-max-signature',
        collection: 'Signature Collection',
        name: 'Super Max Signature',
        detail: 'IV Drip Vitamin',
        priceFrom: 1290,
        unit: 'ครั้ง',
      },
      {
        id: 'iv-premium-bespoke',
        collection: 'Signature Collection',
        name: 'Premium Bespoke',
        detail: 'โปรแกรมเฉพาะบุคคล',
        priceFrom: 1990,
        unit: 'ครั้ง',
      },
    ],
  },
  {
    slug: 'mesotherapy',
    title: 'เมโสบำรุงผิวและเมโสแฟต',
    titleEn: 'Mesotherapy',
    shortDescription: 'เมโสบำรุงผิวและเมโสสลายไขมันเฉพาะจุด เลือกสูตรโดยแพทย์',
    description:
      'โปรแกรมเมโสเธอราปีของ Kazumi Clinic ทั้งเมโสบำรุงผิวให้ดูกระจ่างใสและเมโสสลายไขมันเฉพาะจุด เช่น แก้มและเหนียง แพทย์เลือกสูตรและประเมินความเหมาะสมก่อนรับบริการ',
    aftercare: [
      'งดนวดหรือกดคลึงบริเวณที่ทำหัตถการอย่างน้อย 24 ชั่วโมง',
      'หลีกเลี่ยงแดดจัดและทาครีมกันแดดสม่ำเสมอหลังทำหัตถการ',
      'งดออกกำลังกายหนักและซาวน่าในวันที่ทำหัตถการ',
      'สำหรับเมโสสลายไขมันเฉพาะจุด อาจมีอาการบวมได้หลายวัน ควรแจ้งแพทย์หากบวมมากผิดปกติ',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีการติดเชื้อหรือผื่นอักเสบบริเวณที่จะทำหัตถการ',
      'มีประวัติแพ้ส่วนประกอบของสูตรที่เลือกใช้',
      'มีภาวะเลือดออกง่ายหรือรับประทานยาละลายลิ่มเลือด ควรแจ้งแพทย์ก่อนประเมิน',
    ],
    downtime:
      'บวมแดงหรือมีรอยเข็มเล็กน้อยได้ 1–3 วัน เมโสสลายไขมันเฉพาะจุดอาจบวมนานกว่าปกติถึง 3–5 วัน',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { id: 'meso-nctf-oxelle', name: 'NCTF 135 HA + Oxelle', detail: 'โปรแกรมคู่', unit: 'ครั้ง' },
      {
        id: 'meso-white-complex',
        name: 'White Complex',
        detail: 'Nexus Pharma',
        benefits: ['ฟื้นฟูผิว ลดริ้วรอย ฝ้า กระ ด้วยกลูต้าไธโอนบริสุทธิ์'],
        unit: 'ครั้ง',
      },
      { id: 'meso-nourish', name: 'เมโสบำรุงผิว', detail: 'เลือกสูตรตามสภาพผิว', unit: 'ครั้ง' },
      { id: 'meso-fat-dissolve', name: 'เมโสสลายไขมันเฉพาะจุด', detail: 'แก้ม / เหนียง', unit: 'ครั้ง' },
    ],
  },
  // ── Group 3 · Skin-concern treatments & lifting devices ──────────────────────
  {
    slug: 'acne-care',
    title: 'ดูแลสิวและหลุมสิว',
    titleEn: 'Acne & Acne Scar Care',
    shortDescription: 'รักษาสิวและฟื้นฟูหลุมสิว วางแผนการดูแลเฉพาะบุคคลโดยแพทย์',
    description:
      'โปรแกรมดูแลสิวและหลุมสิวของ Kazumi Clinic แบ่งระดับตามความรุนแรงของปัญหา ตั้งแต่สิวอักเสบไปจนถึงรอยแผลเป็นหลุมสิว แพทย์ประเมินและออกแบบแผนการรักษาเฉพาะบุคคล',
    aftercare: [
      'ทาผลิตภัณฑ์บำรุงและยาตามที่แพทย์สั่งอย่างสม่ำเสมอ',
      'หลีกเลี่ยงการแกะ เกา หรือบีบสิวด้วยตนเอง',
      'ทาครีมกันแดดทุกวันและหลีกเลี่ยงแดดจัดระหว่างการรักษา',
      'แจ้งแพทย์หากมีอาการระคายเคือง แดง หรือลอกมากผิดปกติ',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร — บางหัตถการหรือยาทาอาจไม่เหมาะสม ควรแจ้งแพทย์',
      'มีแผลเปิดหรือการติดเชื้อผิวหนังรุนแรงบริเวณที่จะทำหัตถการ',
      'มีประวัติแพ้ส่วนประกอบของยาหรือผลิตภัณฑ์ที่ใช้ในโปรแกรม',
      'ผิวไวสูงหรืออยู่ระหว่างใช้ยากลุ่มเรตินอยด์ขนาดสูง ควรแจ้งแพทย์ก่อนประเมิน',
    ],
    downtime:
      'ขึ้นอยู่กับหัตถการที่เลือก บางโปรแกรมมีผิวแดงหรือลอกได้ 1–3 วัน แพทย์จะแจ้งระยะพักฟื้นเฉพาะของแต่ละโปรแกรมก่อนเริ่มทำ',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { id: 'acne-care-program', name: 'โปรแกรมดูแลสิว', detail: 'แบ่งระดับตามความรุนแรง', unit: 'ครั้ง' },
      { id: 'acne-scar-program', name: 'โปรแกรมฟื้นฟูหลุมสิว', detail: 'ประเมินโดยแพทย์', unit: 'ครั้ง' },
    ],
  },
  {
    slug: 'laser-hifu',
    title: 'เลเซอร์และยกกระชับ',
    titleEn: 'Laser & HIFU Lifting',
    shortDescription: 'ยกกระชับผิวหน้าด้วยเลเซอร์และ HIFU ปรับพลังงานโดยแพทย์',
    description:
      'โปรแกรมยกกระชับผิวหน้าด้วยเครื่องมือแพทย์ HIFU และเลเซอร์ ช่วยกระชับผิวที่หย่อนคล้อยและดูแลผิวให้เรียบเนียน แพทย์ประเมินระดับพลังงานและตำแหน่งที่เหมาะสมกับแต่ละบุคคล',
    aftercare: [
      'ทาครีมกันแดดสม่ำเสมอและหลีกเลี่ยงแดดจัดหลังทำหัตถการ',
      'งดซาวน่า อบไอน้ำ และออกกำลังกายหนักในวันที่ทำหัตถการ',
      'หลีกเลี่ยงผลิตภัณฑ์ที่มีฤทธิ์ระคายเคือง เช่น เรตินอลหรือกรดผลัดเซลล์ผิว ในช่วง 2–3 วันแรก',
      'แจ้งแพทย์หากมีอาการบวมแดงหรือปวดผิดปกตินานเกิน 3 วัน',
    ],
    contraindications: [
      'อยู่ระหว่างตั้งครรภ์หรือให้นมบุตร',
      'มีโลหะหรืออุปกรณ์ทางการแพทย์ฝังอยู่บริเวณที่จะทำหัตถการ (รวมถึงฟิลเลอร์บางชนิดที่ยังไม่สลาย) ควรแจ้งแพทย์',
      'มีการติดเชื้อหรือแผลเปิดบริเวณผิวที่จะทำหัตถการ',
      'มีโรคผิวหนังอักเสบเรื้อรังที่ยังไม่สงบ ควรแจ้งแพทย์ก่อนประเมิน',
    ],
    downtime:
      'ผิวอาจแดงหรือรู้สึกตึงได้ 1–2 วัน บางรายอาจรู้สึกกดเจ็บใต้ผิวจาก HIFU นานถึง 1 สัปดาห์',
    // TODO: no hero photo in Cloudinary yet, so this page ships without an OG image.
    // Upload one and set `heroImage` to give it a link preview.
    items: [
      { id: 'laser-hifu-lifting', name: 'HIFU ยกกระชับผิวหน้า', detail: 'ประเมินโดยแพทย์', unit: 'ครั้ง' },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
