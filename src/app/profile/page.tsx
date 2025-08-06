"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];
const ACTIVITY_LEVELS = [
  { value: "1-2", label: "주 1~2회 (가벼운 활동)" },
  { value: "3-4", label: "주 3~4회 (보통 활동)" },
  { value: "5+", label: "주 5회 이상 (활발한 활동)" },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const [profile, setProfile] = useState({
    gender: "",
    birth_date: "",
    goal: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    preferred_workout_time: "",
    available_days: [] as string[],
    diet_type: "",
  });

  useEffect(() => {
    const fetchProfile = async (user: any) => {
      if (!user) {
        console.log("❌ fetchProfile: user is null/undefined");
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      console.log("✅ fetchProfile: user found", {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role,
      });

      try {
        // 현재 세션 확인
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("🔐 Current session:", {
          hasSession: !!session,
          sessionError: sessionError,
          accessToken: session?.access_token ? "present" : "missing",
        });

        // user_profiles 테이블에서 사용자 프로필 정보 가져오기
        // 먼저 테이블 존재 여부 확인을 위해 단순 조회 시도
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        console.log("📊 Profile query result:", {
          profileData,
          profileError,
          errorCode: profileError?.code,
          errorMessage: profileError?.message,
        });

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // 데이터가 없는 경우 - 정상적인 상황
            console.log("ℹ️ No profile data found, using empty profile");
          } else if (profileError.code === "42P01") {
            // 테이블이 존재하지 않는 경우
            console.warn(
              "⚠️ user_profiles table does not exist, using empty profile"
            );
          } else {
            // 기타 에러 (RLS, 권한 문제 등)
            console.error("❌ Profile fetch error:", profileError);
            console.log(
              "🔄 Continuing with empty profile due to database access issue"
            );
            // 에러가 있어도 빈 프로필로 계속 진행 (사용자가 정보를 입력할 수 있도록)
          }
          // 모든 경우에 빈 프로필로 초기화
          setProfile({
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
        } else if (profileData) {
          console.log("✅ Profile loaded successfully");
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
        } else {
          console.log("ℹ️ No profile data found, using empty profile");
          setProfile({
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
        }
      } catch (e) {
        console.error("❌ Profile fetch error:", e);
        console.log("🔄 Continuing with empty profile due to fetch error");
        // 네트워크 에러나 기타 문제가 있어도 빈 프로필로 계속 진행
        setProfile({
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
      } finally {
        setLoading(false);
      }
    };

    const checkAuthStatus = async () => {
      console.log("🔍 Starting auth status check...");
      setLoading(true);
      setError("");
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        console.log("🔐 Auth check result:", {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          authError: error,
        });

        if (user && !error) {
          await fetchProfile(user);
        } else {
          console.log("❌ No authenticated user found");
          setError("로그인이 필요합니다.");
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setError("인증 확인 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Supabase 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user);
        } else if (event === "SIGNED_OUT") {
          setError("로그인이 필요합니다.");
          setProfile({
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
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setError("인증 상태 변경 중 오류가 발생했습니다.");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      const fieldName = checkbox.name as keyof typeof profile;
      const fieldValue = checkbox.value;
      const isChecked = checkbox.checked;

      setProfile((prev) => {
        const currentArray = prev[fieldName] as string[];
        if (isChecked) {
          return { ...prev, [fieldName]: [...currentArray, fieldValue] };
        } else {
          return {
            ...prev,
            [fieldName]: currentArray.filter((item) => item !== fieldValue),
          };
        }
      });
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setError("로그인이 필요합니다.");
        setSaving(false);
        return;
      }

      // user_profiles 테이블에 프로필 정보 저장 (upsert)
      const { error: upsertError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || "",
            gender: profile.gender,
            birth_date: profile.birth_date,
            goal: profile.goal,
            height_cm: profile.height_cm,
            weight_kg: profile.weight_kg,
            activity_level: profile.activity_level,
            preferred_workout_time: profile.preferred_workout_time,
            available_days: profile.available_days,
            diet_type: profile.diet_type,
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (upsertError) {
        console.error("Profile save error:", upsertError);
        setError("저장에 실패했습니다: " + upsertError.message);
      } else {
        setSuccess("프로필이 저장되었습니다.");
        // 2초 후 홈 화면으로 이동
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (e) {
      console.error("Profile save error:", e);
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    
    setDeleting(true);
    setError("");
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("로그인이 필요합니다.");
        return;
      }

      // 프로필 데이터 삭제
      await supabase.from("user_profiles").delete().eq("id", user.id);
      
      // 로그아웃
      await supabase.auth.signOut();
      
      alert("회원탈퇴가 완료되었습니다.");
      router.push("/");
    } catch (e) {
      setError("회원탈퇴 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 로그인 안내 표시
  if (error === "로그인이 필요합니다.") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600">
              프로필 정보를 보고 수정하려면 로그인해주세요
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          프로필 정보 수정
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-pulse">
              ✅ {success} - 홈 화면으로 이동합니다...
            </div>
          )}

          {/* 성별 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              성별
            </label>
            <div className="flex space-x-4">
              {GENDER_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={profile.gender === opt.value}
                    onChange={handleChange}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-gray-700 text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              생년월일
            </label>
            <input
              type="date"
              name="birth_date"
              value={profile.birth_date}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          {/* 키 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              키 (cm)
            </label>
            <input
              type="number"
              name="height_cm"
              value={profile.height_cm}
              onChange={handleChange}
              min={0}
              step={0.1}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          {/* 몸무게 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              몸무게 (kg)
            </label>
            <input
              type="number"
              name="weight_kg"
              value={profile.weight_kg}
              onChange={handleChange}
              min={0}
              step={0.1}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          {/* 운동량 수준 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              운동량 수준
            </label>
            <select
              name="activity_level"
              value={profile.activity_level}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="">선택</option>
              {ACTIVITY_LEVELS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 선호 운동 시간 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              선호 운동 시간
            </label>
            <input
              type="text"
              name="preferred_workout_time"
              value={profile.preferred_workout_time}
              onChange={handleChange}
              placeholder="예: 오전 6시, 오후 7시 등"
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>

          {/* 요일 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              요일 선택
            </label>
            <div className="flex flex-wrap gap-3">
              {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="available_days"
                    value={day}
                    checked={profile.available_days.includes(day)}
                    onChange={handleChange}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-gray-700 text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 식단 유형 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              운동 목표
            </label>
            <select
              name="diet_type"
              value={profile.diet_type}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="">선택</option>
              <option value="체중감량">체중감량</option>
              <option value="근육증가">근육증가</option>
              <option value="건강유지">건강유지</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </form>
        
        {/* 회원탈퇴 버튼 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "탈퇴 처리 중..." : "회원탈퇴"}
          </button>
        </div>
      </div>
    </div>
  );
}
