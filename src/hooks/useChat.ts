import { useState } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (messages: Message[], userId: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diet-health-chat`,
        {
          messages,
          userId,
        }
      );

      if (response.data.success) {
        const aiText = response.data.rspData;
        
        // 상품코드 접두사 목록
        const productPrefixes = [
          'LZB', 'LZP', 'LPZ', 'LRZ', 'LDZ', 'LQZ', 'LOZ', 'LSZ', 
          'LIX', 'LBX', 'BSC', 'LIO', 'LIR', 'LIB', 'LZC'
        ];
        
        // 정규식: 접두사 + [숫자*] (최소 1개 이상)
        const regex = new RegExp(
          `\\b(${productPrefixes.join('|')})[0-9\\*]+\\b`,
          'gi'
        );
        
        const restoredText = aiText.replace(regex, (match: string) =>
          match.replace(/\*/g, '0')
        );
        
        return restoredText;
      } else {
        throw new Error(response.data.message || '서버에서 오류가 발생했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading,
    error,
  };
};