import { LogIn } from "lucide-react";

interface WelcomeSectionProps {
  isAuthenticated: boolean;
  userName: string;
  onLogin: () => void;
}

export default function WelcomeSection({
  isAuthenticated,
  userName,
  onLogin,
}: WelcomeSectionProps) {
  return (
    <>
      {/* 환영 메시지 */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          {isAuthenticated && userName ? `${userName}님, 안녕하세요! 👋` : "안녕하세요! 👋"}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          {isAuthenticated
            ? "오늘도 건강한 하루를 시작해보세요"
            : "로그인하고 건강한 루틴을 시작해보세요"}
        </p>
      </div>

      {/* 로그인하지 않은 경우 로그인 안내 */}
      {!isAuthenticated && (
        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-1">
                로그인이 필요합니다
              </h3>
              <p className="text-blue-600 mb-3">
                개인화된 건강 루틴을 이용하려면 로그인해주세요
              </p>
              <button
                onClick={onLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}