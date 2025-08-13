import { useState } from 'react';
import { completionService } from '@/services/completionService';

export const useCompletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markWorkoutCompleted = async (userId: string, workoutId: string) => {
    setLoading(true);
    setError(null);
    try {
      await completionService.markWorkoutCompleted(userId, workoutId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markWorkoutIncomplete = async (userId: string, workoutId: string) => {
    setLoading(true);
    setError(null);
    try {
      await completionService.markWorkoutIncomplete(userId, workoutId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompletedWorkouts = async (userId: string): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await completionService.getCompletedWorkouts(userId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markMealCompleted = async (userId: string, mealId: string) => {
    setLoading(true);
    setError(null);
    try {
      await completionService.markMealCompleted(userId, mealId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markMealIncomplete = async (userId: string, mealId: string) => {
    setLoading(true);
    setError(null);
    try {
      await completionService.markMealIncomplete(userId, mealId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompletedMeals = async (userId: string): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await completionService.getCompletedMeals(userId);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    markWorkoutCompleted,
    markWorkoutIncomplete,
    getCompletedWorkouts,
    markMealCompleted,
    markMealIncomplete,
    getCompletedMeals,
    loading,
    error,
  };
};