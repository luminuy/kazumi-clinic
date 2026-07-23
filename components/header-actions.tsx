'use client';

import { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/auth/login-modal';

export function HeaderActions() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full text-foreground/80 hover:text-primary">
          <Search className="size-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-foreground/80 hover:text-primary"
          onClick={() => setLoginModalOpen(true)}
        >
          <User className="size-5" />
          <span className="sr-only">Account</span>
        </Button>
      </div>
      
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}
