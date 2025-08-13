"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";
import { useDiet } from "@/hooks";
import Header from "@/components/home/Header";
import UserProfileCard from "@/components/diet/UserProfileCard";
import DaySelector from "@/components/diet/DaySelector";
import MealSelector from "@/components/diet/MealSelector";
import NutrientSummary from "@/components/diet/NutrientSummary";
import MealCard from "@/components/diet/MealCard";
import EmptyMealState from "@/components/diet/EmptyMealState";
import DietTips from "@/components/diet/DietTips";

export default function DietPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user, userProfile, fetchUser, isAuthenticated } = useUserStore();
  const {
    mealsByTime,
    selectedMeal,
    setSelectedMeal,
    selectedDay,
    setSelectedDay,
    isLoading: loading,
    getDayName,
    getCurrentDayMeals,
    getTotalNutrients,
  } = useDiet(user?.id);

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
    if (!user) {
      router.push("/");
    }
  }, [user, router]);





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
