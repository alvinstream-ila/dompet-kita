import { format } from 'date-fns';
import { type SyntheticEvent, useEffect, useState } from 'react';
import {
  useAddTransaction,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions';
import api from '@/lib/axios';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { formatToRupiah } from '@/lib/utils';
import type { TransactionFormProps } from '../TransactionForm';

export const useTransactionForm = ({
  onSuccess,
  onTypeChange,
  mode = 'create',
  transactionId,
  initialData,
}: TransactionFormProps) => {
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
  const [receiptPath, setReceiptPath] = useState<string | null>(
    initialData?.receipt_path || null
  );
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const isPending =
    loading ||
    uploading ||
    addTransactionMutation.isPending ||
    updateTransactionMutation.isPending;

  // Sync initialData with local state when transactionId changes
  const [prevId, setPrevId] = useState(transactionId);
  if (transactionId !== prevId) {
    setPrevId(transactionId);
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
      setReceiptPath(initialData.receipt_path || null);
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
        setPreview(response.data.url);
        return response.data.path;
      }
      throw new Error(response.data.message || 'Gagal mengunggah struk');
    } catch (error) {
      console.error('Error uploading via backend:', error);
      throw new Error('Gagal mengunggah struk ke cloud storage');
    }
  };

  const getBase64 = async (
    f: File | null,
    p: string | null
  ): Promise<string | null> => {
    if (p?.startsWith('data:')) return p.split(',')[1];
    if (!f) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(f);
    });
  };

  const handleScan = async () => {
    if (!file && !preview) return;
    setScanning(true);

    try {
      const base64Data = await getBase64(file, preview);
      if (!base64Data) throw new Error('Preview data not available');

      const response = await api.post('/ai/analyze-receipt', {
        image: base64Data,
        mime_type: file?.type || 'image/jpeg',
      });

      if (!response.data.success)
        throw new Error(response.data.message || 'Gagal scan struk');

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
    } catch (error) {
      console.error('Scan error:', error);
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
      let final_path = receiptPath;
      if (file) {
        setUploading(true);
        final_path = await handleFileUpload(file);
        setUploading(false);
      }

      const amountValue = Number.parseInt(amount.replaceAll('.', ''), 10);
      const payload = {
        amount: amountValue,
        description,
        category,
        sub_category: subCategory,
        type,
        date: format(date, 'yyyy-MM-dd'),
        receipt_url: final_path,
        note: null,
      };

      if (mode === 'edit' && transactionId) {
        await updateTransactionMutation.mutateAsync({
          id: transactionId.toString(),
          ...payload,
        });
      } else {
        await addTransactionMutation.mutateAsync(payload);
        setAmount('');
        setDescription('');
        setFile(null);
        setPreview(null);
      }

      onSuccess?.();
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

  const handleFileChange = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleFileRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const categoriesToDisplay =
    type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return {
    type,
    setType,
    amount,
    setAmount,
    description,
    setDescription,
    category,
    setCategory,
    subCategory,
    setSubCategory,
    date,
    setDate,
    file,
    preview,
    scanning,
    isPending,
    categoriesToDisplay,
    handleAmountChange,
    handleScan,
    handleSubmit,
    handleFileChange,
    handleFileRemove,
  };
};
