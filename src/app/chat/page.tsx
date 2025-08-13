"use client";

import ChatMessageList from "@/components/chatMessageList";
import ChatTextarea from "@/components/chatTextarea";
import ChatHeader from "@/components/chat/ChatHeader";
import { useChat } from "@/hooks";

export default function ChatPage() {
  const userId = 'hosin2004@gmail.com';
  const {
    messages,
    input,
    setInput,
    isLoading,
    chatEndRef,
    sendMessage,
    resetChat,
  } = useChat(userId);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendMessage();
  };

  return (
    <main className="max-w-6xl mx-auto p-5 space-y-5 text-gray-800">
      <ChatHeader />


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
        loading={isLoading}
        onReset={resetChat}
      />
    </main>
  );
}
