'use client';

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
} from 'lucide-react';
import { useAuth } from '@/features/auth';

/**
 * LegacyVault Page - Digital Inheritance & Security 🛡️
 * Ported to Next.js 15 (App Router)
 */
export default function LegacyVaultPage() {
  const { user } = useAuth();

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
        className="flex flex-col space-y-2"
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <ShieldAlert className="h-10 w-10 text-rose-500" />
          Digital Legacy Vault
        </h1>
        <p className="max-w-2xl text-slate-400">
          Sentinal Hub: Mengamankan masa depan digital kita. Dead Man&apos;s
          Switch akan aktif otomatis jika aktivitas terhenti melebihi batas
          waktu yang ditentukan.
        </p>
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
                {user?.last_active_at
                  ? formatDistanceToNow(new Date(user.last_active_at), {
                      addSuffix: true,
                      locale: id,
                    })
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
                  {user?.legacy_threshold_months || 6} Bulan
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                  Legacy Trigger
                </p>
                <p className="text-xl font-medium text-amber-500">
                  {user?.is_legacy_triggered ? 'DI AKTIFKAN' : 'STANDBY'}
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
                {user?.partner_name || 'Alvin/Ila'}
              </p>
              <p className="text-sm text-slate-500">Heir / Partner</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 italic">
            &quot;Jika heartbeat berhenti, seluruh snapshot finansial akan
            dikirim secara aman ke pasangan yang terdaftar.&quot;
          </p>

          <button className="w-full rounded-xl bg-sky-600 py-3 font-medium text-white transition-colors hover:bg-sky-500">
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
              <label className="text-sm text-slate-400">
                Threshold Masa Inaktif (Bulan)
              </label>
              <select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white transition-all outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="3">3 Bulan</option>
                <option value="6" defaultValue="6">
                  6 Bulan (Recomended)
                </option>
                <option value="12">12 Bulan</option>
                <option value="24">24 Bulan</option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3">
              <span className="shrink-0">
                <Info className="h-5 w-5 text-indigo-400" />
              </span>
              <p className="text-xs text-indigo-300">
                Data akan otomatis terhapus dari server cloud setelah 2 tahun
                legacy berhasil dipindah-tangankan.
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
            <button className="flex items-center gap-1 text-sm text-emerald-400 transition-colors hover:text-emerald-300">
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Snapshot Finansial #{i + 102}
                    </p>
                    <p className="text-xs text-slate-500">
                      Auto-Generated • 12 April 2026
                    </p>
                  </div>
                </div>
                <button className="rounded-lg bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20">
                  Download
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
