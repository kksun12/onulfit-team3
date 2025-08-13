"use client";

import { ProfileFormData, GENDER_OPTIONS, ACTIVITY_LEVELS, DIET_GOALS } from "@/types";

interface ProfileEditProps {
  profile: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string;
  success: string;
}

export default function ProfileEdit({ 
  profile, 
  onChange, 
  onSubmit, 
  onCancel, 
  saving, 
  error, 
  success 
}: ProfileEditProps) {
  return (
    <form className="space-y-8" onSubmit={onSubmit}>
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
                  onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
                onChange={onChange}
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
          {DIET_GOALS.map((goal) => (
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
                onChange={onChange}
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
          onClick={onCancel}
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
}