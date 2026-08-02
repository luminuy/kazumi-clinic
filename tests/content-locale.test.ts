import { describe, expect, it } from 'vitest';
import {
  localizePost,
  localizePromotion,
  localizeReview,
} from '@/lib/content-locale';
import type { PostRow } from '@/lib/blog-store';
import type { PromotionRow } from '@/lib/promotions-store';
import type { ReviewRow } from '@/lib/reviews-store';

const post: PostRow = {
  id: 'post-1',
  slug: 'example',
  title: 'หัวข้อไทย',
  title_en: 'English title',
  excerpt: 'คำโปรยไทย',
  excerpt_en: ' ',
  body: 'เนื้อหาไทย',
  body_en: 'English body',
  cover_image_public_id: null,
  author: null,
  published: 1,
  published_at: 1,
  updated_at: 1,
  updated_by: 'test-admin',
  category: null,
  sort_order: 0,
  deleted: 0,
};

const promotion: PromotionRow = {
  id: 'promotion-1',
  name: 'ชื่อไทย',
  name_en: 'English name',
  detail: 'รายละเอียดไทย',
  detail_en: '',
  price: 1000,
  original_price: null,
  note: null,
  note_en: 'English note',
  valid_until: '2099-12-31',
  category_slug: null,
  sort_order: 0,
  updated_at: 1,
  updated_by: 'test-admin',
  image_public_id: null,
  deleted: 0,
};

const review: ReviewRow = {
  id: 'review-1',
  name: 'คุณเอ',
  rating: 5,
  quote: 'รีวิวไทย',
  quote_en: 'English review',
  procedure: 'หัตถการไทย',
  procedure_en: '\n',
  category_slug: null,
  before_image_public_id: null,
  after_image_public_id: null,
  consent: 1,
  published: 1,
  sort_order: 0,
  updated_at: 1,
  updated_by: 'test-admin',
  deleted: 0,
};

describe('D1 content locale overlays', () => {
  it('returns the Thai source untouched outside the English locale', () => {
    expect(localizePost(post, 'th')).toBe(post);
    expect(localizePromotion(promotion, 'th')).toBe(promotion);
    expect(localizeReview(review, 'th')).toBe(review);
  });

  it('localizes a post field by field and falls back for blank English', () => {
    expect(localizePost(post, 'en')).toMatchObject({
      title: 'English title',
      excerpt: 'คำโปรยไทย',
      body: 'English body',
    });
  });

  it('localizes promotion and review fields without replacing Thai with blanks', () => {
    expect(localizePromotion(promotion, 'en')).toMatchObject({
      name: 'English name',
      detail: 'รายละเอียดไทย',
      note: 'English note',
    });
    expect(localizeReview(review, 'en')).toMatchObject({
      quote: 'English review',
      procedure: 'หัตถการไทย',
    });
  });
});
