import { NextRequest, NextResponse } from "next/server";
import { supabase as defaultClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "royaritra284@gmail.com";
  try {
    const { data } = await defaultClient
      .from("user_memory")
      .select("profile")
      .eq("email", email.trim().toLowerCase())
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
  const email = body.email || "royaritra284@gmail.com";

  await defaultClient
    .from("user_memory")
    .update({ 
      profile: { spotify_connected: false } 
    })
    .eq("email", email.trim().toLowerCase());

  return NextResponse.json({ success: true });
}
