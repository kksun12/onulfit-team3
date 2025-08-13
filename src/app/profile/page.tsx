"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/home/Header";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'delete'>('view');
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
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
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
        console.error("❌ Profile fetch error:", e);
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
      setLoading(true);
      setError("");
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user && !error) {
          setUserName(user.user_metadata?.name || user.email || "");
          await fetchProfile(user);
        } else {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_IN" && session?.user) {
          setUserName(session.user.user_metadata?.name || session.user.email || "");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("로그인이 필요합니다.");
        setSaving(false);
        return;
      }

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
          { onConflict: "id" }
        );

      if (upsertError) {
        setError("저장에 실패했습니다: " + upsertError.message);
      } else {
        setSuccess("프로필이 저장되었습니다.");
        
        // 솔루션 생성 API 호출
        try {
          const solutionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-insert`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.email }),
            }
          );
          
          if (solutionResponse.ok) {
            console.log('솔루션 생성 요청 성공');
          }
        } catch (solutionError) {
          console.error('솔루션 생성 오류:', solutionError);
        }
        
        setActiveTab('view');
      }
    } catch (e) {
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

      await supabase.from("user_profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      
      alert("회원탈퇴가 완료되었습니다.");
      router.push("/");
    } catch (e) {
      setError("회원탈퇴 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const renderProfileView = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">성별</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
              {profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '미설정'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">생년월일</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
              {profile.birth_date || '미설정'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">키 (cm)</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
              {profile.height_cm || '미설정'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">몸무게 (kg)</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
              {profile.weight_kg || '미설정'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">운동량 수준</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
              {ACTIVITY_LEVELS.find(level => level.value === profile.activity_level)?.label || '미설정'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">선호 운동 시간</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
              {profile.preferred_workout_time || '미설정'}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">운동 가능한 요일</label>
          <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
            {profile.available_days.length > 0 ? profile.available_days.join(', ') : '미설정'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">운동 목표</label>
          <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
            {profile.diet_type || '미설정'}
          </div>
        </div>
      </div>
    );
  };

  const renderProfileEdit = () => {
    return (
      <form className="space-y-8" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">성별</label>
            <div className="flex space-x-6">
              {GENDER_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={profile.gender === opt.value}
                    onChange={handleChange}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">생년월일</label>
            <input
              type="date"
              name="birth_date"
              value={profile.birth_date}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">키 (cm)</label>
            <input
              type="number"
              name="height_cm"
              value={profile.height_cm}
              onChange={handleChange}
              min={0}
              step={0.1}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">몸무게 (kg)</label>
            <input
              type="number"
              name="weight_kg"
              value={profile.weight_kg}
              onChange={handleChange}
              min={0}
              step={0.1}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">운동량 수준</label>
            <select
              name="activity_level"
              value={profile.activity_level}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">선택</option>
              {ACTIVITY_LEVELS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">선호 운동 시간</label>
            <input
              type="text"
              name="preferred_workout_time"
              value={profile.preferred_workout_time}
              onChange={handleChange}
              placeholder="예: 오전 6시, 오후 7시 등"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">운동 가능한 요일</label>
          <div className="grid grid-cols-7 gap-4">
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
              <label key={day} className="flex flex-col items-center space-y-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="available_days"
                  value={day}
                  checked={profile.available_days.includes(day)}
                  onChange={handleChange}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-gray-700 text-sm font-medium">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">운동 목표</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "체중감량", label: "체중감량" },
              { value: "근육증가", label: "근육증가" },
              { value: "건강유지", label: "건강유지" }
            ].map((goal) => (
              <label key={goal.value} className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                profile.diet_type === goal.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}>
                <input
                  type="radio"
                  name="diet_type"
                  value={goal.value}
                  checked={profile.diet_type === goal.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium">{goal.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </form>
    );
  };

  const renderDeleteAccount = () => {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ 주의사항</h3>
          <ul className="text-red-700 space-y-2 text-sm">
            <li>• 회원탈퇴 시 모든 개인 데이터가 영구적으로 삭제됩니다.</li>
            <li>• 운동 기록, 식단 정보, 프로필 등 모든 정보가 사라집니다.</li>
            <li>• 이 작업은 되돌릴 수 없습니다.</li>
            <li>• 동일한 이메일로 재가입이 가능합니다.</li>
          </ul>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              회원탈퇴를 진행하려면 아래에 "탈퇴"를 입력해주세요.
            </label>
            <input
              type="text"
              placeholder="탈퇴"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700"
              onChange={(e) => {
                const confirmButton = document.getElementById('confirm-delete') as HTMLButtonElement;
                if (confirmButton) {
                  confirmButton.disabled = e.target.value !== '탈퇴';
                }
              }}
            />
          </div>
          
          <div className="flex justify-start space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              id="confirm-delete"
              type="button"
              onClick={handleDeleteAccount}
              disabled={true}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "탈퇴 처리 중..." : "회원탈퇴 확인"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleLogin = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    // 이미 프로필 페이지에 있으므로 아무것도 하지 않음
  };

  const handleDiet = () => {
    router.push("/diet");
  };

  const handleHome = () => {
    router.push("/home");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        currentTime={currentTime}
        isAuthenticated={!error}
        userName={userName}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onDiet={handleDiet}
        onHome={handleHome}
      />
      
      <main className="w-full px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8">
            {/* 사이드 메뉴 */}
            <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">프로필 메뉴</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'view'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  프로필 보기
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'edit'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  정보 수정
                </button>
                <button
                  onClick={() => setActiveTab('delete')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'delete'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  회원 탈퇴
                </button>
              </nav>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {activeTab === 'view' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    프로필 정보
                  </h2>
                  {renderProfileView()}
                </div>
              )}
              
              {activeTab === 'edit' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    프로필 정보 수정
                  </h2>
                  {renderProfileEdit()}
                </div>
              )}
              
              {activeTab === 'delete' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    회원 탈퇴
                  </h2>
                  {renderDeleteAccount()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}