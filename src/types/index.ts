// ===== 사용자 관련 타입 =====
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    phone?: string;
  };
}

export interface UserProfile {
  id: string;
  gender: string;
  birth_date: string;
  goal: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  preferred_workout_time: string;
  available_days: string[];
  diet_type: string;
}

// ===== 건강 솔루션 관련 타입 =====
export interface HealthSolution {
  id: string;
  user_id: string;
  week_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category?: string;
  created_at: string;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  nutrients?: Record<string, number>;
  created_at: string;
}

export interface SolutionWorkout {
  id: string;
  solution_id: string;
  exercise_id: string;
  workout_day: number;
  sets?: number;
  reps?: number;
  notes?: string;
}

export interface SolutionMeal {
  id: string;
  solution_id: string;
  meal_id: string;
  meal_day: number;
  meal_time?: string;
  portion_size?: number;
  notes?: string;
}

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

// ===== 채팅 관련 타입 =====
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  userId: string;
}

export interface ChatResponse {
  success: boolean;
  rspData?: string;
  message?: string;
}

// ===== 인증 관련 타입 =====
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
}

// ===== 공통 타입 =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface MealsByTime {
  [key: string]: SolutionMealWithMeal[];
}

export interface WorkoutData {
  day: string;
  exercise: string;
  sets: number;
  reps: number;
  description: string;
  category: string;
  originalId: string;
}

export interface MealData {
  day: string;
  time: string;
  meal: string;
  portion_size: number;
  description: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  originalId: string;
}

export interface UserSchedule {
  user_id: string;
  week_start_date: string;
  workouts: WorkoutData[];
  meals: MealData[];
}

// ===== 폼 관련 타입 =====
export interface ProfileFormData {
  gender: string;
  birth_date: string;
  goal: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  preferred_workout_time: string;
  available_days: string[];
  diet_type: string;
}

// ===== 옵션 타입 =====
export interface SelectOption {
  value: string;
  label: string;
}

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

export const ACTIVITY_LEVELS: SelectOption[] = [
  { value: "1-2", label: "주 1~2회 (가벼운 활동)" },
  { value: "3-4", label: "주 3~4회 (보통 활동)" },
  { value: "5+", label: "주 5회 이상 (활발한 활동)" },
];

export const DIET_GOALS: SelectOption[] = [
  { value: "체중감량", label: "체중감량" },
  { value: "근육증가", label: "근육증가" },
  { value: "건강유지", label: "건강유지" },
];