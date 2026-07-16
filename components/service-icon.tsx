import {
  Syringe,
  Zap,
  Droplets,
  Sparkles,
  Layers,
  Spline,
  Beaker,
  ScanFace,
  Waves,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  filler: Syringe,
  botox: Zap,
  'thread-lift': Spline,
  'iv-drip': Droplets,
  'skin-booster': Sparkles,
  'collagen-booster': Layers,
  mesotherapy: Beaker,
  'acne-care': ScanFace,
  'laser-hifu': Waves,
};

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Sparkles;
  return <Icon className={className} />;
}
