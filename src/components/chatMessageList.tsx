import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessageList({
  messages,
  loading,
  chatEndRef,
}: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading, chatEndRef]);

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1000);
  };

  const isSQL = (content: string) => {
    return (
      content.includes("SELECT") ||
      content.includes("INSERT") ||
      content.includes("UPDATE") ||
      content.includes("DELETE")
    );
  };

  const formatAIResponse = (content: string) => {
    if (
      content.trim().startsWith("SELECT") ||
      content.trim().startsWith("INSERT") ||
      content.trim().startsWith("UPDATE") ||
      content.trim().startsWith("DELETE") ||
      content.trim().startsWith("```sql") ||
      content.trim().startsWith("```")
    ) {
      return content;
    }

    if (content.includes("테이블") && content.includes("조건")) {
      return content
        .replace(/([A-Za-z_]+) \(([^)]+)\):/g, "**$1** ($2):")
        .replace(/조건:/g, "\n### 조건:")
        .replace(/주요 출력 컬럼:/g, "\n### 주요 출력 컬럼:")
        .replace(/칼럼형코드:/g, "\n### 칼럼형코드:")
        .replace(/테이블 설명:/g, "\n### 테이블 설명:")
        .replace(/컬럼 설명:/g, "\n### 컬럼 설명:")
        .replace(/상품 코드 설명:/g, "\n### 상품 코드 설명:")
        .replace(/요약:/g, "\n### 요약:")
        .replace(/\[요약\]/g, "\n### 요약")
        .replace(/(\d{4}년 \d{1,2}월 \d{1,2}일)/g, "**$1**")
        .replace(/([A-Z_]+) 값이/g, "`$1` 값이")
        .replace(/([A-Z_]+)는/g, "`$1`는")
        .replace(/([A-Z_]+) 및 ([A-Z_]+)/g, "`$1` 및 `$2`")
        .replace(/([A-Z_]+)(?<!^1):/g, "**$1**:")
        .replace(/([A-Z_]+):\s*([^.\n]+)\./g, "**$1**: $2.\n  • ")
        .replace(/([A-Z_]+):\s*([^.\n]+)/g, "**$1**: $2\n  ");
    }

    return content
      .replace(/([A-Z_]+):/g, "**$1**:")
      .replace(/\[요약\]/g, "\n### 요약")
      .replace(/요약:/g, "\n### 요약:")
      .replace(/조건:/g, "\n### 조건:")
      .replace(/칼럼형코드:/g, "\n### 칼럼형코드:")
      .replace(/테이블 설명:/g, "\n### 테이블 설명:")
      .replace(/컬럼 설명:/g, "\n### 컬럼 설명:")
      .replace(/상품 코드 설명:/g, "\n### 상품 코드 설명:")
      .replace(/([A-Z_]+):\s*([^.\n]+)\./g, "**$1**: $2.\n");
  };

  return (
    <div className="h-[32rem] overflow-y-auto bg-gray-50/50 rounded-xl p-4 space-y-4 relative">
      {messages.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            AI 상담사와 대화를 시작해보세요
          </h3>
          <p className="text-gray-500 text-sm">
            운동, 식단, 건강에 대한 질문을 자유롭게 해보세요
          </p>
        </div>
      )}

      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`relative flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`
              max-w-3xl w-full rounded-2xl shadow-md border-2 transition-all duration-200
              ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white"
                  : "bg-white border-purple-200 text-gray-800 hover:shadow-lg"
              }
              px-6 py-4
            `}
          >
            {/* 메시지 헤더 */}
            <div
              className={`flex items-center mb-3 ${
                msg.role === "user" ? "text-blue-100" : "text-purple-600"
              }`}
            >
              {msg.role === "user" ? (
                <>
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">나</span>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">AI 상담사</span>
                </>
              )}
            </div>

            {/* 메시지 내용 */}
            <div className="prose prose-sm max-w-none leading-relaxed">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match) {
                      const codeString = Array.isArray(children)
                        ? children.join("")
                        : String(children);
                      return (
                        <div className="relative group">
                          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs font-mono text-black leading-relaxed shadow-sm">
                            <pre className="whitespace-pre-wrap break-words m-0">
                              {codeString}
                            </pre>
                          </div>
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded shadow transition-opacity opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              navigator.clipboard.writeText(codeString);
                              setCopiedCodeIdx(idx);
                              setTimeout(() => setCopiedCodeIdx(null), 1000);
                            }}
                          >
                            {copiedCodeIdx === idx ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              "복사"
                            )}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-900 font-medium">
                        {children}
                      </code>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-sm font-bold text-purple-700 mt-3 mb-2 border-b border-purple-100 pb-1">
                        {children}
                      </h3>
                    );
                  },
                  p({ children }) {
                    return (
                      <p className="mb-2 text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                        {children}
                      </p>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside mb-2 space-y-1 text-gray-800 text-sm">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-800 text-sm">
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return (
                      <li className="text-gray-800 leading-relaxed text-sm">
                        {children}
                      </li>
                    );
                  },
                  strong({ children }) {
                    return (
                      <strong className="font-semibold text-purple-700">
                        {children}
                      </strong>
                    );
                  },
                  em({ children }) {
                    return (
                      <em className="italic text-purple-600">{children}</em>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-purple-300 pl-3 py-2 bg-purple-50 text-gray-700 italic my-2 rounded-r-lg text-sm">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {formatAIResponse(msg.content)}
              </ReactMarkdown>
            </div>

            {/* 복사 버튼 */}
            <button
              type="button"
              onClick={() => handleCopy(msg.content, idx)}
              className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full transition-all duration-200
                ${
                  msg.role === "user"
                    ? "bg-blue-400/20 hover:bg-blue-400/30 text-blue-100"
                    : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                }`}
              title="클립보드 복사"
            >
              {copiedIdx === idx ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      ))}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 px-6 py-4 rounded-2xl shadow-md">
            <div className="text-blue-600 animate-pulse flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                🤖 AI가 응답을 준비하고 있습니다...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
