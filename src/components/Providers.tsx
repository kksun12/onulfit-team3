"use client";

import FloatingChat from '@/components/FloatingChat';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingChat />
    </>
  );
}