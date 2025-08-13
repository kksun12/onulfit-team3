"use client";

import { useState, useEffect } from "react";

export default function ClientTime() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentTime) {
    return <span>--:--:--</span>;
  }

  return <span>{currentTime.toLocaleTimeString("ko-KR")}</span>;
}