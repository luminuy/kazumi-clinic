import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localePrefix: 'as-needed',
  // Thai-first clinic: `/` must always serve Thai. With detection on (next-intl's default),
  // the middleware redirects `/` → `/en` whenever the visitor's Accept-Language prefers English
  // or a NEXT_LOCALE=en cookie lingers from a past switch — so people who never chose English
  // still land on the English page. English is reached only by an explicit switch (which routes
  // to /en directly), so automatic detection is off.
  localeDetection: false
});
 
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
