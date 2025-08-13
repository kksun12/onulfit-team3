import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChatMessage, ChatRequest, ChatResponse } from "@/types";

export const useChat = (userId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input;
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post<ChatResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-chat`,
        {
          messages: updatedMessages,
          userId,
        } as ChatRequest
      );

      if (response.data.success && response.data.rspData) {
        const aiText = response.data.rspData;

        // 상품코드 처리 로직
        const productPrefixes = [
          "LZB", "LZP", "LPZ", "LRZ", "LDZ", "LQZ", "LOZ", "LSZ",
          "LIX", "LBX", "BSC", "LIO", "LIR", "LIB", "LZC",
        ];

        const regex = new RegExp(
          `\\b(${productPrefixes.join("|")})[0-9\\*]+\\b`,
          "gi"
        );

        const restoredText = aiText.replace(regex, (match) =>
          match.replace(/\*/g, "0")
        );

        setMessages([
          ...updatedMessages,
          { role: "assistant", content: restoredText },
        ]);
      } else {
        throw new Error(response.data.message || "서버에서 오류가 발생했습니다.");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "알 수 없는 오류가 발생했습니다.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ 오류 발생: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    chatEndRef,
    sendMessage,
    resetChat,
  };
};