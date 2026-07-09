import { Syringe, Zap, Droplets, Sparkles, Layers, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  filler: Syringe,
  botox: Zap,
  'iv-drip': Droplets,
  'skin-booster': Sparkles,
  'collagen-booster': Layers,
};

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Sparkles;
  return <Icon className={className} />;
}
