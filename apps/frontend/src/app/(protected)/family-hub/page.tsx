'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFormatting } from '@/lib/hooks/useFormatting';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

/**
 * FamilyHub Page - Ecosystem & Legacy 🏡
 * Ported to Next.js 15 (App Router)
 */
export default function FamilyHubPage() {
  const { user } = useAuth();
  const { formatAmount } = useFormatting();

  // Fetch Tax Estimate
  const { data: taxData, isLoading: isTaxLoading } = useQuery({
    queryKey: ['tax-estimate'],
    queryFn: async () => {
      const res = await api.get('/ai/tax/estimate');
      return res.data.data;
    },
  });

  // Fetch Legacy Report
  useQuery({
    queryKey: ['legacy-report'],
    queryFn: async () => {
      const res = await api.get('/ai/legacy/report');
      return res.data.data;
    },
  });

  return (
    <div className="container mx-auto pb-36 px-4 py-10 md:px-8 lg:px-12">
      <header className="mb-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-slate-800 tracking-tight"
        >
          Family <span className="text-blue-600">Ecosystem</span>
        </motion.h1>
        <p className="text-slate-400 font-medium mt-2">Membangun masa depan bersama Alvin & Ila</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Partner Sync Card */}
        <Card className="glass-premium border-none shadow-2xl rounded-[40px] overflow-hidden group">
          <CardHeader className="relative h-48 flex items-center justify-center bg-linear-to-br from-blue-50/50 to-indigo-50/50">
            <Image 
              src="/icons/3d/family.png" 
              alt="Family" 
              width={128}
              height={128}
              className="object-contain group-hover:scale-110 transition-transform duration-500" 
            />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="text-2xl font-black text-slate-800 mb-2">Partner Sync</CardTitle>
            <p className="text-slate-500 text-sm mb-6">Hubungkan akun dengan pasangan untuk sinkronisasi notifikasi pengeluaran besar.</p>
            <div className="space-y-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Partner Saat Ini</span>
                  <span className="text-slate-800 font-bold">{user?.partner_name || 'Alvin/Ila'}</span>
               </div>
               <Button className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold h-12 shadow-lg shadow-blue-200">
                  Undang Pasangan ✨
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tax Assistant Card */}
        <Card className="glass-premium border-none shadow-2xl rounded-[40px] overflow-hidden group">
          <CardHeader className="relative h-48 flex items-center justify-center bg-linear-to-br from-orange-50/50 to-amber-50/50">
            <Image 
              src="/icons/3d/tax.png" 
              alt="Tax" 
              width={128}
              height={128}
              className="object-contain group-hover:scale-110 transition-transform duration-500" 
            />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="text-2xl font-black text-slate-800 mb-2">Automated Tax</CardTitle>
            <p className="text-slate-500 text-sm mb-6">Estimasi pajak tahunan otomatis berdasarkan riwayat transaksi kamu.</p>
            {isTaxLoading ? (
               <div className="h-20 flex items-center justify-center animate-pulse text-slate-400 font-bold">MENGHITUNG...</div>
            ) : (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <span className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest block">Income</span>
                        <span className="text-amber-800 font-bold text-lg">{formatAmount(taxData?.total_income || 0)}</span>
                     </div>
                     <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest block">Est. Tax</span>
                        <span className="text-blue-800 font-bold text-lg">{formatAmount(taxData?.estimated_tax || 0)}</span>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">🤖 Nasihat AI</span>
                     <p className="text-slate-600 text-[11px] leading-relaxed italic">&quot;{taxData?.ai_advice}&quot;</p>
                  </div>
               </div>
            )}
          </CardContent>
        </Card>

        {/* Legacy Planning Card */}
        <Card className="glass-premium border-none shadow-2xl rounded-[40px] overflow-hidden group">
          <CardHeader className="relative h-48 flex items-center justify-center bg-linear-to-br from-purple-50/50 to-pink-50/50">
            <Image 
              src="/icons/3d/legacy.png" 
              alt="Legacy" 
              width={128}
              height={128}
              className="object-contain group-hover:scale-110 transition-transform duration-500" 
            />
          </CardHeader>
          <CardContent className="p-8">
            <CardTitle className="text-2xl font-black text-slate-800 mb-2">Legacy Planning</CardTitle>
            <p className="text-slate-500 text-sm mb-6">Warisan digital untuk memastikan semua data tetap aman untuk masa depan.</p>
            <div className="space-y-4">
               <Button 
                onClick={() => toast.success('Tunggu ya sayang, laporan lagi disiapin! ✨')}
                className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 font-bold h-12 shadow-lg shadow-purple-200"
               >
                  Generate Legacy PDF
               </Button>
               <Button 
                variant="outline"
                className="w-full rounded-2xl border-slate-200 text-slate-600 font-bold h-12 hover:bg-slate-50"
               >
                  Setup Digital Vault
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
