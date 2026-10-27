import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const SUPABASE_PROJECT_URL = "https://zhrwfhtiknrboqfmvzqs.supabase.co";

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
    const { action, email, devPassword, fact, category, key, value } = body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const supabase = getAdminSupabase();

    // 1. CLOUD DEVELOPER CLEARANCE GATE
    if (action === "VERIFY_DEV") {
    const inputKey = (body.devPassword || body.passcode || body.password || "").trim();
    const envKey = (process.env.NOVA_DEV_PASSWORD || "").trim();
    
    // Master Key: Works on both Web and Mobile App
    const isPassValid = (inputKey.length > 0) && (
      inputKey === envKey || 
      inputKey === "nova@creator2026"
    );

    return NextResponse.json({
      developer: isPassValid,
      authorized: isPassValid,
      status: isPassValid ? "AUTHORIZED" : "UNAUTHORIZED",
      error: isPassValid ? null : "Access Denied: Invalid Security Key"
    });
  }

  if (action === "SYNC_KEYS" || action === "GET_KEYS") {
      if (!cleanEmail) return NextResponse.json({ configured: false, gemini_key: "", groq_key: "", openrouter_key: "" });

      const { data } = await supabase
        .from("user_api_keys")
        .select("gemini_key, groq_key, openrouter_key")
        .eq("email", cleanEmail)
        .maybeSingle();

      return NextResponse.json({
        configured: Boolean(data?.gemini_key),
        gemini_key: data?.gemini_key || "",
        groq_key: data?.groq_key || "",
        openrouter_key: data?.openrouter_key || ""
      });
    }

    // 3. ACCOUNT-SPECIFIC CLOUD MEMORY SYNC
    if (action === "SYNC_MEMORY") {
      if (!cleanEmail) return NextResponse.json({ memory: null });

      const { data } = await supabase
        .from("user_memory")
        .select("profile, preferences, facts")
        .eq("email", cleanEmail)
        .maybeSingle();

      return NextResponse.json({
        memory: data || { profile: {}, preferences: {}, facts: [] }
      });
    }

    if (action === "SAVE_FACT") {
      if (!cleanEmail || !fact) return NextResponse.json({ error: "Missing email or fact" }, { status: 400 });

      const { data } = await supabase
        .from("user_memory")
        .select("facts")
        .eq("email", cleanEmail)
        .maybeSingle();

      let factsArray: string[] = Array.isArray(data?.facts) ? data.facts : [];
      if (!factsArray.includes(fact.trim())) {
        factsArray.push(fact.trim());
      }

      await supabase.from("user_memory").upsert({
        email: cleanEmail,
        facts: factsArray,
        updated_at: new Date().toISOString()
      }, { onConflict: "email" });

      return NextResponse.json({ success: true, count: factsArray.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
