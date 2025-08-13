"use client";

interface MealSelectorProps {
  mealTimes: string[];
  selectedMeal: string;
  onMealSelect: (meal: string) => void;
}

export default function MealSelector({ mealTimes, selectedMeal, onMealSelect }: MealSelectorProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">식사 선택</h3>
      <div className="flex flex-wrap gap-3">
        {mealTimes.map((mealTime) => (
          <button
            key={mealTime}
            onClick={() => onMealSelect(mealTime)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              selectedMeal === mealTime
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {mealTime}
          </button>
        ))}
      </div>
    </div>
  );
}