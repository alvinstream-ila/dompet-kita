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
      return user?.exchange_rate || 1;
    }
  };

  // Sync settings when user changes
  useEffect(() => {
    const sync = async () => {
      if (user) {
        const cur = user.currency_format || 'IDR';
        const rate = await fetchExchangeRate(cur);
        setSettings({
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
