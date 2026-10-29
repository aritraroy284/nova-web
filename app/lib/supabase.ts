import { createClient as _createClient } from "@supabase/supabase-js";

const FALLBACK_PROJECT_URL = "https://zhrwfhtiknrboqfmvzqs.supabase.co";

function sanitizeSupabaseUrl(url?: string): string {
  if (!url || typeof url !== "string") return FALLBACK_PROJECT_URL;
  let clean = url.trim().replace(/^["']|["']$/g, "");
  if (!clean || clean === "undefined" || clean === "null" || clean.includes("placeholder")) {
    return FALLBACK_PROJECT_URL;
  }
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  try {
    const parsed = new URL(clean);
    return parsed.origin;
  } catch {
    return FALLBACK_PROJECT_URL;
  }
}

function sanitizeSupabaseKey(key?: string): string {
  if (!key || typeof key !== "string") return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_build_safety";
  const clean = key.trim().replace(/^["']|["']$/g, "");
  return clean.length > 10 ? clean : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_build_safety";
}

const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabase = _createClient(supabaseUrl, supabaseAnonKey);
export const createClient = () => supabase;
export default supabase;
