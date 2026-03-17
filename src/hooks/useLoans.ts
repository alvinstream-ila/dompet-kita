import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Loan } from '@/types';

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
          return [] as Loan[];
        }
        throw error;
      }
      return data as Loan[];
    }
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newLoan: Omit<Loan, 'id' | 'created_at'> & { created_at?: string }) => {
      const { data, error } = await supabase
        .from('loans')
        .insert([newLoan])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    }
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      const { data, error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    }
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    }
  });
}
