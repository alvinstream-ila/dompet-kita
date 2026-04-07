'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  Check,
  Loader2,
  ScanText,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Receipt Scanner Page - AI-powered OCR 📸
 * Ported to Next.js 15 (App Router)
 *
 * Key refactors:
 * - `useNavigate(-1)` replaced with `router.back()`
 * - `navigate('/transactions/create', { state })` replaced with
 *   `router.push(...)` + query params (Next.js App Router does not support
 *   location.state; we pass pre-filled data via query params instead)
 */
export default function ReceiptScannerPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    amount: number;
    merchant: string;
    category: string;
    receipt_url?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const processImage = async () => {
    if (!image || !file) return;

    setIsScanning(true);
    try {
      // 1. Upload to Cloud first
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!uploadResponse.data.success)
        throw new Error('Gagal upload ke cloud.');
      const receipt_url = uploadResponse.data.url;

      // 2. Analyze using AI
      const aiResponse = await api.post('/ai/analyze-receipt', {
        receipt_url: receipt_url,
        receipt_path: uploadResponse.data.path,
      });

      if (aiResponse.data.success) {
        setScanResult({
          ...aiResponse.data.data,
          receipt_url: receipt_url,
        });
      } else {
        throw new Error(aiResponse.data.message || 'Gagal menganalisis struk.');
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error('Scan error', err);
      const backendMessage = err?.response?.data?.message || err.message;
      alert(
        `Maaf Sayang, ada kendala: ${backendMessage}. Coba lagi atau upload manual ya! ❤️`
      );
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Navigate to /transactions/create with pre-filled data via query params.
   * Next.js App Router does not support React Router's `location.state`,
   * so we encode the scan result as URL search params.
   */
  const handleSave = () => {
    if (!scanResult) return;
    const params = new URLSearchParams({
      amount: String(scanResult.amount),
      description: scanResult.merchant,
      category: scanResult.category,
      receipt_url: scanResult.receipt_url || '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
    router.push(`/transactions/create?${params.toString()}`);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-36">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 transition-colors hover:bg-slate-100"
        >
          <X className="h-6 w-6 text-slate-400" />
        </button>
        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800 uppercase">
          E-Receipt Scanner <ScanText className="size-5 text-pink-500" />
        </h1>
        <div className="w-10" />
      </div>

      <Card className="overflow-hidden rounded-[40px] border-none bg-white/70 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <AnimatePresence mode="wait">
          {image ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="relative aspect-3/4 overflow-hidden rounded-[30px] border-4 border-white shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Receipt preview"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setFile(null);
                    setScanResult(null);
                  }}
                  className="absolute top-4 right-4 rounded-full bg-slate-900/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-slate-900"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {scanResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 rounded-[30px] border border-emerald-100 bg-emerald-50/50 p-6"
                >
                  <div className="mb-2 flex items-center gap-3 text-xs font-black tracking-tight text-emerald-600 uppercase">
                    <Check className="h-5 w-5" /> AI Berhasil Baca! ✨
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] leading-none font-black tracking-widest text-emerald-600/60 uppercase">
                        Merchant / Toko
                      </p>
                      <p className="truncate font-bold text-slate-800">
                        {scanResult.merchant}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] leading-none font-black tracking-widest text-emerald-600/60 uppercase">
                        Nominal
                      </p>
                      <p className="font-bold text-slate-800">
                        Rp {scanResult.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSave}
                    className="mt-2 h-14 w-full rounded-2xl bg-emerald-600 font-black tracking-widest text-white uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                  >
                    Lanjut Simpan ❤️
                  </Button>
                </motion.div>
              ) : (
                <Button
                  onClick={processImage}
                  disabled={isScanning}
                  className="h-14 w-full rounded-2xl bg-linear-to-r from-pink-500 to-rose-600 text-lg font-black tracking-widest uppercase shadow-xl shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Mencerna Struk... ✨
                    </>
                  ) : (
                    <>
                      <ScanText className="mr-3 h-5 w-5" />
                      Analisis Pake AI
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex aspect-3/4 flex-col items-center justify-center gap-4 rounded-[30px] border-4 border-dashed border-slate-100 bg-slate-50/50"
            >
              <div className="mb-2 rounded-full bg-pink-50 p-6 text-pink-500">
                <ImageIcon className="h-12 w-12" />
              </div>
              <div className="px-6 text-center">
                <p className="mb-1 font-bold text-slate-800">
                  Foto struk belanjanya dong, Sayang!
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Biar aku catat semuanya ke tabungan mimpi kita ❤️
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 rounded-2xl bg-slate-900 px-6 font-bold tracking-wider uppercase shadow-lg transition-all hover:shadow-xl"
                >
                  <Upload className="mr-2 h-4 w-4" /> Pilih Foto
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <p className="mx-auto mt-12 max-w-xs px-10 text-center text-[10px] leading-relaxed font-black tracking-[0.2em] text-slate-400 uppercase">
        Setiap struk adalah cerita tentang{' '}
        <span className="text-pink-500">Masa Depan</span> kita yang sedang kita
        bangun bersama. ✨
      </p>
    </div>
  );
}
