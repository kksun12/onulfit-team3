"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Activity, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        alert("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
        router.push("/");
      }
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        {/* 로고/헤더 */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-3">OnulFit</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            건강한 루틴으로 더 나은 하루를 시작하세요
          </p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {/* 회원가입 폼 */}
          <form className="space-y-6" onSubmit={handleSignup}>
            {/* 이름 */}
            <InputField
              id="name"
              name="name"
              label="이름"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleInputChange}
              icon={<User className="h-5 w-5 text-gray-400" />}
              required
            />

            {/* 이메일 */}
            <InputField
              id="email"
              name="email"
              type="email"
              label="이메일"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              required
            />

            {/* 전화번호 */}
            <InputField
              id="phone"
              name="phone"
              type="tel"
              label="전화번호"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={handleInputChange}
              icon={<Phone className="h-5 w-5 text-gray-400" />}
            />

            {/* 비밀번호 */}
            <PasswordField
              id="password"
              name="password"
              label="비밀번호"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              required
            />

            {/* 비밀번호 확인 */}
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              required
            />

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                "회원가입"
              )}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <a
                  href="/"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  로그인
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* 공통 Input 컴포넌트 */
function InputField({
  id,
  name,
  label,
  placeholder,
  icon,
  type = "text",
  value,
  onChange,
  required,
}: any) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-3"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

/* 비밀번호 Input 컴포넌트 */
function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  show,
  toggle,
  required,
}: any) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-3"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200"
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
          onClick={toggle}
        >
          {show ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
