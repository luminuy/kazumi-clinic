import Image from 'next/image';

// Editorial page header shared by all inner pages: dark forest band, uppercase
// eyebrow, oversized serif title, optional lead paragraph. Pass `image` (a
// Cloudinary public ID) to show a full-bleed photo behind the text instead of
// the flat olive-deep background, with `imageAlt` describing what it shows —
// omit `imageAlt` only when the photo is purely decorative.
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  imageAlt?: string;
}) {
  // With a photo behind it the band stays dark for legibility; without one it
  // reads as a light Apple-style header (near-black text on the store surface).
  const onImage = Boolean(image);

  return (
    <section
      className={`relative overflow-hidden px-6 pb-16 pt-28 ${
        onImage ? 'bg-olive-deep text-sand' : 'bg-[var(--store-surface)] text-olive-deep'
      }`}
    >
      {image && (
        <>
          <Image
            src={image}
            alt={imageAlt ?? ''}
            aria-hidden={imageAlt ? undefined : 'true'}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-olive-deep via-olive-deep/85 to-olive-deep/55" />
        </>
      )}

      <div className="relative mx-auto max-w-6xl">
        {eyebrow && (
          <div
            className={`flex items-center gap-3 text-xs uppercase tracking-[0.3em] ${
              onImage ? 'text-sand/60' : 'text-forest'
            }`}
          >
            <span className={`h-px w-8 ${onImage ? 'bg-clay' : 'bg-forest'}`} />
            {eyebrow}
          </div>
        )}

        <h1 className={`max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight md:text-6xl ${eyebrow ? 'mt-5' : ''}`}>
          {title}
        </h1>

        {lead && (
          <p className={`mt-6 max-w-2xl text-sm leading-relaxed ${onImage ? 'text-sand/70' : 'text-ink/60'}`}>
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}

// Numbered editorial section label, e.g. (01) บริการ
export function SectionLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
      ({String(index).padStart(2, '0')}) {children}
    </span>
  );
}
