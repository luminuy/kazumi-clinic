import type { Config } from 'tailwindcss';

// Colors approximated from brand assets (logo/cover). Swap for exact brand hex if a style guide exists.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#4B5740',
          deep: '#333C2B',
          light: '#7C8A68',
        },
        sand: '#F4F2EA',
        ink: '#1E211B',
        line: '#06C755',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
