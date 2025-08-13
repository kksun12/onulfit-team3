"use client";

interface ProfileSidebarProps {
  activeTab: 'view' | 'edit' | 'delete';
  onTabChange: (tab: 'view' | 'edit' | 'delete') => void;
}

export default function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
  return (
    <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">프로필 메뉴</h3>
      <nav className="space-y-2">
        <button
          onClick={() => onTabChange('view')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'view'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          프로필 보기
        </button>
        <button
          onClick={() => onTabChange('edit')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'edit'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          정보 수정
        </button>
        <button
          onClick={() => onTabChange('delete')}
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
  );
}