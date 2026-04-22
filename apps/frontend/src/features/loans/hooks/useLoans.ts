import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { Loan } from '@/types';

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data } = await api.get('/loans');
      return data.data as Loan[];
    },
  });
}

export function useLoanReport(month?: number, year?: number) {
  return useQuery({
    queryKey: ['loans', 'report', month, year],
    queryFn: async () => {
      const { data } = await api.get('/loans/report', {
        params: { month, year },
      });
      return data.data;
    },
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLoan: Omit<Loan, 'id' | 'created_at'>) => {
      const { data } = await api.post('/loans', newLoan);
      return data.data;
    },
    onMutate: async (newLoan) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const previousLoans = queryClient.getQueryData(['loans']);
      queryClient.setQueryData(['loans'], (old: Loan[] | undefined) => {
        const optimisticLoan = {
          ...newLoan,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          status: 'pending',
        } as Loan;
        return old ? [...old, optimisticLoan] : [optimisticLoan];
      });
      return { previousLoans };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLoans) {
        queryClient.setQueryData(['loans'], context.previousLoans);
      }
      toast.error('Gagal Menyimpan 🥺');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
    },
    onSuccess: (loan) => {
      toast.success('Pinjaman Dicatat! 📝', {
        description: `Sudah aku bantu catat ya, pinjaman dari ${loan.debtor} kita simpan rapi. ❤️`,
      });
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      const { data } = await api.put(`/loans/${id}`, updates);
      return data.data;
    },
    onMutate: async (updatedLoan) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const previousLoans = queryClient.getQueryData(['loans']);
      queryClient.setQueryData(['loans'], (old: Loan[] | undefined) => {
        return old?.map((loan) =>
          loan.id === updatedLoan.id ? { ...loan, ...updatedLoan } : loan
        );
      });
      return { previousLoans };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLoans) {
        queryClient.setQueryData(['loans'], context.previousLoans);
      }
      toast.error('Gagal Update 🥺');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
    },
    onSuccess: (loan) => {
      if (loan.status === 'paid') {
        toast.success('ALHAMDULILLAH LUNAS! 🎉', {
          description: `Pinjaman dari ${loan.debtor} sudah diselesaikan! Lega ya Sayang! ✨❤️`,
        });
      } else {
        toast.success('Berhasil Diupdate! ✨', {
          description: `Data pinjaman ${loan.debtor} sudah diperbarui ya Sayang! ❤️`,
        });
      }
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/loans/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const previousLoans = queryClient.getQueryData(['loans']);
      queryClient.setQueryData(['loans'], (old: Loan[] | undefined) => {
        return old?.filter((loan) => loan.id !== id);
      });
      return { previousLoans };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLoans) {
        queryClient.setQueryData(['loans'], context.previousLoans);
      }
      toast.error('Gagal Menghapus 🥺');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
    },
    onSuccess: () => {
      toast.info('Data Dihapus 🗑️');
    },
  });
}
