import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const redirectUri = `${process.env.FRONTEND_URL}/api/auth/google/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile&access_type=offline`;
    return NextResponse.redirect(new URL(authUrl));
}
