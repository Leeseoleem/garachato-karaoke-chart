import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY",
  );
}

export const createServerClient = () =>
  createClient(supabaseUrl, supabaseSecretKey);
