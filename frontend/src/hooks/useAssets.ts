import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Asset } from '@/types';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('type', { ascending: true });
      
      if (error) throw error;
      return data as Asset[];
    }
  });
}

export function useWealthHistory() {
  return useQuery({
    queryKey: ['wealth_history'],
    queryFn: async () => {
      // Logic for wealth history from snapshots or calculated from transactions/assets
      // For now, return empty or mock
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
      const { data, error } = await supabase
        .from('assets')
        .insert([newAsset])
        .select();
        
      if (error) throw error;
      return data[0];
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
      const { data, error } = await supabase
        .from('assets')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
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
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
}
