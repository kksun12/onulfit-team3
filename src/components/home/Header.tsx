import { Activity, User, Utensils, LogOut, LogIn } from "lucide-react";

interface HeaderProps {
  currentTime: Date;
  isAuthenticated: boolean;
  userName: string;
  onLogin: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onDiet: () => void;
  onHome?: () => void;
}

export default function Header({
  currentTime,
  isAuthenticated,
  userName,
  onLogin,
  onLogout,
  onSettings,
  onDiet,
  onHome,
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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button 
              onClick={onHome}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-800">OnulFit</h1>
            </button>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={onSettings}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">프로필</span>
              </button>
              
              <button
                onClick={onDiet}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Utensils className="h-4 w-4" />
                <span className="text-sm font-medium">식단관리</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {formatDate(currentTime)}
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {formatTime(currentTime)}
              </div>
            </div>

            {isAuthenticated && userName && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userName}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}