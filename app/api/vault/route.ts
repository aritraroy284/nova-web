import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^["']|["']$/g, '');
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.length > 5) {
      url = "https://" + url;
    } else {
      url = "https://zhrwfhtiknrboqfmvzqs.supabase.co";
    }
  }

  let key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, '');
  
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email } = body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const supabase = getAdminSupabase();

    // 1. STRICT ACCOUNT-SPECIFIC KEY SYNC
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
        configured: true,
        gemini_key: data.gemini_key || "",
        groq_key: data.groq_key || "",
        openrouter_key: data.openrouter_key || ""
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
