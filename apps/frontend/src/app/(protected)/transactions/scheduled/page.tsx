'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  Clock,
  Cpu,
  Pause,
  Play,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
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
        axiosError.response?.data?.message ||
          'Gagal menjalankan analisis kuantum. 🥺'
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
          <Cpu className="text-pink-primary size-10" />
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
            CFO AI <span className="text-pink-primary">Sentinel</span>
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Phase 6: Autonomous Intelligence Hub
          </p>
        </div>
        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl transition-transform active:scale-95"
        >
          <Plus className="size-6" />
        </button>
      </motion.div>

      {/* Quantum Insights Section */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-800">
              <Sparkles className="text-yellow-outlook size-5" />
              Quantum Insights
            </h3>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Sentient Findings
            </span>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-widest uppercase transition-all',
              generateInsightsMutation.isPending
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-yellow-outlook/10 text-yellow-outlook hover:bg-yellow-outlook/20 shadow-sm'
            )}
          >
            {generateInsightsMutation.isPending ? (
              <>
                <div className="border-yellow-outlook size-3 animate-spin rounded-full border-2 border-t-transparent" />
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
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
            {insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'glass-card relative max-w-[350px] min-w-[300px] overflow-hidden border-l-4 p-6',
                  insight.type === 'leak' && 'border-l-red-stat',
                  insight.type === 'optimization' && 'border-l-blue-royal',
                  insight.type === 'trend' && 'border-l-yellow-outlook',
                  insight.type === 'achievement' && 'border-l-green-stat'
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    updateInsightMutation.mutate({
                      id: insight.id,
                      status: 'archived',
                    })
                  }
                  className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>

                <div className="mb-3 flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl',
                      insight.type === 'leak' && 'bg-red-stat/10 text-red-stat',
                      insight.type === 'optimization' &&
                        'bg-blue-royal/10 text-blue-royal',
                      insight.type === 'trend' &&
                        'bg-yellow-outlook/10 text-yellow-outlook',
                      insight.type === 'achievement' &&
                        'bg-green-stat/10 text-green-stat'
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
                    <h4 className="pr-4 leading-tight font-black text-slate-900">
                      {insight.title}
                    </h4>
                    <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Potential Impact: Rp{' '}
                      {insight.impact_value.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <p className="mb-4 line-clamp-3 text-sm font-medium text-slate-600">
                  {insight.content}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                  {insight.action_url && (
                    <a
                      href={insight.action_url}
                      className="flex items-center gap-1 text-xs font-black text-slate-900 hover:underline"
                    >
                      Audit Sekarang <TrendingUp className="size-3" />
                    </a>
                  )}
                </div>

                {/* Ambient glow */}
                <div
                  className={cn(
                    'absolute -right-12 -bottom-12 size-24 rounded-full opacity-20 blur-3xl',
                    insight.type === 'leak' && 'bg-red-stat',
                    insight.type === 'optimization' && 'bg-blue-royal',
                    insight.type === 'trend' && 'bg-yellow-outlook',
                    insight.type === 'achievement' && 'bg-green-stat'
                  )}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 py-10">
            <Cpu className="mb-3 size-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">
              Belum ada temuan terbaru.
            </p>
            <button
              type="button"
              onClick={() => generateInsightsMutation.mutate()}
              className="text-yellow-outlook mt-3 text-xs font-black tracking-widest uppercase hover:underline"
            >
              Cek Pola Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Summary Analytics */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card flex items-center gap-6 p-6"
        >
          <div className="bg-pink-primary/10 text-pink-primary flex size-14 items-center justify-center rounded-2xl">
            <CalendarClock className="size-8" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wider text-slate-400 uppercase">
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
          <div className="bg-blue-royal/10 text-blue-royal flex size-14 items-center justify-center rounded-2xl">
            <Cpu className="size-8" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wider text-slate-400 uppercase">
              AI Autonomy Status
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-green-stat size-3 animate-pulse rounded-full" />
              <h2 className="text-2xl font-black text-slate-900">Active</h2>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
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
                        ? 'bg-green-stat/10 text-green-stat'
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
                        <span className="bg-blue-royal/10 text-blue-royal flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black tracking-tighter uppercase">
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
                        ? 'text-green-stat'
                        : 'text-slate-900'
                    )}
                  >
                    {task.type === 'income' ? '+' : '-'} Rp{' '}
                    {task.amount.toLocaleString('id-ID')}
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
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
                      type="button"
                      onClick={() => deleteMutation.mutate(task.id)}
                      className="text-red-stat hover:bg-red-stat/5 flex size-9 items-center justify-center rounded-xl bg-white shadow-sm transition-all"
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
                  task.status === 'active' ? 'bg-blue-royal' : 'bg-slate-300'
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
