import { supabase } from '@/lib/supabase';
import { 
  HealthSolution, 
  SolutionWorkoutWithExercise,
  SolutionMealWithMeal,
  HealthSolutionWithDetails 
} from '@/types/database';

export class HealthSolutionService {
  // 사용자의 건강 솔루션 조회
  static async getHealthSolution(userId: string): Promise<HealthSolution | null> {
    console.log('🔍 Fetching health solution for user:', userId);
    
    const { data, error } = await supabase
      .from('health_solutions')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('📊 Health solution result:', { data, error });

    if (error) {
      console.error('❌ Health solution fetch error:', error);
      return null;
    }

    return data;
  }

  // 솔루션의 운동 목록 조회 (운동 정보 포함)
  static async getSolutionWorkouts(userId: string): Promise<SolutionWorkoutWithExercise[]> {
    console.log('🏋️ Fetching solution workouts for user:', userId);
    
    // 먼저 사용자의 솔루션 ID 조회
    const { data: solutionData, error: solutionError } = await supabase
      .from('health_solutions')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    console.log('🔍 Solution ID lookup:', { solutionData, solutionError });
    
    if (solutionError || !solutionData) {
      console.log('❌ No solution found for workouts query');
      return [];
    }
    
    // 솔루션 ID로 운동 데이터 조회
    const { data, error } = await supabase
      .from('solution_workouts')
      .select(`
        *,
        exercises (*)
      `)
      .eq('solution_id', solutionData.id);

    console.log('💪 Solution workouts result:', { 
      data, 
      error, 
      count: data?.length,
      solutionId: solutionData.id 
    });

    if (error) {
      console.error('❌ Solution workouts fetch error:', error);
      return [];
    }

    const workouts = data?.map(item => ({
      ...item,
      exercise: item.exercises
    })) || [];
    
    console.log('🔄 Processed workouts:', workouts);
    return workouts;
  }

  // 솔루션의 식단 목록 조회 (식단 정보 포함)
  static async getSolutionMeals(userId: string): Promise<SolutionMealWithMeal[]> {
    console.log('🍽️ Fetching solution meals for user:', userId);
    
    // 먼저 사용자의 솔루션 ID 조회
    const { data: solutionData, error: solutionError } = await supabase
      .from('health_solutions')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    console.log('🔍 Solution ID lookup for meals:', { solutionData, solutionError });
    
    if (solutionError || !solutionData) {
      console.log('❌ No solution found for meals query');
      return [];
    }
    
    // 솔루션 ID로 식단 데이터 조회
    const { data, error } = await supabase
      .from('solution_meals')
      .select(`
        *,
        meals (*)
      `)
      .eq('solution_id', solutionData.id);

    console.log('🥗 Solution meals result:', { 
      data, 
      error, 
      count: data?.length,
      solutionId: solutionData.id 
    });

    if (error) {
      console.error('❌ Solution meals fetch error:', error);
      return [];
    }

    const meals = data?.map(item => ({
      ...item,
      meal: item.meals
    })) || [];
    
    console.log('🔄 Processed meals:', meals);
    return meals;
  }

  // 전체 건강 솔루션 조회 (운동, 식단 포함)
  static async getCompleteHealthSolution(userId: string): Promise<HealthSolutionWithDetails | null> {
    console.log('🎯 Starting complete health solution fetch for user:', userId);
    
    try {
      const [solution, workouts, meals] = await Promise.all([
        this.getHealthSolution(userId),
        this.getSolutionWorkouts(userId),
        this.getSolutionMeals(userId)
      ]);

      console.log('📋 Complete solution components:', {
        solution,
        workoutsCount: workouts.length,
        mealsCount: meals.length
      });

      if (!solution) {
        console.log('❌ No solution found, returning null');
        return null;
      }

      const completeSolution = {
        ...solution,
        solution_workouts: workouts,
        solution_meals: meals
      };
      
      console.log('✅ Complete health solution assembled:', completeSolution);
      return completeSolution;
    } catch (error) {
      console.error('❌ Complete health solution fetch error:', error);
      return null;
    }
  }
}