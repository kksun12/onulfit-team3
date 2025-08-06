// components/chat/ChatMessageList.tsx
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

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

  // 메시지가 추가되거나 로딩 상태가 변경될 때 자동 스크롤
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

  // SQL인지 확인하는 함수
  const isSQL = (content: string) => {
    return (
      content.includes("SELECT") ||
      content.includes("INSERT") ||
      content.includes("UPDATE") ||
      content.includes("DELETE")
    );
  };

  // AI 응답을 마크다운으로 변환하는 함수
  const formatAIResponse = (content: string) => {
    // user 메시지의 SQL 쿼리인 경우 원본 그대로 반환
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

    // 테이블 설명이 포함된 경우 마크다운 형식으로 변환
    if (content.includes("테이블") && content.includes("조건")) {
      return (
        content
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
          // 숫자로 시작하는 패턴은 제외
          .replace(/([A-Z_]+)(?<!^1):/g, "**$1**:")
          // 테이블 설명을 리스트 형태로 변환
          .replace(/([A-Z_]+):\s*([^.\n]+)\./g, "**$1**: $2.\n  • ")
          // 일반적인 설명에 들여쓰기 추가
          .replace(/([A-Z_]+):\s*([^.\n]+)/g, "**$1**: $2\n  ")
      );
    }

    // 일반적인 AI 응답에 대한 기본 마크다운 변환
    return (
      content
        // 테이블명을 볼드체로
        .replace(/([A-Z_]+):/g, "**$1**:")
        // 요약 부분을 제목으로
        .replace(/\[요약\]/g, "\n### 요약")
        .replace(/요약:/g, "\n### 요약:")
        // 조건, 칼럼형코드 등을 제목으로
        .replace(/조건:/g, "\n### 조건:")
        .replace(/칼럼형코드:/g, "\n### 칼럼형코드:")
        .replace(/테이블 설명:/g, "\n### 테이블 설명:")
        .replace(/컬럼 설명:/g, "\n### 컬럼 설명:")
        .replace(/상품 코드 설명:/g, "\n### 상품 코드 설명:")
        // 줄바꿈을 적절히 추가
        .replace(/([A-Z_]+):\s*([^.\n]+)\./g, "**$1**: $2.\n")
    );
  };

  return (
    <div className="h-[32rem] overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3 shadow-inner relative">
      {/* 오른쪽 연한 보라색 구분선 */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-purple-200 opacity-60"></div>

      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`relative flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          } my-2`}
        >
          <div
            className={`
              max-w-3xl w-full rounded-2xl shadow-md border
              ${
                msg.role === "user"
                  ? "bg-blue-50 border-blue-200 text-blue-900"
                  : "bg-white border-purple-200 text-gray-800"
              }
              px-5 py-4
              transition
            `}
          >
            {msg.role === "assistant" && (
              <div className="flex items-center mb-2 text-purple-500 text-xs font-semibold">
                <span className="mr-1">🤖</span>AI 답변
              </div>
            )}
            <div className="prose prose-xs max-w-none leading-relaxed">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    if (!inline && match) {
                      const codeString = Array.isArray(children)
                        ? children.join("")
                        : String(children);
                      const isAssistant = msg.role === "assistant";
                      return (
                        <div className="relative group">
                          <div
                            className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-mono text-black leading-relaxed shadow-sm"
                            style={{
                              fontSize: "10px",
                              fontWeight: "400",
                              lineHeight: "1.6",
                            }}
                          >
                            <pre className="whitespace-pre-wrap break-words m-0">
                              {codeString}
                            </pre>
                          </div>
                          {isAssistant && (
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded shadow transition-opacity opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                                setCopiedCodeIdx(idx);
                                setTimeout(() => setCopiedCodeIdx(null), 1000);
                              }}
                            >
                              {copiedCodeIdx === idx ? "복사됨!" : "복사"}
                            </button>
                          )}
                        </div>
                      );
                    }
                    // 인라인 코드
                    return (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-900 font-medium"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-sm font-bold text-purple-700 mt-3 mb-1 border-b border-purple-100 pb-1">
                        {children}
                      </h3>
                    );
                  },
                  p({ children }) {
                    return (
                      <p className="mb-1 text-gray-800 leading-relaxed text-xs whitespace-pre-wrap">
                        {children}
                      </p>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside mb-1 space-y-0.5 text-gray-800 text-xs">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside mb-1 space-y-0.5 text-gray-800 text-xs">
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return (
                      <li className="text-gray-800 leading-relaxed text-xs">
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
                      <blockquote className="border-l-4 border-purple-300 pl-3 py-1 bg-purple-50 text-gray-700 italic my-2 rounded-r-lg text-xs">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {formatAIResponse(msg.content)}
              </ReactMarkdown>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(msg.content, idx)}
              className={`absolute top-2 right-2 text-xs px-2 py-1 rounded transition
                ${
                  msg.role === "user"
                    ? "bg-blue-200 hover:bg-blue-300 text-blue-700"
                    : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                }`}
              title="클립보드 복사"
            >
              {copiedIdx === idx ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg shadow-sm">
            <div className="text-blue-500 animate-pulse flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="ml-2 text-sm">🤖 응답 중...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
