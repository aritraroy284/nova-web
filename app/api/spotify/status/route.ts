import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase as defaultClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nova_spotify_token")?.value;
  if (token) {
    return NextResponse.json({ connected: true });
  }

  const email = req.nextUrl.searchParams.get("email") || "royaritra284@gmail.com";
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

  return NextResponse.json({ connected: false });
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("nova_spotify_token");
  return NextResponse.json({ success: true });
}
