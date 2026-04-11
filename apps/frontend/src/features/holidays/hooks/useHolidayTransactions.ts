import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import type { Holiday } from '../hooks/useHolidays';

export interface HolidayFundPayload {
  amount: number;
  asset_id?: string;
  description?: string;
  date: string;
}

export function useHolidayHistory(holidayId: string) {
  return useQuery({
    queryKey: ['holidays', holidayId, 'history'],
    queryFn: async () => {
      const { data } = await api.get(`/holidays/${holidayId}/history`);
      return data.data;
    },
    enabled: !!holidayId,
  });
}

export function useAddHolidayFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      holidayId,
      payload,
    }: {
      holidayId: string;
      payload: HolidayFundPayload;
    }) => {
      const { data } = await api.post(`/holidays/${holidayId}/fund`, payload);
      return data.data;
    },
    onSuccess: (data: Holiday) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({
        queryKey: ['holidays', data.id, 'history'],
      });
      queryClient.invalidateQueries({ queryKey: ['wealth-status'] });

      toast.success('Dana Liburan Terisi! ✈️', {
        description: `Yeay, persiapan buat ke ${data.destination} makin mantap ya Sayang! ❤️`,
      });
    },
    onError: () => {
      toast.error('Gagal mengisi dana liburan 🥺');
    },
  });
}
