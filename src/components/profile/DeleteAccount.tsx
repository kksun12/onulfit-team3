"use client";

import { Trash2 } from "lucide-react";

interface DeleteAccountProps {
  onDelete: () => Promise<void>;
  onCancel: () => void;
  deleting: boolean;
}

export default function DeleteAccount({ onDelete, onCancel, deleting }: DeleteAccountProps) {
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
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            id="confirm-delete"
            type="button"
            onClick={onDelete}
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
}