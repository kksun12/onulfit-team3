import { useState } from 'react';
import { HealthSolutionService } from '@/services/healthSolutionService';
import { 
  HealthSolution, 
  SolutionWorkoutWithExercise,
  SolutionMealWithMeal,
  HealthSolutionWithDetails 
} from '@/types/database';

export const useHealthSolution = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHealthSolution = async (userId: string): Promise<HealthSolution | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await HealthSolutionService.getHealthSolution(userId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSolutionWorkouts = async (userId: string): Promise<SolutionWorkoutWithExercise[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await HealthSolutionService.getSolutionWorkouts(userId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getSolutionMeals = async (userId: string): Promise<SolutionMealWithMeal[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await HealthSolutionService.getSolutionMeals(userId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCompleteHealthSolution = async (userId: string): Promise<HealthSolutionWithDetails | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await HealthSolutionService.getCompleteHealthSolution(userId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSolution = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-insert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );
      
      if (!response.ok) {
        throw new Error('솔루션 생성에 실패했습니다.');
      }
      
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getHealthSolution,
    getSolutionWorkouts,
    getSolutionMeals,
    getCompleteHealthSolution,
    createSolution,
    loading,
    error,
  };
};