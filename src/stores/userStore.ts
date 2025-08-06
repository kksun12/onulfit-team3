import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface UserState {
  user: any;
  userEmail: string;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  userEmail: "",
  isLoading: false,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user && !error) {
        set({
          user,
          userEmail: user.email || "",
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ isLoading: false });
    }
  },

  clearUser: () => {
    set({ user: null, userEmail: "" });
  },
}));
