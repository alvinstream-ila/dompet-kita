import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Asset, ApiError } from '@/types';

export interface AssetTransaction {
  id: number;
  asset_id: number;
  source_asset?: Asset | null;
  amount: number;
  type: 'funding' | 'withdrawal' | 'adjustment';
  description?: string;
  transaction_date: string;
  created_at: string;
}

export const useAssetTransactions = (assetId?: number) => {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['assets', assetId, 'history'],
    queryFn: async () => {
      const response = await api.get(`/assets/${assetId}/history`);
      return response.data.data as AssetTransaction[];
    },
    enabled: !!assetId,
  });

  const fundMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      source_asset_id?: number;
      description?: string;
    }) => {
      const response = await api.post(`/assets/${assetId}/fund`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({
        queryKey: ['assets', assetId, 'history'],
      });
      toast.success('Top up aset berhasil! 💰');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Gagal melakukan top up');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: {
      amount: number;
      recipient_asset_id?: number;
      description?: string;
    }) => {
      const response = await api.post(`/assets/${assetId}/withdraw`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({
        queryKey: ['assets', assetId, 'history'],
      });
      toast.success('Pencairan aset berhasil! 💸');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Gagal mencairkan aset');
    },
  });

  return {
    transactions,
    isLoading,
    fund: fundMutation.mutateAsync,
    isFunding: fundMutation.isPending,
    withdraw: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
  };
};
