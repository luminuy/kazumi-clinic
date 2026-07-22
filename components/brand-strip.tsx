/**
 * Brands & technologies the clinic actually uses on its menu (lib/services.ts) — a quiet
 * credibility band. Rendered as wordmarks rather than logo images on purpose: the real brand
 * logos are third-party assets we don't hold, and inventing look-alikes would misrepresent them.
 * Swap any entry for a real uploaded logo once the clinic provides the files.
 */
const brands = [
  'Neura',
  'Karisma Rh Collagen',
  'Oxelle',
  'NCTF 135 HA',
  'PDO Thread',
  'HIFU',
] as const;

export function BrandStrip() {
  return (
    <section
      aria-label="แบรนด์และเทคโนโลยีที่คลินิกเลือกใช้"
      className="border-y border-olive/10 bg-cream"
    >
      <div className="mx-auto max-w-6xl px-6 py-9 md:px-12 md:py-11">
        <p className="text-center text-[0.62rem] uppercase tracking-[0.24em] text-ink/80">
          แบรนด์และเทคโนโลยีที่เราเลือกใช้
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:mt-6 md:gap-x-12">
          {brands.map((brand) => (
            <li
              key={brand}
              className="font-serif text-lg leading-none text-ink md:text-xl"
              lang="en"
            >
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
