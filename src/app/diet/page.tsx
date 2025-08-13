"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HealthSolutionService } from "@/services/healthSolutionService";
import { SolutionMealWithMeal } from "@/types/database";
import { useUserStore } from "@/stores/userStore";
import Header from "@/components/home/Header";
import UserProfileCard from "@/components/diet/UserProfileCard";
import DaySelector from "@/components/diet/DaySelector";
import MealSelector from "@/components/diet/MealSelector";
import NutrientSummary from "@/components/diet/NutrientSummary";
import MealCard from "@/components/diet/MealCard";
import EmptyMealState from "@/components/diet/EmptyMealState";
import DietTips from "@/components/diet/DietTips";

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
        const meals = await HealthSolutionService.getSolutionMeals(user.id);
        
        // 식사 시간별로 그룹화
        const groupedMeals: MealsByTime = {};
        meals.forEach(meal => {
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
        console.error("Error fetching meals data:", error);
      } finally {
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
    return selectedMeals.filter(meal => meal.meal_day === selectedDay);
  };

  const getNutrientValue = (meal: SolutionMealWithMeal, nutrient: string): number => {
    return meal.meal?.nutrients?.[nutrient] || 0;
  };

  const getTotalNutrients = () => {
    const currentMeals = getCurrentDayMeals();
    return currentMeals.reduce((total, meal) => {
      const nutrients = meal.meal?.nutrients || {};
      return {
        calories: total.calories + (nutrients["칼로리"] || 0),
        protein: total.protein + (nutrients["단백질"] || 0),
        carbs: total.carbs + (nutrients["탄수화물"] || 0),
        fat: total.fat + (nutrients["지방"] || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
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
      await supabase.auth.signOut();
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
        {userProfile && <UserProfileCard userProfile={userProfile} />}
        
        <DaySelector selectedDay={selectedDay} onDaySelect={setSelectedDay} />
        
        <MealSelector 
          mealTimes={Object.keys(mealsByTime)} 
          selectedMeal={selectedMeal} 
          onMealSelect={setSelectedMeal} 
        />
        
        {getCurrentDayMeals().length > 0 && (
          <NutrientSummary 
            dayName={getDayName(selectedDay)} 
            selectedMeal={selectedMeal} 
            totalNutrients={getTotalNutrients()} 
          />
        )}
        
        <div className="space-y-6">
          {getCurrentDayMeals().length > 0 ? (
            getCurrentDayMeals().map((mealItem) => (
              <MealCard key={mealItem.id} mealItem={mealItem} />
            ))
          ) : (
            <EmptyMealState 
              dayName={getDayName(selectedDay)} 
              selectedMeal={selectedMeal} 
            />
          )}
        </div>
        
        <DietTips />
      </main>
    </div>
  );
}
