"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        // user_profiles 테이블에서 사용자 프로필 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116는 데이터가 없는 경우
          console.error("Profile fetch error:", profileError);
          setError("프로필 정보를 불러오지 못했습니다.");
        } else if (profileData) {
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
      } catch (e) {
        console.error("Profile fetch error:", e);
        setError("프로필 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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
      </div>
    </div>
  );
}
