import { useRef, useEffect } from "react";
import { Send, RotateCcw, MessageCircle } from "lucide-react";

interface Props {
  input: string;
  setInput: (val: string) => void;
  handleSend: (e?: React.FormEvent) => void;
  loading: boolean;
  onReset: () => void;
}

export default function ChatTextarea({
  input,
  setInput,
  handleSend,
  loading,
  onReset,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && input.includes("SELECT")) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 300) + "px";
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
      textareaRef.current.style.height = newHeight + "px";
    }
  };

  const isSQL =
    input.includes("SELECT") ||
    input.includes("INSERT") ||
    input.includes("UPDATE") ||
    input.includes("DELETE");

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={`w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 bg-white shadow-sm resize-none min-h-[3rem] text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            isSQL ? "max-h-80 font-mono text-xs" : "max-h-40"
          }`}
          placeholder="운동, 식단, 건강에 대한 질문을 자유롭게 해보세요..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={isSQL ? 8 : 3}
          style={{
            overflow: isSQL ? "auto" : "hidden",
            lineHeight: isSQL ? "1.4" : "1.2",
          }}
        />

        {/* 입력 아이콘 */}
        <div className="absolute top-3 left-3 text-gray-400">
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 text-sm font-medium shadow-sm transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          <span>대화 초기화</span>
        </button>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>{loading ? "전송 중..." : "전송"}</span>
        </button>
      </div>
    </form>
  );
}
