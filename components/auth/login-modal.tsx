'use client';

import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { LineIcon } from '@/components/brand-icons';
import { cn } from '@/lib/utils';

export function LoginModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleOAuthLogin = (provider: 'google' | 'line') => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `/api/account/oauth/${provider}`,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'oauth_success') {
        onOpenChange(false);
        // Reload to update header state or session
        window.location.reload();
      }
      if (event.data?.type === 'oauth_error') {
        console.error('OAuth login failed');
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      }
    };

    window.addEventListener('message', messageListener);

    // Cleanup listener when popup closes
    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
      }
    }, 500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-6 border bg-background p-8 shadow-xl transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:rounded-2xl">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">เข้าสู่ระบบ</h2>
            <p className="text-sm text-muted-foreground">
              เข้าสู่ระบบสมาชิก Kazumi เพื่อจัดการการจองและตะกร้าของคุณ
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              className="w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
              onClick={() => handleOAuthLogin('line')}
            >
              <LineIcon className="mr-2 size-5" />
              ดำเนินการต่อด้วย LINE
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-50"
              onClick={() => handleOAuthLogin('google')}
            >
              <svg className="mr-2 size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              ดำเนินการต่อด้วย Google
            </Button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  หรือ
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              เข้าสู่ระบบด้วยอีเมล
            </Button>
            
            <p className="mt-2 text-center text-sm text-muted-foreground">
              ยังไม่มีบัญชี? <span className="font-semibold text-primary cursor-pointer">สมัครสมาชิก</span>
            </p>
          </div>
          <Dialog.Close
            render={<Button variant="ghost" size="icon-sm" className="absolute right-4 top-4" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
