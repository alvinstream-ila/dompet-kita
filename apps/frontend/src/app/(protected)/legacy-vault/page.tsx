'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  FileText,
  Heart,
  Info,
  Key,
  Settings,
  ShieldAlert,
  Users,
  Download,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import axios from '@/lib/axios';

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

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/legacy');
      setReports(response.data.data);
    } catch (error) {
      console.error('Failed to fetch legacy reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeartbeat = async () => {
    setIsSyncing(true);
    try {
      await axios.post('/api/legacy/heartbeat');
      setLastHeartbeat(new Date().toISOString());
      // Optional: show toast success
    } catch (error) {
      console.error('Heartbeat failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateThreshold = async (val: number) => {
    setThreshold(val);
    try {
      await axios.patch('/api/legacy/settings', {
        legacy_threshold_months: val,
      });
    } catch (error) {
      console.error('Failed to update threshold:', error);
    }
  };

  const handleTriggerSnapshot = async () => {
    setIsSyncing(true);
    try {
      await axios.post('/api/legacy/snapshot');
      await fetchReports();
    } catch (error) {
      console.error('Failed to trigger snapshot:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await axios.get(`/api/legacy/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Legacy_Snapshot_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
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
    <div className="mx-auto max-w-7xl space-y-8 p-4 pb-36 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
            <ShieldAlert className="h-10 w-10 text-rose-500" />
            Digital Legacy Vault
          </h1>
          <p className="max-w-2xl text-slate-400">
            Sentinel Hub v7.1.18: Mengamankan masa depan digital keluarga. Dead
            Man&apos;s Switch akan aktif otomatis jika aktivitas terhenti.
          </p>
        </div>

        <button
          onClick={handleHeartbeat}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 disabled:opacity-50"
        >
          {isSyncing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className="h-5 w-5 text-rose-500" />
          )}
          Send Heartbeat
        </button>
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
                      new Date(lastHeartbeat || user!.last_active_at!),
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
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Users className="h-5 w-5 text-sky-400" />
              Designated Partner
            </h3>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-white">
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
          className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
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
                  handleUpdateThreshold(parseInt(e.target.value))
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
            <button
              onClick={handleTriggerSnapshot}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Generate Snapshot
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => (
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
                          { day: 'numeric', month: 'long', year: 'numeric' }
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
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-slate-500">
                <FileText className="mb-2 h-8 w-8 opacity-20" />
                <p>Belum ada snapshot yang tersimpan.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
