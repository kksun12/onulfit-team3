"use client";

import { useState } from "react";
import axios from "axios";

export default function DietHealthInsert() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-insert`,
        { userId } // 서버에서 @RequestBody String userId 로 받음
      );

    if (res.data.success){
        setResult(res.data.rspData); 
    }else{
        setResult(res.data.message)
    }
     console.log(res.data)

    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white dark:bg-gray-900 rounded-md shadow-md">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Diet Health Insert</h1>

      <input
        type="text"
        placeholder="User ID 입력"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border border-gray-300 dark:border-gray-700 p-2 w-full mb-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !userId.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded text-white"
      >
        {loading ? "처리 중..." : "전송"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-4 p-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          <strong>응답 결과:</strong>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
