import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { Asset } from '@/types';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data } = await api.get('/assets');
      return data.data as Asset[];
    },
    refetchInterval: 1000 * 60 * 5, // 5 Minutes Realtime Heartbeat
  });
}

export function useWealthHistory() {
  return useQuery({
    queryKey: ['wealth_history'],
    queryFn: async () => {
      const { data } = await api.get('/wealth-history');
      return data.data as { month: string; value: number }[];
    },
  });
}

export function useWealthSimulation(months: number = 12) {
  return useQuery({
    queryKey: ['wealth_simulation', months],
    queryFn: async () => {
      const { data } = await api.get(`/ai/wealth/simulate?months=${months}`);
      return data.data as {
        month: string;
        pessimistic: number;
        expected: number;
        optimistic: number;
      }[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useAddAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAsset: Omit<Asset, 'id' | 'last_updated'>) => {
      const { data } = await api.post('/assets', newAsset);
      return data.data;
    },
    onMutate: async (newAsset) => {
      await queryClient.cancelQueries({ queryKey: ['assets'] });
      const previousAssets = queryClient.getQueryData<Asset[]>(['assets']);
      queryClient.setQueryData(['assets'], (old: Asset[] | undefined) => {
        const optimisticAsset = {
          ...newAsset,
          id: `temp-${Date.now()}`,
          last_updated: new Date().toISOString(),
        } as Asset;
        return old ? [...old, optimisticAsset] : [optimisticAsset];
      });
      return { previousAssets };
    },
    onError: (_err, _newAsset, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets'], context.previousAssets);
      }
      toast.error('Gagal Menambah Aset 🥺');
    },
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['wealth_history'] });
      toast.success('Horee, Aset Bertambah! 💎', {
        description: `Sudah aku bantu catat aset "${asset.name}" kita ya Sayang! ❤️`,
      });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Asset> & { id: string }) => {
      const { data } = await api.put(`/assets/${id}`, updates);
      return data.data;
    },
    onMutate: async (updatedAsset) => {
      await queryClient.cancelQueries({ queryKey: ['assets'] });
      const previousAssets = queryClient.getQueryData<Asset[]>(['assets']);
      queryClient.setQueryData(['assets'], (old: Asset[] | undefined) => {
        return old?.map((asset) =>
          asset.id === updatedAsset.id ? { ...asset, ...updatedAsset } : asset
        );
      });
      return { previousAssets };
    },
    onError: (_err, _updatedAsset, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets'], context.previousAssets);
      }
      toast.error('Gagal Update Aset 🥺');
    },
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['wealth_history'] });
      toast.success('Aset Berhasil Diupdate! ✨', {
        description: `Sekarang nilai "${asset.name}" kita sudah terupdate ya Sayang! ❤️`,
      });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assets/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['assets'] });
      const previousAssets = queryClient.getQueryData<Asset[]>(['assets']);
      queryClient.setQueryData(['assets'], (old: Asset[] | undefined) => {
        return old?.filter((asset) => asset.id !== id);
      });
      return { previousAssets };
    },
    onError: (_err, _id, context) => {
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets'], context.previousAssets);
      }
      toast.error('Gagal Hapus Aset 🥺');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['wealth_history'] });
      toast.info('Aset Dihapus 🗑️', {
        description:
          'Asetnya sudah aku hapus ya Sayang. Tenang, nanti kita cari aset lain! ❤️',
      });
    },
  });
}
