import Link from 'next/link';

// Editorial page header shared by all inner pages: dark forest band, breadcrumb,
// uppercase eyebrow, oversized serif title, optional lead paragraph.
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumb: { name: string; href?: string }[];
}) {
  return (
    <section className="bg-olive-deep px-6 pb-16 pt-28 text-sand">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-sand/50">
          {breadcrumb.map((b, i) => (
            <span key={b.name} className="flex items-center gap-1.5">
              {b.href ? (
                <Link href={b.href} className="transition-colors hover:text-sand">
                  {b.name}
                </Link>
              ) : (
                <span className="text-sand/80">{b.name}</span>
              )}
              {i < breadcrumb.length - 1 && <span className="text-sand/30">/</span>}
            </span>
          ))}
        </nav>

        {eyebrow && (
          <div className="mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sand/60">
            <span className="h-px w-8 bg-clay" />
            {eyebrow}
          </div>
        )}

        <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight md:text-6xl">
          {title}
        </h1>

        {lead && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-sand/70">{lead}</p>}
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
