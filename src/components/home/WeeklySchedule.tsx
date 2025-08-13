import { WorkoutData, MealData } from "@/app/home/page";

interface WeeklyScheduleProps {
  weekDays: Date[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  getWorkoutsByDay: (date: Date) => WorkoutData[];
  getMealsByDay: (date: Date) => MealData[];
  completedWorkouts: string[];
  completedMeals: string[];
  scheduleLoading: boolean;
  scheduleError: string | null;
}

export default function WeeklySchedule({
  weekDays,
  selectedDate,
  onDateSelect,
  getWorkoutsByDay,
  getMealsByDay,
  completedWorkouts,
  completedMeals,
  scheduleLoading,
  scheduleError,
}: WeeklyScheduleProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">이번 주 스케줄</h3>
          {scheduleLoading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">스케줄 로딩 중...</span>
            </div>
          )}
        </div>
        {scheduleError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{scheduleError}</p>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isSelected =
              selectedDate?.toDateString() === date.toDateString();

            const dayWorkouts = getWorkoutsByDay(date);
            const dayMeals = getMealsByDay(date);
            const completedWorkoutsCount = dayWorkouts.filter((w) =>
              completedWorkouts.includes(w.originalId)
            ).length;
            const completedMealsCount = dayMeals.filter((m) =>
              completedMeals.includes(m.originalId)
            ).length;

            return (
              <div
                key={index}
                onClick={() => onDateSelect(date)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : isToday
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : isWeekend
                    ? "border-purple-200 bg-purple-50 hover:shadow-md"
                    : "border-gray-200 bg-white hover:shadow-md"
                }`}
              >
                <div className="text-center mb-3">
                  <div
                    className={`text-sm font-medium ${
                      isToday ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {date.toLocaleDateString("ko-KR", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isToday ? "text-blue-800" : "text-gray-800"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>

                <div className="space-y-1">
                  {dayWorkouts.length > 0 && (
                    <div className="text-xs">
                      <div
                        className={`font-medium mb-1 ${
                          isToday ? "text-blue-600" : "text-blue-500"
                        }`}
                      >
                        운동
                      </div>
                      <div className="text-gray-600">
                        {completedWorkoutsCount}/{dayWorkouts.length} 완료
                      </div>
                    </div>
                  )}
                  {dayMeals.length > 0 && (
                    <div className="text-xs">
                      <div
                        className={`font-medium mb-1 ${
                          isToday ? "text-green-600" : "text-green-500"
                        }`}
                      >
                        식단
                      </div>
                      <div className="text-gray-600">
                        {completedMealsCount}/{dayMeals.length} 완료
                      </div>
                    </div>
                  )}
                  {dayWorkouts.length === 0 && dayMeals.length === 0 && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400">일정 없음</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
