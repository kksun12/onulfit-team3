"use client";

export default function DietTips() {
  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 식단 관리 팁</h3>
      <div className="space-y-2 text-blue-700">
        <p>• 규칙적인 식사 시간을 지켜주세요</p>
        <p>• 충분한 수분 섭취를 잊지 마세요</p>
        <p>• 식사 전후 30분 정도의 가벼운 운동을 권장합니다</p>
        <p>• 개인 상황에 맞게 재료를 조절하세요</p>
      </div>
    </div>
  );
}