import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http"))
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://zhrwfhtiknrboqfmvzqs.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const supabase = getSupabase();

    // UNIVERSAL MASTER KEY SYNC (Serves active keys to any Nova App user)
    if (action === "SYNC_KEYS" || action === "GET_KEYS") {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("gemini_key, groq_key, openrouter_key")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return NextResponse.json({
        gemini_key: data?.gemini_key || "",
        groq_key: data?.groq_key || "",
        openrouter_key: data?.openrouter_key || ""
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
