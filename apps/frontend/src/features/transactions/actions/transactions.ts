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
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[Action] Failed to fetch financial summary:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal memuat ringkasan 🥺',
      data: {
        income: 0,
        expense: 0,
        balance: 0,
        transactions: [],
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      },
    };
  }
}
