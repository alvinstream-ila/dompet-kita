import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

export interface Holiday {
  id: number;
  destination: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'booked' | 'completed' | 'cancelled';
  itinerary: string | null;
  spent?: number;
  is_favorite?: boolean;
}

export function useHolidays() {
  return useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const { data } = await api.get('/holidays');
      return data as Holiday[];
    }
  });
}

export function useAddHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newHoliday: Omit<Holiday, 'id'>) => {
      const { data } = await api.post('/holidays', newHoliday);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Rencana Dibuat! ✨', {
        description: `Asik! Kita mau ke ${data.destination} nih Sayang! ❤️`
      });
    },
    onError: () => {
      toast.error('Gagal Menyimpan 🥺', {
        description: 'Coba ulangi lagi ya Sayang, maaf ada kendala.'
      });
    }
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Holiday> & { id: number }) => {
      const { data } = await api.put(`/holidays/${id}`, updates);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Berhasil Diupdate! ✨', {
        description: `Rencana ke ${data.destination} sudah aku catat ya!`
      });
    },
    onError: () => {
      toast.error('Gagal Update 🥺');
    }
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.info('Rencana Dihapus 🗑️', {
        description: 'Gapapa Sayang, kita cari destinasi lain yang lebih seru!'
      });
    }
  });
}
