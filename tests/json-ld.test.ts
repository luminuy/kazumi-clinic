import { describe, it, expect } from 'vitest';
import { jsonLdHtml } from '@/lib/json-ld';

const LS = String.fromCharCode(0x2028); // U+2028 line separator
const PS = String.fromCharCode(0x2029); // U+2029 paragraph separator

describe('jsonLdHtml', () => {
  it('escapes < so a payload cannot close the <script> element', () => {
    const out = jsonLdHtml({ headline: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script>');
  });

  it('escapes the U+2028 / U+2029 line terminators', () => {
    const out = jsonLdHtml({ q: `a${LS}b${PS}c` });
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(LS);
    expect(out).not.toContain(PS);
  });

  it('stays valid JSON with equivalent data after escaping', () => {
    const data = { headline: '</script>', body: `x${LS}y`, nested: { n: 1 } };
    expect(JSON.parse(jsonLdHtml(data))).toEqual(data);
  });

  it('leaves ordinary content untouched', () => {
    expect(jsonLdHtml({ name: 'Kazumi Clinic' })).toBe('{"name":"Kazumi Clinic"}');
  });
});
