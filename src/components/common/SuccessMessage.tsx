"use client";

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className = "" }: SuccessMessageProps) {
  return (
    <div className={`bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm ${className}`}>
      ✅ {message}
    </div>
  );
}