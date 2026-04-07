'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  category: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  status: 'pending' | 'paid';
  lastPaidAt?: string;
}

const STORAGE_KEY = 'dk_scheduled_bills';

export function useBills() {
  const [state, setState] = useState<{
    bills: Bill[];
    isLoading: boolean;
  }>({
    bills: [],
    isLoading: true,
  });

  // Initialize from LocalStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      let initialBills = [];
      if (stored) {
        try {
          initialBills = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse bills', e);
        }
      }
      // Atomic update in a separate task to avoid cascading renders
      setState({ bills: initialBills, isLoading: false });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bills));
    }
  }, [state.bills, state.isLoading]);

  const addBill = (bill: Omit<Bill, 'id' | 'status'>) => {
    const newBill: Bill = {
      ...bill,
      id: crypto.randomUUID(),
      status: 'pending',
    };
    setState((prev) => ({
      ...prev,
      bills: [...prev.bills, newBill],
    }));
    toast.success('Tagihan baru berhasil ditambahkan! 💸');
  };

  const deleteBill = (id: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
    toast.info('Tagihan dihapus.');
  };

  const markAsPaid = (id: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === id
          ? { ...b, status: 'paid', lastPaidAt: new Date().toISOString() }
          : b
      ),
    }));
    toast.success('Yeay! Tagihan sudah dilunasi. 💖');
  };

  const resetStatus = (id: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.map((b) => (b.id === id ? { ...b, status: 'pending' } : b)),
    }));
  };

  return {
    bills: state.bills,
    isLoading: state.isLoading,
    addBill,
    deleteBill,
    markAsPaid,
    resetStatus,
  };
}
