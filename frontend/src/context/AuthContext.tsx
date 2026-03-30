/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  currency_format?: string;
  exchange_rate?: number;
  budget_cycle_start?: number;
  is_privacy_mode?: boolean;
  full_name?: string;
  avatar_url?: string;
  partner_name?: string;
  anniversary_date?: string;
  timezone?: string;
  monthly_budget_limit?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const { data } = await api.get('/user');
          setUser(data);
        } catch {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const authValue = React.useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isVerified: !!user?.email_verified_at,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
