import { useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';

export const useFormatting = () => {
  const { isPrivacyMode, currencyFormat, exchangeRate } = useSettings();

  const formatAmount = useCallback(
    (amount: number, forceShow: boolean = false) => {
      if (isPrivacyMode && !forceShow) {
        return '••••••';
      }

      // Default to en-US for non-IDR currencies to ensure standard global formatting
      const locale = currencyFormat === 'IDR' ? 'id-ID' : 'en-US';

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyFormat,
        minimumFractionDigits: currencyFormat === 'IDR' ? 0 : 2,
        maximumFractionDigits: currencyFormat === 'IDR' ? 0 : 2,
      }).format(currencyFormat === 'IDR' ? amount : amount * exchangeRate);
    },
    [isPrivacyMode, currencyFormat, exchangeRate]
  );

  return { formatAmount };
};
