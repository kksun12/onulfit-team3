"use client";

import ChatMessageList from "@/components/chatMessageList";
import ChatTextarea from "@/components/chatTextarea";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
        const { data: { user }, error } = await supabase.auth.getUser();
        
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
    console.log("=============");

    try {
      console.log(userId);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-chat`,
        {
          messages: updatedMessages,
          userId: userId,
        }
      );
      console.log("---------------------");
      console.log(response.data);

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

        console.log(restoredText);

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

  // 카테고리 변경 시 시간 리셋 함수

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-5 space-y-5 text-gray-800">
      <h1 className="text-base font-bold text-blue-600">💬 LLM 대화창</h1>

      <ChatMessageList
        messages={messages}
        loading={loading}
        chatEndRef={chatEndRef}
      />

      <div ref={chatEndRef} />

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
    </main>
  );
}
