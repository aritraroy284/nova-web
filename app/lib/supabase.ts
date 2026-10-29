import { createClient as _createClient } from "@supabase/supabase-js";

function getValidUrl(url: string | undefined): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return "https://placeholder-url.supabase.co";
  }
  const trimmed = url.trim();
  try {
    const withProto = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProto);
    return parsed.origin;
  } catch {
    return "https://placeholder-url.supabase.co";
  }
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = getValidUrl(rawUrl);
const supabaseAnonKey = (rawKey && rawKey.trim() !== "") ? rawKey.trim() : "placeholder-anon-key";

export const supabase = _createClient(supabaseUrl, supabaseAnonKey);
export const createClient = () => supabase;
export default supabase;
