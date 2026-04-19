'use client';

import { isAxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Heart,
  HeartPulse,
  Info,
  Key,
  Loader2,
  PlusCircle,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SudoConfirmDialog } from '@/components/ui/SudoConfirmDialog';
import { useAuth } from '@/features/auth';
import api from '@/lib/axios';

interface LegacyReport {
  id: number;
  filename: string;
  summary_data: Record<string, unknown>;
  created_at: string;
}

/**
 * LegacyVault Page - Digital Inheritance & Security 🛡️
 * Enhanced with real API integration and heartbeat monitoring.
 */
export default function LegacyVaultPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<LegacyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(
    user?.legacy_threshold_months || 6
  );
  const [isSudoOpen, setIsSudoOpen] = useState(false);
  const pendingAction = useRef<(() => Promise<void>) | null>(null);

  // Sync threshold when user data loads
  useEffect(() => {
    if (user?.legacy_threshold_months) {
      setThreshold(user.legacy_threshold_months);
    }
  }, [user]);

  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get('/legacy');
      setReports(response.data.data);
    } catch (error) {
      console.error('Failed to fetch legacy reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleHeartbeat = async () => {
    setIsSyncing(true);
    try {
      await api.post('/legacy/heartbeat');
      setLastHeartbeat(new Date().toISOString());
      toast.success('Sistem mendeteksi detak jantungmu, Sayang. Kamu aman! ❤️');
    } catch (error) {
      console.error('Heartbeat failed:', error);
      toast.error('Gagal mengirim heartbeat 🥺');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateThreshold = async (val: number) => {
    const action = async () => {
      await api.patch('/legacy/settings', {
        legacy_threshold_months: val,
      });
      setThreshold(val);
      toast.success('Threshold warisan digital diperbarui! ✨');
    };

    try {
      await action();
    } catch (error: unknown) {
      if (
        isAxiosError(error) &&
        error.response?.status === 403 &&
        error.response?.data?.sudo_required
      ) {
        pendingAction.current = action;
        setIsSudoOpen(true);
      } else {
        console.error('Failed to update threshold:', error);
        toast.error('Gagal memperbarui threshold 🥺');
      }
    }
  };

  const handleTriggerSnapshot = async () => {
    const action = async () => {
      setIsSyncing(true);
      try {
        await api.post('/legacy/snapshot');
        await fetchReports();
        toast.success('Snapshot finansial berhasil dibangkitkan! 🛡️');
      } finally {
        setIsSyncing(false);
      }
    };

    try {
      await action();
    } catch (error: unknown) {
      if (
        isAxiosError(error) &&
        error.response?.status === 403 &&
        error.response?.data?.sudo_required
      ) {
        pendingAction.current = action;
        setIsSudoOpen(true);
      } else {
        console.error('Failed to trigger snapshot:', error);
        toast.error('Gagal membangkitkan snapshot 🥺');
      }
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await api.get(`/legacy/download/${id}`, {
        responseType: 'blob',
      });
      const url = globalThis.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Legacy_Snapshot_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Gagal mendownload snapshot 🥺');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 p-4 pb-36 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-6 md:flex-row md:items-center"
        >
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
              <div className="rounded-2xl bg-rose-500/20 p-2.5 backdrop-blur-md">
                <ShieldAlert className="h-8 w-8 text-rose-500" />
              </div>
              Digital Legacy Vault
            </h1>
            <p className="max-w-2xl text-slate-400">
              Sentinel Hub v7.1.18: Mengamankan masa depan digital keluarga.
              Dead Man&apos;s Switch akan aktif otomatis jika aktivitas
              terhenti.
            </p>
          </div>

          <Button
            onClick={handleHeartbeat}
            disabled={isSyncing}
            className="group relative h-14 overflow-hidden rounded-2xl bg-linear-to-br from-rose-500/20 to-orange-500/20 px-8 font-bold text-white backdrop-blur-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <div className="relative flex items-center gap-3">
              {isSyncing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <HeartPulse className="h-5 w-5 animate-pulse text-rose-500" />
              )}
              Send Heartbeat
            </div>
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Heartbeat Status Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:col-span-2"
          >
            <div className="absolute top-0 right-0 p-8">
              <Heart className="h-24 w-24 animate-pulse text-rose-500/10" />
            </div>

            <div className="relative space-y-6">
              <div className="flex items-center gap-2 font-medium text-rose-400">
                <div className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                Digital Heartbeat Active
              </div>

              <div className="space-y-1">
                <h2 className="text-5xl font-bold tracking-tight text-white">
                  {lastHeartbeat || user?.last_active_at
                    ? formatDistanceToNow(
                        new Date(
                          lastHeartbeat || user?.last_active_at || new Date()
                        ),
                        {
                          addSuffix: true,
                          locale: id,
                        }
                      )
                    : 'Baru saja'}
                </h2>
                <p className="text-slate-400">
                  Terakhir kali sistem mendeteksi kehadiranmu sayang.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                    Threshold Status
                  </p>
                  <p className="text-xl font-medium text-white">
                    {threshold} Bulan
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                    Vault Security
                  </p>
                  <p className="text-xl font-medium text-emerald-500">
                    ENCRYPTED
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Partner Info Card */}
          <motion.div
            variants={itemVariants}
            className="group space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
                <Users className="h-5 w-5 text-sky-400" />
                Designated Partner
              </h3>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors group-hover:bg-sky-500/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-white transition-colors group-hover:text-sky-300">
                  {user?.legacy_partner_name || 'Alvin/Ila'}
                </p>
                <p className="text-sm text-slate-500">Heir / Partner</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 italic">
              &quot;Jika heartbeat berhenti, seluruh snapshot finansial akan
              dikirim secara aman ke pasangan yang terdaftar.&quot;
            </p>

            <button
              type="button"
              className="w-full rounded-xl bg-sky-600 py-3 font-medium text-white transition-colors hover:bg-sky-500"
            >
              Ganti Pasangan
            </button>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            variants={itemVariants}
            className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:bg-white/10"
          >
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Settings className="h-5 w-5 text-indigo-400" />
              Legacy Settings
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="inactive-threshold"
                  className="text-sm text-slate-400"
                >
                  Threshold Masa Inaktif (Bulan)
                </label>
                <select
                  id="inactive-threshold"
                  value={threshold}
                  onChange={(e) =>
                    handleUpdateThreshold(Number.parseInt(e.target.value, 10))
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="3">3 Bulan</option>
                  <option value="6">6 Bulan (Recomended)</option>
                  <option value="12">12 Bulan</option>
                  <option value="24">24 Bulan</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                <span className="shrink-0">
                  <Info className="h-5 w-5 text-rose-400" />
                </span>
                <p className="text-xs text-rose-300">
                  Sistem mPDF enkripsi aktif. Laporan akan otomatis terkunci
                  menggunakan password akun Anda.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reports Archive */}
          <motion.div
            variants={itemVariants}
            className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
                <FileText className="h-5 w-5 text-emerald-400" />
                Vault Archive
              </h3>
              <Button
                onClick={handleTriggerSnapshot}
                disabled={isSyncing}
                variant="ghost"
                className="relative z-20 flex h-10 items-center gap-2 rounded-xl bg-emerald-500/10 px-4 text-emerald-400 backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-95"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                Generate Snapshot
              </Button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                (() => {
                  if (reports.length > 0) {
                    return reports.map((report) => (
                      <div
                        key={report.id}
                        className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                            <Key className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {report.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                              Auto-Archived •{' '}
                              {new Date(report.created_at).toLocaleDateString(
                                'id-ID',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(report.id)}
                          type="button"
                          className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    ));
                  }
                  return (
                    <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-slate-500">
                      <FileText className="mb-2 h-8 w-8 opacity-20" />
                      <p>Belum ada snapshot yang tersimpan.</p>
                    </div>
                  );
                })()
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <SudoConfirmDialog
        isOpen={isSudoOpen}
        onClose={() => {
          setIsSudoOpen(false);
          pendingAction.current = null;
        }}
        onSuccess={async () => {
          setIsSudoOpen(false);
          if (pendingAction.current) {
            await pendingAction.current();
            pendingAction.current = null;
          }
        }}
      />
    </div>
  );
}
