// 건강 솔루션 메타 정보
export interface HealthSolution {
  id: string;
  user_id: string;
  week_start_date: string; // YYYY-MM-DD 형식
  created_at: string;
  updated_at: string;
}

// 솔루션 운동 기록
export interface SolutionWorkout {
  id: string;
  solution_id: string;
  exercise_id: string;
  workout_day: number; // 0=일, 1=월, ..., 6=토
  sets?: number;
  reps?: number;
  notes?: string;
}

// 솔루션 식단 기록
export interface SolutionMeal {
  id: string;
  solution_id: string;
  meal_id: string;
  meal_day: number; // 0=일, ..., 6=토
  meal_time?: string; // 아침, 점심, 저녁, 간식 등
  portion_size?: number;
  notes?: string;
}

// 운동 마스터 테이블
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category?: string; // 근력, 유산소 등
  created_at: string;
}

// 식단 마스터 테이블
export interface Meal {
  id: string;
  name: string;
  description?: string;
  nutrients?: Record<string, number>; // {"단백질": 30, "탄수화물": 20, ...}
  created_at: string;
}

// 조인된 데이터 타입들
export interface SolutionWorkoutWithExercise extends SolutionWorkout {
  exercise: Exercise;
}

export interface SolutionMealWithMeal extends SolutionMeal {
  meal: Meal;
}

export interface HealthSolutionWithDetails extends HealthSolution {
  solution_workouts: SolutionWorkoutWithExercise[];
  solution_meals: SolutionMealWithMeal[];
}