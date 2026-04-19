'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import type { Transaction } from '@/types';

/**
 * Add a new transaction via Server Action
 */
export async function addTransactionAction(
  newTransaction: Omit<Transaction, 'id' | 'created_at'>
) {
  try {
    const data = await serverApi('/transactions', {
      method: 'POST',
      body: JSON.stringify(newTransaction),
    });

    revalidatePath('/');
    revalidatePath('/transactions');
    return { success: true, data };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal Mencatat 🥺';
    return { success: false, error: message };
  }
}

/**
 * Update an existing transaction via Server Action
 */
export async function updateTransactionAction({
  id,
  ...updates
}: Partial<Transaction> & { id: string }) {
  try {
    const data = await serverApi(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    revalidatePath('/');
    revalidatePath('/transactions');
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal Update 🥺';
    return { success: false, error: message };
  }
}

/**
 * Delete a transaction via Server Action
 */
export async function deleteTransactionAction(id: string) {
  try {
    await serverApi(`/transactions/${id}`, {
      method: 'DELETE',
    });

    revalidatePath('/');
    revalidatePath('/transactions');
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal Menghapus 🥺';
    return { success: false, error: message };
  }
}

/**
 * Fetch financial summary (Server-side for RSC)
 */
export async function getFinancialSummaryAction(
  month?: number,
  year?: number,
  budgetCycleStart?: number
) {
  const params = new URLSearchParams();
  if (month !== undefined) params.set('month', month.toString());
  if (year !== undefined) params.set('year', year.toString());
  if (budgetCycleStart !== undefined)
    params.set('budget_cycle_start', budgetCycleStart.toString());

  try {
    const response = await serverApi(
      `/transactions/summary?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch financial summary:', error);
    return {
      total_balance: 0,
      monthly_income: 0,
      monthly_expense: 0,
      monthly_savings: 0,
      budget_usage_percentage: 0,
      recent_transactions: [],
      income_analysis: [],
      expense_analysis: [],
    };
  }
}
