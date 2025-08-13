import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AppUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    phone?: string;
  };
}

interface UserProfile {
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

interface UserState {
  user: AppUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  clearUser: () => void;
  initializeAuthListener: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true, // 초기값을 true로 설정
  isAuthenticated: false,

  initializeAuthListener: () => {
    // Supabase 인증 상태 변화를 실시간으로 감지
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email);
        const appUser: AppUser = {
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: session.user.user_metadata,
        };
        set({
          user: appUser,
          isAuthenticated: true,
          isLoading: false,
        });
        // 사용자 프로필도 함께 가져오기
        await get().fetchUserProfile();
      } else if (event === "SIGNED_OUT") {
        console.log("❌ User signed out");
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed for user:", session.user.email);
        const appUser: AppUser = {
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: session.user.user_metadata,
        };
        set({
          user: appUser,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    });

    // 초기 세션 상태 확인
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session?.user && !error) {
          console.log("✅ Initial session found:", session.user.email);
          const appUser: AppUser = {
            id: session.user.id,
            email: session.user.email || "",
            user_metadata: session.user.user_metadata,
          };
          set({
            user: appUser,
            isAuthenticated: true,
            isLoading: false,
          });
          // 사용자 프로필도 함께 가져오기
          await get().fetchUserProfile();
        } else {
          console.log("❌ No initial session found");
          set({
            user: null,
            userProfile: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // 초기 세션 확인 실행
    checkInitialSession();
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        console.log("✅ User fetched:", user.email);
        const appUser: AppUser = {
          id: user.id,
          email: user.email || "",
          user_metadata: user.user_metadata,
        };
        set({
          user: appUser,
          isAuthenticated: true,
          isLoading: false,
        });
        // 사용자 프로필도 함께 가져오기
        await get().fetchUserProfile();
      } else {
        console.log("❌ No user found or error:", error);
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  fetchUserProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: profileData, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
        // 에러가 있어도 빈 프로필로 설정
        set({
          userProfile: {
            id: user.id,
            gender: "",
            birth_date: "",
            goal: "",
            height_cm: "",
            weight_kg: "",
            activity_level: "",
            preferred_workout_time: "",
            available_days: [],
            diet_type: "",
          },
        });
      } else if (profileData) {
        set({ userProfile: profileData });
      } else {
        // 프로필이 없는 경우 빈 프로필로 설정
        set({
          userProfile: {
            id: user.id,
            gender: "",
            birth_date: "",
            goal: "",
            height_cm: "",
            weight_kg: "",
            activity_level: "",
            preferred_workout_time: "",
            available_days: [],
            diet_type: "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // 에러가 있어도 빈 프로필로 설정
      set({
        userProfile: {
          id: user.id,
          gender: "",
          birth_date: "",
          goal: "",
          height_cm: "",
          weight_kg: "",
          activity_level: "",
          preferred_workout_time: "",
          available_days: [],
          diet_type: "",
        },
      });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearUser: () => {
    set({
      user: null,
      userProfile: null,
      isAuthenticated: false,
    });
  },
}));
