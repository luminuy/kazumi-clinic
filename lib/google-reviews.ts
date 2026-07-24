import 'server-only';
import { cache } from 'react';

/**
 * Google reviews for the clinic's Place, via the Places API (New). Server-only: the API key is a
 * Cloudflare secret (GOOGLE_PLACES_API_KEY) and never reaches the browser — the page fetches here
 * and renders the result. GOOGLE_PLACE_ID identifies the clinic's listing (public info, not a
 * secret). Both are read at call time so a missing config degrades to "no Google section" rather
 * than throwing — same degrade-to-safe philosophy as the D1 stores.
 *
 * Google's Places API returns at most 5 reviews per place; there is no way to fetch more. Displaying
 * them carries policy obligations (attribution + link back to Google, unmodified text, author name
 * and photo) — handled in components/google-reviews.tsx. See:
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 */

export type GoogleReview = {
  id: string;
  author: string;
  authorUri: string | null;
  photoUri: string | null;
  rating: number;
  text: string;
  relativeTime: string;
};

export type GoogleReviewsData = {
  /** Aggregate star rating for the place, e.g. 4.8. */
  rating: number | null;
  /** Total number of ratings the place has on Google. */
  total: number;
  /** Canonical Google Maps URL for the place — where "see all reviews" points. */
  mapsUri: string;
  reviews: GoogleReview[];
};

// Shape of the fields we request from the Places API (New). Everything is optional because the API
// omits fields it has no data for.
type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    name?: string;
    rating?: number;
    relativePublishingTimeDescription?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  }>;
};

function config() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!apiKey || !placeId) return null;
  return { apiKey, placeId };
}

/**
 * Fetch the place's reviews in the given locale, or null when unconfigured / on any error. React
 * cache dedupes the call across a render (the page and its metadata both read it); the fetch itself
 * is revalidated hourly, matching the /reviews page ISR window and keeping well within quota.
 */
export const getGoogleReviews = cache(
  async (locale: string = 'th'): Promise<GoogleReviewsData | null> => {
    const cfg = config();
    if (!cfg) return null;

    const languageCode = locale === 'en' ? 'en' : 'th';
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      cfg.placeId,
    )}?languageCode=${languageCode}&regionCode=TH`;

    try {
      const res = await fetch(url, {
        headers: {
          'X-Goog-Api-Key': cfg.apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
        },
        // Refresh hourly rather than on every render — Google reviews change slowly and the quota
        // is per-call. Aligns with the /reviews page `revalidate`.
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;

      const data = (await res.json()) as PlacesResponse;
      const reviews: GoogleReview[] = (data.reviews ?? [])
        .map((r, i) => {
          const text = r.text?.text ?? r.originalText?.text ?? '';
          const author = r.authorAttribution?.displayName ?? '';
          if (!text || !author || typeof r.rating !== 'number') return null;
          return {
            id: r.name ?? `google-review-${i}`,
            author,
            authorUri: r.authorAttribution?.uri ?? null,
            photoUri: r.authorAttribution?.photoUri ?? null,
            rating: r.rating,
            text,
            relativeTime: r.relativePublishingTimeDescription ?? '',
          } satisfies GoogleReview;
        })
        .filter((r): r is GoogleReview => r !== null);

      if (reviews.length === 0) return null;

      return {
        rating: typeof data.rating === 'number' ? data.rating : null,
        total: data.userRatingCount ?? 0,
        mapsUri: data.googleMapsUri ?? '',
        reviews,
      };
    } catch {
      return null;
    }
  },
);
