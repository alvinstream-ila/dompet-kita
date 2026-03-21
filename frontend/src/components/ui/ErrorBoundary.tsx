import React from 'react'
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full glass-premium p-8 rounded-[40px] text-center shadow-2xl border border-white">
            <div className="size-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 font-display">Waduh, Sayang... 🥺</h2>
            <p className="text-slate-500 font-medium mb-8">
              Aplikasinya lagi "pusing" sebentar nih. Coba kita refresh yuk, siapa tahu dia langsung seger lagi! ❤️
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
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
