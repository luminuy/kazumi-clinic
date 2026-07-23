import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  FileText,
  ImageIcon,
  Package,
  Star,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { siteImages } from '@/lib/site-images';
import { serviceCategories } from '@/lib/services';
import { getImageOverrides } from '@/lib/site-images-store';
import { getAllPromotions } from '@/lib/promotions-store';
import { getAllReviews } from '@/lib/reviews-store';
import { getAllPosts } from '@/lib/blog-store';
import { getAllLeads } from '@/lib/leads-store';
import { PageHeading } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'ภาพรวม' };

// Every stat on this page is live D1 data, never build output.
export const dynamic = 'force-dynamic';

type OverviewCard = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** The headline metric — the number the clinic glances at first. */
  metric: number;
  metricLabel: string;
  /** One line of finer detail under the metric. */
  detail: string;
  /** Draw attention (forest accent) when this card has something waiting. */
  highlight?: boolean;
};

function CardGrid({ title, cards }: { title: string; cards: OverviewCard[] }) {
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">{title}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, icon: Icon, metric, metricLabel, detail, highlight }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'group flex h-full flex-col rounded-2xl border bg-cream p-5 transition-shadow duration-200 hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)]',
                highlight ? 'border-forest/40 ring-1 ring-forest/15' : 'border-black/[0.07]',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-xl',
                    highlight ? 'bg-forest/12 text-forest' : 'bg-black/[0.05] text-ink/60',
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <ArrowRight className="size-4 text-ink/25 transition-transform group-hover:translate-x-0.5 group-hover:text-ink/50" />
              </div>

              <h3 className="mt-4 text-sm font-medium text-ink">{label}</h3>

              <div className="mt-auto pt-4">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'font-serif text-3xl leading-none',
                      highlight ? 'text-forest' : 'text-ink',
                    )}
                  >
                    {metric}
                  </span>
                  <span className="text-xs text-ink/45">{metricLabel}</span>
                </div>
                <p className="mt-1.5 text-xs text-ink/50">{detail}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function AdminDashboardPage() {
  const [overrides, promotions, reviews, posts, leads] = await Promise.all([
    getImageOverrides(),
    getAllPromotions(),
    getAllReviews(),
    getAllPosts(),
    getAllLeads(),
  ]);

  const imageTotal = siteImages.length;
  const imageChanged = siteImages.filter((image) => overrides.has(image.key)).length;

  const categoryCount = serviceCategories.length;
  const productCount = serviceCategories.reduce((sum, category) => sum + category.items.length, 0);

  const today = new Date().toISOString().slice(0, 10);
  const promoActive = promotions.filter((promo) => (promo.valid_until ?? '') >= today).length;

  const reviewLive = reviews.filter((review) => review.published === 1 && review.consent === 1).length;
  const postLive = posts.filter((post) => post.published === 1).length;

  const newLeads = leads.filter((lead) => lead.status === 'new').length;

  const content: OverviewCard[] = [
    {
      href: '/admin/images',
      label: 'รูปภาพ',
      icon: ImageIcon,
      metric: imageChanged,
      metricLabel: `จาก ${imageTotal} รูป`,
      detail: imageChanged > 0 ? 'เปลี่ยนจากค่าเริ่มต้นแล้ว' : 'ยังใช้รูปเริ่มต้นทั้งหมด',
    },
    {
      href: '/admin/products',
      label: 'สินค้า',
      icon: Package,
      metric: productCount,
      metricLabel: 'รายการ',
      detail: `${categoryCount} หมวดบริการ`,
    },
    {
      href: '/admin/promotions',
      label: 'โปรโมชั่น',
      icon: Tag,
      metric: promoActive,
      metricLabel: 'ใช้ได้',
      detail: `ทั้งหมด ${promotions.length} รายการ`,
    },
    {
      href: '/admin/reviews',
      label: 'รีวิว',
      icon: Star,
      metric: reviewLive,
      metricLabel: 'เผยแพร่',
      detail: `ทั้งหมด ${reviews.length} รายการ`,
    },
    {
      href: '/admin/blog',
      label: 'บทความ',
      icon: FileText,
      metric: postLive,
      metricLabel: 'เผยแพร่',
      detail: `ทั้งหมด ${posts.length} บทความ`,
    },
  ];

  const customer: OverviewCard[] = [
    {
      href: '/admin/leads',
      label: 'นัดหมาย',
      icon: CalendarCheck,
      metric: newLeads,
      metricLabel: 'รายการใหม่',
      detail: `ทั้งหมด ${leads.length} คำขอ`,
      highlight: newLeads > 0,
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="Dashboard"
        title="ภาพรวม"
        description="ศูนย์กลางจัดการเว็บไซต์คลินิก — เลือกหมวดด้านล่างเพื่อแก้ไขเนื้อหา รูปภาพ หรือดูคำขอนัดหมาย"
      />

      {newLeads > 0 && (
        <Link
          href="/admin/leads"
          className="group mt-8 flex items-center gap-3 rounded-2xl border border-forest/40 bg-forest/[0.06] px-5 py-4 transition-colors hover:bg-forest/[0.1]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest/12 text-forest">
            <BellRing className="size-5" strokeWidth={1.7} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink">
              มีคำขอนัดหมายใหม่ {newLeads} รายการ
            </span>
            <span className="block text-xs text-ink/55">
              โทรกลับแล้วอัปเดตสถานะเพื่อไม่ให้ตกหล่น
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-forest transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      <div className="mt-10 space-y-12">
        <CardGrid title="เนื้อหาเว็บไซต์" cards={content} />
        <CardGrid title="ลูกค้า" cards={customer} />
      </div>
    </>
  );
}
