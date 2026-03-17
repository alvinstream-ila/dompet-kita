import { useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useCurrency } from './useCurrency';

export const useFormatting = () => {
  const { isPrivacyMode, currencyFormat } = useSettings();
  const { data: idrToUsd = 0.00006 } = useCurrency();

  const formatAmount = useCallback((amount: number, forceShow: boolean = false) => {
    if (isPrivacyMode && !forceShow) {
      return '••••••';
    }

    if (currencyFormat === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount * idrToUsd);
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [isPrivacyMode, currencyFormat, idrToUsd]);

  return { formatAmount };
};
