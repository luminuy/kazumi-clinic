import { cld } from './cloud';
import { getImage } from './site-images-store';
import type { SiteImageKey } from './site-images';

export type SocialImage = {
  url: string;
  width: 1200;
  height: 630;
  alt?: string;
};

/** Crop one Cloudinary public ID to the site's shared OG/Twitter dimensions. */
export function socialImage(publicId: string, alt?: string): SocialImage {
  return {
    url: cld(publicId, { width: 1200, height: 630, crop: 'fill', gravity: 'auto' }),
    width: 1200,
    height: 630,
    ...(alt ? { alt } : {}),
  };
}

/** Resolve an admin-managed image slot before building its OG/Twitter image. */
export async function siteSocialImage(key: SiteImageKey, alt?: string): Promise<SocialImage> {
  return socialImage(await getImage(key), alt);
}
