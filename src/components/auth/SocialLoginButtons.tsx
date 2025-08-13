"use client";

import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";

interface SocialLoginButtonsProps {
  onOAuthLogin: (provider: "google" | "discord") => Promise<void>;
  isLoading: boolean;
}

export default function SocialLoginButtons({ onOAuthLogin, isLoading }: SocialLoginButtonsProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <button
        type="button"
        onClick={() => onOAuthLogin("google")}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-[#dadce0] bg-white text-gray-700 font-medium hover:bg-gray-50 transition active:scale-[0.98]"
        disabled={isLoading}
      >
        <FcGoogle className="w-5 h-5" />
        Google로 로그인
      </button>

      <button
        type="button"
        onClick={() => onOAuthLogin("discord")}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-[#5865F2] bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition active:scale-[0.98]"
        disabled={isLoading}
      >
        <FaDiscord className="w-5 h-5" />
        Discord로 로그인
      </button>
    </div>
  );
}