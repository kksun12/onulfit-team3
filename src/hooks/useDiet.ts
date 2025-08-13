import { useState, useEffect } from "react";
import { HealthSolutionService } from "@/services/healthSolutionService";
import { SolutionMealWithMeal, MealsByTime } from "@/types";

export const useDiet = (userId?: string) => {
  const [mealsByTime, setMealsByTime] = useState<MealsByTime>({});
  const [selectedMeal, setSelectedMeal] = useState<string>("아침");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealsData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const meals = await HealthSolutionService.getSolutionMeals(id);
      
      const groupedMeals: MealsByTime = {};
      meals.forEach(meal => {
        const mealTime = meal.meal_time || "기타";
        if (!groupedMeals[mealTime]) {
          groupedMeals[mealTime] = [];
        }
        groupedMeals[mealTime].push(meal);
      });
      
      setMealsByTime(groupedMeals);
      
      const firstMealTime = Object.keys(groupedMeals)[0];
      if (firstMealTime) {
        setSelectedMeal(firstMealTime);
      }
    } catch (err) {
      setError("식단 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayIndex];
  };

  const getCurrentDayMeals = () => {
    const selectedMeals = mealsByTime[selectedMeal] || [];
    return selectedMeals.filter(meal => meal.meal_day === selectedDay);
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

  useEffect(() => {
    if (userId) {
      fetchMealsData(userId);
    }
  }, [userId]);

  return {
    mealsByTime,
    selectedMeal,
    setSelectedMeal,
    selectedDay,
    setSelectedDay,
    isLoading,
    error,
    getDayName,
    getCurrentDayMeals,
    getTotalNutrients,
    fetchMealsData,
  };
};