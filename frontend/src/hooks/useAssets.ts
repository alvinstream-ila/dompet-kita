import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Asset } from '@/types';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data } = await api.get('/assets');
      return data as Asset[];
    }
  });
}

export function useWealthHistory() {
  return useQuery({
    queryKey: ['wealth_history'],
    queryFn: async () => {
      // Mock for now, until history API is built
      return [
        { month: 'Jan', value: 10000000 },
        { month: 'Feb', value: 12000000 },
        { month: 'Mar', value: 15600000 },
      ];
    }
  });
}

export function useAddAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAsset: Omit<Asset, 'id' | 'last_updated'>) => {
      const { data } = await api.post('/assets', newAsset);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Asset> & { id: string }) => {
      const { data } = await api.put(`/assets/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}
