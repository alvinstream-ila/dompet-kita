import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SettingsContext } from './settings-context';
import type { SettingsState } from './settings-context';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>({
    budgetCycleStart: 1,
    isPrivacyMode: false,
    isEcoMode: false,
    currencyFormat: 'IDR',
    monthlyBudgetLimit: 5000000, 
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setSettings({
          budgetCycleStart: metadata.budget_cycle_start || 1,
          isPrivacyMode: metadata.is_privacy_mode || false,
          isEcoMode: metadata.is_eco_mode || false,
          currencyFormat: metadata.currency_format || 'IDR',
          monthlyBudgetLimit: metadata.monthly_budget_limit || 5000000,
        });
      }
      setLoading(false);
    };

    fetchSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setSettings({
          budgetCycleStart: metadata.budget_cycle_start || 1,
          isPrivacyMode: metadata.is_privacy_mode || false,
          isEcoMode: metadata.is_eco_mode || false,
          currencyFormat: metadata.currency_format || 'IDR',
          monthlyBudgetLimit: metadata.monthly_budget_limit || 5000000,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SettingsState>) => {
    try {
      const updated = { ...settings, ...newSettings };
      
      const { error } = await supabase.auth.updateUser({
        data: {
          budget_cycle_start: updated.budgetCycleStart,
          is_privacy_mode: updated.isPrivacyMode,
          is_eco_mode: updated.isEcoMode,
          currency_format: updated.currencyFormat,
          monthly_budget_limit: updated.monthlyBudgetLimit,
        }
      });

      if (error) throw error;
      setSettings(updated);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (settings.isEcoMode) {
      document.body.classList.add('eco-mode');
    } else {
      document.body.classList.remove('eco-mode');
    }
  }, [settings.isEcoMode]);

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

