"use client";

import { Utensils } from "lucide-react";

interface EmptyMealStateProps {
  dayName: string;
  selectedMeal: string;
}

export default function EmptyMealState({ dayName, selectedMeal }: EmptyMealStateProps) {
  return (
    <div className="text-center py-12">
      <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">
        등록된 식단이 없습니다
      </h3>
      <p className="text-gray-500">
        {dayName}요일 {selectedMeal}에 대한 식단이 없습니다.
      </p>
    </div>
  );
}