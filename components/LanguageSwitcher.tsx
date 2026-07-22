'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="group relative flex items-center">
      <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
        <Globe className="size-4" />
        <span className="sr-only">Toggle language</span>
      </Button>
      <div className="invisible absolute top-full right-0 z-50 mt-1 flex flex-col overflow-hidden rounded-md border border-olive/10 bg-background py-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <button
          onClick={() => switchLocale('th')}
          className={`px-4 py-2 text-sm text-left hover:bg-muted ${locale === 'th' ? 'font-bold text-primary' : 'text-foreground/80'}`}
        >
          ไทย
        </button>
        <button
          onClick={() => switchLocale('en')}
          className={`px-4 py-2 text-sm text-left hover:bg-muted ${locale === 'en' ? 'font-bold text-primary' : 'text-foreground/80'}`}
        >
          English
        </button>
      </div>
    </div>
  );
}
