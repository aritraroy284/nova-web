import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const SUPABASE_PROJECT_URL = "https://zhrwfhtiknrboqfmvzqs.supabase.co";
const AUTHORIZED_CREATOR_EMAIL = "royaritra284@gmail.com";

function getAdminSupabase() {
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim().replace(/^["']|["']$/g, '');
  if (serviceKey && serviceKey.length > 20) {
    try {
      return createClient(SUPABASE_PROJECT_URL, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (e) {
      console.error("Service key client init failed:", e);
    }
  }
  return defaultClient;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email, devPassword, plugin, connected } = body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const supabase = getAdminSupabase();

    // 1. DUAL-LOCK DEVELOPER CLEARANCE GATE
    if (action === "VERIFY_DEV") {
      const activeDevPassword = process.env.NOVA_DEV_PASSWORD || "nova@creator2026";
      if (cleanEmail !== AUTHORIZED_CREATOR_EMAIL) {
        return NextResponse.json({
          status: "FORBIDDEN",
          developer: false,
          error: "Unauthorized Account: Developer access restricted to creator."
        }, { status: 403 });
      }

      if (!devPassword || devPassword.trim() !== activeDevPassword) {
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

    // 2. STRICT ACCOUNT-SPECIFIC KEY SYNC
    if (action === "SYNC_KEYS" || action === "GET_KEYS") {
      if (!cleanEmail) {
        return NextResponse.json({
          configured: false,
          gemini_key: "",
          groq_key: "",
          openrouter_key: ""
        });
      }

      const { data, error } = await supabase
        .from("user_api_keys")
        .select("gemini_key, groq_key, openrouter_key")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({
          configured: false,
          gemini_key: "",
          groq_key: "",
          openrouter_key: ""
        });
      }

      return NextResponse.json({
        configured: Boolean(data.gemini_key),
        gemini_key: data.gemini_key || "",
        groq_key: data.groq_key || "",
        openrouter_key: data.openrouter_key || ""
      });
    }

    // 3. CLOUD-SCOPED PLUGIN STATE MANAGEMENT
    if (action === "GET_PLUGINS") {
      if (!cleanEmail) return NextResponse.json({ gmail_connected: false });

      const { data } = await supabase
        .from("user_plugins")
        .select("gmail_connected")
        .eq("email", cleanEmail)
        .maybeSingle();

      return NextResponse.json({ gmail_connected: data?.gmail_connected || false });
    }

    if (action === "SET_PLUGIN") {
      if (!cleanEmail) return NextResponse.json({ error: "Missing email" }, { status: 400 });

      const updates: any = {
        email: cleanEmail,
        updated_at: new Date().toISOString()
      };
      if (plugin === "gmail") updates.gmail_connected = Boolean(connected);

      await supabase.from("user_plugins").upsert(updates, { onConflict: "email" });
      return NextResponse.json({ success: true, email: cleanEmail, connected });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
