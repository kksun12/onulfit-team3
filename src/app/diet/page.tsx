"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Target, Heart, Zap } from "lucide-react";
import { SolutionMealWithMeal } from "@/types/database";
import { useUserStore } from "@/stores/userStore";
import Header from "@/components/home/Header";
import { useAuth, useHealthSolution } from "@/hooks";

interface MealsByTime {
  [key: string]: SolutionMealWithMeal[];
}

export default function DietPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [mealsByTime, setMealsByTime] = useState<MealsByTime>({});
  const [selectedMeal, setSelectedMeal] = useState<string>("아침");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const router = useRouter();
  const { user, userProfile, fetchUser, isAuthenticated } = useUserStore();
  const { signOut } = useAuth();
  const { getSolutionMeals } = useHealthSolution();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) {
        await fetchUser();
      }
    };
    initializeData();
  }, [isAuthenticated, fetchUser]);

  useEffect(() => {
    const fetchMealsData = async () => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        // 건강 솔루션 식단 데이터 가져오기
        const meals = await getSolutionMeals(user.id);

        // 식사 시간별로 그룹화
        const groupedMeals: MealsByTime = {};
        meals.forEach((meal) => {
          const mealTime = meal.meal_time || "기타";
          if (!groupedMeals[mealTime]) {
            groupedMeals[mealTime] = [];
          }
          groupedMeals[mealTime].push(meal);
        });

        setMealsByTime(groupedMeals);

        // 첫 번째 식사 시간을 기본 선택으로 설정
        const firstMealTime = Object.keys(groupedMeals)[0];
        if (firstMealTime) {
          setSelectedMeal(firstMealTime);
        }
      } catch (error) {
        console.error("❌ [식단] 식단 데이터 로드 오류:", error);
      } finally {
        console.log("🏁 [식단] 식단 데이터 로드 완료");
        setLoading(false);
      }
    };

    if (user) {
      fetchMealsData();
    }
  }, [user, router]);

  const getDayName = (dayIndex: number) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayIndex];
  };

  const getCurrentDayMeals = () => {
    const selectedMeals = mealsByTime[selectedMeal] || [];
    return selectedMeals.filter((meal) => meal.meal_day === selectedDay);
  };

  const getNutrientValue = (
    meal: SolutionMealWithMeal,
    nutrient: string
  ): number => {
    return meal.meal?.nutrients?.[nutrient] || 0;
  };

  const getTotalNutrients = () => {
    const currentMeals = getCurrentDayMeals();
    return currentMeals.reduce(
      (total, meal) => {
        const nutrients = meal.meal?.nutrients || {};
        return {
          calories: total.calories + (nutrients["calories"] || 0),
          protein: total.protein + (nutrients["protein"] || 0),
          carbs: total.carbs + (nutrients["carbs"] || 0),
          fat: total.fat + (nutrients["fat"] || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case "체중감량":
        return "text-red-600 bg-red-50";
      case "근육증가":
        return "text-blue-600 bg-blue-50";
      case "건강유지":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">식단을 분석하는 중...</p>
        </div>
      </div>
    );
  }

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
    // 이미 식단관리 페이지에 있으므로 아무것도 하지 않음
  };

  const handleHome = () => {
    router.push("/home");
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        currentTime={currentTime}
        isAuthenticated={isAuthenticated}
        userName={user?.user_metadata?.name || user?.email || ""}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onDiet={handleDiet}
        onHome={handleHome}
      />

      <main className="w-full px-8 py-8">
        {/* 사용자 정보 및 목표 */}
        {userProfile && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                개인화된 식단 추천
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getGoalColor(
                  userProfile.diet_type
                )}`}
              >
                {userProfile.diet_type || "건강유지"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-gray-600">
                  목표: {userProfile.diet_type || "건강유지"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-red-600" />
                <span className="text-gray-600">
                  키: {userProfile.height_cm || "N/A"}cm
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span className="text-gray-600">
                  체중: {userProfile.weight_kg || "N/A"}kg
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 요일 선택 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            요일 선택
          </h3>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => setSelectedDay(dayIndex)}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDay === dayIndex
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {getDayName(dayIndex)}
              </button>
            ))}
          </div>
        </div>

        {/* 식사 타입 선택 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            식사 선택
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.keys(mealsByTime).map((mealTime) => (
              <button
                key={mealTime}
                onClick={() => setSelectedMeal(mealTime)}
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

        {/* 영양소 요약 */}
        {getCurrentDayMeals().length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {getDayName(selectedDay)}요일 {selectedMeal} 영양소 요약
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-lg font-bold text-blue-600">
                  {getTotalNutrients().calories.toFixed(0)} kcal
                </div>
                <div className="text-sm text-gray-600">칼로리</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-lg font-bold text-green-600">
                  {getTotalNutrients().protein.toFixed(1)}g
                </div>
                <div className="text-sm text-gray-600">단백질</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <div className="text-lg font-bold text-yellow-600">
                  {getTotalNutrients().carbs.toFixed(1)}g
                </div>
                <div className="text-sm text-gray-600">탄수화물</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="text-lg font-bold text-red-600">
                  {getTotalNutrients().fat.toFixed(1)}g
                </div>
                <div className="text-sm text-gray-600">지방</div>
              </div>
            </div>
          </div>
        )}

        {/* 식단 목록 */}
        <div className="space-y-6">
          {getCurrentDayMeals().length > 0 ? (
            getCurrentDayMeals().map((mealItem) => (
              <div
                key={mealItem.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {mealItem.meal?.name || "식단 정보 없음"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {mealItem.meal?.description || "설명이 없습니다."}
                      </p>
                      {mealItem.portion_size && (
                        <p className="text-sm text-blue-600 font-medium">
                          권장량: {mealItem.portion_size}인분
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {getNutrientValue(mealItem, "calories").toFixed(0)} kcal
                      </div>
                      <div className="text-sm text-gray-500">칼로리</div>
                    </div>
                  </div>

                  {/* 영양소 정보 */}
                  {mealItem.meal?.nutrients && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-lg font-bold text-blue-600">
                          {getNutrientValue(mealItem, "protein").toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">단백질</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-lg font-bold text-green-600">
                          {getNutrientValue(mealItem, "carbs").toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">탄수화물</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-xl">
                        <div className="text-lg font-bold text-yellow-600">
                          {getNutrientValue(mealItem, "fat").toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">지방</div>
                      </div>
                    </div>
                  )}

                  {/* 추가 정보 */}
                  {mealItem.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        메모
                      </h4>
                      <p className="text-gray-600 text-sm">{mealItem.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                등록된 식단이 없습니다
              </h3>
              <p className="text-gray-500">
                {getDayName(selectedDay)}요일 {selectedMeal}에 대한 식단이
                없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 식단 관리 팁
          </h3>
          <div className="space-y-2 text-blue-700">
            <p>• 규칙적인 식사 시간을 지켜주세요</p>
            <p>• 충분한 수분 섭취를 잊지 마세요</p>
            <p>• 식사 전후 30분 정도의 가벼운 운동을 권장합니다</p>
            <p>• 개인 상황에 맞게 재료를 조절하세요</p>
          </div>
        </div>
      </main>
    </div>
  );
}
