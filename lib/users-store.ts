import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

export type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  provider: string;
  provider_id: string;
  created_at: string;
};

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

export async function upsertUser(user: {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  provider: string;
  provider_id: string;
}): Promise<UserRow> {
  const binding = await db();
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');

  const now = new Date().toISOString();

  // Try to find if user exists by provider_id
  const existing = await binding
    .prepare('SELECT * FROM users WHERE provider_id = ?1')
    .bind(user.provider_id)
    .first<UserRow>();

  if (existing) {
    // Update existing user details (like name/avatar which might change)
    await binding
      .prepare('UPDATE users SET email = ?1, name = ?2, avatar_url = ?3 WHERE id = ?4')
      .bind(user.email, user.name, user.avatar_url, existing.id)
      .run();
    return { ...existing, email: user.email, name: user.name, avatar_url: user.avatar_url };
  } else {
    // Insert new user
    await binding
      .prepare(
        'INSERT INTO users (id, email, name, avatar_url, provider, provider_id, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
      )
      .bind(user.id, user.email, user.name, user.avatar_url, user.provider, user.provider_id, now)
      .run();
      
    return { ...user, created_at: now };
  }
}
