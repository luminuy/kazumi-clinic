'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, User, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import type { OAuthProvider } from '@/lib/members/oauth';

// Both modals sit in the tree on every page (just visually hidden via `open`), so their JS shipped
// and hydrated for every visitor regardless of whether they ever open search or account. Splitting
// them into their own chunks means that cost is only paid once someone actually opens one.
const LoginModal = dynamic(() => import('@/components/auth/login-modal').then((m) => m.LoginModal), {
  ssr: false,
});
const SearchModal = dynamic(() => import('@/components/search-modal').then((m) => m.SearchModal), {
  ssr: false,
});

export function HeaderActions({
  oauthProviders = [],
  emailConfigured = false,
}: {
  oauthProviders?: OAuthProvider[];
  emailConfigured?: boolean;
}) {
  const t = useTranslations('Navigation');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // The brief logged-out/empty state keeps cookie-bound reads out of the static site layout.
    void Promise.all([
      fetch('/api/cart', { cache: 'no-store' }),
      fetch('/api/account/me', { cache: 'no-store' }),
    ])
      .then(async ([cartResponse, memberResponse]) => {
        const cartPayload: unknown = cartResponse.ok ? await cartResponse.json() : null;
        const memberPayload: unknown = memberResponse.ok ? await memberResponse.json() : null;

        if (
          typeof cartPayload === 'object' &&
          cartPayload !== null &&
          'cart' in cartPayload &&
          typeof cartPayload.cart === 'object' &&
          cartPayload.cart !== null &&
          'count' in cartPayload.cart &&
          typeof cartPayload.cart.count === 'number'
        ) {
          setCartCount(cartPayload.cart.count);
        }

        if (
          typeof memberPayload === 'object' &&
          memberPayload !== null &&
          'isLoggedIn' in memberPayload &&
          typeof memberPayload.isLoggedIn === 'boolean'
        ) {
          setIsLoggedIn(memberPayload.isLoggedIn);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-foreground/80 hover:text-primary"
          onClick={() => setSearchModalOpen(true)}
        >
          <Search className="size-5" />
          <span className="sr-only">Search</span>
        </Button>
        <span className="relative inline-flex">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-foreground/80 hover:text-primary"
            aria-label={t('cart')}
            render={<Link href="/cart" />}
          >
            <ShoppingBag className="size-5" />
          </Button>
          {cartCount > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-forest px-1 text-[0.6rem] font-medium leading-none text-white"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-foreground/80 hover:text-primary"
          {...(isLoggedIn 
            ? { render: <Link href="/account" /> } 
            : { onClick: () => setLoginModalOpen(true) }
          )}
        >
          <User className="size-5" />
          <span className="sr-only">Account</span>
        </Button>
      </div>
      
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        providers={oauthProviders}
        emailConfigured={emailConfigured}
      />
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
}
