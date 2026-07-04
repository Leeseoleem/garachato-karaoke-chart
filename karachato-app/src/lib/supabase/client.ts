import { createClient } from "@supabase/supabase-js";

// 웹뷰/웹 공용 브라우저 클라이언트 (publishable 키 + RLS).
// SECRET 키는 절대 여기(클라 번들)에 넣지 않는다.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  throw new Error(
    "Missing env: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY",
  );
}

export const supabase = createClient(url, key);
