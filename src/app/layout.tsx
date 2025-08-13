import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingChat from "@/components/FloatingChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnulFit - 건강한 루틴",
  description: "바쁜 현대인의 스케줄에 맞춘 유연한 건강 루틴 제공 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}
