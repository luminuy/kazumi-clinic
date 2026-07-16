import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';

// queue + tagCache are required — the default in-memory/dummy implementations throw at
// runtime ("Dummy queue is not implemented") and ISR pages never revalidate. See wrangler.jsonc
// for the matching Durable Object / KV / D1 bindings.
//
// KV rather than R2 for the incremental cache: R2 isn't enabled on this Cloudflare account
// (the API returns "Please enable R2 through the Cloudflare Dashboard", code 10042) and turning
// it on is a dashboard/billing action the account owner has to take. KV is already available and
// is sufficient here — this site's cached pages are far below KV's 25MB per-value limit. Switch
// to r2IncrementalCache if R2 is ever enabled and the payloads outgrow KV.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
  tagCache: d1NextTagCache,
});
