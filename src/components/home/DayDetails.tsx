import { WorkoutData, MealData } from "@/app/home/page";

interface DayDetailsProps {
  selectedDate: Date;
  onClose: () => void;
  getWorkoutsByDay: (date: Date) => WorkoutData[];
  getMealsByDay: (date: Date) => MealData[];
}

export default function DayDetails({
  selectedDate,
  onClose,
  getWorkoutsByDay,
  getMealsByDay,
}: DayDetailsProps) {
  const workouts = getWorkoutsByDay(selectedDate);
  const meals = getMealsByDay(selectedDate);

  return (
    <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {selectedDate.toDateString() === new Date().toDateString()
              ? "오늘의 루틴 & 식단"
              : `${selectedDate.toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })} 상세 정보`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 운동 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">운동</h4>
            <div className="space-y-3">
              {workouts.length > 0 ? (
                workouts.map((workout, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <h5 className="font-semibold text-blue-800">
                      {workout.exercise}
                    </h5>
                    <p className="text-sm text-blue-600">
                      {workout.category} • {workout.sets}세트 × {workout.reps}회
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {workout.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  예정된 운동이 없습니다
                </p>
              )}
            </div>
          </div>

          {/* 식단 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">식단</h4>
            <div className="space-y-3">
              {meals.length > 0 ? (
                meals.map((meal, index) => (
                  <div
                    key={index}
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <h5 className="font-semibold text-green-800 mb-2">
                      {meal.meal}
                    </h5>
                    <p className="text-sm text-green-600 mb-2">
                      {meal.time} • {meal.portion_size}g • {meal.nutrients.calories}kcal
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      {meal.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-100 px-2 py-1 rounded">
                        <span className="text-blue-700 font-medium">단백질</span>
                        <span className="text-gray-700 ml-1">
                          {meal.nutrients.protein}g
                        </span>
                      </div>
                      <div className="bg-orange-100 px-2 py-1 rounded">
                        <span className="text-orange-700 font-medium">탄수화물</span>
                        <span className="text-gray-700 ml-1">
                          {meal.nutrients.carbs}g
                        </span>
                      </div>
                      <div className="bg-purple-100 px-2 py-1 rounded">
                        <span className="text-purple-700 font-medium">지방</span>
                        <span className="text-gray-700 ml-1">
                          {meal.nutrients.fat}g
                        </span>
                      </div>
                      <div className="bg-green-100 px-2 py-1 rounded">
                        <span className="text-green-700 font-medium">칼로리</span>
                        <span className="text-gray-700 ml-1">
                          {meal.nutrients.calories}kcal
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  예정된 식단이 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}