import { create } from 'zustand';
import api from '@/lib/axios';
import { type User, type ApiError } from '@/types';

export interface SettingsState {
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  currencyFormat: string;
  exchangeRate: number;
  monthlyBudgetLimit: number;
  fullName?: string;
  avatarUrl?: string;
  partnerName?: string;
  anniversaryDate?: string;
  timezone?: string;
  loading: boolean;
}

interface SettingsStore extends SettingsState {
  setSettings: (settings: Partial<SettingsState>) => void;
  updateSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
  syncWithUser: (user: User) => Promise<void>;
}

const fetchExchangeRate = async (currency: string, currentRate?: number) => {
  if (currency === 'IDR') return 1;
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/IDR');
    const data = await response.json();
    return data.rates[currency] || 1;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return currentRate || 1;
  }
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  budgetCycleStart: 1,
  isPrivacyMode: false,
  currencyFormat: 'IDR',
  exchangeRate: 1,
  monthlyBudgetLimit: 5000000,
  loading: true,

  setSettings: (settings) => set((state) => ({ ...state, ...settings })),

  updateSettings: async (newSettings) => {
    const current = get();
    const finalSettings = { ...current, ...newSettings };

    if (
      newSettings.currencyFormat &&
      newSettings.currencyFormat !== current.currencyFormat
    ) {
      const newRate = await fetchExchangeRate(newSettings.currencyFormat);
      finalSettings.exchangeRate = newRate;
    }

    try {
      await api.put('/user/profile', {
        budget_cycle_start: finalSettings.budgetCycleStart,
        is_privacy_mode: finalSettings.isPrivacyMode,
        currency_format: finalSettings.currencyFormat,
        exchange_rate: finalSettings.exchangeRate,
        monthly_budget_limit: finalSettings.monthlyBudgetLimit,
        full_name: finalSettings.fullName,
        avatar_url: finalSettings.avatarUrl,
        partner_name: finalSettings.partnerName,
        anniversary_date: finalSettings.anniversaryDate,
        timezone: finalSettings.timezone,
      });
      set(finalSettings);
    } catch (error: unknown) {
      let message = 'Gagal memperbarui pengaturan';
      const axiosError = error as ApiError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
      alert(message);
      throw error;
    }
  },

  syncWithUser: async (user) => {
    if (!user) {
      set({ loading: false });
      return;
    }

    const cur = user.currency_format || 'IDR';
    const rate = await fetchExchangeRate(cur, Number(user.exchange_rate));

    set({
      budgetCycleStart: user.budget_cycle_start || 1,
      isPrivacyMode: !!user.is_privacy_mode,
      currencyFormat: cur,
      exchangeRate: Number(user.exchange_rate) || rate,
      monthlyBudgetLimit: Number(user.monthly_budget_limit) || 5000000,
      fullName: user.full_name || '',
      avatarUrl: user.avatar_url || '',
      partnerName: user.partner_name || '',
      anniversaryDate: user.anniversary_date || '',
      timezone: user.timezone || 'Asia/Jakarta',
      loading: false,
    });
  },
}));
