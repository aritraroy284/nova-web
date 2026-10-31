import { NextRequest, NextResponse } from "next/server";
import { supabase as defaultClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_PROJECT_URL = "https://zhrwfhtiknrboqfmvzqs.supabase.co";

function getAdminSupabase() {
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (serviceKey && serviceKey.length > 20) {
    try {
      return createClient(SUPABASE_PROJECT_URL, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {}
  }
  return defaultClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email?.trim().toLowerCase();
    const query = body.query?.trim();

    if (!email || !query) {
      return NextResponse.json({ error: "Missing email or query" }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: userMem } = await supabase
      .from("user_memory")
      .select("profile")
      .eq("email", email)
      .maybeSingle();

    const profile = userMem?.profile;
    if (!profile || !profile.spotify_connected) {
      return NextResponse.json({ error: "SPOTIFY_NOT_CONNECTED" }, { status: 403 });
    }

    let accessToken = profile.spotify_access_token;
    const refreshToken = profile.spotify_refresh_token;

    // 1. Search Track on Spotify Web API
    let searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Token expire hone par auto-refresh
    if (searchRes.status === 401 && refreshToken) {
      const clientId = (process.env.SPOTIFY_CLIENT_ID || "b386bf23d06545f0a46968ef77da91c8").trim();
      const clientSecret = (process.env.SPOTIFY_CLIENT_SECRET || "").trim();
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const refreshRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken
        })
      });

      const refreshData = await refreshRes.json();
      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        profile.spotify_access_token = accessToken;
        await supabase
          .from("user_memory")
          .update({ profile })
          .eq("email", email);

        searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    }

    const searchData = await searchRes.json();
    const track = searchData?.tracks?.items?.[0];

    if (!track) {
      return NextResponse.json({ error: "NO_TRACK_FOUND" }, { status: 404 });
    }

    const trackUri = track.uri;
    const trackName = track.name + " by " + (track.artists?.[0]?.name || "");

    // 2. Try zero-touch Web API Playback (Premium / Active Device)
    const playRes = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uris: [trackUri] })
    });

    if (playRes.status === 204 || playRes.status === 200) {
      return NextResponse.json({
        success: true,
        mode: "HEADLESS_WEB_API",
        track: trackName,
        uri: trackUri
      });
    }

    // 3. Fallback: Free accounts ke liye direct track URI bhejo
    return NextResponse.json({
      success: true,
      mode: "DIRECT_TRACK_URI",
      track: trackName,
      uri: trackUri
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
