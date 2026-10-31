import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/plugins?error=spotify_denied", req.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://nova-copilot-ai.vercel.app/api/auth/spotify/callback";

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.access_token) {
      return NextResponse.redirect(new URL("/plugins?error=spotify_token_failed", req.url));
    }

    // Save token in secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("nova_spotify_token", data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: data.expires_in || 3600,
      path: "/"
    });

    if (data.refresh_token) {
      cookieStore.set("nova_spotify_refresh", data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      });
    }

    return NextResponse.redirect(new URL("/plugins?spotify=connected", req.url));
  } catch (err) {
    return NextResponse.redirect(new URL("/plugins?error=spotify_server_error", req.url));
  }
}
