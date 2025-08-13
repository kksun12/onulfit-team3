"use client";

interface NutrientSummaryProps {
  dayName: string;
  selectedMeal: string;
  totalNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function NutrientSummary({ dayName, selectedMeal, totalNutrients }: NutrientSummaryProps) {
  return (
    <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {dayName}요일 {selectedMeal} 영양소 요약
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="text-lg font-bold text-blue-600">
            {totalNutrients.calories.toFixed(0)} kcal
          </div>
          <div className="text-sm text-gray-600">칼로리</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="text-lg font-bold text-green-600">
            {totalNutrients.protein.toFixed(1)}g
          </div>
          <div className="text-sm text-gray-600">단백질</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-xl">
          <div className="text-lg font-bold text-yellow-600">
            {totalNutrients.carbs.toFixed(1)}g
          </div>
          <div className="text-sm text-gray-600">탄수화물</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <div className="text-lg font-bold text-red-600">
            {totalNutrients.fat.toFixed(1)}g
          </div>
          <div className="text-sm text-gray-600">지방</div>
        </div>
      </div>
    </div>
  );
}