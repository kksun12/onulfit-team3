"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

interface Workout {
  id: string;
  name: string;
  duration: number;
  category: string;
  completed: boolean;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  completed: boolean;
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [workouts] = useState<Workout[]>([
    {
      id: "1",
      name: "오전 스트레칭",
      duration: 10,
      category: "스트레칭",
      completed: false,
    },
    {
      id: "2",
      name: "점심 산책",
      duration: 20,
      category: "유산소",
      completed: false,
    },
    {
      id: "3",
      name: "저녁 요가",
      duration: 30,
      category: "요가",
      completed: false,
    },
  ]);

  const [meals] = useState<Meal[]>([
    {
      id: "1",
      name: "아침 식사",
      time: "08:00",
      calories: 350,
      completed: true,
    },
    {
      id: "2",
      name: "점심 식사",
      time: "12:30",
      calories: 550,
      completed: false,
    },
    {
      id: "3",
      name: "저녁 식사",
      time: "18:30",
      calories: 450,
      completed: false,
    },
  ]);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 로그인 상태 확인 및 프로필 체크
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (user && !error) {
          setIsLoggedIn(true);
          setUserName(user.user_metadata?.name || user.email || "사용자");
          
          // 프로필 정보 확인
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          // 프로필이 없거나 필수 정보가 비어있으면 프로필 페이지로 이동
          if (!profileData || !profileData.gender || !profileData.birth_date || 
              !profileData.height_cm || !profileData.weight_kg) {
            router.push("/profile");
            return;
          }
        } else {
          // 로그인되지 않은 사용자를 로그인 페이지로 리다이렉트
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndProfile();

    // Supabase 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsLoggedIn(true);
        setUserName(
          session.user.user_metadata?.name || session.user.email || "사용자"
        );
        
        // OAuth 로그인 후 프로필 체크
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (!profileData || !profileData.gender || !profileData.birth_date || 
            !profileData.height_cm || !profileData.weight_kg) {
          router.push("/profile");
          return;
        }
      } else if (event === "SIGNED_OUT") {
        // 로그아웃 시 로그인 페이지로 리다이렉트
        router.push("/");
        return;
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

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

  const handleWorkoutToggle = (workoutId: string) => {
    setActiveWorkout(activeWorkout === workoutId ? null : workoutId);
  };

  const handleWorkoutComplete = (workoutId: string) => {
    // TODO: Supabase에 완료 상태 업데이트
    console.log(`Workout ${workoutId} completed`);
  };

  const handleLogin = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      } else {
        setIsLoggedIn(false);
        setUserName("사용자");
        router.push("/");
      }
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

  // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
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
              {isLoggedIn && (
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
              {isLoggedIn ? (
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
            {isLoggedIn ? `${userName}님, 안녕하세요! 👋` : "안녕하세요! 👋"}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {isLoggedIn
              ? "오늘도 건강한 하루를 시작해보세요"
              : "로그인하고 건강한 루틴을 시작해보세요"}
          </p>
        </div>

        {/* 로그인하지 않은 경우 로그인 안내 */}
        {!isLoggedIn && (
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
            <h3 className="text-xl font-bold text-gray-800">이번 주 스케줄</h3>
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

                    {/* 오늘인 경우 요약 정보 표시 */}
                    {isToday && (
                      <div className="space-y-2">
                        <div className="text-xs">
                          <div className="font-medium text-blue-600 mb-1">
                            운동
                          </div>
                          <div className="text-gray-600">
                            {workouts.filter((w) => w.completed).length}/
                            {workouts.length} 완료
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-green-600 mb-1">
                            식단
                          </div>
                          <div className="text-gray-600">
                            {meals.filter((m) => m.completed).length}/
                            {meals.length} 완료
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 다른 날짜는 간단한 표시 */}
                    {!isToday && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">
                          {index === 3
                            ? "오늘"
                            : index < 3
                            ? "지난주"
                            : "다음주"}
                        </div>
                      </div>
                    )}
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
                {isLoggedIn && (
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    <Plus className="h-5 w-5 mr-2" />
                    루틴 추가
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {isLoggedIn ? (
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        activeWorkout === workout.id
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : workout.completed
                          ? "border-green-200 bg-green-50 shadow-md"
                          : "border-gray-200 bg-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {workout.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-1">
                              {workout.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {workout.category} • {workout.duration}분
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!workout.completed && (
                            <button
                              onClick={() => handleWorkoutToggle(workout.id)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                activeWorkout === workout.id
                                  ? "bg-blue-100 text-blue-600 shadow-md"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {activeWorkout === workout.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {!workout.completed && (
                            <button
                              onClick={() => handleWorkoutComplete(workout.id)}
                              className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              완료
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                {isLoggedIn && (
                  <button className="flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors">
                    <Plus className="h-5 w-5 mr-2" />
                    식단 추가
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {isLoggedIn ? (
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        meal.completed
                          ? "border-green-200 bg-green-50 shadow-md"
                          : "border-gray-200 bg-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {meal.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-1">
                              {meal.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {meal.time} • {meal.calories}kcal
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!meal.completed && (
                            <button
                              onClick={() =>
                                console.log(`Meal ${meal.id} completed`)
                              }
                              className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              완료
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
