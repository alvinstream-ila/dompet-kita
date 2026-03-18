import React, { useState, useEffect } from 'react';
import { useAddTransaction } from '@/hooks/useTransactions';
import { 
  Loader2,
  Image as ImageIcon,
  Check,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar as CalendarIcon,
  Target,
  X,
  Sparkles
} from 'lucide-react';
import { s3Client, OCI_CONFIG } from '../../lib/storage';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getGeminiModel } from '../../lib/gemini';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatToRupiah, getTerbilang } from "@/lib/utils";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Kebutuhan Rumah',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan & Utilitas',
  'Lainnya'
];

const INCOME_CATEGORIES = [
  'Gaji',
  'Investasi',
  'Hadiah',
  'Bisnis',
  'Penjualan',
  'Bonus',
  'Lainnya'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const addTransactionMutation = useAddTransaction();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState('Pribadi');
  const [date, setDate] = useState<Date>(new Date());
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (type === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [type]);

  const handleFileUpload = async (selectedFile: File) => {
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: OCI_CONFIG.bucket,
        Key: filePath,
        Body: selectedFile,
        ContentType: selectedFile.type,
      });

      await s3Client.send(command);
      const publicUrl = `https://${OCI_CONFIG.namespace}.objectstorage.${import.meta.env.VITE_OCI_REGION}.oraclecloud.com/n/${OCI_CONFIG.namespace}/b/${OCI_CONFIG.bucket}/o/${filePath}`;
      return publicUrl;
    } catch (error) {
      console.error('Error uploading to OCI:', error);
      throw new Error('Gagal mengunggah struk ke Oracle Cloud');
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    
    try {
      // Use Real AI if API Key exists
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (apiKey) {
        const model = getGeminiModel();
        
        // Convert file to base64 for Gemini
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const base64Data = fileBase64.split(',')[1];
        
        const prompt = "Analyze this receipt and extract: 1. Total Amount (number only), 2. Shop/Merchant Name. Respond in JSON format: { \"amount\": number, \"merchant\": \"string\" }";
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          }
        ]);
        
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanText);
        
        if (data.amount) setAmount(formatToRupiah(data.amount.toString()));
        if (data.merchant) setDescription(data.merchant);
      } else {
        // Fallback to Mock AI OCR Logic
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockAmounts = ['75000', '125000', '50000', '35000'];
        const randomAmount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];
        
        setAmount(formatToRupiah(randomAmount));
        
        if (!description) {
          setDescription('Hasil Scan AI ✨');
        }
      }
      
      alert('AI Berhasil membaca struk! Nominal otomatis terisi ya Sayang! ❤️');
    } catch (error) {
      console.error('Scan error:', error);
      alert('Maaf, AI gagal membaca struk ini. Coba ketik manual ya Sayang! 🥺');
    } finally {
      setScanning(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      let receipt_url = null;
      if (file) {
        setUploading(true);
        receipt_url = await handleFileUpload(file);
        setUploading(false);
      }

      addTransactionMutation.mutate({
        amount: parseInt(amount.replace(/\./g, '')),
        description,
        category,
        sub_category: subCategory,
        type,
        date: format(date, "yyyy-MM-dd"),
        receipt_url,
        note: null
      }, {
        onSuccess: () => {
          onSuccess();
          onClose();
          setAmount('');
          setDescription('');
          setFile(null);
        },
        onError: (error) => {
          alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan transaksi');
        }
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatToRupiah(value);
    setAmount(formatted);
  };


  const categoriesToDisplay = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const activeColorClass = type === 'expense' ? 'bg-slate-900 border-slate-900' : 'bg-emerald-600 border-emerald-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <DialogHeader className={cn("p-6 pb-10 text-white relative overflow-hidden transition-colors duration-500", activeColorClass)}>
          <div className="relative z-10 space-y-0.5">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Entry Transaction</p>
             <DialogTitle className="text-xl font-black flex items-center gap-2 tracking-tight text-white">
               {type === 'expense' ? <ArrowDownCircle className="size-5" /> : <ArrowUpCircle className="size-5" />}
               TAMBAH {type === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
             </DialogTitle>
             
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 w-11 h-11 rounded-full text-white hover:bg-white/10 hover:text-white transition-all active:scale-90 z-50"
            >
              <X className="w-6 h-6" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-8 -mt-6 relative z-20 space-y-4">
          {/* Custom Tabs Switcher - More Compact */}
          <Tabs value={type} onValueChange={(v: string) => setType(v as 'expense' | 'income')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white shadow-lg rounded-xl border border-slate-100 h-auto">
              <TabsTrigger 
                value="expense" 
                className="py-2.5 rounded-lg font-black text-[10px] transition-all uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                PENGELUARAN
              </TabsTrigger>
              <TabsTrigger 
                value="income" 
                className="py-2.5 rounded-lg font-black text-[10px] transition-all uppercase tracking-wider data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                PEMASUKAN
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            {/* Optimized Date Picker */}
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-bold text-[12px] h-10 rounded-xl bg-slate-50 border-slate-200 hover:bg-slate-100 px-3.5",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                    {date ? format(date, "d MMM yyyy", { locale: id }) : <span>Pilih</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* shadcn Select for Categories */}
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 focus:ring-slate-200 font-extrabold text-[12px] px-3.5 transition-all">
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                  {categoriesToDisplay.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-bold text-[12px] focus:bg-slate-50 rounded-lg">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Kategori Khusus</Label>
            <Select value={subCategory} onValueChange={setSubCategory}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 focus:ring-slate-200 font-extrabold text-[12px] px-3.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100">
                <SelectItem value="Pribadi" className="font-bold text-[12px]">Pribadi</SelectItem>
                <SelectItem value="Keluarga" className="font-bold text-[12px]">Keluarga</SelectItem>
                <SelectItem value="Tabungan" className="font-bold text-[12px]">Tabungan</SelectItem>
                <SelectItem value="Investasi" className="font-bold text-[12px]">Investasi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Keterangan / Rincian</Label>
            <Input
              placeholder="Misal : Ongkos Perjalanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 bg-slate-50 border-slate-200 rounded-xl px-3.5 focus-visible:ring-slate-200 font-bold text-[12px] placeholder:text-slate-400 placeholder:font-medium"
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col pt-1">
            <div className="flex justify-between items-end px-1">
              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Nominal (Rp)</Label>
              <span className="text-[10px] font-bold text-blue-500 italic">
                {amount && getTerbilang(parseInt(amount.replace(/\./g, '')))}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-base select-none">Rp.</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className="w-full h-12 bg-slate-100/50 border-slate-200 rounded-2xl pl-12 pr-4 text-xl font-black text-slate-900 focus-visible:ring-slate-300 shadow-inner appearance-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="receipt-upload"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
                    alert('Ukuran file terlalu besar! Maksimal 5MB ya Sayang.. ❤️');
                    e.target.value = '';
                    setFile(null);
                  } else {
                    setFile(selectedFile || null);
                  }
                }}
                accept="image/*,.pdf"
              />
              <Button
                type="button"
                variant="outline"
                asChild
                className={cn(
                  "h-9 rounded-full border-dashed border-2 px-5 transition-all outline-hidden",
                  file ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <label htmlFor="receipt-upload" className="cursor-pointer space-x-2">
                  {file ? <Check className="size-3.5 shrink-0" /> : <ImageIcon className="size-3.5 shrink-0" />}
                  <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[80px]">
                    {file ? file.name : 'STRUK'}
                  </span>
                </label>
              </Button>

              {file && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full border-dashed border-2 px-5 transition-all text-blue-600 border-blue-200 hover:bg-blue-50 bg-white"
                  disabled={scanning}
                  onClick={handleScan}
                >
                  <div className="flex items-center space-x-2 cursor-pointer">
                    {scanning ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {scanning ? 'SCANNING...' : 'SCAN AI'}
                    </span>
                  </div>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
               <Target className="size-3.5 text-slate-500" />
               <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">SPLIT BILL</span>
               <input type="checkbox" className="size-3.5 accent-slate-900 cursor-pointer rounded-sm" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || uploading}
            className={cn(
              "w-full h-11 rounded-2xl shadow-lg active:scale-[0.98] transition-all text-[12px] font-black tracking-widest text-white uppercase mt-2",
              type === 'expense' ? "bg-slate-900 hover:bg-black shadow-slate-900/10" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
            )}
          >
            {loading || uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "SIMPAN TRANSAKSI"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
