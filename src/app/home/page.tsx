"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";
import { HealthSolutionService } from "@/services/healthSolutionService";
import { HealthSolutionWithDetails } from "@/types/database";
import Header from "@/components/home/Header";
import WelcomeSection from "@/components/home/WelcomeSection";
import WeeklySchedule from "@/components/home/WeeklySchedule";
import DayDetails from "@/components/home/DayDetails";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    fetchUser,
    signOut,
  } = useUserStore();

  const [userSchedule, setUserSchedule] = useState<UserSchedule | null>(null);
  const [healthSolution, setHealthSolution] = useState<HealthSolutionWithDetails | null>(null);
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
        "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일",
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

  const fetchHealthSolution = useCallback(
    async (userId: string) => {
      console.log(`🔄 [홈] 솔루션 로드 시작 - userId: ${userId}`);
      setScheduleLoading(true);
      setScheduleError(null);

      try {
        console.log('📡 [홈] HealthSolutionService.getCompleteHealthSolution 호출');
        const solution = await HealthSolutionService.getCompleteHealthSolution(userId);
        console.log('📊 [홈] 솔루션 응답:', solution ? '데이터 있음' : '데이터 없음');
        
        if (solution) {
          console.log('✅ [홈] 솔루션 데이터 변환 및 설정 완료');
          setHealthSolution(solution);
          const convertedSchedule = convertHealthSolutionToUserSchedule(solution as any);
          setUserSchedule(convertedSchedule);
        } else {
          console.log('⚠️ [홈] 솔루션 없음 - 빈 스케줄로 진행');
          const weekStart = getCurrentWeekStart();
          setUserSchedule({
            user_id: userId,
            week_start_date: weekStart,
            workouts: [],
            meals: [],
          });
        }
      } catch (error) {
        console.error('❌ [홈] 건강 솔루션 로드 오류:', error);
        setScheduleError("건강 솔루션을 불러오는데 실패했습니다.");
        const weekStart = getCurrentWeekStart();
        setUserSchedule({
          user_id: userId,
          week_start_date: weekStart,
          workouts: [],
          meals: [],
        });
      } finally {
        console.log('🏁 [홈] 솔루션 로드 완료 - 로딩 상태 해제');
        setScheduleLoading(false);
      }
    },
    [getCurrentWeekStart, convertHealthSolutionToUserSchedule]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 [홈] 인증 상태 확인 시작');
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('📊 [홈] 인증 응답:', { user: user ? '로그인됨' : '비로그인', error });
        
        if (user && !error) {
          console.log('✅ [홈] 로그인 상태 확인됨 - 사용자:', user.email);
          setIsLoggedIn(true);
          setUserName(user.user_metadata?.name || user.email || "");
        } else {
          console.log('❌ [홈] 비로그인 상태 - 로그인 페이지로 이동');
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error('❌ [홈] 인증 오류:', error);
        router.replace("/");
        return;
      }
      
      console.log('🏁 [홈] 인증 확인 완료 - 로딩 상태 해제');
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // 프로필 체크 및 건강 솔루션 로드
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      console.log('📄 [홈] 프로필 체크 및 솔루션 로드 시작');
      const checkProfileAndLoadSolution = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          console.log('📄 [홈] 프로필 정보 확인 시작');
          // 프로필 정보 확인
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          console.log('📊 [홈] 프로필 데이터:', profileData ? '있음' : '없음');
            
          // 필수 정보가 비어있으면 프로필 페이지로 이동
          if (!profileData || !profileData.gender || !profileData.birth_date || 
              !profileData.height_cm || !profileData.weight_kg) {
            console.log('⚠️ [홈] 프로필 정보 불완전 - 프로필 페이지로 이동');
            router.replace("/profile");
            return;
          }
          
          // 프로필이 완성된 경우 건강 솔루션 로드
          console.log('✅ [홈] 프로필 완성 확인 - 솔루션 로드 시작');
          fetchHealthSolution(user.id);
        }
      };
      checkProfileAndLoadSolution();
    }
  }, [isLoggedIn, isLoading, fetchHealthSolution, router]);

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

  const handleHome = () => {
    router.push("/home");
  };

  const getDayOfWeekInKorean = (date: Date) => {
    const days = [
      "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일",
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
      <Header
        currentTime={currentTime}
        isAuthenticated={isLoggedIn}
        userName={userName}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onDiet={handleDiet}
        onHome={handleHome}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <WelcomeSection
          isAuthenticated={isLoggedIn}
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
          />
        )}
      </main>
    </div>
  );
}