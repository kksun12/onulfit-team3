"use client";

import { Activity } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center">
      <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Activity className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-lg text-gray-600 leading-relaxed">{subtitle}</p>
    </div>
  );
}