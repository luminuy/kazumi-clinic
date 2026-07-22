import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    // Delegates resizing to Cloudinary (see lib/cloud.ts default export) instead of Next's
    // own optimizer — required because @opennextjs/cloudflare doesn't run Next's image API.
    loader: 'custom',
    loaderFile: './lib/cloud.ts',
  },
};

export default withNextIntl(nextConfig);
