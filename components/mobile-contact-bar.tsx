import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { site } from '@/lib/site';

const actions = [
  { label: 'โทร', href: site.phoneUrl, icon: Phone, external: false },
  { label: 'แผนที่', href: site.mapsUrl, icon: MapPin, external: true },
  { label: 'จอง LINE', href: site.lineUrl, icon: MessageCircle, external: true },
] as const;

export function MobileContactBar() {
  return (
    <nav
      aria-label="ติดต่อคลินิกอย่างรวดเร็ว"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-olive/15 bg-cream/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgb(38_40_31/0.12)] backdrop-blur md:hidden"
    >
      {actions.map(({ label, href, icon: Icon, external }) => (
        <a
          key={label}
          href={href}
          {...(external && { target: '_blank', rel: 'noopener' })}
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.7rem] font-medium text-olive-deep transition-colors hover:bg-olive/5"
        >
          <Icon className="size-4" />
          {label}
        </a>
      ))}
    </nav>
  );
}
