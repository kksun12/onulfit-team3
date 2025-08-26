import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 환경에 따른 redirect URL 설정
export const getRedirectUrl = () => {
  // Vercel 환경에서는 환경 변수 사용
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 개발 환경에서는 localhost 사용
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // 프로덕션 환경에서는 현재 도메인 사용 (fallback)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
};

// OAuth callback URL 생성
export const getOAuthCallbackUrl = () => {
  const baseUrl = getRedirectUrl();
  return `${baseUrl}/auth/callback`;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "onulfit-auth-token",
  },
});
