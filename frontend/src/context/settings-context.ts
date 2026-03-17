import { createContext } from 'react';

export interface SettingsState {
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  isEcoMode: boolean;
  currencyFormat: 'IDR' | 'USD';
  monthlyBudgetLimit: number;
}

export interface SettingsContextType {
  budgetCycleStart: number;
  isPrivacyMode: boolean;
  isEcoMode: boolean;
  currencyFormat: 'IDR' | 'USD';
  monthlyBudgetLimit: number;
  updateSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
  loading: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
