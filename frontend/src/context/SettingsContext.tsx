import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from './AuthContext';
import { SettingsContext } from './settings-context';
import type { SettingsState } from './settings-context';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>({
    budgetCycleStart: 1,
    isPrivacyMode: false,
    currencyFormat: 'IDR',
    exchangeRate: 1,
    monthlyBudgetLimit: 5000000, 
  });

  // Fetch exchange rate when currency changes
  const fetchExchangeRate = async (currency: string) => {
    if (currency === 'IDR') return 1;
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/IDR');
      const data = await response.json();
      return data.rates[currency] || 1;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      return (user as any)?.exchange_rate || 1;
    }
  };

  // Sync settings when user changes
  useEffect(() => {
    const sync = async () => {
      if (user) {
        const cur = (user as any).currency_format || 'IDR';
        const rate = await fetchExchangeRate(cur);
        setSettings({
          budgetCycleStart: (user as any).budget_cycle_start || 1,
          isPrivacyMode: (user as any).is_privacy_mode || false,
          currencyFormat: cur,
          exchangeRate: parseFloat((user as any).exchange_rate) || rate,
          monthlyBudgetLimit: parseFloat((user as any).monthly_budget_limit) || 5000000,
          fullName: (user as any).full_name || '',
          avatarUrl: (user as any).avatar_url || '',
          partnerName: (user as any).partner_name || '',
          anniversaryDate: (user as any).anniversary_date || '',
          timezone: (user as any).timezone || 'Asia/Jakarta',
        });
      }
      setLoading(false);
    };
    sync();

    // Auto update every 60 mins if page stays open
    const interval = setInterval(() => {
        if (settings.currencyFormat !== 'IDR') {
            fetchExchangeRate(settings.currencyFormat).then(rate => {
                setSettings(prev => ({ ...prev, exchangeRate: rate }));
            });
        }
    }, 3600000);

    return () => clearInterval(interval);
  }, [user]);

  const updateSettings = async (newSettings: Partial<SettingsState>) => {
    try {
      let finalSettings = { ...settings, ...newSettings };
      
      // Fetch new exchange rate if currency is changed
      if (newSettings.currencyFormat && newSettings.currencyFormat !== settings.currencyFormat) {
          const newRate = await fetchExchangeRate(newSettings.currencyFormat);
          finalSettings.exchangeRate = newRate;
      }

      // Update in Laravel Backend
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

      setSettings(finalSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };



  return (
    <SettingsContext.Provider 
      value={{ 
        ...settings, 
        updateSettings, 
        loading 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
