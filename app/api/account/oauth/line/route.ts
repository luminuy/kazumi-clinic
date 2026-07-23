import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = `${url.origin}/api/account/oauth/line/callback`;
  
  const state = crypto.randomUUID();

  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', process.env.LINE_CHANNEL_ID || '');
  lineAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  lineAuthUrl.searchParams.set('state', state);
  lineAuthUrl.searchParams.set('scope', 'profile openid email');
  lineAuthUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(lineAuthUrl.toString());
}
