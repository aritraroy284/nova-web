import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || "b386bf23d06545f0a46968ef77da91c8";
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "https://nova-copilot-ai.vercel.app/api/auth/spotify/callback";

  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming"
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId.trim(),
    scope: scopes,
    redirect_uri: redirectUri.trim(),
    show_dialog: "true"
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
