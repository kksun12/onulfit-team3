"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks";
import Header from "@/components/home/Header";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEdit from "@/components/profile/ProfileEdit";
import DeleteAccount from "@/components/profile/DeleteAccount";



export default function ProfilePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'delete'>('view');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  
  const {
    profile,
    setProfile,
    isLoading: loading,
    isSaving: saving,
    error,
    success,
    setError,
    setSuccess,
    updateProfile,
    deleteAccount,
  } = useProfile();

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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const success = await updateProfile(profile, user.id);
      if (success) {
        setActiveTab('view');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    
    setDeleting(true);
    const success = await deleteAccount();
    
    if (success) {
      alert("회원탈퇴가 완료되었습니다.");
      router.push("/");
    }
    
    setDeleting(false);
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
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {activeTab === 'view' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    프로필 정보
                  </h2>
                  <ProfileView profile={profile} />
                </div>
              )}
              
              {activeTab === 'edit' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    프로필 정보 수정
                  </h2>
                  <ProfileEdit 
                    profile={profile}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => setActiveTab('view')}
                    saving={saving}
                    error={error}
                    success={success}
                  />
                </div>
              )}
              
              {activeTab === 'delete' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    회원 탈퇴
                  </h2>
                  <DeleteAccount 
                    onDelete={handleDeleteAccount}
                    onCancel={() => setActiveTab('view')}
                    deleting={deleting}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}