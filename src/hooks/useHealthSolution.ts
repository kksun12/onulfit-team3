import { useState, useEffect } from "react";
import { HealthSolutionService } from "@/services/healthSolutionService";
import { 
  HealthSolution, 
  HealthSolutionWithDetails, 
  SolutionWorkoutWithExercise, 
  SolutionMealWithMeal 
} from "@/types";

export const useHealthSolution = (userId?: string) => {
  const [healthSolution, setHealthSolution] = useState<HealthSolution | null>(null);
  const [workouts, setWorkouts] = useState<SolutionWorkoutWithExercise[]>([]);
  const [meals, setMeals] = useState<SolutionMealWithMeal[]>([]);
  const [completeSolution, setCompleteSolution] = useState<HealthSolutionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthSolution = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const solution = await HealthSolutionService.getHealthSolution(id);
      setHealthSolution(solution);
      return solution;
    } catch (err) {
      setError("건강 솔루션을 불러오는데 실패했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkouts = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const workoutData = await HealthSolutionService.getSolutionWorkouts(id);
      setWorkouts(workoutData);
      return workoutData;
    } catch (err) {
      setError("운동 데이터를 불러오는데 실패했습니다.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeals = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const mealData = await HealthSolutionService.getSolutionMeals(id);
      setMeals(mealData);
      return mealData;
    } catch (err) {
      setError("식단 데이터를 불러오는데 실패했습니다.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompleteSolution = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const solution = await HealthSolutionService.getCompleteHealthSolution(id);
      setCompleteSolution(solution);
      return solution;
    } catch (err) {
      setError("완전한 건강 솔루션을 불러오는데 실패했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCompleteSolution(userId);
    }
  }, [userId]);

  return {
    healthSolution,
    workouts,
    meals,
    completeSolution,
    isLoading,
    error,
    fetchHealthSolution,
    fetchWorkouts,
    fetchMeals,
    fetchCompleteSolution,
  };
};