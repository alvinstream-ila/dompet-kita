import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface ChatResponse {
  success: boolean;
  message: string;
}

export const useAIChat = () => {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await axios.post<ChatResponse>('/ai/chat', { message });
      return data;
    },
  });
};
