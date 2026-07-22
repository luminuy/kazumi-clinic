import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  // Mirror the "@/..." path alias from tsconfig.json so tests import the same way the app does.
  resolve: {
    alias: { '@': root },
  },
});
