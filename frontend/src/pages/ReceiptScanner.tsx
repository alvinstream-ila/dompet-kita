import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Check, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

export const ReceiptScanner: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;
    
    setIsScanning(true);
    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const response = await api.post('/ai/analyze-receipt', {
        image: base64Data,
        mime_type: mimeType
      });
      
      if (response.data.success) {
        setScanResult(response.data.data);
      } else {
        console.error('Gagal menganalisis struk.');
      }
    } catch (err) {
      console.error('Scan error', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    if (!scanResult) return;
    // Navigate to transaction form with pre-filled data
    navigate('/transactions/create', { 
      state: { 
        amount: scanResult.amount, 
        note: `Scan: ${scanResult.merchant}`,
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
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">E-Receipt Scanner ✨</h1>
        <div className="w-10" />
      </div>

      <Card className="overflow-hidden bg-white shadow-2xl rounded-[40px] border-none p-6 md:p-8">
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
                <p className="text-sm text-slate-400">Pastikan tulisan total harga kelihatan jelas ya.</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={() => fileInputRef.current?.click()} className="rounded-2xl bg-slate-900 px-6 font-bold uppercase tracking-wider h-12">
                  <Upload className="w-4 h-4 mr-2" /> Upload Foto
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
              <div className="relative aspect-3/4 rounded-[30px] overflow-hidden shadow-inner border border-slate-100">
                <img src={image} alt="Receipt preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!scanResult ? (
                <Button 
                  onClick={processImage} 
                  disabled={isScanning}
                  className="w-full h-14 rounded-2xl bg-linear-to-r from-pink-500 to-rose-600 font-black uppercase tracking-widest text-lg shadow-pink-200 shadow-xl"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Lagi Baca Struk... ✨
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Analisis Pake AI
                    </>
                  )}
                </Button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 p-6 rounded-[30px] border border-emerald-100 space-y-4"
                >
                  <div className="flex items-center gap-3 text-emerald-600 mb-2 font-black uppercase tracking-tight text-sm">
                    <Check className="w-5 h-5" /> Hasil Analisis AI
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-600/60 uppercase font-black tracking-widest leading-none">Merchant</p>
                      <p className="font-bold text-slate-800 truncate">{scanResult.merchant}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-emerald-600/60 uppercase font-black tracking-widest leading-none">Total Amount</p>
                      <p className="font-bold text-slate-800">Rp {scanResult.amount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider mt-2">
                    Simpan Transaksi
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      <p className="text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-10 leading-relaxed">
        AI mungkin salah membaca angka. <br/>Periksa kembali sebelum menyimpan ya Cintaku! ❤️
      </p>
    </div>
  );
};
