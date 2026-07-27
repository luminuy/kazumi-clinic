// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';
import thMessages from '@/messages/th.json';
import { serviceCategories, type ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { ServiceItemActions } from '@/components/service-item-actions';

/**
 * The purchase row is where a medical-content rule turns into UI: an item the clinic has not priced
 * must offer a LINE enquiry and nothing else (CLAUDE.md §0.2 — prices need the owner/doctor's sign
 * off before they reach the site). A regression here would put a "ซื้อเลย" button on a treatment
 * with no approved price, which is exactly the kind of thing nobody notices in review.
 */

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
  // The locale-aware Link needs next-intl's request context, which no unit test has. A plain
  // anchor keeps the rendered markup (and its accessible name) identical for these assertions.
  Link: ({ href, children, ...rest }: { href: string; children?: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

// next/image runs the project's Cloudinary loader, which expects Next's build-time image config.
// These assertions only care whether an <img> is rendered at all, so a plain element is enough.
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

const priced: ServiceItem = {
  id: 'filler-1cc',
  name: 'ฟิลเลอร์',
  detail: '1 cc',
  unit: 'ต่อครั้ง',
  priceFrom: 6900,
};
const unpriced: ServiceItem = { name: 'เมโสหน้าใส', detail: 'ปรึกษาแพทย์', unit: 'ต่อครั้ง' };

/** Real messages, so a renamed/removed key fails here instead of shipping as a raw key on /en. */
function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="th" messages={thMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('ServiceItemActions — what an item without a published price may show', () => {
  it('offers only the LINE enquiry when the item has no price', () => {
    renderWithIntl(<ServiceItemActions item={unpriced} />);

    const line = screen.getByRole('link', { name: /LINE/ });
    expect(line).toHaveProperty('href', 'https://lin.ee/1tshhNn');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText('ซื้อเลย')).toBeNull();
  });

  it('offers only the LINE enquiry when the item has a price but no product id to buy', () => {
    renderWithIntl(<ServiceItemActions item={{ name: 'โปรแกรมพิเศษ', unit: 'ต่อคอร์ส', priceFrom: 4500 }} />);

    expect(screen.queryByText('ซื้อเลย')).toBeNull();
    expect(screen.getByRole('link', { name: /LINE/ })).toBeTruthy();
  });

  it('shows cart, LINE and buy-now once the item is fully purchasable', () => {
    renderWithIntl(<ServiceItemActions item={priced} />);

    expect(screen.getByRole('button', { name: /เพิ่ม ฟิลเลอร์ 1 cc ลงตะกร้า/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /สอบถาม ฟิลเลอร์ 1 cc ผ่าน LINE/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /ซื้อเลย/ })).toBeTruthy();
  });

  it('opens LINE in a new tab without handing it window.opener', () => {
    renderWithIntl(<ServiceItemActions item={unpriced} />);

    const line = screen.getByRole('link', { name: /LINE/ });
    expect(line.getAttribute('target')).toBe('_blank');
    expect(line.getAttribute('rel')).toContain('noopener');
  });
});

describe('ServiceItemActions — buy now', () => {
  it('adds the item then sends the visitor to checkout', async () => {
    renderWithIntl(<ServiceItemActions item={priced} />);

    screen.getByRole('button', { name: /ซื้อเลย/ }).click();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/cart/checkout'));
    expect(fetchMock).toHaveBeenCalledWith('/api/cart/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'filler-1cc' }),
    });
  });

  it('stays on the page and says so when the cart write fails', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
    renderWithIntl(<ServiceItemActions item={priced} />);

    screen.getByRole('button', { name: /ซื้อเลย/ }).click();

    await waitFor(() => expect(screen.getByText('เพิ่มลงตะกร้าไม่สำเร็จ')).toBeTruthy());
    // Navigating to an empty checkout would look like the purchase went through.
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('ignores repeat clicks while the first add is still in flight', async () => {
    let release: (value: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (release = resolve)));
    renderWithIntl(<ServiceItemActions item={priced} />);

    const buy = screen.getByRole('button', { name: /ซื้อเลย/ });
    buy.click();
    await waitFor(() => expect(buy).toHaveProperty('disabled', true));
    buy.click();
    buy.click();

    release(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('ServiceItemActions — against the real catalogue', () => {
  it('every catalogue item that renders a buy button really is purchasable', () => {
    const items = serviceCategories.flatMap((category) => category.items);
    const buyable = items.filter((item) => Boolean(item.id) && item.priceFrom !== undefined);

    for (const item of buyable) {
      // lib/members/catalog.ts uses the same two fields to decide what the cart accepts; an item
      // that shows the button but is rejected server-side would be a dead end for the customer.
      expect(item.id, `${item.name} has a price but no id`).toBeTruthy();
      expect(typeof item.priceFrom, `${item.name} has a non-numeric price`).toBe('number');
    }
  });
});

describe('brand chrome survives an empty logo slot', () => {
  // `brand-mark` used to ship a baked-in Cloudinary ID that had been deleted from the media
  // library. One click on /admin's "คืนรูปเดิม" would have put that dead ID back on every page.
  // The default is gone now, so the slot can legitimately resolve to '' — which must not become
  // <Image src="">.
  it('Header renders the wordmark and no image when the mark is empty', async () => {
    const { default: Header } = await import('@/components/Header');
    renderWithIntl(<Header logoMark="" />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByLabelText('Kazumi Clinic หน้าหลัก')).toBeTruthy();
  });

  it('Header renders the mark when one is uploaded', async () => {
    const { default: Header } = await import('@/components/Header');
    renderWithIntl(<Header logoMark="kazumi-clinic/brand-mark-123" />);

    expect(screen.getByRole('img', { name: 'Kazumi Clinic' })).toBeTruthy();
  });

  it('Footer renders the wordmark and no image when the mark is empty', async () => {
    const { default: Footer } = await import('@/components/Footer');
    renderWithIntl(<Footer logoMark="" description={site.description} />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Kazumi Clinic')).toBeTruthy();
  });
});
