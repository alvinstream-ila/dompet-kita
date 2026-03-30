import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="glass-premium w-full max-w-md rounded-[40px] border border-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
              <AlertCircle size={40} />
            </div>
            <h2 className="font-display mb-2 text-2xl font-black text-slate-800">
              Waduh, Sayang... 🥺
            </h2>
            <p className="mb-8 font-medium text-slate-500">
              Aplikasinya lagi "pusing" sebentar nih. Coba kita refresh yuk,
              siapa tahu dia langsung seger lagi! ❤️
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-black tracking-widest uppercase"
            >
              <RefreshCcw size={18} />
              Refresh Sekarang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
