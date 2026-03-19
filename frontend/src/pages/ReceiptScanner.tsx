import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Loader2, ScanText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export const ReceiptScanner: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ amount: number; merchant: string; receipt_url?: string } | null>(null);
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
      // 1. Upload to Cloud first (E2E requirement)
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!uploadResponse.data.success) throw new Error('Gagal upload ke cloud.');
      const receipt_url = uploadResponse.data.url;

      // 2. Analyze using AI
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const aiResponse = await api.post('/ai/analyze-receipt', {
        image: base64Data,
        mime_type: mimeType
      });
      
      if (aiResponse.data.success) {
        setScanResult({
            ...aiResponse.data.data,
            receipt_url: receipt_url
        });
      } else {
        throw new Error('Gagal menganalisis struk.');
      }
    } catch (err) {
      console.error('Scan error', err);
      alert('Maaf Sayang, ada kendala pas scan struknya. Coba lagi atau upload manual ya! ❤️');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    if (!scanResult) return;
    // Navigate to dedicated create page with pre-filled data (Now includes receipt_url!)
    navigate('/transactions/create', { 
      state: { 
        amount: scanResult.amount, 
        description: scanResult.merchant,
        receipt_url: scanResult.receipt_url,
        date: new Date().toISOString().split('T')[0]
      } 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            E-Receipt Scanner <ScanText className="size-5 text-pink-500" />
        </h1>
        <div className="w-10" />
      </div>

      <Card className="overflow-hidden bg-white/70 backdrop-blur-xl shadow-2xl rounded-[40px] border-none p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="aspect-3/4 border-4 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center justify-center gap-4 bg-slate-50/50"
            >
              <div className="p-6 rounded-full bg-pink-50 text-pink-500 mb-2">
                <ImageIcon className="w-12 h-12" />
              </div>
              <div className="text-center px-6">
                <p className="font-bold text-slate-800 mb-1">Foto struk belanjanya dong, Sayang!</p>
                <p className="text-xs text-slate-400 font-medium">Biar aku catat semuanya ke tabungan mimpi kita ❤️</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={() => fileInputRef.current?.click()} className="rounded-2xl bg-slate-900 px-6 font-bold uppercase tracking-wider h-12 shadow-lg hover:shadow-xl transition-all">
                  <Upload className="w-4 h-4 mr-2" /> Pilih Foto
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
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="relative aspect-3/4 rounded-[30px] overflow-hidden shadow-inner border-4 border-white">
                <img src={image} alt="Receipt preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                      setImage(null);
                      setFile(null);
                      setScanResult(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-slate-900/40 backdrop-blur-md rounded-full text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!scanResult ? (
                <Button 
                  onClick={processImage} 
                  disabled={isScanning}
                  className="w-full h-14 rounded-2xl bg-linear-to-r from-pink-500 to-rose-600 font-black uppercase tracking-widest text-lg shadow-pink-200 shadow-xl active:scale-[0.98] transition-all"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Mencerna Struk... ✨
                    </>
                  ) : (
                    <>
                      <ScanText className="w-5 h-5 mr-3" />
                      Analisis Pake AI
                    </>
                  )}
                </Button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50/50 p-6 rounded-[30px] border border-emerald-100 space-y-4"
                >
                  <div className="flex items-center gap-3 text-emerald-600 mb-2 font-black uppercase tracking-tight text-xs">
                    <Check className="w-5 h-5" /> AI Berhasil Baca! ✨
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-600/60 uppercase font-black tracking-widest leading-none">Merchant / Toko</p>
                      <p className="font-bold text-slate-800 truncate">{scanResult.merchant}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-600/60 uppercase font-black tracking-widest leading-none">Nominal</p>
                      <p className="font-bold text-slate-800">Rp {scanResult.amount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-white shadow-emerald-200 shadow-lg mt-2">
                    Lanjut Simpan ❤️
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      <p className="text-center mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-10 leading-relaxed max-w-xs mx-auto">
        Setiap struk adalah cerita tentang <span className="text-pink-500">Masa Depan</span> kita yang sedang kita bangun bersama. ✨
      </p>
    </div>
  );
};
