import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Node by default — it matches how the route/lib tests run. Component tests opt into jsdom
    // per file with a `@vitest-environment jsdom` docblock so the rest stay fast.
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      // Mirror the "@/..." path alias from tsconfig.json so tests import the same way the app does.
      '@': root,
      // Next.js no-ops `import 'server-only'` at build time; the real package throws
      // unconditionally outside that special handling, which is what plain Vite/Node resolution
      // does under vitest. See tests/shims/server-only.ts for the full story.
      'server-only': `${root}/tests/shims/server-only.ts`,
    },
  },
});
