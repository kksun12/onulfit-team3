import { supabase } from '@/lib/supabase';
import { 
  HealthSolution, 
  SolutionWorkoutWithExercise,
  SolutionMealWithMeal,
  HealthSolutionWithDetails 
} from '@/types/database';

export class HealthSolutionService {
  // 사용자의 건강 솔루션 조회 (최신 순)
  static async getHealthSolution(userId: string): Promise<HealthSolution | null> {
    console.log('🔍 [Service] 건강 솔루션 조회 시작 - userId:', userId);
    
    try {
      const { data, error } = await supabase
        .from('health_solutions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      console.log('📊 [Service] 건강 솔루션 결과:', { hasData: !!data, error });

      if (error) {
        console.error('❌ [Service] 건강 솔루션 조회 오류:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('❌ [Service] 건강 솔루션 조회 예외:', err);
      return null;
    }
  }

  // 솔루션의 운동 목록 조회 (운동 정보 포함)
  static async getSolutionWorkouts(userId: string): Promise<SolutionWorkoutWithExercise[]> {
    console.log('🏋️ [Service] 운동 데이터 조회 시작 - userId:', userId);
    
    try {
      // 먼저 사용자의 최신 솔루션 ID 조회
      const { data: solutionData, error: solutionError } = await supabase
        .from('health_solutions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (solutionError || !solutionData) {
        console.log('❌ [Service] 솔루션 ID 조회 실패 - 운동 데이터 없음');
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

      if (error) {
        console.error('❌ [Service] 운동 데이터 조회 오류:', error);
        return [];
      }

      const workouts = data?.map(item => ({
        ...item,
        exercise: item.exercises
      })) || [];
      
      console.log('✅ [Service] 운동 데이터 조회 완료 - 개수:', workouts.length);
      return workouts;
    } catch (err) {
      console.error('❌ [Service] 운동 데이터 조회 예외:', err);
      return [];
    }
  }

  // 솔루션의 식단 목록 조회 (식단 정보 포함)
  static async getSolutionMeals(userId: string): Promise<SolutionMealWithMeal[]> {
    console.log('🍽️ [Service] 식단 데이터 조회 시작 - userId:', userId);
    
    try {
      // 먼저 사용자의 최신 솔루션 ID 조회
      const { data: solutionData, error: solutionError } = await supabase
        .from('health_solutions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (solutionError || !solutionData) {
        console.log('❌ [Service] 솔루션 ID 조회 실패 - 식단 데이터 없음');
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

      if (error) {
        console.error('❌ [Service] 식단 데이터 조회 오류:', error);
        return [];
      }

      const meals = data?.map(item => {
        const meal = {
          ...item,
          meal: item.meals
        };
        
        // 영양 정보 검증
        if (!meal.meal?.nutrients) {
          console.warn('⚠️ [Service] 영양 정보 누락:', meal.meal?.name);
        }
        
        return meal;
      }) || [];
      
      console.log('✅ [Service] 식단 데이터 조회 완료 - 개수:', meals.length);
      return meals;
    } catch (err) {
      console.error('❌ [Service] 식단 데이터 조회 예외:', err);
      return [];
    }
  }

  // 전체 건강 솔루션 조회 (운동, 식단 포함)
  static async getCompleteHealthSolution(userId: string): Promise<HealthSolutionWithDetails | null> {
    console.log('🎯 [Service] 전체 솔루션 조회 시작 - userId:', userId);
    
    try {
      // 솔루션 기본 정보 먼저 조회
      const solution = await this.getHealthSolution(userId);
      
      if (!solution) {
        console.log('❌ [Service] 솔루션 없음 - null 반환');
        return null;
      }
      
      // 솔루션이 있으면 운동, 식단 데이터 병렬 조회
      const [workouts, meals] = await Promise.all([
        this.getSolutionWorkouts(userId),
        this.getSolutionMeals(userId)
      ]);

      const completeSolution = {
        ...solution,
        solution_workouts: workouts,
        solution_meals: meals
      };
      
      console.log('✅ [Service] 전체 솔루션 조회 완료:', {
        solutionId: solution.id,
        workoutsCount: workouts.length,
        mealsCount: meals.length
      });
      
      return completeSolution;
    } catch (error) {
      console.error('❌ [Service] 전체 솔루션 조회 예외:', error);
      return null;
    }
  }
}