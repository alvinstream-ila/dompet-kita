import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  Check,
  ImageIcon,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';
import Image from 'next/image';
import React, { type SyntheticEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAddTransaction,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions';
import api from '@/lib/axios';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { cn, formatToRupiah, getTerbilang } from '@/lib/utils';

export interface TransactionFormProps {
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
  readonly onTypeChange?: (type: 'expense' | 'income') => void;
  readonly mode?: 'create' | 'edit';
  readonly transactionId?: string;
  readonly initialData?: {
    readonly amount?: number;
    readonly description?: string;
    readonly type?: 'expense' | 'income';
    readonly category?: string;
    readonly sub_category?: string | null;
    readonly date?: string;
    readonly receipt_url?: string | null;
  };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  onCancel,
  onTypeChange,
  mode = 'create',
  transactionId,
  initialData,
}) => {
  const addTransactionMutation = useAddTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>(
    initialData?.type || 'expense'
  );
  const [amount, setAmount] = useState(
    initialData?.amount ? formatToRupiah(initialData.amount.toString()) : ''
  );
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [category, setCategory] = useState(
    initialData?.category ||
      (type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  );
  const [subCategory, setSubCategory] = useState(
    initialData?.sub_category || 'Pribadi'
  );
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.receipt_url || null
  );
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const isPending =
    loading ||
    uploading ||
    addTransactionMutation.isPending ||
    updateTransactionMutation.isPending;

  const modeLabel = mode === 'create' ? 'SIMPAN' : 'PERBARUI';
  const submitLabel = isPending ? (
    <Loader2 className="mx-auto size-5 animate-spin" />
  ) : (
    `${modeLabel} TRANSAKSI`
  );

  const receiptDisplayLabel = mode === 'edit' ? 'STRUK ADA' : 'STRUK';
  const receiptStatusLabel = file ? file.name : receiptDisplayLabel;
  const scanStatusLabel = scanning ? 'SCANNING...' : 'SCAN AI';

  // Sync initialData with local state (Adjusting state while rendering)
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      const newType = initialData.type || 'expense';
      setType(newType);
      setAmount(
        initialData.amount ? formatToRupiah(initialData.amount.toString()) : ''
      );
      setDescription(initialData.description || '');
      setCategory(
        initialData.category ||
          (newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
      );
      setSubCategory(initialData.sub_category || 'Pribadi');
      setDate(initialData.date ? new Date(initialData.date) : new Date());
      setPreview(initialData.receipt_url || null);
    }
  }

  useEffect(() => {
    if (onTypeChange) onTypeChange(type);
  }, [type, onTypeChange]);

  const handleFileUpload = async (selectedFile: File) => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.url;
      }
      throw new Error(response.data.message || 'Gagal mengunggah struk');
    } catch (error) {
      console.error('Error uploading via backend:', error);
      throw new Error('Gagal mengunggah struk ke cloud storage');
    }
  };

  const handleScan = async () => {
    if (!file && !preview) return;
    setScanning(true);

    try {
      let base64Data = preview?.startsWith('data:')
        ? preview.split(',')[1]
        : null;

      if (!base64Data && file) {
        const reader = new FileReader();
        const b64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        base64Data = (b64 as string).split(',')[1];
      }

      if (!base64Data) throw new Error('Preview data not available');

      const response = await api.post('/ai/analyze-receipt', {
        image: base64Data,
        mime_type: file?.type || 'image/jpeg',
      });

      if (response.data.success) {
        const {
          amount: extractedAmount,
          merchant,
          category: extractedCategory,
          message,
        } = response.data.data;

        if (extractedAmount)
          setAmount(formatToRupiah(extractedAmount.toString()));
        if (merchant) setDescription(merchant);
        if (extractedCategory) setCategory(extractedCategory);

        alert(
          message ||
            'AI Berhasil membaca struk! Nominal otomatis terisi ya Sayang! ❤️'
        );
      } else {
        throw new Error(response.data.message || 'Gagal scan struk');
      }
    } catch (error) {
      console.error('Scan error via backend:', error);
      alert(
        'Maaf, AI gagal membaca struk ini. Coba ketik manual ya Sayang! 🥺'
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let receipt_url = initialData?.receipt_url || null;
      if (file) {
        setUploading(true);
        receipt_url = await handleFileUpload(file);
        setUploading(false);
      }

      const payload = {
        amount: Number.parseInt(amount.replaceAll('.', ''), 10),
        description,
        category,
        sub_category: subCategory,
        type,
        date: format(date, 'yyyy-MM-dd'),
        receipt_url,
        note: null,
      };

      if (mode === 'edit' && transactionId) {
        await updateTransactionMutation.mutateAsync({
          id: transactionId.toString(),
          ...payload,
        });
      } else {
        await addTransactionMutation.mutateAsync(payload);
      }

      onSuccess?.();
      if (mode === 'create') {
        setAmount('');
        setDescription('');
        setFile(null);
        setPreview(null);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan transaksi'
      );
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

  const categoriesToDisplay =
    type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Custom Tabs Switcher */}
      <Tabs
        value={type}
        onValueChange={(v: string) => setType(v as 'expense' | 'income')}
        className="w-full"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
          <TabsTrigger
            value="expense"
            className="rounded-lg py-2.5 text-[10px] font-black tracking-wider uppercase transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            PENGELUARAN
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="data-[state=active]:bg-green-stat rounded-lg py-2.5 text-[10px] font-black tracking-wider uppercase transition-all data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            PEMASUKAN
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-3">
        {/* Date Picker */}
        <div className="flex flex-col space-y-1.5">
          <Label
            htmlFor="transaction-date"
            className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
          >
            Tanggal
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="transaction-date"
                variant={'outline'}
                type="button"
                className={cn(
                  'h-10 w-full justify-start rounded-xl border-slate-200 bg-slate-50 px-3.5 text-left text-[12px] font-bold hover:bg-slate-100',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                {date ? (
                  format(date, 'd MMM yyyy', { locale: id })
                ) : (
                  <span>Pilih</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden rounded-2xl border-none p-0 shadow-2xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                autoFocus
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Kategori */}
        <div className="flex flex-col space-y-1.5">
          <Label
            htmlFor="transaction-category"
            className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
          >
            Kategori
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              id="transaction-category"
              className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 text-[12px] font-extrabold transition-all focus:ring-slate-200"
            >
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {categoriesToDisplay.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="rounded-lg text-[12px] font-bold focus:bg-slate-50"
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="transaction-sub-category"
          className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
        >
          Kategori Khusus
        </Label>
        <Select value={subCategory} onValueChange={setSubCategory}>
          <SelectTrigger
            id="transaction-sub-category"
            className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 text-[12px] font-extrabold focus:ring-slate-200"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
            <SelectItem value="Pribadi" className="text-[12px] font-bold">
              Pribadi
            </SelectItem>
            <SelectItem value="Keluarga" className="text-[12px] font-bold">
              Keluarga
            </SelectItem>
            <SelectItem value="Tabungan" className="text-[12px] font-bold">
              Tabungan
            </SelectItem>
            <SelectItem value="Investasi" className="text-[12px] font-bold">
              Investasi
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="transaction-description"
          className="px-1 text-[10px] font-black tracking-widest text-slate-800 uppercase"
        >
          Keterangan / Rincian
        </Label>
        <Input
          id="transaction-description"
          placeholder="Misal : Ongkos Perjalanan"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 text-[12px] font-bold placeholder:font-medium placeholder:text-slate-400 focus-visible:ring-slate-200"
          required
        />
      </div>

      <AmountInput amount={amount} onChange={handleAmountChange} />

      <ReceiptSection
        preview={preview}
        scanning={scanning}
        file={file}
        receiptStatusLabel={receiptStatusLabel}
        scanStatusLabel={scanStatusLabel}
        onFileSelect={(f) => {
          setFile(f);
          const reader = new FileReader();
          reader.onloadend = () => setPreview(reader.result as string);
          reader.readAsDataURL(f);
        }}
        onFileRemove={() => {
          setFile(null);
          setPreview(null);
        }}
        onScan={handleScan}
      />

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 flex-1 rounded-2xl border-slate-200 text-[12px] font-black uppercase"
          >
            BATAL
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            'h-11 flex-1 rounded-2xl text-[12px] font-black tracking-widest text-white uppercase shadow-lg transition-all active:scale-[0.98]',
            type === 'expense'
              ? 'bg-slate-900 shadow-slate-900/10 hover:bg-black'
              : 'bg-green-stat shadow-green-stat/10 hover:bg-green-stat/90'
          )}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

interface AmountInputProps {
  amount: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({ amount, onChange }) => (
  <div className="flex flex-col space-y-1.5 pt-1">
    <div className="flex items-end justify-between px-1">
      <Label className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
        Nominal (Rp)
      </Label>
      <span className="text-blue-royal text-[10px] font-bold italic">
        {amount &&
          getTerbilang(Number.parseInt(amount.replaceAll('.', ''), 10))}
      </span>
    </div>
    <div className="relative">
      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-base font-black text-slate-500 select-none">
        Rp.
      </span>
      <Input
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={amount}
        onChange={onChange}
        className="h-12 w-full appearance-none rounded-2xl border-slate-200 bg-slate-100/50 pr-4 pl-12 text-xl font-black text-slate-900 shadow-inner focus-visible:ring-slate-300"
        required
      />
    </div>
  </div>
);

interface ReceiptSectionProps {
  preview: string | null;
  scanning: boolean;
  file: File | null;
  receiptStatusLabel: string;
  scanStatusLabel: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onScan: () => void;
}

const ReceiptSection: React.FC<ReceiptSectionProps> = ({
  preview,
  scanning,
  file,
  receiptStatusLabel,
  scanStatusLabel,
  onFileSelect,
  onFileRemove,
  onScan,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
        >
          <Image
            src={preview}
            alt="Receipt preview"
            width={600}
            height={400}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 rounded-full px-3 text-[10px] font-black"
              onClick={onFileRemove}
            >
              Hapus
            </Button>
          </div>
          {scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-[2px]">
              <Loader2 className="text-blue-royal h-8 w-8 animate-spin" />
              <span className="text-blue-royal animate-pulse text-[10px] font-black tracking-widest">
                ANALYZING...
              </span>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > MAX_FILE_SIZE) {
                  alert(
                    'Ukuran file terlalu besar! Maksimal 5MB ya Sayang.. ❤️'
                  );
                } else {
                  onFileSelect(f);
                }
              }
            }}
            accept="image/*,.pdf"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'h-9 rounded-full border-2 border-dashed px-5 transition-all outline-none',
              file || preview
                ? 'border-green-stat/30 bg-green-stat/5 text-green-stat hover:bg-green-stat/10'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            )}
          >
            <div className="flex cursor-pointer items-center space-x-2">
              {file || preview ? (
                <Check className="size-3.5 shrink-0" />
              ) : (
                <ImageIcon className="size-3.5 shrink-0" />
              )}
              <span className="max-w-[80px] truncate text-[9px] font-black tracking-widest uppercase">
                {receiptStatusLabel}
              </span>
            </div>
          </Button>

          {(file || preview?.startsWith('data:')) && (
            <Button
              type="button"
              variant="outline"
              className="border-blue-royal/30 text-blue-royal hover:bg-blue-royal/5 h-9 rounded-full border-2 border-dashed bg-white px-5 transition-all"
              disabled={scanning}
              onClick={onScan}
            >
              <div className="flex cursor-pointer items-center space-x-2">
                {scanning ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                <span className="text-[9px] font-black tracking-widest uppercase">
                  {scanStatusLabel}
                </span>
              </div>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
          <Target className="size-3.5 text-slate-500" />
          <span className="text-[9px] font-black tracking-widest text-slate-800 uppercase">
            SPLIT BILL
          </span>
          <input
            type="checkbox"
            className="size-3.5 cursor-pointer rounded-sm accent-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
