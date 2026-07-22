import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata: Metadata = {
  title: { default: 'จัดการเว็บไซต์', template: '%s — Kazumi Admin' },
  // robots.ts already disallows /admin; this covers crawlers that ignore it. The real gate is
  // middleware.ts — these are only belt and braces.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminEmail = (await headers()).get('x-admin-email');

  return (
    <div className="min-h-screen bg-sand lg:flex">
      <AdminSidebar email={adminEmail} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
