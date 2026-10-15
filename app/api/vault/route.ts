import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email } = body;
    const cleanEmail = (email || "").trim().toLowerCase();

    // 1. STRICT ACCOUNT-SPECIFIC KEY SYNC
    if (action === "SYNC_KEYS" || action === "GET_KEYS") {
      if (!cleanEmail) {
        return NextResponse.json({
          error: "Missing account email",
          gemini_key: "",
          groq_key: "",
          openrouter_key: ""
        }, { status: 400 });
      }

      // Sirf usi specific user ke email ka locker check karo
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
