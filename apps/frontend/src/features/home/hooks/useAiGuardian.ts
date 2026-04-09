import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface GuardianData {
  success: boolean;
  message: string;
  data: {
    prediction: {
      status: 'safe' | 'CAUTION' | 'WARNING' | 'CRITICAL';
      days_remaining: number;
      current_cash: number;
      burn_rate: number;
      message: string;
    };
    rebalance: Array<{
      action: 'INVEST' | 'REPLENISH' | 'HOLD';
      amount?: number;
      reason: string;
    }>;
  };
}

export function useAiGuardian() {
  return useQuery<GuardianData>({
    queryKey: ['ai_guardian'],
    queryFn: async () => {
      const { data } = await api.get(`/ai/guardian?t=${Date.now()}`);
      return data;
    },
    staleTime: 1000 * 60 * 60 * 3, // Trust the cache for 3 hours
    refetchOnWindowFocus: false, // Don't refresh when switching tabs
    refetchOnMount: false, // Don't refresh when navigating back to this page
    refetchOnReconnect: false,
  });
}
