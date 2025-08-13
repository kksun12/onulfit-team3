"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, RotateCcw } from "lucide-react";
import ChatMessageList from "./chatMessageList";
import axios from "axios";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.email || "");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    checkAuth();
  }, []);

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
        const productPrefixes = [
          "LZB", "LZP", "LPZ", "LRZ", "LDZ", "LQZ", "LOZ", "LSZ", 
          "LIX", "LBX", "BSC", "LIO", "LIR", "LIB", "LZC"
        ];
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
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ 오류 발생: ${err?.response?.data?.message || err.message}`,
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

  if (!isAuthenticated) return null;

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 ${
          isOpen ? "hidden" : ""
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* 채팅 패널 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 채팅 위젯 */}
          <div className="fixed right-6 bottom-6 w-96 h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col md:w-96 md:h-[600px]">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">AI 상담</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 채팅 영역 */}
            <div className="flex-1 overflow-hidden">
              <ChatMessageList
                messages={messages}
                loading={loading}
                chatEndRef={chatEndRef}
              />
              <div ref={chatEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleSend} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setInput("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="대화 초기화"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}