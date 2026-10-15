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

const DEV_EMAIL = "royaritra284@gmail.com";
const DEV_PASSWORD = process.env.NOVA_DEV_PASSWORD || "nova@creator2026";

export async function POST(req: Request) {
  try {
    const { action, email, devPassword, userId } = await req.json();
    const supabase = getSupabase();

    // 1. DEVELOPER AUTHENTICATION GATE
    if (action === "VERIFY_DEV") {
      const isDevEmail = email && email.trim().toLowerCase() === DEV_EMAIL;
      const isDevPass = devPassword && devPassword.trim() === DEV_PASSWORD;

      if (isDevEmail && isDevPass) {
        return NextResponse.json({
          status: "AUTHORIZED",
          developer: true,
          message: "Developer protocol engaged."
        });
      } else {
        return NextResponse.json({
          status: "UNAUTHORIZED",
          developer: false,
          error: "Invalid developer credentials or password."
        }, { status: 401 });
      }
    }

    // 2. DYNAMIC KEY SYNC FOR ANDROID APP
    if (action === "SYNC_KEYS") {
      if (!userId && !email) {
        return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
      }

      let query = supabase.from("user_api_keys").select("gemini_key, groq_key, openrouter_key");
      if (userId) query = query.eq("user_id", userId);

      const { data, error } = await query.maybeSingle();

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
