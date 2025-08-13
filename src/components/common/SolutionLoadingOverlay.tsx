"use client";

import { Activity } from "lucide-react";

interface SolutionLoadingOverlayProps {
  isVisible: boolean;
}

export default function SolutionLoadingOverlay({ isVisible }: SolutionLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Activity className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">솔루션 생성 중</h3>
          <p className="text-gray-600">맞춤형 건강 솔루션을 준비하고 있습니다</p>
        </div>
        
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{animation: 'loading-bar 2s ease-in-out infinite'}}></div>
            </div>
          </div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-sm text-gray-500">잠시만 기다려주세요...</p>
        </div>
      </div>
    </div>
    </>
  );
}