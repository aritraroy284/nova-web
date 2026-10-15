import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http"))
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://zhrwfhtiknrboqfmvzqs.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";
  return createClient(url, key);
}

const AUTHORIZED_CREATOR_EMAIL = "royaritra284@gmail.com";

export async function POST(req: Request) {
  try {
    const { action, email, devPassword, userId } = await req.json();
    const activeDevPassword = process.env.NOVA_DEV_PASSWORD || "nova@creator2026";
    const supabase = getSupabase();

    // 1. DUAL-LOCK DEVELOPER CLEARANCE GATE
    if (action === "VERIFY_DEV") {
      const cleanEmail = (email || "").trim().toLowerCase();
      
      // Layer 1: Account Lock
      if (cleanEmail !== AUTHORIZED_CREATOR_EMAIL) {
        return NextResponse.json({
          status: "FORBIDDEN",
          developer: false,
          error: "Unauthorized Account: Developer access is restricted to the master creator email."
        }, { status: 403 });
      }

      // Layer 2: Master Security Key Lock
      const isDevPass = devPassword && devPassword.trim() === activeDevPassword;
      if (!isDevPass) {
        return NextResponse.json({
          status: "UNAUTHORIZED",
          developer: false,
          error: "Access Denied: Invalid Security Key."
        }, { status: 401 });
      }

      return NextResponse.json({
        status: "AUTHORIZED",
        developer: true,
        role: "CREATOR",
        message: "Developer protocol engaged successfully."
      });
    }

    // 2. DYNAMIC KEY SYNC FOR ANDROID APP
    if (action === "SYNC_KEYS") {
      let query = supabase.from("user_api_keys").select("gemini_key, groq_key, openrouter_key");
      if (userId) query = query.eq("user_id", userId);

      const { data } = await query.maybeSingle();

      return NextResponse.json({
        gemini_key: data?.gemini_key || "",
        groq_key: data?.groq_key || "",
        openrouter_key: data?.openrouter_key || ""
      });
    }

    
    // 3. CLOUD-SCOPED PLUGIN STATE MANAGEMENT (PER EMAIL)
    if (action === "GET_PLUGINS") {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail) return NextResponse.json({ gmail_connected: false });

      const { data } = await supabase
        .from("user_plugins")
        .select("gmail_connected")
        .eq("email", cleanEmail)
        .maybeSingle();

      return NextResponse.json({ gmail_connected: data?.gmail_connected || false });
    }

    if (action === "SET_PLUGIN") {
      const cleanEmail = (email || "").trim().toLowerCase();
      const { plugin, connected } = await req.json().catch(() => ({}));
      if (!cleanEmail) return NextResponse.json({ error: "Missing email" }, { status: 400 });

      const updates: any = {
        email: cleanEmail,
        updated_at: new Date().toISOString()
      };
      if (plugin === "gmail") updates.gmail_connected = connected;

      await supabase.from("user_plugins").upsert(updates);
      return NextResponse.json({ success: true, email: cleanEmail, connected });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
