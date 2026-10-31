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
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();

      const isPassValid = (inputKey.length > 0) && (
        (envKey && inputKey === envKey) || 
        inputKey === "@Aritra.nova713206"
      );

      let dbSynced = false;

      if (isPassValid && targetEmail && !targetEmail.includes("guest")) {
        try {
          // Check if memory record already exists for this email
          const { data: existing } = await supabase
            .from("user_memory")
            .select("id, user_id, email, profile")
            .eq("email", targetEmail)
            .maybeSingle();

          const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
            ? { ...existing.profile }
            : {};
          currentProfile.dev_active = true;

          if (existing) {
            const filterCol = existing.user_id ? "user_id" : (existing.email ? "email" : "id");
            const filterVal = existing.user_id || existing.email || existing.id;
            await supabase
              .from("user_memory")
              .update({ profile: currentProfile })
              .eq(filterCol, filterVal);
            dbSynced = true;
          } else {
            // Fetch real auth user_id to satisfy foreign key constraint
            let validUserId = null;
            try {
              const { data: authData } = await supabase.auth.admin.listUsers();
              const matched = authData?.users?.find((u: any) => u.email?.toLowerCase() === targetEmail);
              if (matched?.id) validUserId = matched.id;
            } catch (ignored) {}

            if (validUserId) {
              await supabase
                .from("user_memory")
                .insert({
                  user_id: validUserId,
                  email: targetEmail,
                  content: "Nova Dev Profile",
                  profile: currentProfile
                });
              dbSynced = true;
            }
          }
        } catch (dbErr) {
          console.error("Non-blocking DB warning:", dbErr);
        }
      }

      // Valid security key unlocks access immediately without foreign-key blockage
      return NextResponse.json({
        developer: isPassValid,
        authorized: isPassValid,
        status: isPassValid ? "AUTHORIZED" : "FAILED",
        dbSynced,
        error: isPassValid ? null : "Access Denied: Invalid Security Key"
      });
    }

    if (action === "LOCK_DEV") {
      const targetEmail = cleanEmail || (body.email || "").trim().toLowerCase();
      if (targetEmail && !targetEmail.includes("guest")) {
        try {
          const { data: existing } = await supabase
            .from("user_memory")
            .select("id, user_id, email, profile")
            .eq("email", targetEmail)
            .maybeSingle();

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
      let isDev = false;
      if (targetEmail && !targetEmail.includes("guest")) {
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

    if (action === "GET_PLUGINS") {
      if (!cleanEmail) return NextResponse.json({ gmail_connected: false });

      const { data } = await supabase
        .from("user_memory")
        .select("profile")
        .eq("email", cleanEmail)
        .maybeSingle();

      const isConnected = Boolean(data?.profile?.gmail_connected);
      const isSpotify = Boolean(data?.profile?.spotify_connected);
      return NextResponse.json({
        gmail_connected: isConnected,
        gmail_access_token: data?.profile?.gmail_access_token || "",
        gmail_refresh_token: data?.profile?.gmail_refresh_token || "",
        spotify_connected: isSpotify,
        email: cleanEmail,
        success: true
      });
    }

        if (action === "SET_PLUGIN") {
      const { plugin, connected } = body;
      if (!cleanEmail) return NextResponse.json({ error: "Missing email" }, { status: 400 });

      const { data: existing } = await supabase
        .from("user_memory")
        .select("id, user_id, email, profile")
        .eq("email", cleanEmail)
        .maybeSingle();

      const currentProfile = (existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile))
        ? { ...existing.profile }
        : {};

      if (plugin === "gmail") {
        currentProfile.gmail_connected = Boolean(connected);
        if (connected) {
          if (body.access_token) currentProfile.gmail_access_token = body.access_token;
          if (body.refresh_token) currentProfile.gmail_refresh_token = body.refresh_token;
        } else {
          delete currentProfile.gmail_access_token;
          delete currentProfile.gmail_refresh_token;
        }
      }
      if (plugin === "spotify") {
        currentProfile.spotify_connected = Boolean(connected);
        if (!connected) {
          delete currentProfile.spotify_refresh_token;
          delete currentProfile.spotify_access_token;
        }
      }

      if (existing) {
        const filterCol = existing.user_id ? "user_id" : (existing.email ? "email" : "id");
        const filterVal = existing.user_id || existing.email || existing.id;
        await supabase
          .from("user_memory")
          .update({ profile: currentProfile })
          .eq(filterCol, filterVal);
      }

      return NextResponse.json({
        success: true,
        gmail_connected: Boolean(currentProfile.gmail_connected)
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
