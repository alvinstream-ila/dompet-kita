import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface InsightData {
  title: string;
  insight: string;
}

export function useAIInsights() {
  return useQuery<InsightData>({
    queryKey: ['ai_insights'],
    queryFn: async () => {
      const { data } = await api.get(`/ai/insights?t=${Date.now()}`);
      return data;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}
