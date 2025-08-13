// components/chat/ChatInputBox.tsx
import { useRef, useEffect } from "react";

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

  // SQL이 들어오면 자동으로 크기 조정
  useEffect(() => {
    if (textareaRef.current && input.includes("SELECT")) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 300) + "px";
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // 오토 리사이즈
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
      textareaRef.current.style.height = newHeight + "px";
    }
  };

  // SQL인지 확인하는 함수
  const isSQL =
    input.includes("SELECT") ||
    input.includes("INSERT") ||
    input.includes("UPDATE") ||
    input.includes("DELETE");

  return (
    <form onSubmit={handleSend} className="flex flex-col space-y-1">
      <div className="flex space-x-2 items-end">
        <textarea
          ref={textareaRef}
          className={`flex-1 border border-gray-300 rounded px-2 py-1 bg-white shadow-sm resize-none min-h-[2rem] text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            isSQL ? "max-h-80 font-mono text-xs" : "max-h-40"
          }`}
          placeholder="메시지를 입력하세요"
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
        <div className="flex flex-col space-y-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded shadow text-xs font-medium transition-colors"
          >
            전송
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full px-2 py-0.5 rounded bg-gray-200 hover:bg-red-400 hover:text-white text-gray-700 text-xs font-semibold shadow transition-colors"
          >
            대화 초기화
          </button>
        </div>
      </div>
    </form>
  );
}
