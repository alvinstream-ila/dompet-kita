import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Goal } from '@/types';
import { toast } from 'sonner';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data } = await api.get('/goals');
      return data.data as Goal[];
    },
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newGoal: Omit<Goal, 'id' | 'created_at' | 'current_amount' | 'status'>
    ) => {
      const { data } = await api.post('/goals', {
        ...newGoal,
        current_amount: 0,
        status: 'active',
      });
      return data;
    },
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);
      queryClient.setQueryData(['goals'], (old: Goal[] | undefined) => {
        const optimisticGoal = {
          ...newGoal,
          id: 'temp-' + Date.now(),
          current_amount: 0,
          status: 'active',
          created_at: new Date().toISOString(),
        } as Goal;
        return old ? [...old, optimisticGoal] : [optimisticGoal];
      });
      return { previousGoals };
    },
    onError: (_err, _newGoal, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals);
      }
      toast.error('Gagal Menambah Mimpi 🥺');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Mimpi Baru Dicatat! ✨', {
        description: `Yey! Satu lagi langkah buat mewujudkan ${data.name} kita! ❤️`,
      });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Goal> & { id: string }) => {
      const { data } = await api.put(`/goals/${id}`, updates);
      return data;
    },
    onMutate: async (updatedGoal) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);
      queryClient.setQueryData(['goals'], (old: Goal[] | undefined) => {
        return old?.map((goal) =>
          goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal
        );
      });
      return { previousGoals };
    },
    onError: (_err, _updatedGoal, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals);
      }
      toast.error('Gagal Update Mimpi 🥺');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      if (data.status === 'completed') {
        toast.success('BERHASIL TERWUJUD! 🏆🎉', {
          description: `Mimpi "${data.name}" kita sudah jadi nyata, Sayang! So proud of us! ❤️`,
        });
      } else {
        toast.success('Kemajuan Dicatat! ✨');
      }
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);
      queryClient.setQueryData(['goals'], (old: Goal[] | undefined) => {
        return old?.filter((goal) => goal.id !== id);
      });
      return { previousGoals };
    },
    onError: (_err, _id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals);
      }
      toast.error('Gagal Menghapus 🥺');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.info('Mimpi Dihapus 🗑️', {
        description: 'Gapapa Sayang, kita buat mimpi yang lebih besar lagi ya!',
      });
    },
  });
}
