// Client-safe lead constants. Kept out of lib/leads-store.ts (which imports the Cloudflare server
// context) so the admin dashboard client component can import the status enum without dragging a
// server-only module into the browser bundle.

export const LEAD_STATUSES = ['new', 'contacted', 'booked', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
