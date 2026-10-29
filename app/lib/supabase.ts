import { createClient as _createClient } from "@supabase/supabase-js";

const REAL_PROJECT_URL = "https://zhrwfhtiknrboqfmvzqs.supabase.co";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== "")
  ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
  : REAL_PROJECT_URL;

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== "")
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

export const supabase = _createClient(supabaseUrl, supabaseAnonKey);
export const createClient = () => supabase;
export default supabase;
