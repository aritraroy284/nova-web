import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nova_spotify_token")?.value;
  return NextResponse.json({ connected: !!token });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("nova_spotify_token");
  cookieStore.delete("nova_spotify_refresh");
  return NextResponse.json({ success: true });
}
