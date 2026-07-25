import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

/**
 * The blog admin writes to D1, but what the public sees is the ISR cache — so a write is only
 * finished once every path that could still be serving the old copy has been purged. The site is
 * bilingual (Thai at the bare path, English under /en), which doubles the list.
 *
 * Delete used to purge only the Thai listing. A post removed for a real reason — a wrong price, an
 * unreviewed medical claim (CLAUDE.md §0.2) — stayed readable at its own URL and on /en/blog for up
 * to an hour after the clinic deleted it.
 */

const {
  clientIpMock,
  deletePostMock,
  rateLimitMock,
  revalidatePathMock,
  slugTakenMock,
  upsertPostMock,
} = vi.hoisted(() => ({
  clientIpMock: vi.fn(),
  deletePostMock: vi.fn(),
  rateLimitMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  slugTakenMock: vi.fn(),
  upsertPostMock: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }));

vi.mock('@/lib/rate-limit', () => ({ clientIp: clientIpMock, rateLimit: rateLimitMock }));

vi.mock('@/lib/blog-store', () => ({
  upsertPost: upsertPostMock,
  deletePost: deletePostMock,
  slugTaken: slugTakenMock,
}));

const { POST, DELETE } = await import('@/app/api/admin/blog/route');

function adminRequest(method: 'POST' | 'DELETE', body: unknown): NextRequest {
  return new Request('https://example.test/api/admin/blog', {
    method,
    headers: { 'content-type': 'application/json', 'x-admin-email': 'admin@example.test' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

const post = {
  title: 'ดูแลผิวหลังทำเลเซอร์',
  slug: 'laser-aftercare',
  body: 'เนื้อหาบทความ',
  published: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  clientIpMock.mockReturnValue('203.0.113.9');
  rateLimitMock.mockResolvedValue(true);
  slugTakenMock.mockResolvedValue(false);
  upsertPostMock.mockResolvedValue(undefined);
  deletePostMock.mockResolvedValue('laser-aftercare');
});

describe('POST /api/admin/blog — publishing refreshes both languages', () => {
  it('purges the listing, the article and the sitemap in Thai and English', async () => {
    const response = await POST(adminRequest('POST', post));
    expect(response.status).toBe(200);

    const purged = revalidatePathMock.mock.calls.map(([path]) => path);
    expect(purged).toEqual(
      expect.arrayContaining([
        '/blog',
        '/en/blog',
        '/blog/laser-aftercare',
        '/en/blog/laser-aftercare',
        '/sitemap.xml',
      ]),
    );
  });
});

describe('DELETE /api/admin/blog — a deleted post must stop being served', () => {
  it('purges the article itself and the English listing, not just the Thai one', async () => {
    const response = await DELETE(adminRequest('DELETE', { id: 'post_1' }));
    expect(response.status).toBe(200);

    const purged = revalidatePathMock.mock.calls.map(([path]) => path);
    expect(purged).toContain('/blog');
    expect(purged, 'the English listing kept the deleted post').toContain('/en/blog');
    expect(purged, "the article's own URL kept serving it").toContain('/blog/laser-aftercare');
    expect(purged).toContain('/en/blog/laser-aftercare');
    expect(purged).toContain('/sitemap.xml');
  });

  it('still purges the listings when the id matched no post', async () => {
    deletePostMock.mockResolvedValue(null);

    const response = await DELETE(adminRequest('DELETE', { id: 'gone' }));

    expect(response.status).toBe(200);
    const purged = revalidatePathMock.mock.calls.map(([path]) => path);
    expect(purged).toEqual(expect.arrayContaining(['/blog', '/en/blog', '/sitemap.xml']));
    // Nothing to target — it must not invent a path like "/blog/null".
    expect(purged.some((path) => path.includes('null'))).toBe(false);
  });
});
