import type { PostRow } from '@/lib/blog-store';
import type { PromotionRow } from '@/lib/promotions-store';
import type { ProductRow } from '@/lib/service-products-store';
import type { ReviewRow } from '@/lib/reviews-store';
import type { Locale } from '@/lib/site';

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function localizedText<T extends string | null>(
  thai: T,
  english: string | null | undefined,
  locale: Locale | string,
): T | string {
  return locale === 'en' && hasText(english) ? english : thai;
}

function isNonEmptyStringArrayJson(value: string | null | undefined): value is string {
  if (!hasText(value)) return false;
  try {
    const parsed: unknown = JSON.parse(value);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((item) => typeof item === 'string' && item.trim().length > 0)
    );
  } catch {
    return false;
  }
}

/**
 * Overlay English D1 content field by field. Empty, whitespace-only, or missing translations
 * deliberately fall back to the Thai source so an English ISR page never caches blank content.
 */
export function localizePost(row: PostRow, locale: Locale | string): PostRow {
  if (locale !== 'en') return row;
  return {
    ...row,
    title: localizedText(row.title, row.title_en, locale),
    excerpt: localizedText(row.excerpt, row.excerpt_en, locale),
    body: localizedText(row.body, row.body_en, locale),
  };
}

export function localizePromotion(
  row: PromotionRow,
  locale: Locale | string,
): PromotionRow {
  if (locale !== 'en') return row;
  return {
    ...row,
    name: localizedText(row.name, row.name_en, locale),
    detail: localizedText(row.detail, row.detail_en, locale),
    note: localizedText(row.note, row.note_en, locale),
  };
}

export function localizeProduct(
  row: ProductRow,
  locale: Locale | string,
): ProductRow {
  if (locale !== 'en') return row;
  return {
    ...row,
    name: localizedText(row.name, row.name_en, locale),
    detail: localizedText(row.detail, row.detail_en, locale),
    tagline: localizedText(row.tagline, row.tagline_en, locale),
    // benefits_en uses the same JSON-array encoding as benefits. Invalid or empty JSON is not a
    // usable translation, so retain the Thai JSON and let the store's normal parser handle it.
    benefits: isNonEmptyStringArrayJson(row.benefits_en) ? row.benefits_en : row.benefits,
  };
}

export function localizeReview(row: ReviewRow, locale: Locale | string): ReviewRow {
  if (locale !== 'en') return row;
  return {
    ...row,
    quote: localizedText(row.quote, row.quote_en, locale),
    procedure: localizedText(row.procedure, row.procedure_en, locale),
  };
}
