import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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
    return NextResponse.redirect(new URL("/plugins?error=" + (error || "access_denied"), req.url));
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
      const errMsg = encodeURIComponent(data.error_description || data.error || "token_failed");
      return NextResponse.redirect(new URL(`/plugins?error=${errMsg}`, req.url));
    }

    // 1. Browser cookie set karo
    const cookieStore = await cookies();
    cookieStore.set("nova_spotify_token", data.access_token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/"
    });

    // 2. Supabase Cloud Vault Sync
    const supabase = getAdminSupabase();
    
    // Agar state me email missing tha to auth user list se recent dev/user try karo
    if (!targetEmail) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers?.users?.length) {
          targetEmail = (authUsers.users[0].email || "").toLowerCase();
        }
      } catch (ignored) {}
    }

    if (targetEmail) {
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
  } catch (err: any) {
    return NextResponse.redirect(new URL("/plugins?error=" + encodeURIComponent(err.message || "server_error"), req.url));
  }
}
