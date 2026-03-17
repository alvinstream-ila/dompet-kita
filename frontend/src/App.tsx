import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import { PageLoader } from '@/components/ui/PageLoader';
import { MainLayout } from '@/components/layout/MainLayout';
import { LazyMotion, domAnimation } from 'framer-motion';
import './App.css';

// Lazy load pages for better performance
const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Reports = lazy(() => import('@/pages/Reports'));
const Loans = lazy(() => import('@/pages/Loans'));
const LoanHistory = lazy(() => import('@/pages/LoanHistory'));
const MimpiKita = lazy(() => import('@/pages/MimpiKita'));
const Holiday = lazy(() => import('./pages/Holiday'));
const Wealth = lazy(() => import('./pages/Wealth'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

import type { Session } from '@supabase/supabase-js';

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle background class for body
  useEffect(() => {
    if (location.pathname === '/login') {
      document.body.classList.remove('app-main-bg');
    } else {
      document.body.classList.add('app-main-bg');
    }
  }, [location.pathname]);

  if (initialLoading) {
    return <PageLoader isLoading={true} message="Mengecek status kita sayang..." />;
  }

  return (
    <Suspense fallback={<PageLoader isLoading={true} message="Lagi loading sebentar ya sayang..." />}>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected Routes wrapped in a single MainLayout to avoid remounting */}
        <Route element={session ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/history" element={<LoanHistory />} />
          <Route path="/mimpi-kita" element={<MimpiKita />} />
          <Route path="/holiday" element={<Holiday />} />
          <Route path="/wealth" element={<Wealth />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <LazyMotion features={domAnimation}>
          <Router>
            <AppContent />
          </Router>
        </LazyMotion>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
