"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/?error=auth_failed");
          return;
        }

        if (session?.user) {
          console.log("✅ Auth successful, user:", session.user.email);
          // 홈 페이지로 리다이렉트
          router.push("/home");
        } else {
          console.log("❌ No session found");
          router.push("/?error=no_session");
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        router.push("/?error=unexpected");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 처리 중...</p>
      </div>
    </div>
  );
}
