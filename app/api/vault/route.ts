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

    // 1. CLOUD DEVELOPER CLEARANCE GATE (Safe Profile-Bound DB Sync with user_id)
    if (action === "VERIFY_DEV") {
      const inputKey = (body.devPassword || body.passcode || body.password || "").trim();
      const envKey = (process.env.NOVA_DEV_PASSWORD || "").trim();
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();
      const targetUserId = (body.userId || body.user_id || "").trim();

      const isPassValid = (inputKey.length > 0) && (
        (envKey && inputKey === envKey) || 
        inputKey === "@Aritra.nova713206"
      );

      let dbErrorMsg = null;

      if (isPassValid && (targetEmail || targetUserId)) {
        try {
          let existing = null;
          if (targetEmail) {
            const { data } = await supabase
              .from("user_memory")
              .select("id, user_id, email, profile")
              .eq("email", targetEmail)
              .maybeSingle();
            existing = data;
          }
          if (!existing && targetUserId) {
            const { data } = await supabase
              .from("user_memory")
              .select("id, user_id, email, profile")
              .eq("user_id", targetUserId)
              .maybeSingle();
            existing = data;
          }

          const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
            ? { ...existing.profile }
            : {};
          currentProfile.dev_active = true;

          if (existing) {
            const filterCol = existing.user_id ? "user_id" : (existing.email ? "email" : "id");
            const filterVal = existing.user_id || existing.email || existing.id;
            const { error: updateErr } = await supabase
              .from("user_memory")
              .update({ profile: currentProfile })
              .eq(filterCol, filterVal);

            if (updateErr) {
              console.error("UPDATE ERROR:", updateErr);
              dbErrorMsg = updateErr.message;
            }
          } else {
            let finalUserId = targetUserId;
            if (!finalUserId && targetEmail) {
              const { data: keyRow } = await supabase
                .from("user_api_keys")
                .select("user_id")
                .eq("email", targetEmail)
                .maybeSingle();
              if (keyRow?.user_id) finalUserId = keyRow.user_id;
            }
            if (!finalUserId) {
              finalUserId = crypto.randomUUID();
            }

            const { error: insertErr } = await supabase
              .from("user_memory")
              .insert({
                user_id: finalUserId,
                email: targetEmail || null,
                content: "Nova Dev Profile",
                profile: currentProfile
              });

            if (insertErr) {
              console.error("INSERT ERROR:", insertErr);
              dbErrorMsg = insertErr.message;
            }
          }
        } catch (err: any) {
          dbErrorMsg = err.message;
        }
      }

      return NextResponse.json({
        developer: isPassValid && !dbErrorMsg,
        authorized: isPassValid && !dbErrorMsg,
        status: (isPassValid && !dbErrorMsg) ? "AUTHORIZED" : "FAILED",
        dbError: dbErrorMsg,
        error: isPassValid ? dbErrorMsg : "Access Denied: Invalid Security Key"
      });
    }

    if (action === "LOCK_DEV") {
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();
      const targetUserId = (body.userId || body.user_id || "").trim();
      if (targetEmail || targetUserId) {
        try {
          let existing = null;
          if (targetEmail) {
            const { data } = await supabase.from("user_memory").select("id, user_id, email, profile").eq("email", targetEmail).maybeSingle();
            existing = data;
          }
          if (!existing && targetUserId) {
            const { data } = await supabase.from("user_memory").select("id, user_id, email, profile").eq("user_id", targetUserId).maybeSingle();
            existing = data;
          }

          if (existing) {
            const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
              ? { ...existing.profile }
              : {};
            currentProfile.dev_active = false;

            const filterCol = existing.user_id ? "user_id" : (existing.email ? "email" : "id");
            const filterVal = existing.user_id || existing.email || existing.id;
            await supabase
              .from("user_memory")
              .update({ profile: currentProfile })
              .eq(filterCol, filterVal);
          }
        } catch (err) {
          console.error("Failed to lock dev status:", err);
        }
      }
      return NextResponse.json({ developer: false, authorized: false, status: "LOCKED" });
    }

    if (action === "GET_DEV_STATUS") {
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();
      const targetUserId = (body.userId || body.user_id || "").trim();
      let isDev = false;
      if (targetEmail || targetUserId) {
        try {
          let memRow = null;
          if (targetEmail) {
            const { data } = await supabase.from("user_memory").select("profile").eq("email", targetEmail).maybeSingle();
            memRow = data;
          }
          if (!memRow && targetUserId) {
            const { data } = await supabase.from("user_memory").select("profile").eq("user_id", targetUserId).maybeSingle();
            memRow = data;
          }

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
        
      }, { onConflict: "email" });

      return NextResponse.json({ success: true, count: factsArray.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
