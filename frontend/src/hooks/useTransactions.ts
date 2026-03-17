import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { useSettings } from '@/hooks/useSettings';
import { startOfMonth, endOfMonth, setDate, subMonths, startOfDay, endOfDay } from 'date-fns';

export function useTransactions(month?: number, year?: number) {
  const { budgetCycleStart } = useSettings();

  return useInfiniteQuery({
    queryKey: ['transactions', month, year, budgetCycleStart],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 20;
      let query = supabase.from('transactions').select('*');
      
      if (month !== undefined && year !== undefined) {
        let startDate: Date;
        let endDate: Date;
        const currentMonthDate = new Date(year, month, 15);

        if (budgetCycleStart === 1) {
          startDate = startOfMonth(currentMonthDate);
          endDate = endOfMonth(currentMonthDate);
        } else {
          const targetDay = budgetCycleStart;
          endDate = endOfDay(setDate(currentMonthDate, targetDay - 1));
          startDate = startOfDay(setDate(subMonths(currentMonthDate, 1), targetDay));
        }

        query = query.gte('date', startDate.toISOString()).lte('date', endDate.toISOString());
      }
      
      const { data, error } = await query
        .order('date', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);
      
      if (error) throw error;
      return data as Transaction[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet_health'] });
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet_health'] });
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet_health'] });
    }
  });
}
