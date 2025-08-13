import { supabase } from "@/lib/supabase";

export interface CompletionService {
  // 운동 완료 상태 관리
  markWorkoutCompleted: (userId: string, workoutId: string) => Promise<void>;
  markWorkoutIncomplete: (userId: string, workoutId: string) => Promise<void>;
  getCompletedWorkouts: (userId: string) => Promise<string[]>;

  // 식단 완료 상태 관리
  markMealCompleted: (userId: string, mealId: string) => Promise<void>;
  markMealIncomplete: (userId: string, mealId: string) => Promise<void>;
  getCompletedMeals: (userId: string) => Promise<string[]>;

  // 특정 날짜의 완료 상태 조회
  getCompletedWorkoutsByDate: (userId: string, date: Date) => Promise<string[]>;
  getCompletedMealsByDate: (userId: string, date: Date) => Promise<string[]>;
}

class CompletionServiceImpl implements CompletionService {
  // 운동 완료 처리
  async markWorkoutCompleted(userId: string, workoutId: string): Promise<void> {
    try {
      // 이미 완료된 상태인지 확인
      const { data: existing } = await supabase
        .from("workout_completions")
        .select("id")
        .eq("user_id", userId)
        .eq("workout_id", workoutId)
        .maybeSingle();

      if (!existing) {
        // 새로운 완료 상태 추가
        const { error } = await supabase.from("workout_completions").insert({
          user_id: userId,
          workout_id: workoutId,
        });

        if (error) {
          console.error("운동 완료 상태 저장 실패:", error);
          throw new Error("운동 완료 상태를 저장할 수 없습니다.");
        }
      }
    } catch (error) {
      console.error("운동 완료 처리 중 오류:", error);
      throw error;
    }
  }

  // 운동 완료 취소
  async markWorkoutIncomplete(
    userId: string,
    workoutId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("workout_completions")
        .delete()
        .eq("user_id", userId)
        .eq("workout_id", workoutId);

      if (error) {
        console.error("운동 완료 취소 실패:", error);
        throw new Error("운동 완료 상태를 취소할 수 없습니다.");
      }
    } catch (error) {
      console.error("운동 완료 취소 중 오류:", error);
      throw error;
    }
  }

  // 사용자의 모든 완료된 운동 ID 조회
  async getCompletedWorkouts(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("workout_completions")
        .select("workout_id")
        .eq("user_id", userId);

      if (error) {
        console.error("완료된 운동 조회 실패:", error);
        throw new Error("완료된 운동을 조회할 수 없습니다.");
      }

      return data?.map((item) => item.workout_id) || [];
    } catch (error) {
      console.error("완료된 운동 조회 중 오류:", error);
      return [];
    }
  }

  // 식단 완료 처리
  async markMealCompleted(userId: string, mealId: string): Promise<void> {
    try {
      // 이미 완료된 상태인지 확인
      const { data: existing } = await supabase
        .from("meal_completions")
        .select("id")
        .eq("user_id", userId)
        .eq("meal_id", mealId)
        .maybeSingle();

      if (!existing) {
        // 새로운 완료 상태 추가
        const { error } = await supabase.from("meal_completions").insert({
          user_id: userId,
          meal_id: mealId,
        });

        if (error) {
          console.error("식단 완료 상태 저장 실패:", error);
          throw new Error("식단 완료 상태를 저장할 수 없습니다.");
        }
      }
    } catch (error) {
      console.error("식단 완료 처리 중 오류:", error);
      throw error;
    }
  }

  // 식단 완료 취소
  async markMealIncomplete(userId: string, mealId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("meal_completions")
        .delete()
        .eq("user_id", userId)
        .eq("meal_id", mealId);

      if (error) {
        console.error("식단 완료 취소 실패:", error);
        throw new Error("식단 완료 상태를 취소할 수 없습니다.");
      }
    } catch (error) {
      console.error("식단 완료 취소 중 오류:", error);
      throw error;
    }
  }

  // 사용자의 모든 완료된 식단 ID 조회
  async getCompletedMeals(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("meal_completions")
        .select("meal_id")
        .eq("user_id", userId);

      if (error) {
        console.error("완료된 식단 조회 실패:", error);
        throw new Error("완료된 식단을 조회할 수 없습니다.");
      }

      return data?.map((item) => item.meal_id) || [];
    } catch (error) {
      console.error("완료된 식단 조회 중 오류:", error);
      return [];
    }
  }

  // 특정 날짜의 완료된 운동 ID 조회 (현재는 전체 조회, 필요시 날짜별 필터링 추가 가능)
  async getCompletedWorkoutsByDate(
    userId: string,
    date: Date
  ): Promise<string[]> {
    // 현재는 전체 완료된 운동을 반환
    // 필요시 날짜별 필터링 로직 추가 가능
    return this.getCompletedWorkouts(userId);
  }

  // 특정 날짜의 완료된 식단 ID 조회 (현재는 전체 조회, 필요시 날짜별 필터링 추가 가능)
  async getCompletedMealsByDate(userId: string, date: Date): Promise<string[]> {
    // 현재는 전체 완료된 식단을 반환
    // 필요시 날짜별 필터링 로직 추가 가능
    return this.getCompletedMeals(userId);
  }
}

export const completionService = new CompletionServiceImpl();
