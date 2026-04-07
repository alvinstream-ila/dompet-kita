import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Loan } from '@/types';
import { toast } from 'sonner';

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data } = await api.get('/loans');
      return data.data as Loan[];
    },
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLoan: Omit<Loan, 'id' | 'created_at'>) => {
      const { data } = await api.post('/loans', newLoan);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Pinjaman Dicatat! 📝', {
        description: `Sudah aku bantu catat ya, pinjaman dari ${data.debtor}.`,
      });
    },
    onError: () => toast.error('Gagal Menyimpan 🥺'),
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      const { data } = await api.put(`/loans/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      if (data.status === 'paid') {
        toast.success('ALHAMDULILLAH LUNAS! 🎉', {
          description: `Pinjaman ${data.debtor} sudah diselesaikan! ✨`,
        });
      } else {
        toast.success('Berhasil Diupdate! ✨');
      }
    },
    onError: () => toast.error('Gagal Update 🥺'),
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/loans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.info('Data Dihapus 🗑️');
    },
    onError: () => toast.error('Gagal Menghapus 🥺'),
  });
}
