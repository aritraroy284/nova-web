import { NextRequest, NextResponse } from "next/server";
import { supabase as defaultClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  
  // Agar koi email nahi aya (e.g. guest ya not logged in), to seedha false return karo
  if (!email) {
    return NextResponse.json({ connected: false });
  }

  try {
    const { data } = await defaultClient
      .from("user_memory")
      .select("profile")
      .eq("email", email)
      .maybeSingle();

    const isConnected = Boolean(data?.profile?.spotify_connected);
    return NextResponse.json({ connected: isConnected });
  } catch (e) {
    return NextResponse.json({ connected: false });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("nova_spotify_token");
  
  const body = await req.json().catch(() => ({}));
  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required to disconnect plugin" }, { status: 400 });
  }

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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
