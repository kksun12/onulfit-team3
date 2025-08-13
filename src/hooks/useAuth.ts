import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LoginCredentials, SignupData } from "@/types";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        setError(error.message);
        return false;
      } else {
        router.push("/home");
        return true;
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData: SignupData) => {
    setIsLoading(true);
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return false;
    }

    if (signupData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setIsLoading(false);
      return false;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            phone: signupData.phone,
          },
        },
      });

      if (error) {
        setError(error.message);
        return false;
      } else {
        alert("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
        router.push("/");
        return true;
      }
    } catch {
      setError("회원가입 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const oAuthLogin = async (provider: "google" | "discord") => {
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined" 
            ? window.location.origin + "/home" 
            : undefined,
        },
      });
      
      if (error) {
        setError(error.message);
        return false;
      }
      return true;
    } catch (e) {
      setError("소셜 로그인 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    oAuthLogin,
    isLoading,
    error,
  };
};