"use client";

import { useAuth } from "@/hooks";
import AuthHeader from "@/components/auth/AuthHeader";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { login, oAuthLogin, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
  };

  const handleOAuthLogin = async (provider: "google" | "discord") => {
    await oAuthLogin(provider);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        <AuthHeader 
          title="OnulFit" 
          subtitle="건강한 루틴으로 더 나은 하루를 시작하세요" 
        />

        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <SocialLoginButtons 
            onOAuthLogin={handleOAuthLogin} 
            isLoading={isLoading} 
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <LoginForm 
            onSubmit={handleLogin} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
}
