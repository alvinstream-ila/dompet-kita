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

export function useAddLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLoan: Omit<Loan, 'id' | 'created_at'>) => {
      const { data } = await api.post('/loans', newLoan);
      return data.data;
    },
    onSuccess: (loan) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Pinjaman Dicatat! 📝', {
        description: `Sudah aku bantu catat ya, pinjaman dari ${loan.debtor} kita simpan rapi. ❤️`,
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
      return data.data;
    },
    onSuccess: (loan) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
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
