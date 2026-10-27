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

    // 1. CLOUD DEVELOPER CLEARANCE GATE (Safe Profile-Bound DB Sync)
    if (action === "VERIFY_DEV") {
      const inputKey = (body.devPassword || body.passcode || body.password || "").trim();
      const envKey = (process.env.NOVA_DEV_PASSWORD || "").trim();
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();

      // Strictly checks against your environment key or newly set master password
      const isPassValid = (inputKey.length > 0) && (
        (envKey && inputKey === envKey) || 
        inputKey === ""
      );

      if (isPassValid && targetEmail) {
        try {
          const { data: existing } = await supabase
            .from("user_memory")
            .select("id, profile")
            .eq("email", targetEmail)
            .maybeSingle();

          const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
            ? { ...existing.profile }
            : {};
          currentProfile.dev_active = true;

          if (existing?.id) {
            await supabase
              .from("user_memory")
              .update({ profile: currentProfile, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          } else {
            await supabase
              .from("user_memory")
              .insert({ email: targetEmail, profile: currentProfile, updated_at: new Date().toISOString() });
          }
        } catch (err) {
          console.error("Failed to save dev status:", err);
        }
      }

      return NextResponse.json({
        developer: isPassValid,
        authorized: isPassValid,
        status: isPassValid ? "AUTHORIZED" : "UNAUTHORIZED",
        error: isPassValid ? null : "Access Denied: Invalid Security Key"
      });
    }

    if (action === "LOCK_DEV") {
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();
      if (targetEmail) {
        try {
          const { data: existing } = await supabase
            .from("user_memory")
            .select("id, profile")
            .eq("email", targetEmail)
            .maybeSingle();

          if (existing?.id) {
            const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
              ? { ...existing.profile }
              : {};
            currentProfile.dev_active = false;

            await supabase
              .from("user_memory")
              .update({ profile: currentProfile, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          }
        } catch (err) {
          console.error("Failed to lock dev status:", err);
        }
      }
      return NextResponse.json({ developer: false, authorized: false, status: "LOCKED" });
    }

    if (action === "GET_DEV_STATUS") {
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();
      let isDev = false;
      if (targetEmail) {
        try {
          const { data: memRow } = await supabase
            .from("user_memory")
            .select("profile")
            .eq("email", targetEmail)
            .maybeSingle();

          if (memRow?.profile && typeof memRow.profile === "object" && memRow.profile.dev_active === true) {
            isDev = true;
          }
        } catch (err) {
          console.error("GET_DEV_STATUS error:", err);
        }
      }
      return NextResponse.json({ developer: isDev, authorized: isDev });
    }

    if (action === "SYNC_KEYS" || action === "GET_KEYS") {
      if (!cleanEmail) return NextResponse.json({ configured: false, gemini_key: "", groq_key: "", openrouter_key: "", dev_active: false });

      const { data: keyData } = await supabase
        .from("user_api_keys")
        .select("gemini_key, groq_key, openrouter_key")
        .eq("email", cleanEmail)
        .maybeSingle();

      let isDev = false;
      try {
        const { data: memRow } = await supabase
          .from("user_memory")
          .select("profile")
          .eq("email", cleanEmail)
          .maybeSingle();
        if (memRow?.profile && typeof memRow.profile === "object" && memRow.profile.dev_active === true) {
          isDev = true;
        }
      } catch (err) {}

      return NextResponse.json({
        configured: Boolean(keyData?.gemini_key),
        gemini_key: keyData?.gemini_key || "",
        groq_key: keyData?.groq_key || "",
        openrouter_key: keyData?.openrouter_key || "",
        dev_active: isDev
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
