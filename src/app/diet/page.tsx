"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Utensils, Target, Clock, Heart, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DietRecommendation {
  id: string;
  mealType: string;
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
}

export default function DietPage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<DietRecommendation[]>(
    []
  );
  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast");
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          router.push("/");
          return;
        }

        // 사용자 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserProfile(profileData);

        // 프로필 정보를 기반으로 식단 추천 생성
        generateDietRecommendations(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const generateDietRecommendations = (profile: any) => {
    // 프로필 정보를 기반으로 개인화된 식단 추천
    const userGoal = profile?.diet_type || "건강유지";
    const userWeight = profile?.weight_kg || 70;
    const userHeight = profile?.height_cm || 170;
    const userActivity = profile?.activity_level || "3-4";

    // 목표에 따른 칼로리 계산
    let dailyCalories = 2000; // 기본값
    if (userGoal === "체중감량") {
      dailyCalories = Math.round(userWeight * 25 * 0.8); // 체중감량을 위한 칼로리
    } else if (userGoal === "근육증가") {
      dailyCalories = Math.round(userWeight * 25 * 1.2); // 근육증가를 위한 칼로리
    }

    const mealRecommendations: DietRecommendation[] = [
      {
        id: "1",
        mealType: "breakfast",
        title: "단백질 풍부한 아침 식사",
        description: "근육 회복과 에너지 공급을 위한 균형 잡힌 아침 식사",
        calories: Math.round(dailyCalories * 0.25),
        protein: 25,
        carbs: 45,
        fat: 15,
        ingredients: [
          "오트밀 1컵",
          "바나나 1개",
          "그릭요거트 1/2컵",
          "견과류 1/4컵",
          "꿀 1큰술",
        ],
        instructions: [
          "오트밀을 우유와 함께 끓여주세요",
          "바나나를 슬라이스하여 추가합니다",
          "그릭요거트와 견과류를 올려주세요",
          "꿀을 뿌려 완성합니다",
        ],
      },
      {
        id: "2",
        mealType: "lunch",
        title: "건강한 점심 식사",
        description: "오후 활동을 위한 충분한 영양소가 포함된 점심",
        calories: Math.round(dailyCalories * 0.35),
        protein: 35,
        carbs: 50,
        fat: 20,
        ingredients: [
          "현미밥 1공기",
          "닭가슴살 150g",
          "브로콜리 1컵",
          "당근 1/2개",
          "올리브오일 1큰술",
        ],
        instructions: [
          "닭가슴살을 올리브오일로 구워주세요",
          "브로콜리와 당근을 찜기에서 찝니다",
          "현미밥과 함께 담아 완성합니다",
        ],
      },
      {
        id: "3",
        mealType: "dinner",
        title: "가벼운 저녁 식사",
        description: "수면 전 소화가 잘 되는 가벼운 저녁 식사",
        calories: Math.round(dailyCalories * 0.25),
        protein: 20,
        carbs: 30,
        fat: 10,
        ingredients: [
          "연어 120g",
          "퀴노아 1/2컵",
          "시금치 2컵",
          "체리토마토 1/2컵",
          "레몬즙 1큰술",
        ],
        instructions: [
          "연어를 레몬즙과 함께 구워주세요",
          "퀴노아를 삶아주세요",
          "시금치와 체리토마토를 섞어 샐러드를 만듭니다",
          "모든 재료를 함께 담아 완성합니다",
        ],
      },
      {
        id: "4",
        mealType: "snack",
        title: "건강한 간식",
        description: "운동 전후 또는 간식 시간을 위한 영양 간식",
        calories: Math.round(dailyCalories * 0.15),
        protein: 15,
        carbs: 25,
        fat: 8,
        ingredients: [
          "아몬드 1/4컵",
          "사과 1개",
          "그릭요거트 1/2컵",
          "꿀 1작은술",
        ],
        instructions: [
          "사과를 썰어주세요",
          "그릭요거트에 꿀을 섞어주세요",
          "아몬드와 함께 담아 완성합니다",
        ],
      },
    ];

    setRecommendations(mealRecommendations);
  };

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "아침";
      case "lunch":
        return "점심";
      case "dinner":
        return "저녁";
      case "snack":
        return "간식";
      default:
        return mealType;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">식단 관리</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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

        {/* 식사 타입 선택 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            식사 선택
          </h3>
          <div className="flex flex-wrap gap-3">
            {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
              <button
                key={mealType}
                onClick={() => setSelectedMeal(mealType)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  selectedMeal === mealType
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {getMealTypeLabel(mealType)}
              </button>
            ))}
          </div>
        </div>

        {/* 추천 식단 */}
        <div className="space-y-6">
          {recommendations
            .filter((rec) => rec.mealType === selectedMeal)
            .map((recommendation) => (
              <div
                key={recommendation.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {recommendation.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {recommendation.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {recommendation.calories} kcal
                      </div>
                      <div className="text-sm text-gray-500">총 칼로리</div>
                    </div>
                  </div>

                  {/* 영양소 정보 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-lg font-bold text-blue-600">
                        {recommendation.protein}g
                      </div>
                      <div className="text-sm text-gray-600">단백질</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-lg font-bold text-green-600">
                        {recommendation.carbs}g
                      </div>
                      <div className="text-sm text-gray-600">탄수화물</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-xl">
                      <div className="text-lg font-bold text-yellow-600">
                        {recommendation.fat}g
                      </div>
                      <div className="text-sm text-gray-600">지방</div>
                    </div>
                  </div>

                  {/* 재료 */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      재료
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {recommendation.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 조리 방법 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      조리 방법
                    </h4>
                    <div className="space-y-2">
                      {recommendation.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
