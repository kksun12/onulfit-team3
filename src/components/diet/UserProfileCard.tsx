"use client";

import { Target, Heart, Zap } from "lucide-react";
import { UserProfile } from "@/types";

interface UserProfileCardProps {
  userProfile: UserProfile;
}

export default function UserProfileCard({ userProfile }: UserProfileCardProps) {
  const getGoalColor = (goal: string) => {
    switch (goal) {
      case "체중감량":
        return "text-red-600 bg-red-50";
      case "근육증가":
        return "text-blue-600 bg-blue-50";
      case "건강유지":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">개인화된 식단 추천</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getGoalColor(
            userProfile.diet_type
          )}`}
        >
          {userProfile.diet_type || "건강유지"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <Target className="h-5 w-5 text-blue-600" />
          <span className="text-gray-600">
            목표: {userProfile.diet_type || "건강유지"}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Heart className="h-5 w-5 text-red-600" />
          <span className="text-gray-600">
            키: {userProfile.height_cm || "N/A"}cm
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Zap className="h-5 w-5 text-yellow-600" />
          <span className="text-gray-600">
            체중: {userProfile.weight_kg || "N/A"}kg
          </span>
        </div>
      </div>
    </div>
  );
}