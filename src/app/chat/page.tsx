"use client";

import ChatMessageList from "@/components/chatMessageList";
import ChatTextarea from "@/components/chatTextarea";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { MessageCircle, ArrowLeft, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SQLResult {
  sql: string;
  svc: string;
  svcUrl: string;
  txid: string;
  errorYn: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (user && !error) {
          setUserId(user.email || "");
        } else {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/");
        return;
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-chat`,
        {
          messages: updatedMessages,
          userId: userId,
        }
      );

      if (response.data.success) {
        const aiText = response.data.rspData;

        // 상품코드 접두사 목록
        const productPrefixes = [
          "LZB",
          "LZP",
          "LPZ",
          "LRZ",
          "LDZ",
          "LQZ",
          "LOZ",
          "LSZ",
          "LIX",
          "LBX",
          "BSC",
          "LIO",
          "LIR",
          "LIB",
          "LZC",
        ];

        // 정규식: 접두사 + [숫자*] (최소 1개 이상)
        const regex = new RegExp(
          `\\b(${productPrefixes.join("|")})[0-9\\*]+\\b`,
          "gi"
        );

        const restoredText = aiText.replace(regex, (match: string) =>
          match.replace(/\*/g, "0")
        );

        setMessages([
          ...updatedMessages,
          { role: "assistant", content: restoredText },
        ]);
      } else {
        console.log(`서버에서 오류가 옵니다 ${response.data.message} `);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Unknown error occurred");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ 오류 발생: ${
            (err as any)?.response?.data?.message || (err as any).message
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/home")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">홈으로</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">AI 상담</h1>
                  <p className="text-sm text-gray-600">
                    건강한 루틴에 대해 AI와 상담해보세요
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Bot className="h-4 w-4" />
              <span>AI 상담사</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* 채팅 영역 */}
          <ChatMessageList
            messages={messages}
            loading={loading}
            chatEndRef={chatEndRef}
          />

          <div ref={chatEndRef} />

          {/* 입력 영역 */}
          <div className="mt-6">
            <ChatTextarea
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              loading={loading}
              onReset={() => {
                setMessages([]);
                setInput("");
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
