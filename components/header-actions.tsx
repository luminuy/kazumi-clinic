'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, User, ShoppingBag } from 'lucide-react';
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
  cartCount = 0,
  isLoggedIn = false,
  oauthProviders = [],
}: {
  cartCount?: number;
  isLoggedIn?: boolean;
  oauthProviders?: OAuthProvider[];
}) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
            aria-label="ตะกร้าสินค้า"
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
      
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} providers={oauthProviders} />
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
}
