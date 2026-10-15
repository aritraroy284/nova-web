import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // UNIVERSAL MASTER KEY SYNC (Reads using existing configured client)
    if (action === "SYNC_KEYS" || action === "GET_KEYS") {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("gemini_key, groq_key, openrouter_key")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message, gemini_key: "", groq_key: "", openrouter_key: "" }, { status: 200 });
      }

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
