import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { upsertUser } from '@/lib/users-store';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import crypto from 'crypto';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const popupClosingScript = (status: 'success' | 'error') => `
    <script>
      window.opener.postMessage({ type: 'oauth_${status}' }, window.location.origin);
      window.close();
    </script>
  `;

  if (error || !code) {
    return new NextResponse(popupClosingScript('error'), { headers: { 'Content-Type': 'text/html' } });
  }

  const redirectUri = `${url.origin}/api/account/oauth/line/callback`;
  const channelId = process.env.LINE_CHANNEL_ID || '';
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

  try {
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });

    if (!tokenResponse.ok) {
      console.error(await tokenResponse.text());
      throw new Error('Failed to fetch LINE token');
    }

    const tokenData = await tokenResponse.json();
    const { id_token } = tokenData;

    const JWKS = createRemoteJWKSet(new URL('https://api.line.me/oauth2/v2.1/certs'));
    const { payload } = await jwtVerify(id_token, JWKS, {
      issuer: 'https://access.line.me',
      audience: channelId,
    });

    const email = typeof payload.email === 'string' ? payload.email : null;
    const name = typeof payload.name === 'string' ? payload.name : null;
    const picture = typeof payload.picture === 'string' ? payload.picture : null;
    const providerId = typeof payload.sub === 'string' ? payload.sub : '';

    if (!providerId) throw new Error('Missing LINE user ID');

    const userId = crypto.randomUUID();
    const userRow = await upsertUser({
      id: userId,
      email: email,
      name: name,
      avatar_url: picture,
      provider: 'line',
      provider_id: providerId,
    });

    await setSession({
      userId: userRow.id,
      email: userRow.email || '',
      name: userRow.name || '',
      avatarUrl: userRow.avatar_url || '',
    });

    return new NextResponse(popupClosingScript('success'), { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('LINE OAuth Error:', error);
    return new NextResponse(popupClosingScript('error'), { headers: { 'Content-Type': 'text/html' } });
  }
}
