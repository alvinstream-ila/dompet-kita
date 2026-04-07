'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  CalendarClock,
  Cpu,
  Plus,
  Trash2,
  Pause,
  Play,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  Shield,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types';

/**
 * ScheduledTransactions Page - CFO AI Sentinel 🤖
 * Ported to Next.js 15 (App Router)
 *
 * Key refactors:
 * - Bare `axios` replaced with centralized `@/lib/axios` instance (includes
 *   Bearer token auth interceptor and correct baseURL)
 * - All API paths adjusted: `/api/...` → `/...` (prefix is in baseURL)
 * - No router-dom usage was present in this file; no navigation refactor needed
 */

interface ScheduledTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  status: 'active' | 'paused' | 'finished';
  is_auto_execute: boolean;
  last_executed_at: string | null;
}

interface TransactionInsight {
  id: string;
  type: 'leak' | 'optimization' | 'trend' | 'achievement';
  title: string;
  content: string;
  impact_value: number;
  status: 'new' | 'read' | 'archived';
  action_url?: string;
  created_at: string;
}

const fetchScheduled = async (): Promise<ScheduledTransaction[]> => {
  const { data } = await api.get('/scheduled-transactions');
  return data;
};

const fetchInsights = async (): Promise<TransactionInsight[]> => {
  const { data } = await api.get('/ai/quantum-insights');
  return data;
};

export default function ScheduledTransactionsPage() {
  const queryClient = useQueryClient();

  const { data: scheduledTasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['scheduled-transactions'],
    queryFn: fetchScheduled,
  });

  const { data: insights, isLoading: isInsightsLoading } = useQuery({
    queryKey: ['quantum-insights'],
    queryFn: fetchInsights,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/scheduled-transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] });
      toast.success('Jadwal berhasil dihapus sayang! 🌸');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/scheduled-transactions/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] });
      toast.success('Status berhasil diubah! ✨');
    },
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/ai/quantum-insights/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quantum-insights'] });
      if (variables.status === 'archived') {
        toast.success('Temuan berhasil diarsipkan! 📥');
      }
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: () => api.post('/ai/quantum-insights/generate'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quantum-insights'] });
      toast.success(data.data.message || 'Analisis kuantum selesai! ✨');
    },
    onError: (err: unknown) => {
      const axiosError = err as ApiError;
      toast.error(
        axiosError.response?.data?.message || 'Gagal menjalankan analisis kuantum. 🥺'
      );
    },
  });

  if (isTasksLoading || isInsightsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Cpu className="size-10 text-pink-400" />
        </motion.div>
      </div>
    );
  }

  const totalMonthlyCommitment =
    scheduledTasks?.reduce((acc, curr) => {
      if (curr.type === 'expense' && curr.status === 'active') {
        if (curr.recurrence === 'daily') return acc + curr.amount * 30;
        if (curr.recurrence === 'weekly') return acc + curr.amount * 4;
        if (curr.recurrence === 'monthly') return acc + curr.amount;
      }
      return acc;
    }, 0) || 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            CFO AI <span className="text-pink-500">Sentinel</span>
          </h1>
          <p className="mt-1 text-slate-500 font-medium">
            Phase 6: Autonomous Intelligence Hub
          </p>
        </div>
        <button className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl transition-transform active:scale-95">
          <Plus className="size-6" />
        </button>
      </motion.div>

      {/* Quantum Insights Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" />
              Quantum Insights
            </h3>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Sentient Findings
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              generateInsightsMutation.isPending
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-sm'
            )}
          >
            {generateInsightsMutation.isPending ? (
              <>
                <div className="size-3 border-2 border-amber-500 border-t-transparent animate-spin rounded-full" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="size-3 fill-current" />
                Quantum Pulse
              </>
            )}
          </motion.button>
        </div>

        {insights && insights.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            {insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'relative min-w-[300px] max-w-[350px] glass-card p-6 border-l-4 overflow-hidden',
                  insight.type === 'leak' && 'border-l-rose-500',
                  insight.type === 'optimization' && 'border-l-blue-500',
                  insight.type === 'trend' && 'border-l-amber-500',
                  insight.type === 'achievement' && 'border-l-teal-500'
                )}
              >
                <button
                  onClick={() =>
                    updateInsightMutation.mutate({
                      id: insight.id,
                      status: 'archived',
                    })
                  }
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="size-4" />
                </button>

                <div className="flex items-start gap-4 mb-3">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl',
                      insight.type === 'leak' && 'bg-rose-100 text-rose-600',
                      insight.type === 'optimization' &&
                        'bg-blue-100 text-blue-600',
                      insight.type === 'trend' &&
                        'bg-amber-100 text-amber-600',
                      insight.type === 'achievement' &&
                        'bg-teal-100 text-teal-600'
                    )}
                  >
                    {insight.type === 'leak' && (
                      <AlertCircle className="size-5" />
                    )}
                    {insight.type === 'optimization' && (
                      <Zap className="size-5" />
                    )}
                    {insight.type === 'trend' && (
                      <TrendingUp className="size-5" />
                    )}
                    {insight.type === 'achievement' && (
                      <Shield className="size-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight pr-4">
                      {insight.title}
                    </h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                      Potential Impact: Rp{' '}
                      {insight.impact_value.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-3">
                  {insight.content}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                  {insight.action_url && (
                    <a
                      href={insight.action_url}
                      className="text-xs font-black text-slate-900 flex items-center gap-1 hover:underline"
                    >
                      Audit Sekarang <TrendingUp className="size-3" />
                    </a>
                  )}
                </div>

                {/* Ambient glow */}
                <div
                  className={cn(
                    'absolute -bottom-12 -right-12 size-24 blur-3xl rounded-full opacity-20',
                    insight.type === 'leak' && 'bg-rose-500',
                    insight.type === 'optimization' && 'bg-blue-500',
                    insight.type === 'trend' && 'bg-amber-500',
                    insight.type === 'achievement' && 'bg-teal-500'
                  )}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center py-10 bg-slate-50/50 border-dashed border-2">
            <Cpu className="size-10 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-400">
              Belum ada temuan terbaru.
            </p>
            <button
              onClick={() => generateInsightsMutation.mutate()}
              className="mt-3 text-xs font-black text-amber-600 uppercase tracking-widest hover:underline"
            >
              Cek Pola Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Summary Analytics */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card flex items-center gap-6 p-6"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
            <CalendarClock className="size-8" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Monthly Commitment
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              Rp {totalMonthlyCommitment.toLocaleString('id-ID')}
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card flex items-center gap-6 p-6"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
            <Cpu className="size-8" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              AI Autonomy Status
            </p>
            <div className="flex items-center gap-2">
              <div className="size-3 animate-pulse rounded-full bg-green-500" />
              <h2 className="text-2xl font-black text-slate-900">Active</h2>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="size-5 text-slate-400" />
          Scheduled Automations
        </h3>

        <AnimatePresence mode="popLayout">
          {scheduledTasks?.map((task, index) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'glass-card group relative overflow-hidden p-0',
                task.status !== 'active' && 'opacity-75 grayscale-[0.5]'
              )}
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      'flex size-14 items-center justify-center rounded-2xl shadow-sm transition-colors',
                      task.type === 'income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {task.type === 'income' ? (
                      <TrendingUp className="size-7" />
                    ) : (
                      <TrendingDown className="size-7" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-black text-slate-900">
                        {task.description}
                      </h4>
                      {task.is_auto_execute && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-blue-600">
                          <Cpu className="size-3" /> Auto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5 capitalize">
                        <CalendarClock className="size-4" /> {task.recurrence}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4" /> Next:{' '}
                        {new Date(task.next_due_date).toLocaleDateString(
                          'id-ID',
                          { day: 'numeric', month: 'short' }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      'text-xl font-black',
                      task.type === 'income'
                        ? 'text-green-600'
                        : 'text-slate-900'
                    )}
                  >
                    {task.type === 'income' ? '+' : '-'} Rp{' '}
                    {task.amount.toLocaleString('id-ID')}
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: task.id,
                          status:
                            task.status === 'active' ? 'paused' : 'active',
                        })
                      }
                      className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                    >
                      {task.status === 'active' ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(task.id)}
                      className="flex size-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm transition-all hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div
                className={cn(
                  'h-1.5 w-full',
                  task.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {(!scheduledTasks || scheduledTasks.length === 0) && (
          <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-6">
              <AlertCircle className="size-12 text-slate-300" />
            </div>
            <h4 className="text-xl font-black text-slate-800">
              Belum ada jadwal otonom sayang.
            </h4>
            <p className="mt-2 text-slate-500">
              Mulai daftarkan tagihan rutin kamu agar robot CFO kita yang urus!
              ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
