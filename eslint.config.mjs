// eslint-config-next 16 ships native flat config (arrays of flat config objects), so it is
// spread in directly. The FlatCompat shim used up to Next 15.5 is gone: passing v16's flat
// config back through FlatCompat.extends() throws "Converting circular structure to JSON".
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  {
    // Build output, tool-managed worktrees, and vendored deps are not project source.
    // Scanning transient Wrangler files inside a nested worktree can also race their cleanup.
    ignores: [
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      '.claude/worktrees/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
      // One-off Node maintenance/seed utilities, run by hand with `node scripts/x.js`, not part of
      // the shipped app. They're CommonJS (`require`) and some embed long content with characters
      // the flat-config parser rejects — linting them only ever red-flagged CI on non-app code.
      'scripts/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // next/core-web-vitals leaves react/no-danger off, which made every
      // `// eslint-disable-next-line react/no-danger` guarding our JSON-LD blocks report as an
      // unused directive. Those guards are a deliberate convention (CLAUDE.md §12), so enable
      // the rule they name instead of deleting them: injecting HTML now has to be opted into
      // line by line, which is exactly what the convention was reaching for.
      'react/no-danger': 'warn',
    },
  },
];

export default config;
