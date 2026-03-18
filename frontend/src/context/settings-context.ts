import { createContext } from 'react';

export interface SettingsState {
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  currencyFormat: string;
  exchangeRate: number; // Base IDR
  monthlyBudgetLimit: number;
  fullName?: string;
  avatarUrl?: string;
  partnerName?: string;
  anniversaryDate?: string;
  timezone?: string;
}

export interface SettingsContextType extends SettingsState {
  updateSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
  loading: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
