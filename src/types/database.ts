// 이 파일은 더 이상 사용되지 않습니다.
// 모든 타입은 src/types/index.ts에서 관리됩니다.
export * from "./index";

export interface Database {
  public: {
    Tables: {
      // ... existing tables ...

      // 완료 상태 테이블들
      workout_completions: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_id?: string;
          completed_at?: string;
          created_at?: string;
        };
      };

      meal_completions: {
        Row: {
          id: string;
          user_id: string;
          meal_id: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_id: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_id?: string;
          completed_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
