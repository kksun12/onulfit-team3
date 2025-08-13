"use client";

import { SolutionMealWithMeal } from "@/types/database";

interface MealCardProps {
  mealItem: SolutionMealWithMeal;
}

export default function MealCard({ mealItem }: MealCardProps) {
  const getNutrientValue = (nutrient: string): number => {
    return mealItem.meal?.nutrients?.[nutrient] || 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {mealItem.meal?.name || "식단 정보 없음"}
            </h3>
            <p className="text-gray-600 mb-4">
              {mealItem.meal?.description || "설명이 없습니다."}
            </p>
            {mealItem.portion_size && (
              <p className="text-sm text-blue-600 font-medium">
                권장량: {mealItem.portion_size}인분
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {getNutrientValue("칼로리").toFixed(0)} kcal
            </div>
            <div className="text-sm text-gray-500">칼로리</div>
          </div>
        </div>

        {/* 영양소 정보 */}
        {mealItem.meal?.nutrients && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-lg font-bold text-blue-600">
                {getNutrientValue("단백질").toFixed(1)}g
              </div>
              <div className="text-sm text-gray-600">단백질</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-lg font-bold text-green-600">
                {getNutrientValue("탄수화물").toFixed(1)}g
              </div>
              <div className="text-sm text-gray-600">탄수화물</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <div className="text-lg font-bold text-yellow-600">
                {getNutrientValue("지방").toFixed(1)}g
              </div>
              <div className="text-sm text-gray-600">지방</div>
            </div>
          </div>
        )}

        {/* 추가 정보 */}
        {mealItem.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">메모</h4>
            <p className="text-gray-600 text-sm">{mealItem.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}