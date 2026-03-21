import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageLoader } from '@/components/ui/PageLoader';
import { MainLayout } from '@/components/layout/MainLayout';
import { LazyMotion, domAnimation } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSettingsStore } from './context/settingsStore';
import { ReceiptScanner } from './pages/ReceiptScanner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import './App.css';

// Lazy load pages
const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Reports = lazy(() => import('@/pages/Reports'));
const Loans = lazy(() => import('@/pages/Loans'));
const LoanHistory = lazy(() => import('@/pages/LoanHistory'));
const MimpiKita = lazy(() => import('@/pages/MimpiKita'));
const Holiday = lazy(() => import('./pages/Holiday'));
const Wealth = lazy(() => import('./pages/Wealth'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const CreateTransaction = lazy(() => import('./pages/CreateTransaction'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1, // Automatic retry for stability
    },
    mutations: {
      retry: 1,
    }
  },
});

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const { syncWithUser } = useSettingsStore();
  const location = useLocation();

  useEffect(() => {
    syncWithUser(user);
  }, [user, syncWithUser]);

  useEffect(() => {
    if (location.pathname === '/login') {
      document.body.classList.remove('app-main-bg');
    } else {
      document.body.classList.add('app-main-bg');
    }
  }, [location.pathname]);

  if (loading) {
    return <PageLoader isLoading={true} message="Mengecek status kita sayang..." />;
  }

  return (
    <Suspense fallback={<PageLoader isLoading={true} message="Lagi loading sebentar ya sayang..." />}>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/history" element={<LoanHistory />} />
          <Route path="/mimpi-kita" element={<MimpiKita />} />
          <Route path="/holiday" element={<Holiday />} />
          <Route path="/scan" element={<ReceiptScanner />} />
          <Route path="/transactions/create" element={<CreateTransaction />} />
          <Route path="/wealth" element={<Wealth />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <LazyMotion features={domAnimation}>
              <Router>
                <AppContent />
              </Router>
            </LazyMotion>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
