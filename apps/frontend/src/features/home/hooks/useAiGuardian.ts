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
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}
