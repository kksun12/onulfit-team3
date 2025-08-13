import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile, ProfileFormData } from "@/types";

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<ProfileFormData>({
    gender: "",
    birth_date: "",
    goal: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    preferred_workout_time: "",
    available_days: [],
    diet_type: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async (id: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (profileData) {
        setProfile({
          gender: profileData.gender || "",
          birth_date: profileData.birth_date || "",
          goal: profileData.goal || "",
          height_cm: profileData.height_cm || "",
          weight_kg: profileData.weight_kg || "",
          activity_level: profileData.activity_level || "",
          preferred_workout_time: profileData.preferred_workout_time || "",
          available_days: profileData.available_days || [],
          diet_type: profileData.diet_type || "",
        });
      }
    } catch (err) {
      setError("프로필을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileFormData, currentUserId: string) => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("로그인이 필요합니다.");
      }

      const { error: upsertError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || "",
            ...profileData,
            last_updated: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        throw upsertError;
      }

      setSuccess("프로필이 저장되었습니다.");
      return true;
    } catch (err: any) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("로그인이 필요합니다.");
      }

      await supabase.from("user_profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      
      return true;
    } catch (err: any) {
      setError(err.message || "회원탈퇴 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  return {
    profile,
    setProfile,
    isLoading,
    isSaving,
    error,
    success,
    setError,
    setSuccess,
    fetchProfile,
    updateProfile,
    deleteAccount,
  };
};