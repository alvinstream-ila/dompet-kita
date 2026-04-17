import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { Goal } from '@/types';

export interface GoalDepositPayload {
  amount: number;
  asset_id?: string;
  description?: string;
  date: string;
}

export function useGoalHistory(goalId: string) {
  return useQuery({
    queryKey: ['goals', goalId, 'history'],
    queryFn: async () => {
      const { data } = await api.get(`/goals/${goalId}/history`);
      return data.data;
    },
    enabled: !!goalId,
  });
}

export function useAddGoalDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      payload,
    }: {
      goalId: string;
      payload: GoalDepositPayload;
    }) => {
      const { data } = await api.post(`/goals/${goalId}/deposit`, payload);
      return data.data;
    },
    onSuccess: (data: Goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({
        queryKey: ['goals', data.id, 'history'],
      });

      toast.success('Tabungan Dicatat! 💰', {
        description: `Alhamdulillah, mimpi "${data.name}" kita selangkah lebih dekat ya Sayang! ❤️`,
      });
    },
    onError: () => {
      toast.error('Gagal mencatat tabungan 🥺');
    },
  });
}
