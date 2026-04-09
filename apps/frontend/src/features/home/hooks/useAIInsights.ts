import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface InsightData {
  success: boolean;
  message: string;
  data: {
    title: string;
    insight: string;
  };
}

export function useAIInsights() {
  return useQuery<InsightData>({
    queryKey: ['ai_insights'],
    queryFn: async () => {
      const { data } = await api.get(`/ai/insights?t=${Date.now()}`, {
        timeout: 45000, // 45 seconds
      });
      return data;
    },
    staleTime: 1000 * 60 * 60 * 3, // Trust the cache for 3 hours
    refetchOnWindowFocus: false, // Don't refresh when switching tabs
    refetchOnMount: false, // Don't refresh when navigating back to this page
    refetchOnReconnect: false,
  });
}
