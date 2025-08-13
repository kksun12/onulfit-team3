import { WorkoutData, MealData } from "@/app/home/page";
import { CheckCircle, Circle, Play, Pause } from "lucide-react";

interface DayDetailsProps {
  selectedDate: Date;
  onClose: () => void;
  getWorkoutsByDay: (date: Date) => WorkoutData[];
  getMealsByDay: (date: Date) => MealData[];
  completedWorkouts: string[];
  completedMeals: string[];
  onWorkoutComplete: (workout: WorkoutData) => void;
  onMealComplete: (meal: MealData) => void;
}

export default function DayDetails({
  selectedDate,
  onClose,
  getWorkoutsByDay,
  getMealsByDay,
  completedWorkouts,
  completedMeals,
  onWorkoutComplete,
  onMealComplete,
}: DayDetailsProps) {
  const workouts = getWorkoutsByDay(selectedDate);
  const meals = getMealsByDay(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {isToday
              ? "오늘의 루틴 & 식단"
              : `${formatDate(selectedDate)} 상세 정보`}
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
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">운동</h4>
              {workouts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {
                      workouts.filter((w) =>
                        completedWorkouts.includes(w.originalId)
                      ).length
                    }
                    /{workouts.length} 완료
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${
                          workouts.length > 0
                            ? (workouts.filter((w) =>
                                completedWorkouts.includes(w.originalId)
                              ).length /
                                workouts.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {workouts.length > 0 ? (
                workouts.map((workout, index) => {
                  const isCompleted = completedWorkouts.includes(
                    workout.originalId
                  );
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        isCompleted
                          ? "bg-green-50 border-green-200 shadow-md"
                          : "bg-blue-50 border-blue-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-blue-400" />
                          )}
                          <h5
                            className={`font-semibold ${
                              isCompleted ? "text-green-800" : "text-blue-800"
                            }`}
                          >
                            {workout.exercise}
                          </h5>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "🏋️ Workout complete button clicked:",
                              workout
                            );
                            onWorkoutComplete(workout);
                          }}
                          className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                            isCompleted
                              ? "bg-orange-600 text-white hover:bg-orange-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                          title={isCompleted ? "완료 취소" : "완료 처리"}
                        >
                          {isCompleted ? "취소" : "완료"}
                        </button>
                      </div>
                      <p
                        className={`text-sm mb-1 ${
                          isCompleted ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        {workout.category} • {workout.sets}세트 × {workout.reps}
                        회
                      </p>
                      <p className="text-xs text-gray-600">
                        {workout.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">
                  예정된 운동이 없습니다
                </p>
              )}
            </div>
          </div>

          {/* 식단 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">식단</h4>
              {meals.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {
                      meals.filter((m) => completedMeals.includes(m.originalId))
                        .length
                    }
                    /{meals.length} 완료
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${
                          meals.length > 0
                            ? (meals.filter((m) =>
                                completedMeals.includes(m.originalId)
                              ).length /
                                meals.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {meals.length > 0 ? (
                meals.map((meal, index) => {
                  const isCompleted = completedMeals.includes(meal.originalId);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        isCompleted
                          ? "bg-green-50 border-green-200 shadow-md"
                          : "bg-green-50 border-green-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-green-400" />
                          )}
                          <h5
                            className={`font-semibold ${
                              isCompleted ? "text-green-800" : "text-green-800"
                            }`}
                          >
                            {meal.meal}
                          </h5>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "🍽️ Meal complete button clicked:",
                              meal
                            );
                            onMealComplete(meal);
                          }}
                          className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                            isCompleted
                              ? "bg-orange-600 text-white hover:bg-orange-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                          title={isCompleted ? "완료 취소" : "완료 처리"}
                        >
                          {isCompleted ? "취소" : "완료"}
                        </button>
                      </div>
                      <p className="text-sm text-green-600 mb-2">
                        {meal.time} • {meal.portion_size}g •{" "}
                        {meal.nutrients.calories}kcal
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        {meal.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-100 px-2 py-1 rounded">
                          <span className="text-blue-700 font-medium">
                            단백질
                          </span>
                          <span className="text-gray-700 ml-1">
                            {meal.nutrients.protein}g
                          </span>
                        </div>
                        <div className="bg-orange-100 px-2 py-1 rounded">
                          <span className="text-orange-700 font-medium">
                            탄수화물
                          </span>
                          <span className="text-gray-700 ml-1">
                            {meal.nutrients.carbs}g
                          </span>
                        </div>
                        <div className="bg-purple-100 px-2 py-1 rounded">
                          <span className="text-purple-700 font-medium">
                            지방
                          </span>
                          <span className="text-gray-700 ml-1">
                            {meal.nutrients.fat}g
                          </span>
                        </div>
                        <div className="bg-green-100 px-2 py-1 rounded">
                          <span className="text-green-700 font-medium">
                            칼로리
                          </span>
                          <span className="text-gray-700 ml-1">
                            {meal.nutrients.calories}kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
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