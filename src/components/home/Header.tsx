import { Activity, User, Utensils, LogOut, LogIn } from "lucide-react";

interface HeaderProps {
  currentTime: Date;
  isAuthenticated: boolean;
  userName: string;
  onLogin: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onDiet: () => void;
}

export default function Header({
  currentTime,
  isAuthenticated,
  userName,
  onLogin,
  onLogout,
  onSettings,
  onDiet,
}: HeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-4 text-2xl font-bold text-gray-800">OnulFit</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 font-medium">
                {formatDate(currentTime)}
              </div>
              <div className="text-xl font-bold text-gray-800">
                {formatTime(currentTime)}
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userName}
                </span>
              </div>
            )}

            <button
              onClick={onSettings}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">프로필</span>
            </button>

            <button
              onClick={onDiet}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <Utensils className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">식단관리</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}