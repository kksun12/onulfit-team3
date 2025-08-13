"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { HealthSolutionWithDetails } from "@/types/database";
import Header from "@/components/home/Header";
import WelcomeSection from "@/components/home/WelcomeSection";
import WeeklySchedule from "@/components/home/WeeklySchedule";
import DayDetails from "@/components/home/DayDetails";
import { useAuth, useProfile, useHealthSolution, useCompletion } from "@/hooks";
import { supabase } from "@/lib/supabase";

// 화면 표시용 변환된 데이터 인터페이스
export interface WorkoutData {
  day: string;
  exercise: string;
  sets: number;
  reps: number;
  description: string;
  category: string;
  originalId: string;
}

export interface MealData {
  day: string;
  time: string;
  meal: string;
  portion_size: number;
  description: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  originalId: string;
}

interface UserSchedule {
  user_id: string;
  week_start_date: string;
  workouts: WorkoutData[];
  meals: MealData[];
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [userName, setUserName] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: userStoreLoading,
    fetchUser,
    signOut,
    initializeAuthListener,
  } = useUserStore();
  
  const { getCompleteHealthSolution } = useHealthSolution();
  const completionHooks = useCompletion();

  // 디버깅을 위한 사용자 상태 로그
  useEffect(() => {
    console.log("🔍 User state changed:", {
      user: user ? { id: user.id, email: user.email } : null,
      isAuthenticated,
      userStoreLoading,
      timestamp: new Date().toISOString(),
    });
  }, [user, isAuthenticated, userStoreLoading]);

  // 컴포넌트 마운트 시 auth listener 초기화
  useEffect(() => {
    const cleanup = initializeAuthListener();
    return cleanup;
  }, [initializeAuthListener]);

  // 사용자 정보가 로드되면 사용자명 설정
  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.name || user.email || "");
    }
  }, [user]);

  const [userSchedule, setUserSchedule] = useState<UserSchedule | null>(null);
  const [healthSolution, setHealthSolution] =
    useState<HealthSolutionWithDetails | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const getCurrentWeekStart = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday.toISOString().split("T")[0];
  }, []);

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
        (sw: any) => {
          const exercise = sw.exercise || sw.exercises;
          return {
            day: dayNames[sw.workout_day] || "",
            exercise: exercise?.name || "",
            sets: sw.sets || 0,
            reps: sw.reps || 0,
            description: exercise?.description || "",
            category: exercise?.category || "",
            originalId: sw.id,
          };
        }
      );

      const meals: MealData[] = (solution.solution_meals || []).map(
        (sm: any) => {
          const meal = sm.meal || sm.meals;
          return {
            day: dayNames[sm.meal_day] || "",
            time: sm.meal_time || "",
            meal: meal?.name || "",
            portion_size: sm.portion_size || 0,
            description: meal?.description || "",
            nutrients: meal?.nutrients || {
              protein: 0,
              carbs: 0,
              fat: 0,
              calories: 0,
            },
            originalId: sm.id,
          };
        }
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

  const fetchHealthSolutionRef = useRef<(userId: string) => Promise<void>>();
  
  fetchHealthSolutionRef.current = async (userId: string) => {
    setScheduleLoading(true);
    setScheduleError(null);

    try {
      const solution = await getCompleteHealthSolution(userId);

      if (solution) {
        setHealthSolution(solution);
        const convertedSchedule = convertHealthSolutionToUserSchedule(
          solution as any
        );
        setUserSchedule(convertedSchedule);
      } else {
        const weekStart = getCurrentWeekStart();
        setUserSchedule({
          user_id: userId,
          week_start_date: weekStart,
          workouts: [],
          meals: [],
        });
      }
    } catch (error) {
      setScheduleError("건강 솔루션을 불러오는데 실패했습니다.");
      const weekStart = getCurrentWeekStart();
      setUserSchedule({
        user_id: userId,
        week_start_date: weekStart,
        workouts: [],
        meals: [],
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  const loadCompletionStatusRef = useRef<(userId: string) => Promise<void>>();
  
  loadCompletionStatusRef.current = async (userId: string) => {
    try {
      console.log("🔄 Loading completion status for user:", userId);

      const [completedWorkoutsData, completedMealsData] = await Promise.all([
        completionHooks.getCompletedWorkouts(userId),
        completionHooks.getCompletedMeals(userId),
      ]);

      console.log("✅ Loaded completion status:", {
        workouts: completedWorkoutsData.length,
        meals: completedMealsData.length,
      });

      setCompletedWorkouts(completedWorkoutsData);
      setCompletedMeals(completedMealsData);
    } catch (error) {
      console.error("❌ Error loading completion status:", error);
      setCompletedWorkouts([]);
      setCompletedMeals([]);
    }
  };

  // 운동 완료 상태 변경 (DB 동기화)
  const handleWorkoutComplete = useCallback(
    async (workout: WorkoutData) => {
      console.log("🏋️ handleWorkoutComplete called:", {
        workout,
        userId: user?.id,
      });

      if (!user?.id) {
        console.error("❌ No user ID found");
        alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      try {
        const isCurrentlyCompleted = completedWorkouts.includes(
          workout.originalId
        );

        console.log("🔄 Current completion status:", {
          workoutId: workout.originalId,
          isCompleted: isCurrentlyCompleted,
        });

        if (isCurrentlyCompleted) {
          // 완료 취소
          console.log("🔄 Marking workout as incomplete...");
          try {
            await completionHooks.markWorkoutIncomplete(user.id, workout.originalId);
            console.log(
              "✅ Workout marked as incomplete in DB:",
              workout.exercise
            );
          } catch (dbError) {
            console.warn(
              "⚠️ DB update failed, using local state only:",
              dbError
            );
          }

          setCompletedWorkouts((prev) =>
            prev.filter((id) => id !== workout.originalId)
          );
          console.log("✅ Workout marked as incomplete:", workout.exercise);
        } else {
          // 완료 처리
          console.log("🔄 Marking workout as completed...");
          try {
            await completionHooks.markWorkoutCompleted(user.id, workout.originalId);
            console.log(
              "✅ Workout marked as completed in DB:",
              workout.exercise
            );
          } catch (dbError) {
            console.warn(
              "⚠️ DB update failed, using local state only:",
              dbError
            );
          }

          setCompletedWorkouts((prev) => [...prev, workout.originalId]);
          console.log("✅ Workout marked as completed:", workout.exercise);
        }
      } catch (error) {
        console.error("❌ Error updating workout completion status:", error);
        alert(
          "완료 상태를 업데이트하는 중 오류가 발생했습니다: " +
            (error as Error).message
        );
      }
    },
    [user?.id, completedWorkouts]
  );

  // 식단 완료 상태 변경 (DB 동기화)
  const handleMealComplete = useCallback(
    async (meal: MealData) => {
      console.log("🍽️ handleMealComplete called:", { meal, userId: user?.id });

      if (!user?.id) {
        console.error("❌ No user ID found");
        alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      try {
        const isCurrentlyCompleted = completedMeals.includes(meal.originalId);

        console.log("🔄 Current completion status:", {
          mealId: meal.originalId,
          isCompleted: isCurrentlyCompleted,
        });

        if (isCurrentlyCompleted) {
          // 완료 취소
          console.log("🔄 Marking meal as incomplete...");
          try {
            await completionHooks.markMealIncomplete(user.id, meal.originalId);
            console.log("✅ Meal marked as incomplete in DB:", meal.meal);
          } catch (dbError) {
            console.warn(
              "⚠️ DB update failed, using local state only:",
              dbError
            );
          }

          setCompletedMeals((prev) =>
            prev.filter((id) => id !== meal.originalId)
          );
          console.log("✅ Meal marked as incomplete:", meal.meal);
        } else {
          // 완료 처리
          console.log("🔄 Marking meal as completed...");
          try {
            await completionHooks.markMealCompleted(user.id, meal.originalId);
            console.log("✅ Meal marked as completed in DB:", meal.meal);
          } catch (dbError) {
            console.warn(
              "⚠️ DB update failed, using local state only:",
              dbError
            );
          }

          setCompletedMeals((prev) => [...prev, meal.originalId]);
          console.log("✅ Meal marked as completed:", meal.meal);
        }
      } catch (error) {
        console.error("❌ Error updating meal completion status:", error);
        alert(
          "완료 상태를 업데이트하는 중 오류가 발생했습니다: " +
            (error as Error).message
        );
      }
    },
    [user?.id, completedMeals]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  // 로그인 상태 확인 및 데이터 로드
  useEffect(() => {
    if (userStoreLoading) return;
    
    if (!isAuthenticated || !user) {
      router.replace("/");
      return;
    }

    if (dataLoaded) return;

    const loadData = async () => {
      try {
        setScheduleLoading(true);
        
        // 건강 솔루션 로드
        const solution = await getCompleteHealthSolution(user.id);
        if (solution) {
          const convertedSchedule = convertHealthSolutionToUserSchedule(solution as any);
          setUserSchedule(convertedSchedule);
        } else {
          const weekStart = getCurrentWeekStart();
          setUserSchedule({
            user_id: user.id,
            week_start_date: weekStart,
            workouts: [],
            meals: [],
          });
        }
        
        // 완료 상태 로드
        const [completedWorkoutsData, completedMealsData] = await Promise.all([
          completionHooks.getCompletedWorkouts(user.id),
          completionHooks.getCompletedMeals(user.id),
        ]);
        
        setCompletedWorkouts(completedWorkoutsData);
        setCompletedMeals(completedMealsData);
        
      } catch (error) {
        console.error("Data load error:", error);
        const weekStart = getCurrentWeekStart();
        setUserSchedule({
          user_id: user.id,
          week_start_date: weekStart,
          workouts: [],
          meals: [],
        });
      } finally {
        setScheduleLoading(false);
        setDataLoaded(true);
      }
    };

    loadData();
  }, [isAuthenticated, user?.id, userStoreLoading, dataLoaded]);

  const handleLogin = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = '/';
    }
  };

  const handleSettings = () => {
    router.push("/profile");
  };

  const handleDiet = () => {
    router.push("/diet");
  };



  const handleHome = () => {
    router.push("/home");
  };

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

  const getWorkoutsByDay = (date: Date) => {
    if (!userSchedule) return [];
    const dayName = getDayOfWeekInKorean(date);
    return userSchedule.workouts.filter((workout) => workout.day === dayName);
  };

  const getMealsByDay = (date: Date) => {
    if (!userSchedule) return [];
    const dayName = getDayOfWeekInKorean(date);
    return userSchedule.meals.filter((meal) => meal.day === dayName);
  };

  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - 3 + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  if (userStoreLoading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        currentTime={currentTime}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onDiet={handleDiet}
        onHome={handleHome}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <WelcomeSection
          isAuthenticated={isAuthenticated}
          userName={userName}
          onLogin={handleLogin}
        />

        <WeeklySchedule
          weekDays={weekDays}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          getWorkoutsByDay={getWorkoutsByDay}
          getMealsByDay={getMealsByDay}
          completedWorkouts={completedWorkouts}
          completedMeals={completedMeals}
          scheduleLoading={scheduleLoading}
          scheduleError={scheduleError}
        />

        {selectedDate && (
          <DayDetails
            selectedDate={selectedDate}
            onClose={() => setSelectedDate(null)}
            getWorkoutsByDay={getWorkoutsByDay}
            getMealsByDay={getMealsByDay}
            completedWorkouts={completedWorkouts}
            completedMeals={completedMeals}
            onWorkoutComplete={handleWorkoutComplete}
            onMealComplete={handleMealComplete}
          />
        )}
      </main>
    </div>
  );
}