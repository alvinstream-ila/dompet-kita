import Cookies from 'js-cookie';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '@/features/settings';
import api from '@/lib/axios';
import { SessionMonitor } from '../components/SessionMonitor';

export type { User } from '@/types';

import type { User } from '@/types';

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
      const token = Cookies.get('auth_token');
      if (token) {
        try {
          const { data } = await api.get('/user');
          setUser(data);

          // 🛡️ Centralized Settings Sync (Essential for Social Auth & Page Refresh)
          await useSettingsStore.getState().syncWithUser(data);

          // 🛡️ Sync verification status for middleware
          if (data.email_verified_at) {
            Cookies.set('user_verified', 'true', {
              expires: 7,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          } else {
            Cookies.remove('user_verified');
          }
        } catch {
          Cookies.remove('auth_token');
          Cookies.remove('user_verified');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = React.useCallback((token: string, user: User) => {
    Cookies.set('auth_token', token, {
      expires: 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // 🛡️ Set verification status for middleware
    if (user.email_verified_at) {
      Cookies.set('user_verified', 'true', {
        expires: 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      Cookies.remove('user_verified');
    }

    setUser(user);

    // 🛡️ Centralized Settings Sync (Essential for Manual Login)
    // fire-and-forget: we don't block the login for this sync.
    // The UI will re-render when settings resolve. If sync fails, defaults are used.
    void useSettingsStore.getState().syncWithUser(user);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      Cookies.remove('auth_token');
      Cookies.remove('user_verified');
      setUser(null);
    }
  }, []);

  const authValue = React.useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isVerified: !!user?.email_verified_at,
    }),
    [user, loading, logout, login]
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
      <SessionMonitor />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
