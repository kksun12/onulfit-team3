"use client";

interface ProfileData {
  gender: string;
  birth_date: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  preferred_workout_time: string;
  available_days: string[];
  diet_type: string;
}

interface ProfileViewProps {
  profile: ProfileData;
}

const ACTIVITY_LEVELS = [
  { value: "1-2", label: "주 1~2회 (가벼운 활동)" },
  { value: "3-4", label: "주 3~4회 (보통 활동)" },
  { value: "5+", label: "주 5회 이상 (활발한 활동)" },
];

export default function ProfileView({ profile }: ProfileViewProps) {
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
}