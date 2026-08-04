import { afterEach, describe, expect, it } from 'vitest';
import { GoogleAnalytics } from '@/components/google-analytics';

/**
 * The whole point of the env gate is that an unconfigured deploy loads *nothing* — gtag.js is
 * 148KB on the wire, so "renders nothing" has to be the guaranteed default, not an accident.
 * These call the component directly rather than rendering it: it's a server component and the
 * assertion is about which elements it returns, not about the DOM.
 */

const original = process.env.GA_MEASUREMENT_ID;

afterEach(() => {
  if (original === undefined) delete process.env.GA_MEASUREMENT_ID;
  else process.env.GA_MEASUREMENT_ID = original;
});

type ElementLike = { props?: Record<string, unknown> };

/** Flattens the returned tree to the props of every <Script> in it. */
function scriptProps(node: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];

  const walk = (n: unknown): void => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== 'object') return;

    const { props } = n as ElementLike;
    if (!props) return;
    if (props.src !== undefined || props.id !== undefined) out.push(props);
    walk(props.children);
  };

  walk(node);
  return out;
}

describe('GoogleAnalytics', () => {
  it.each([undefined, '', '   '])('renders nothing when GA_MEASUREMENT_ID is %o', (value) => {
    if (value === undefined) delete process.env.GA_MEASUREMENT_ID;
    else process.env.GA_MEASUREMENT_ID = value;

    expect(GoogleAnalytics()).toBeNull();
  });

  it('loads gtag.js for the configured id and initialises it', () => {
    process.env.GA_MEASUREMENT_ID = 'G-ABC1234567';
    const scripts = scriptProps(GoogleAnalytics());

    expect(scripts).toHaveLength(2);
    expect(scripts[0].src).toBe('https://www.googletagmanager.com/gtag/js?id=G-ABC1234567');
    expect(scripts[1].children).toContain('"G-ABC1234567"');
    // afterInteractive keeps the tag out of the critical path; a change here is a perf decision.
    expect(scripts.every((s) => s.strategy === 'afterInteractive')).toBe(true);
  });

  it.each([
    'G-1";alert(1);//',
    "G-1');alert(1);//",
    'G-<script>',
    'UA-12345-1',
    'G-',
    'not-an-id',
  ])('refuses to emit anything for a malformed id (%s)', (value) => {
    // The value reaches an inline <script>, so the gate is "does it look like a measurement id",
    // not "can we escape it". Nothing renders → nothing to break out of.
    process.env.GA_MEASUREMENT_ID = value;

    expect(GoogleAnalytics()).toBeNull();
  });
});
