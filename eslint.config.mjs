import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// ESLint 9 only reads flat config, but eslint-config-next 15.5 still ships the legacy
// eslintrc format with no flat export — hence FlatCompat. Without this file `pnpm lint`
// doesn't lint anything: it exits 2 telling you to migrate, which it did for every commit
// up to this one. Drop the shim once eslint-config-next exports a flat config.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

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
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
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
