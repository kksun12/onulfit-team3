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
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Workout {
  id: string;
  name: string;
  duration: number;
  category: string;
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

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (user && !error) {
          setIsLoggedIn(true);
          setUserName(user.user_metadata?.name || user.email || "사용자");
        } else {
          setIsLoggedIn(false);
          setUserName("사용자");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Supabase 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsLoggedIn(true);
        setUserName(
          session.user.user_metadata?.name || session.user.email || "사용자"
        );
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setUserName("사용자");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  오늘 목표
                </p>
                <p className="text-2xl font-bold text-gray-800">3/3</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-7 w-7 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  총 운동 시간
                </p>
                <p className="text-2xl font-bold text-gray-800">60분</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  연속 달성
                </p>
                <p className="text-2xl font-bold text-gray-800">7일</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="h-7 w-7 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  이번 주
                </p>
                <p className="text-2xl font-bold text-gray-800">5/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 루틴 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
          <div className="p-8 border-b border-gray-100">
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
          <div className="p-8">
            {isLoggedIn ? (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      activeWorkout === workout.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : workout.completed
                        ? "border-green-200 bg-green-50 shadow-md"
                        : "border-gray-200 bg-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {workout.completed ? (
                            <CheckCircle className="h-7 w-7 text-green-500" />
                          ) : (
                            <div className="h-7 w-7 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">
                            {workout.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {workout.category} • {workout.duration}분
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {!workout.completed && (
                          <button
                            onClick={() => handleWorkoutToggle(workout.id)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              activeWorkout === workout.id
                                ? "bg-blue-100 text-blue-600 shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {activeWorkout === workout.id ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        {!workout.completed && (
                          <button
                            onClick={() => handleWorkoutComplete(workout.id)}
                            className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
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
              <div className="text-center py-12">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <LogIn className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    로그인이 필요합니다
                  </h4>
                  <p className="text-gray-500 mb-4">
                    개인화된 루틴을 보려면 로그인해주세요
                  </p>
                  <button
                    onClick={handleLogin}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    로그인하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
