import { useQuery } from '@tanstack/react-query';

interface ExchangeRateResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  rates: Record<string, number>;
}

export const useCurrency = () => {
  return useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async (): Promise<number> => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/IDR');
        if (!response.ok) throw new Error('Failed to fetch exchange rate');
        const data: ExchangeRateResponse = await response.json();

        // Return the IDR -> USD rate
        return data.rates.USD || 0.00006; // Fallback to ~16,666 IDR/USD
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 0.00006; // Fallback
      }
    },
    staleTime: 1000 * 60 * 60, // Refresh every hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
};
