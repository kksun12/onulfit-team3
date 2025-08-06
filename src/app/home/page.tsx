"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  User,
  Settings,
  LogOut,
  LogIn,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/lib/supabase";

// 데이터베이스 스키마에 맞는 인터페이스 정의
interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  nutrients: {
    단백질: number;
    탄수화물: number;
    지방: number;
    칼로리: number;
  };
}

interface SolutionWorkout {
  id: string;
  solution_id: string;
  exercise_id: string;
  workout_day: number; // 0=일, 1=월, ..., 6=토
  sets: number;
  reps: number;
  notes: string;
  exercise: Exercise; // 조인된 운동 정보
}

interface SolutionMeal {
  id: string;
  solution_id: string;
  meal_id: string;
  meal_day: number; // 0=일, 1=월, ..., 6=토
  meal_time: string; // 아침, 점심, 저녁, 간식
  portion_size: number;
  notes: string;
  meal: Meal; // 조인된 식단 정보
}

interface HealthSolution {
  id: string;
  user_id: string;
  week_start_date: string;
  created_at: string;
  updated_at: string;
  solution_workouts: SolutionWorkout[];
  solution_meals: SolutionMeal[];
}

// 화면 표시용 변환된 데이터 인터페이스
interface WorkoutData {
  day: string;
  exercise: string;
  sets: number;
  reps: number;
  description: string;
  category: string;
  originalId: string; // 완료 상태 추적용
}

interface MealData {
  day: string;
  time: string;
  meal: string;
  portion_size: number;
  description: string;
  nutrients: {
    단백질: number;
    탄수화물: number;
    지방: number;
    칼로리: number;
  };
  originalId: string; // 완료 상태 추적용
}

interface UserSchedule {
  user_id: string;
  week_start_date: string;
  workouts: WorkoutData[];
  meals: MealData[];
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Zustand store 사용
  const {
    user,
    userProfile,
    isAuthenticated,
    isLoading: userLoading,
    fetchUser,
    signOut,
  } = useUserStore();

  // 사용자 스케줄 데이터 상태
  const [userSchedule, setUserSchedule] = useState<UserSchedule | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // 사용자 이름 계산
  const userName = user?.user_metadata?.name || user?.email || "사용자";

  // 현재 주의 시작일 계산 (월요일 기준)
  const getCurrentWeekStart = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday.toISOString().split("T")[0]; // YYYY-MM-DD 형식
  }, []);

  // 데이터베이스 데이터를 화면 표시용으로 변환
  const convertHealthSolutionToUserSchedule = useCallback(
    (solution: any): UserSchedule => {
      const dayNames = [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일",
      ];

      const workouts: WorkoutData[] = (solution.solution_workouts || []).map(
        (sw: any) => ({
          day: dayNames[sw.workout_day] || "",
          exercise: sw.exercises?.[0]?.name || sw.exercise?.name || "",
          sets: sw.sets || 0,
          reps: sw.reps || 0,
          description:
            sw.exercises?.[0]?.description || sw.exercise?.description || "",
          category: sw.exercises?.[0]?.category || sw.exercise?.category || "",
          originalId: sw.id,
        })
      );

      const meals: MealData[] = (solution.solution_meals || []).map(
        (sm: any) => ({
          day: dayNames[sm.meal_day] || "",
          time: sm.meal_time || "",
          meal: sm.meals?.[0]?.name || sm.meal?.name || "",
          portion_size: sm.portion_size || 0,
          description: sm.meals?.[0]?.description || sm.meal?.description || "",
          nutrients: sm.meals?.[0]?.nutrients ||
            sm.meal?.nutrients || {
              단백질: 0,
              탄수화물: 0,
              지방: 0,
              칼로리: 0,
            },
          originalId: sm.id,
        })
      );

      return {
        user_id: solution.user_id,
        week_start_date: solution.week_start_date,
        workouts,
        meals,
      };
    },
    []
  );

  // 데이터베이스에서 사용자의 건강 솔루션 가져오기
  const fetchHealthSolution = useCallback(
    async (userId: string) => {
      console.log("🏠 fetchHealthSolution 시작:", { userId });

      setScheduleLoading(true);
      setScheduleError(null);

      try {
        const weekStart = getCurrentWeekStart();
        console.log("📅 Week start:", weekStart);

        // health_solutions 테이블에서 데이터 가져오기 시도
        const { data: solutionData, error: solutionError } = await supabase
          .from("health_solutions")
          .select(
            `
          id,
          user_id,
          week_start_date,
          created_at,
          updated_at,
          solution_workouts(
            id,
            exercise_id,
            workout_day,
            sets,
            reps,
            notes,
            exercises(
              id,
              name,
              description,
              category
            )
          ),
          solution_meals(
            id,
            meal_id,
            meal_day,
            meal_time,
            portion_size,
            notes,
            meals(
              id,
              name,
              description,
              nutrients
            )
          )
        `,
            { head: false }
          )
          .eq("user_id", userId)
          .eq("week_start_date", weekStart)
          .maybeSingle();

        console.log("🏋️ Health solution query result:", {
          solutionData,
          solutionError,
          errorCode: solutionError?.code,
          errorMessage: solutionError?.message,
        });

        if (solutionError) {
          if (solutionError.code === "PGRST116") {
            // 데이터가 없는 경우 - 정상적인 상황
            console.log(
              "ℹ️ No health solution found for this week, using empty schedule"
            );
            setUserSchedule({
              user_id: userId,
              week_start_date: weekStart,
              workouts: [],
              meals: [],
            });
          } else if (solutionError.code === "42P01") {
            // 테이블이 존재하지 않는 경우
            console.warn(
              "⚠️ health_solutions table does not exist, using empty schedule"
            );
            setUserSchedule({
              user_id: userId,
              week_start_date: weekStart,
              workouts: [],
              meals: [],
            });
          } else {
            // 기타 에러 (RLS, 권한 문제 등)
            console.error("❌ Health solution fetch error:", solutionError);
            console.log(
              "🔄 Continuing with empty schedule due to database access issue"
            );
            setUserSchedule({
              user_id: userId,
              week_start_date: weekStart,
              workouts: [],
              meals: [],
            });
          }
        } else if (solutionData) {
          console.log("✅ Health solution loaded successfully");
          const convertedSchedule = convertHealthSolutionToUserSchedule(
            solutionData as any
          );
          setUserSchedule(convertedSchedule);
        } else {
          console.log("ℹ️ No health solution data found, using empty schedule");
          setUserSchedule({
            user_id: userId,
            week_start_date: weekStart,
            workouts: [],
            meals: [],
          });
        }
      } catch (error) {
        console.error("❌ Error fetching health solution:", error);
        console.log("🔄 Continuing with empty schedule due to fetch error");
        setScheduleError("건강 솔루션을 불러오는데 실패했습니다.");
        // 에러가 있어도 빈 스케줄로 계속 진행
        setUserSchedule({
          user_id: userId,
          week_start_date: getCurrentWeekStart(),
          workouts: [],
          meals: [],
        });
      } finally {
        console.log("🏁 fetchHealthSolution 완료, 로딩 상태 해제");
        setScheduleLoading(false);
      }
    },
    [getCurrentWeekStart, convertHealthSolutionToUserSchedule]
  );

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 초기 로딩
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🏠 Starting home page auth initialization...");
      await fetchUser();
      setIsLoading(false);
    };

    // 컴포넌트 마운트 시에만 실행
    initializeAuth();
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 인증 상태 변경 감지
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log("✅ User authenticated, fetching health solution...");
      fetchHealthSolution(user.id);
    } else if (!isAuthenticated && !isLoading) {
      console.log("❌ No authenticated user found");
      setUserSchedule(null);
    }
  }, [isAuthenticated, user?.id, isLoading, fetchHealthSolution]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const handleLogin = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    router.push("/profile");
  };

  const handleDiet = () => {
    router.push("/diet");
  };

  // 요일 변환 함수
  const getDayOfWeekInKorean = (date: Date) => {
    const days = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    return days[date.getDay()];
  };

  // 현재 요일의 운동 가져오기
  const getTodayWorkouts = () => {
    if (!userSchedule) return [];
    const today = getDayOfWeekInKorean(new Date());
    return userSchedule.workouts.filter((workout) => workout.day === today);
  };

  // 현재 요일의 식단 가져오기
  const getTodayMeals = () => {
    if (!userSchedule) return [];
    const today = getDayOfWeekInKorean(new Date());
    return userSchedule.meals.filter((meal) => meal.day === today);
  };

  // 특정 날짜의 운동 가져오기
  const getWorkoutsByDay = (date: Date) => {
    if (!userSchedule) return [];
    const dayName = getDayOfWeekInKorean(date);
    return userSchedule.workouts.filter((workout) => workout.day === dayName);
  };

  // 특정 날짜의 식단 가져오기
  const getMealsByDay = (date: Date) => {
    if (!userSchedule) return [];
    const dayName = getDayOfWeekInKorean(date);
    return userSchedule.meals.filter((meal) => meal.day === dayName);
  };

  // 운동 완료 처리
  const handleWorkoutComplete = (workout: WorkoutData) => {
    setCompletedWorkouts((prev) =>
      prev.includes(workout.originalId)
        ? prev.filter((id) => id !== workout.originalId)
        : [...prev, workout.originalId]
    );
    // TODO: 데이터베이스에 완료 상태 저장
  };

  // 식단 완료 처리
  const handleMealComplete = (meal: MealData) => {
    setCompletedMeals((prev) =>
      prev.includes(meal.originalId)
        ? prev.filter((id) => id !== meal.originalId)
        : [...prev, meal.originalId]
    );
    // TODO: 데이터베이스에 완료 상태 저장
  };

  // 일주일 날짜 생성
  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - 3 + i); // 오늘을 중앙에 두고 전후 3일씩
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-4 text-2xl font-bold text-gray-800">OnulFit</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* 시간 표시 */}
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">
                  {formatDate(currentTime)}
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {formatTime(currentTime)}
                </div>
              </div>

              {/* 사용자 정보 */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {userName}
                  </span>
                </div>
              )}

              {/* 프로필 설정 버튼 */}
              <button
                onClick={handleSettings}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="프로필 정보 수정"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  프로필
                </span>
              </button>

              {/* 식단관리 버튼 */}
              <button
                onClick={handleDiet}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="식단 추천"
              >
                <Utensils className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  식단관리
                </span>
              </button>

              {/* 로그인/로그아웃 버튼 */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  title="로그인"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 환영 메시지 */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {isAuthenticated
              ? `${userName}님, 안녕하세요! 👋`
              : "안녕하세요! 👋"}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {isAuthenticated
              ? "오늘도 건강한 하루를 시작해보세요"
              : "로그인하고 건강한 루틴을 시작해보세요"}
          </p>
        </div>

        {/* 로그인하지 않은 경우 로그인 안내 */}
        {!isAuthenticated && (
          <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                  로그인이 필요합니다
                </h3>
                <p className="text-blue-600 mb-3">
                  개인화된 건강 루틴을 이용하려면 로그인해주세요
                </p>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 일주일 스케줄 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 mb-10">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                이번 주 스케줄
              </h3>
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
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isToday
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : isWeekend
                        ? "border-purple-200 bg-purple-50"
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

                    {/* 요일별 요약 정보 표시 */}
                    <div className="space-y-1">
                      {(() => {
                        const dayWorkouts = getWorkoutsByDay(date);
                        const dayMeals = getMealsByDay(date);
                        const completedWorkoutsCount = dayWorkouts.filter((w) =>
                          completedWorkouts.includes(w.originalId)
                        ).length;
                        const completedMealsCount = dayMeals.filter((m) =>
                          completedMeals.includes(m.originalId)
                        ).length;

                        return (
                          <>
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
                                  {completedWorkoutsCount}/{dayWorkouts.length}{" "}
                                  완료
                                </div>
                              </div>
                            )}
                            {dayMeals.length > 0 && (
                              <div className="text-xs">
                                <div
                                  className={`font-medium mb-1 ${
                                    isToday
                                      ? "text-green-600"
                                      : "text-green-500"
                                  }`}
                                >
                                  식단
                                </div>
                                <div className="text-gray-600">
                                  {completedMealsCount}/{dayMeals.length} 완료
                                </div>
                              </div>
                            )}
                            {dayWorkouts.length === 0 &&
                              dayMeals.length === 0 && (
                                <div className="text-center">
                                  <div className="text-xs text-gray-400">
                                    일정 없음
                                  </div>
                                </div>
                              )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 오늘의 루틴과 식단 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 오늘의 루틴 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">오늘의 루틴</h3>
                {isAuthenticated && (
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    <Plus className="h-5 w-5 mr-2" />
                    루틴 추가
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  {getTodayWorkouts().length > 0 ? (
                    getTodayWorkouts().map((workout, index) => {
                      const isCompleted = completedWorkouts.includes(
                        workout.originalId
                      );
                      const isActive = activeWorkout === workout.originalId;

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            isActive
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : isCompleted
                              ? "border-green-200 bg-green-50 shadow-md"
                              : "border-gray-200 bg-white shadow-md hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                  <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-base font-semibold text-gray-800 mb-1">
                                  {workout.exercise}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {workout.category} • {workout.sets}세트 ×{" "}
                                  {workout.reps}회
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {workout.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!isCompleted && (
                                <button
                                  onClick={() =>
                                    setActiveWorkout(
                                      isActive ? null : workout.originalId
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-blue-100 text-blue-600 shadow-md"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  {isActive ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              {!isCompleted && (
                                <button
                                  onClick={() => handleWorkoutComplete(workout)}
                                  className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  완료
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <Activity className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-600 mb-2">
                          오늘 예정된 운동이 없습니다
                        </h4>
                        <p className="text-sm text-gray-500">
                          휴식을 취하거나 자유롭게 운동해보세요
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <LogIn className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-base font-semibold text-gray-600 mb-2">
                      로그인이 필요합니다
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      개인화된 루틴을 보려면 로그인해주세요
                    </p>
                    <button
                      onClick={handleLogin}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                    >
                      로그인하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 오늘의 식단 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">오늘의 식단</h3>
                {isAuthenticated && (
                  <button className="flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors">
                    <Plus className="h-5 w-5 mr-2" />
                    식단 추가
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  {getTodayMeals().length > 0 ? (
                    getTodayMeals().map((meal, index) => {
                      const isCompleted = completedMeals.includes(
                        meal.originalId
                      );

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            isCompleted
                              ? "border-green-200 bg-green-50 shadow-md"
                              : "border-gray-200 bg-white shadow-md hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                  <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-800 mb-1">
                                  {meal.meal}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {meal.time} • {meal.portion_size}g •{" "}
                                  {meal.nutrients.칼로리}kcal
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                  {meal.description}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-blue-50 px-2 py-1 rounded">
                                    <span className="text-blue-600 font-medium">
                                      단백질
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      {meal.nutrients.단백질}g
                                    </span>
                                  </div>
                                  <div className="bg-orange-50 px-2 py-1 rounded">
                                    <span className="text-orange-600 font-medium">
                                      탄수화물
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      {meal.nutrients.탄수화물}g
                                    </span>
                                  </div>
                                  <div className="bg-purple-50 px-2 py-1 rounded">
                                    <span className="text-purple-600 font-medium">
                                      지방
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      {meal.nutrients.지방}g
                                    </span>
                                  </div>
                                  <div className="bg-green-50 px-2 py-1 rounded">
                                    <span className="text-green-600 font-medium">
                                      칼로리
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      {meal.nutrients.칼로리}kcal
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {!isCompleted && (
                                <button
                                  onClick={() => handleMealComplete(meal)}
                                  className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  완료
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <Utensils className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-600 mb-2">
                          오늘 예정된 식단이 없습니다
                        </h4>
                        <p className="text-sm text-gray-500">
                          자유롭게 식사를 즐기세요
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <Utensils className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-base font-semibold text-gray-600 mb-2">
                      로그인이 필요합니다
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      개인화된 식단을 보려면 로그인해주세요
                    </p>
                    <button
                      onClick={handleLogin}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                    >
                      로그인하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
