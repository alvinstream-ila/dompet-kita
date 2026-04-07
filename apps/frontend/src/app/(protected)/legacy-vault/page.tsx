'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Heart, 
  Users, 
  Settings, 
  FileText, 
  Key,
  Info
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-36">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
          Digital Legacy Vault
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Sentinal Hub: Mengamankan masa depan digital kita. Dead Man&apos;s Switch akan aktif otomatis 
          jika aktivitas terhenti melebihi batas waktu yang ditentukan.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Heartbeat Status Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 p-8">
            <Heart className="w-24 h-24 text-rose-500/10 animate-pulse" />
          </div>
          
          <div className="relative space-y-6">
            <div className="flex items-center gap-2 text-rose-400 font-medium">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              Digital Heartbeat Active
            </div>
            
            <div className="space-y-1">
              <h2 className="text-5xl font-bold text-white tracking-tight">
                {user?.last_active_at ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true, locale: id }) : 'Baru saja'}
              </h2>
              <p className="text-slate-400">Terakhir kali sistem mendeteksi kehadiranmu sayang.</p>
            </div>

            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Threshold Status</p>
                <p className="text-xl text-white font-medium">{user?.legacy_threshold_months || 6} Bulan</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Legacy Trigger</p>
                <p className="text-xl text-amber-500 font-medium">{user?.is_legacy_triggered ? 'DI AKTIFKAN' : 'STANDBY'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Partner Info Card */}
        <motion.div 
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              Designated Partner
            </h3>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-medium">{user?.partner_name || 'Alvin/Ila'}</p>
              <p className="text-sm text-slate-500">Heir / Partner</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 italic">
            &quot;Jika heartbeat berhenti, seluruh snapshot finansial akan dikirim secara aman ke pasangan yang terdaftar.&quot;
          </p>

          <button className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors">
            Ganti Pasangan
          </button>
        </motion.div>

        {/* Settings Card */}
        <motion.div 
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl space-y-6"
        >
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Legacy Settings
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Threshold Masa Inaktif (Bulan)</label>
              <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none">
                <option value="3">3 Bulan</option>
                <option value="6" defaultValue="6">6 Bulan (Recomended)</option>
                <option value="12">12 Bulan</option>
                <option value="24">24 Bulan</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="shrink-0">
                <Info className="w-5 h-5 text-indigo-400" />
              </span>
              <p className="text-xs text-indigo-300">
                Data akan otomatis terhapus dari server cloud setelah 2 tahun legacy berhasil dipindah-tangankan.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reports Archive */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Vault Archive
            </h3>
            <button className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Snapshot Finansial #{i+102}</p>
                    <p className="text-xs text-slate-500">Auto-Generated • 12 April 2026</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all">
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
