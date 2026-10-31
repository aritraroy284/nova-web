import { NextRequest, NextResponse } from "next/server";
import { supabase as defaultClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_PROJECT_URL = "https://zhrwfhtiknrboqfmvzqs.supabase.co";

function getAdminSupabase() {
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim().replace(/^["']|["']$/g, '');
  if (serviceKey && serviceKey.length > 20) {
    try {
      return createClient(SUPABASE_PROJECT_URL, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {}
  }
  return defaultClient;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const stateRaw = req.nextUrl.searchParams.get("state");

  let targetEmail = "";
  if (stateRaw) {
    try {
      const parsed = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf8"));
      targetEmail = (parsed.email || "").trim().toLowerCase();
    } catch (e) {}
  }

  if (error || !code) {
    return NextResponse.redirect(new URL("/plugins?error=spotify_denied", req.url));
  }

  const clientId = (process.env.SPOTIFY_CLIENT_ID || "b386bf23d06545f0a46968ef77da91c8").trim();
  const clientSecret = (process.env.SPOTIFY_CLIENT_SECRET || "").trim();
  const redirectUri = (process.env.SPOTIFY_REDIRECT_URI || "https://nova-copilot-ai.vercel.app/api/auth/spotify/callback").trim();

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
      return NextResponse.redirect(new URL("/plugins?error=token_exchange_failed", req.url));
    }

    // Dynamic User Sync in Supabase
    if (targetEmail) {
      const supabase = getAdminSupabase();
      const { data: existing } = await supabase
        .from("user_memory")
        .select("id, user_id, email, profile")
        .eq("email", targetEmail)
        .maybeSingle();

      const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
        ? { ...existing.profile }
        : {};

      currentProfile.spotify_connected = true;
      if (data.refresh_token) currentProfile.spotify_refresh_token = data.refresh_token;
      currentProfile.spotify_access_token = data.access_token;
      currentProfile.spotify_token_expires = Date.now() + (data.expires_in || 3600) * 1000;

      if (existing) {
        const filterCol = existing.user_id ? "user_id" : (existing.email ? "email" : "id");
        const filterVal = existing.user_id || existing.email || existing.id;
        await supabase
          .from("user_memory")
          .update({ profile: currentProfile })
          .eq(filterCol, filterVal);
      }
    }

    return NextResponse.redirect(new URL("/plugins?spotify=connected", req.url));
  } catch (err) {
    return NextResponse.redirect(new URL("/plugins?error=server_error", req.url));
  }
}
