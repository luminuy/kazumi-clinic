// GENERATED — do not edit by hand.
//
//   npx tsx scripts/i18n/catalogue-extract.mts > /tmp/catalogue-th.json
//   bash scripts/i18n/translate-catalogue.sh /tmp/catalogue-th.json > /tmp/catalogue-en.json
//   node scripts/i18n/catalogue-validate.mjs /tmp/catalogue-th.json /tmp/catalogue-en.json
//   node scripts/i18n/catalogue-apply.mjs /tmp/catalogue-en.json
//
// English for the service catalogue, keyed by the same stable ids as lib/services.ts. That file
// stays the Thai source of truth — prices, อย. notes and ids are curated by hand there and must not
// be rewritten by a translation run. tests/invariants.test.ts proves the two stay 1:1, so a new
// Thai item cannot ship without its English.
//
// Wording rules (medical advertising is regulated — CLAUDE.md §0.2): docs/i18n-glossary.md.

export type CatalogueCategoryEn = {
  shortDescription: string;
  description: string;
  aftercare?: string[];
  contraindications?: string[];
  downtime?: string;
};

export type CatalogueItemEn = {
  name: string;
  detail?: string;
  benefits?: string[];
};

export const catalogueCategoriesEn: Record<string, CatalogueCategoryEn> = {
  "filler": {
    shortDescription: "Fills deep folds, contours the face and lips for a natural look, assessed by a doctor",
    description: "Hyaluronic acid dermal filler injection services using quality brands to treat nasolabial folds, marionette lines, under-eye area, and lips. Kazumi Clinic's doctors assess the facial structure and customize the volume for each individual before the treatment.",
    aftercare: [
      "Avoid massaging, pressing, or rubbing the treated area for at least 24–48 hours.",
      "Avoid strenuous exercise, saunas, steam rooms, and alcohol consumption on the day of the treatment.",
      "Avoid extreme heat on the face, such as strong sunlight or tanning beds, for at least 1 week.",
      "If there is unusual swelling, bruising, or pain lasting longer than 3–5 days, please contact the clinic.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "Infections or inflammatory rashes in the treatment area.",
      "History of allergy to hyaluronic acid or dermal filler ingredients.",
      "Bleeding disorders or taking blood thinners; please inform the doctor before assessment.",
    ],
    downtime: "Mild swelling, redness, or bruising at the injection site may occur for 2–5 days; makeup can be applied to cover it after 24 hours if there are no open wounds.",
  },
  "botox": {
    shortDescription: "Reduces wrinkles, contours the face, slims the jawline, and reduces sweat, injected by a doctor",
    description: "Botulinum toxin injections by a doctor to reduce wrinkles on the forehead, crow's feet, and frown lines, slim the jawline, lift the outer eyebrows, and reduce sweat. Dosage is customized for each individual based on the physician's assessment.",
    aftercare: [
      "Avoid massaging or sleeping on the treated area for at least 4–6 hours.",
      "Avoid bending your head down or strenuous exercise on the day of injection.",
      "Avoid saunas, steam rooms, and alcohol consumption for at least 24 hours.",
      "Results begin to appear within 3–14 days. If they are not as assessed, a follow-up appointment with the doctor should be scheduled.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "Myasthenia gravis or neuromuscular disorders affecting muscle function.",
      "History of allergy to botulinum toxin.",
      "Infections in the injection area.",
    ],
    downtime: "Mild redness or swelling from needle marks may occur for a few hours up to 1 day; daily activities can be resumed immediately.",
  },
  "thread-lift": {
    shortDescription: "Skin tightening of the jawline and cheeks with dissolvable PDO threads, assessed by a doctor",
    description: "A facial thread lift program using dissolvable PDO threads to help with skin tightening of the cheeks, jawline, and under the chin. The doctor assesses the number of threads and placement according to each individual's facial structure before the treatment.",
    aftercare: [
      "Avoid facial massages, rubbing, or other facial treatments in the treated area for at least 2 weeks.",
      "Avoid opening the mouth wide, chewing hard food, or excessive facial movement during the first 3–5 days.",
      "Sleep on your back and avoid sleeping face down or pressing on your face during the first week.",
      "Avoid strenuous exercise and saunas for about 1–2 weeks.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "Infections or open wounds on the face where threads will be inserted.",
      "Bleeding disorders or taking blood thinners.",
      "Active chronic skin diseases on the face; please inform the doctor before assessment.",
    ],
    downtime: "Swelling, tightness, or bruising along the thread lines may occur for 3–7 days; some individuals may feel tightness or a pulling sensation on the face for up to 2 weeks.",
  },
  "collagen-booster": {
    shortDescription: "Infuses fresh collagen, reduces wrinkles, and restores skin structure for a youthful appearance",
    description: "A fresh collagen infusion program using Karisma Rh Collagen to help restore skin structure, reduce nasolabial folds, marionette lines, and under-eye bags, while stimulating new collagen production, supervised and assessed by a doctor.",
    aftercare: [
      "Avoid massaging or rubbing the treated area for at least 24–48 hours.",
      "Avoid strenuous exercise, saunas, and alcohol consumption on the day of the treatment.",
      "Apply sunscreen and avoid strong sunlight on the face during recovery.",
      "If there is unusual swelling or redness lasting longer than 5 days, please contact the clinic.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "History of allergy to collagen or product ingredients.",
      "Infections or inflammatory rashes in the injection area.",
      "Autoimmune disorders; please inform the doctor before assessment.",
    ],
    downtime: "Mild swelling and redness at the injection site may occur for 2–4 days; makeup can be applied to cover it after 24 hours.",
  },
  "skin-booster": {
    shortDescription: "Provides deep hydration, restoring tired skin to be smooth, soft, and plump",
    description: "Premium-grade skin booster to provide hydration and restore skin cells from within, stimulating new collagen production. Suitable for tired, dehydrated skin and enlarged pores, assessed by a doctor for suitability.",
    aftercare: [
      "Avoid touching, massaging, or rubbing the face for at least 24 hours.",
      "Avoid heavy makeup and facial scrubs during the first 24 hours.",
      "Apply sunscreen regularly and avoid strong sunlight after the treatment.",
      "Avoid saunas, steam rooms, and alcohol consumption on the day of the treatment.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "Infections or inflammatory rashes on the skin where the treatment is to be performed.",
      "History of allergy to skin booster product ingredients.",
      "Open wounds or severe skin inflammation on the face.",
    ],
    downtime: "Mild redness or small bumps from needle marks may occur for 1–2 days; makeup can be applied to cover it after 24 hours.",
  },
  "iv-drip": {
    shortDescription: "IV vitamin drip to restore the skin from within for a brighter skin appearance",
    description: "An IV vitamin drip program with Kazumi Clinic's exclusive formulas to help adjust skin tone for brighter skin, reduce pigmentation, stimulate collagen, and restore tired skin from sunlight and pollution, supervised by a doctor.",
    aftercare: [
      "Drink plenty of water after the IV vitamin drip to aid absorption.",
      "Rest at the IV station for 5–10 minutes before walking if you feel dizzy.",
      "Inform a nurse or doctor immediately if you experience itching, rashes, or chest tightness during or after the IV drip.",
      "Avoid bending the arm at the injection site forcefully on the day of the treatment.",
    ],
    contraindications: [
      "History of allergy to vitamins or ingredients in the selected formula.",
      "Kidney or heart diseases that limit fluid intake; please inform the doctor before assessment.",
      "Pregnant or breastfeeding; please consult a doctor beforehand.",
      "G6PD deficiency for formulas containing high-dose vitamin C; please inform the doctor.",
    ],
    downtime: "No downtime; daily activities can be resumed immediately after the IV drip. Mild bruising may occur at the injection site.",
  },
  "mesotherapy": {
    shortDescription: "Mesotherapy and localized fat-dissolving mesotherapy, with formulas selected by a doctor",
    description: "Kazumi Clinic's mesotherapy programs include both mesotherapy for brighter skin and localized fat-dissolving mesotherapy for areas such as cheeks and double chin. The doctor selects the formula and assesses suitability before the service.",
    aftercare: [
      "Avoid massaging or rubbing the treated area for at least 24 hours.",
      "Avoid strong sunlight and apply sunscreen regularly after the treatment.",
      "Avoid strenuous exercise and saunas on the day of the treatment.",
      "For localized fat-dissolving mesotherapy, swelling may occur for several days; please inform the doctor if there is unusual swelling.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "Infections or inflammatory rashes in the treatment area.",
      "History of allergy to ingredients in the selected formula.",
      "Bleeding disorders or taking blood thinners; please inform the doctor before assessment.",
    ],
    downtime: "Mild swelling, redness, or needle marks may occur for 1–3 days. Localized fat-dissolving mesotherapy may cause swelling that lasts longer, typically 3–5 days.",
  },
  "acne-care": {
    shortDescription: "Acne treatment and acne scar restoration, with a customized care plan designed by a doctor",
    description: "Kazumi Clinic's acne and acne scar care program is categorized by the severity of the condition, ranging from inflammatory acne to acne scars. The doctor assesses and designs a customized treatment plan.",
    aftercare: [
      "Apply skincare products and medications consistently as prescribed by the doctor.",
      "Avoid picking, scratching, or squeezing acne by yourself.",
      "Apply sunscreen daily and avoid strong sunlight during the treatment.",
      "Inform the doctor if you experience unusual irritation, redness, or excessive peeling.",
    ],
    contraindications: [
      "Pregnant or breastfeeding — some treatments or topical medications may not be suitable; please inform the doctor.",
      "Open wounds or severe skin infections in the treatment area.",
      "History of allergy to ingredients in medications or products used in the program.",
      "Highly sensitive skin or currently using high-dose retinoids; please inform the doctor before assessment.",
    ],
    downtime: "Depends on the selected treatment; some programs may cause skin redness or peeling for 1–3 days. The doctor will inform you of the specific recovery period for each program before starting.",
  },
  "laser-hifu": {
    shortDescription: "Facial skin tightening with laser and HIFU, with energy levels adjusted by a doctor",
    description: "A facial skin tightening program using medical HIFU and laser devices to help tighten sagging skin and promote smooth skin. The doctor assesses the appropriate energy levels and target areas for each individual.",
    aftercare: [
      "Apply sunscreen regularly and avoid strong sunlight after the treatment.",
      "Avoid saunas, steam rooms, and strenuous exercise on the day of the treatment.",
      "Avoid irritating products, such as retinol or exfoliating acids, during the first 2–3 days.",
      "Inform the doctor if there is unusual swelling, redness, or pain lasting longer than 3 days.",
    ],
    contraindications: [
      "Pregnant or breastfeeding.",
      "Metal implants or medical devices embedded in the treatment area (including certain types of undissolved dermal fillers); please inform the doctor.",
      "Infections or open wounds on the skin where the treatment is to be performed.",
      "Active chronic inflammatory skin diseases; please inform the doctor before assessment.",
    ],
    downtime: "Skin may be red or feel tight for 1–2 days; some individuals may feel tenderness under the skin from HIFU for up to 1 week.",
  },
};

export const catalogueItemsEn: Record<string, CatalogueItemEn> = {
  "filler-neura-deep-1cc": {
    name: "Neura Deep",
    detail: "1 CC",
  },
  "filler-neura-deep-3cc": {
    name: "Neura Deep",
    detail: "3 CC",
  },
  "filler-neura-volume-1cc": {
    name: "Neura Volume",
    detail: "1 CC",
  },
  "filler-neura-volume-3cc": {
    name: "Neura Volume",
    detail: "3 CC",
  },
  "filler-lip-neura-deep-1cc": {
    name: "Filler Lip (Neura Deep)",
    detail: "1 CC",
  },
  "filler-resty-1cc": {
    name: "Filler Resty",
    detail: "Vital Light & Classic, 1 CC",
  },
  "botox-neuro-100u": {
    name: "Botulinum Toxin Neuro",
    detail: "100 U",
  },
  "thread-lift-pdo-4": {
    name: "PDO cog threads",
    detail: "4 threads",
  },
  "thread-lift-pdo-6": {
    name: "PDO cog threads",
    detail: "6 threads",
  },
  "thread-lift-pdo-8": {
    name: "PDO cog threads",
    detail: "8 threads",
  },
  "collagen-karisma-rh": {
    name: "Karisma Rh Collagen",
    detail: "Made in Italy",
    benefits: [
      "Human Collagen Type 1 — Collagen structure 100% replicated from Collagen Type 1 in human skin",
      "99.99% Compatibility — Up to 99.99% biocompatible, reducing the risk of allergy",
      "Restoration — Replenishes collagen while stimulating new collagen production",
      "Targeted Solution — Reduces wrinkles, nasolabial folds, marionette lines, and under-eye bags",
    ],
  },
  "skin-booster-oxelle": {
    name: "Oxelle Skin Booster",
    detail: "Product from Italy",
    benefits: [
      "Revitalizing — Stimulates collagen production for plump and elastic skin",
      "Bio-Stimulating — Accelerates new skin cell generation, blurs pores, and smooths skin",
      "Antioxidant — Protects skin from pollution and delays the appearance of wrinkles",
      "Whitening — Reduces melasma, freckles, dark spots, and adjusts skin tone to be evenly brighter",
    ],
  },
  "iv-aura-bright-express": {
    name: "Aura Bright Express",
    detail: "IV vitamin drip",
  },
  "iv-snow-white-intensive": {
    name: "Snow White Intensive",
    detail: "IV vitamin drip",
  },
  "iv-detox-restore": {
    name: "Detox Restore",
    detail: "IV vitamin drip",
  },
  "iv-energy-reset": {
    name: "Energy Reset",
    detail: "IV vitamin drip",
  },
  "iv-ala-metabolic-glow": {
    name: "ALA Metabolic Glow",
    detail: "IV vitamin drip",
  },
  "iv-super-max-signature": {
    name: "Super Max Signature",
    detail: "IV vitamin drip",
  },
  "iv-premium-bespoke": {
    name: "Premium Bespoke",
    detail: "Personalized program",
  },
  "meso-nctf-oxelle": {
    name: "NCTF 135 HA + Oxelle",
    detail: "Combined program",
  },
  "meso-white-complex": {
    name: "White Complex",
    detail: "Nexus Pharma",
    benefits: [
      "Restores skin, reduces wrinkles, melasma, and freckles with pure glutathione",
    ],
  },
  "meso-nourish": {
    name: "Mesotherapy",
    detail: "Formulas selected according to skin conditions",
  },
  "meso-fat-dissolve": {
    name: "Localized fat-dissolving mesotherapy",
    detail: "Cheeks / Double chin",
  },
  "acne-care-program": {
    name: "Acne care program",
    detail: "Categorized by severity",
  },
  "acne-scar-program": {
    name: "Acne scar restoration program",
    detail: "Assessed by a doctor",
  },
  "laser-hifu-lifting": {
    name: "HIFU facial skin tightening",
    detail: "Assessed by a doctor",
  },
};

/** Unit words are a closed set ("ครั้ง"), so they translate through a lookup rather than per item. */
export const catalogueUnitsEn: Record<string, string> = {
  "ครั้ง": "session",
};
