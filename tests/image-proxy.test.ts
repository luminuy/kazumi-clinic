import { describe, expect, it } from 'vitest';
import { cloudinaryUrlFromProxyPath } from '@/lib/image-proxy';
import cloudinaryLoader, { CLOUD_NAME, IMAGE_PROXY_PREFIX } from '@/lib/cloud';

/**
 * `/api/img/*` fetches a URL derived from user-controlled path segments. That is exactly the shape
 * of an open proxy / SSRF bug, so the validator gets tested harder than the happy path does: the
 * rule is that anything not recognised returns null, and the route turns null into a 400 rather
 * than fetching it.
 */

const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

describe('cloudinaryUrlFromProxyPath', () => {
  it('rebuilds a plain resize URL', () => {
    expect(cloudinaryUrlFromProxyPath(['f_auto,q_auto,c_limit,w_750', 'kazumi-clinic', 'hero-home'])).toBe(
      `${base}/f_auto,q_auto,c_limit,w_750/kazumi-clinic/hero-home`,
    );
  });

  it('keeps a leading crop segment ahead of the resize, which is the order Cloudinary needs', () => {
    expect(
      cloudinaryUrlFromProxyPath(['c_crop,w_1060,h_1080,x_0,y_0', 'f_auto,q_auto,c_limit,w_640', 'a', 'b']),
    ).toBe(`${base}/c_crop,w_1060,h_1080,x_0,y_0/f_auto,q_auto,c_limit,w_640/a/b`);
  });

  it('accepts a bare public ID with no transformations', () => {
    expect(cloudinaryUrlFromProxyPath(['kazumi-clinic', 'logo'])).toBe(`${base}/kazumi-clinic/logo`);
  });

  it.each([
    ['nothing at all', []],
    ['only transformations, no asset', ['f_auto,q_auto,c_limit,w_750']],
    ['a path traversal', ['kazumi-clinic', '..', '..', 'secret']],
    ['a dot segment', ['.', 'logo']],
    ['an absolute URL smuggled in', ['https:', '', 'evil.example.com', 'x']],
    ['a host in the public ID', ['evil.example.com/x']],
    ['an overlay that composites another asset', ['l_kazumi-clinic:private', 'kazumi-clinic', 'logo']],
    ['an arbitrary effect', ['e_blur:2000', 'kazumi-clinic', 'logo']],
    ['a remote fetch source', ['f_auto', 'https://evil.example.com/x.png']],
    ['a query string', ['kazumi-clinic', 'logo?x=1']],
    ['a segment with a slash-encoded traversal', ['%2e%2e', 'logo']],
    ['an absurdly deep path', Array.from({ length: 20 }, () => 'a')],
  ])('rejects %s', (_label, segments) => {
    expect(cloudinaryUrlFromProxyPath(segments as string[])).toBeNull();
  });

  it('never points anywhere but our own cloud, whatever the input', () => {
    const attempts = [
      ['other-cloud', 'image', 'upload', 'x'],
      ['f_auto', 'kazumi-clinic', 'hero-home'],
      ['c_limit,w_100', 'a', 'b', 'c'],
    ];

    for (const segments of attempts) {
      const url = cloudinaryUrlFromProxyPath(segments);
      if (url !== null) expect(url.startsWith(`${base}/`)).toBe(true);
    }
  });
});

describe('cloudinaryLoader', () => {
  it('emits a same-origin URL so the browser reuses the document connection', () => {
    const src = cloudinaryLoader({ src: 'kazumi-clinic/hero-home', width: 750 });

    expect(src.startsWith(`${IMAGE_PROXY_PREFIX}/`)).toBe(true);
    expect(src).not.toContain('res.cloudinary.com');
  });

  it('round-trips through the proxy validator', () => {
    const src = cloudinaryLoader({ src: 'kazumi-clinic/hero-home', width: 750, quality: 80 });
    const segments = src.slice(IMAGE_PROXY_PREFIX.length + 1).split('/');

    expect(cloudinaryUrlFromProxyPath(segments)).toBe(
      `${base}/f_auto,q_80,c_limit,w_750/kazumi-clinic/hero-home`,
    );
  });

  it('round-trips a cldSrc() crop prefix too', () => {
    const src = cloudinaryLoader({ src: 'c_crop,w_1060,h_1080,x_0,y_0/kazumi-clinic/hero', width: 640 });
    const segments = src.slice(IMAGE_PROXY_PREFIX.length + 1).split('/');

    expect(cloudinaryUrlFromProxyPath(segments)).toBe(
      `${base}/c_crop,w_1060,h_1080,x_0,y_0/f_auto,q_auto,c_limit,w_640/kazumi-clinic/hero`,
    );
  });

  it('leaves local /public paths alone', () => {
    expect(cloudinaryLoader({ src: '/icon.png', width: 64 })).toBe('/icon.png');
  });
});
