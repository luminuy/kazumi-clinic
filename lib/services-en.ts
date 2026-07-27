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
};

export type CatalogueItemEn = {
  name: string;
  detail?: string;
  benefits?: string[];
};

export const catalogueCategoriesEn: Record<string, CatalogueCategoryEn> = {
  "filler": {
    shortDescription: "Fills deep folds, adjusts facial shape and lips to look natural, assessed by a doctor",
    description: "Hyaluronic acid dermal filler treatment from quality brands, caring for nasolabial folds, marionette lines, under-eye area, and lips. Kazumi Clinic's doctors assess facial structure and design the customized volume for each individual before the treatment.",
  },
  "botox": {
    shortDescription: "Reduces wrinkles, shapes the face and jawline, and reduces sweat, injected by a doctor",
    description: "Botulinum toxin injections by a doctor to reduce forehead wrinkles, crow's feet, and frown lines, slim the jawline, lift eyebrows, and reduce sweat. The dosage is customized for each individual based on a physician's assessment.",
  },
  "thread-lift": {
    shortDescription: "Skin tightening for the jawline and cheeks with dissolvable PDO threads, assessed by a doctor",
    description: "Thread lift program for facial skin tightening using dissolvable PDO threads, helping to tighten the skin of cheeks, jawline, and under-chin area. The doctor assesses the number of threads and placement according to each individual's facial structure before the procedure.",
  },
  "collagen-booster": {
    shortDescription: "Replenishes fresh collagen, reduces the appearance of wrinkles, and restores skin structure for a youthful appearance",
    description: "Karisma Rh Collagen replenishing program that helps restore skin structure, reduces nasolabial folds, marionette lines, and under-eye bags while stimulating new collagen production, supervised and assessed by a doctor.",
  },
  "skin-booster": {
    shortDescription: "Provides deep hydration, restoring tired skin to be soft, smooth, and plump",
    description: "Premium grade skin booster that hydrates and restores skin cells from within, stimulating new collagen production. Suitable for tired skin, dehydrated skin, and enlarged pores, with suitability assessed by a doctor.",
  },
  "iv-drip": {
    shortDescription: "IV vitamin drip to restore skin from within for brighter skin",
    description: "Kazumi Clinic's signature IV vitamin drip program that helps adjust skin tone for brighter skin, reduces pigmentation, stimulates collagen, and restores skin fatigued from sunlight and pollution, supervised by a doctor.",
  },
  "mesotherapy": {
    shortDescription: "Mesotherapy and localized fat-dissolving mesotherapy, with formulas selected by a doctor",
    description: "Kazumi Clinic's mesotherapy programs include both mesotherapy for brighter skin and localized fat-dissolving mesotherapy for areas such as the cheeks and double chin. Doctors select the formula and assess suitability before the treatment.",
  },
  "acne-care": {
    shortDescription: "Acne treatment and acne scar restoration, with personalized care planned by a doctor",
    description: "Kazumi Clinic's acne and acne scar programs are categorized by severity, ranging from inflammatory acne to acne scars, with doctors assessing and designing a personalized treatment plan.",
  },
  "laser-hifu": {
    shortDescription: "Facial skin tightening with laser and HIFU, with energy levels adjusted by a doctor",
    description: "Facial skin tightening program using medical HIFU and laser devices, helping to tighten sagging skin and smooth the skin. The doctor assesses the appropriate energy levels and target areas for each individual.",
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
      "Human Collagen Type 1 — Collagen with a structure 100% replicated from Collagen Type 1 in human skin",
      "99.99% Compatibility — Highly compatible with the body up to 99.99%, reducing the risk of allergic reactions",
      "Restoration — Replenishes collagen while stimulating new collagen production",
      "Targeted Solution — Reduces the appearance of wrinkles, nasolabial folds, marionette lines, and under-eye bags",
    ],
  },
  "skin-booster-oxelle": {
    name: "Oxelle Skin Booster",
    detail: "Product from Italy",
    benefits: [
      "Revitalizing — Stimulates collagen production for plump and elastic skin",
      "Bio-Stimulating — Accelerates new skin cell generation, blurs pores, and smooths the skin",
      "Antioxidant — Protects skin from pollution and delays the appearance of wrinkles",
      "Whitening — Reduces melasma, freckles, and dark spots, promoting an even and brighter skin tone",
    ],
  },
  "iv-aura-bright-express": {
    name: "Aura Bright Express",
    detail: "IV Vitamin Drip",
  },
  "iv-snow-white-intensive": {
    name: "Snow White Intensive",
    detail: "IV Vitamin Drip",
  },
  "iv-detox-restore": {
    name: "Detox Restore",
    detail: "IV Vitamin Drip",
  },
  "iv-energy-reset": {
    name: "Energy Reset",
    detail: "IV Vitamin Drip",
  },
  "iv-ala-metabolic-glow": {
    name: "ALA Metabolic Glow",
    detail: "IV Vitamin Drip",
  },
  "iv-super-max-signature": {
    name: "Super Max Signature",
    detail: "IV Vitamin Drip",
  },
  "iv-premium-bespoke": {
    name: "Premium Bespoke",
    detail: "Personalized program",
  },
  "meso-nctf-oxelle": {
    name: "NCTF 135 HA + Oxelle",
    detail: "Dual program",
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
    detail: "Formula selected according to skin condition",
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
