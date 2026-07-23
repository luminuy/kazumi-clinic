import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AdminSidebar } from '@/components/admin/sidebar';
import { countNewLeads } from '@/lib/leads-store';

export const metadata: Metadata = {
  title: { default: 'จัดการเว็บไซต์', template: '%s — Kazumi Admin' },
  // robots.ts already disallows /admin; this covers crawlers that ignore it. The real gate is
  // middleware.ts — these are only belt and braces.
  robots: { index: false, follow: false },
};

// The sidebar badge is live D1 data, so the whole admin shell is per-request.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminEmail, newLeads] = await Promise.all([
    headers().then((h) => h.get('x-admin-email')),
    countNewLeads(),
  ]);

  return (
    <div className="min-h-screen bg-sand lg:flex">
      <AdminSidebar email={adminEmail} newLeads={newLeads} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
