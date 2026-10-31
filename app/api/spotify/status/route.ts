import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase as defaultClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nova_spotify_token")?.value;
  if (token) {
    return NextResponse.json({ connected: true });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (email) {
    try {
      const { data } = await defaultClient
        .from("user_memory")
        .select("profile")
        .eq("email", email)
        .maybeSingle();

      if (data?.profile?.spotify_connected) {
        return NextResponse.json({ connected: true });
      }
    } catch (e) {}
  }

  return NextResponse.json({ connected: false });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("nova_spotify_token");
  cookieStore.delete("nova_spotify_refresh");

  const body = await req.json().catch(() => ({}));
  const email = body.email?.trim().toLowerCase();

  if (email) {
    try {
      const { data: existing } = await defaultClient
        .from("user_memory")
        .select("id, user_id, profile")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
          ? { ...existing.profile }
          : {};

        currentProfile.spotify_connected = false;
        delete currentProfile.spotify_access_token;
        delete currentProfile.spotify_refresh_token;

        const filterCol = existing.user_id ? "user_id" : "id";
        const filterVal = existing.user_id || existing.id;

        await defaultClient
          .from("user_memory")
          .update({ profile: currentProfile })
          .eq(filterCol, filterVal);
      }
    } catch (err) {}
  }

  return NextResponse.json({ success: true });
}
