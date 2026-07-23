import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { upsertUser } from '@/lib/users-store';

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

  const redirectUri = `${url.origin}/api/account/oauth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) throw new Error('Failed to fetch Google token');

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) throw new Error('Failed to fetch Google user profile');
    
    const profile = await userResponse.json();

    const userId = crypto.randomUUID();
    const userRow = await upsertUser({
      id: userId,
      email: profile.email || null,
      name: profile.name || null,
      avatar_url: profile.picture || null,
      provider: 'google',
      provider_id: profile.id,
    });

    await setSession({
      userId: userRow.id,
      email: userRow.email || '',
      name: userRow.name || '',
      avatarUrl: userRow.avatar_url || '',
    });

    return new NextResponse(popupClosingScript('success'), { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('Google OAuth Error:', error);
    return new NextResponse(popupClosingScript('error'), { headers: { 'Content-Type': 'text/html' } });
  }
}
