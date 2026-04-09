import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Calendar as CalendarIcon,
  User,
  FileText,
  Wallet,
  ArrowUpCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatToRupiah, getTerbilang } from '@/lib/utils';
import { useAddLoan, useUpdateLoan } from '../hooks/useLoans';
import type { Loan, ApiError } from '@/types';

export interface LoanFormProps {
  onSuccess?: () => void;
  loan?: Loan | null;
  onTypeChange?: (type: 'utang' | 'piutang') => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({
  onSuccess,
  loan,
  onTypeChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'utang' | 'piutang'>(loan?.type || 'utang');
  const [amount, setAmount] = useState(
    loan ? formatToRupiah(loan.amount.toString()) : ''
  );
  const [remainingAmount, setRemainingAmount] = useState(
    loan ? formatToRupiah(loan.remaining_amount.toString()) : ''
  );
  const [paymentAmount, setPaymentAmount] = useState('');
  const [contactName, setContactName] = useState(loan?.contact_name || '');
  const [description, setDescription] = useState(loan?.description || '');
  const [transactionDate, setTransactionDate] = useState<Date>(
    loan?.created_at ? parseISO(loan.created_at) : new Date()
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    loan?.due_date ? parseISO(loan.due_date) : undefined
  );
  const [status] = useState<'active' | 'paid'>(loan?.status || 'active');

  const { mutateAsync: addLoan } = useAddLoan();
  const { mutateAsync: updateLoan } = useUpdateLoan();

  useEffect(() => {
    if (onTypeChange) onTypeChange(type);
  }, [type, onTypeChange]);

  const parseNumeric = (val: string) =>
    Number.parseInt(val.replaceAll('.', '')) || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatToRupiah(e.target.value);
    setAmount(formatted);
    if (!loan) setRemainingAmount(formatted);
  };

  const handleRemainingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemainingAmount(formatToRupiah(e.target.value));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!loan) return;
    const formatted = formatToRupiah(e.target.value);
    setPaymentAmount(formatted);

    const paymentVal = parseNumeric(formatted);
    const newRemaining = Math.max(0, loan.remaining_amount - paymentVal);
    setRemainingAmount(formatToRupiah(newRemaining.toString()));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount || !contactName || !description) return;

    setLoading(true);
    try {
      const numAmount = parseNumeric(amount);
      const numRemaining = parseNumeric(remainingAmount || amount);

      const payload = {
        type,
        amount: numAmount,
        remaining_amount: numRemaining,
        description,
        contact_name: contactName,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        created_at: format(transactionDate, 'yyyy-MM-dd'),
        status: numRemaining <= 0 ? 'paid' : status,
      };

      if (loan) {
        await updateLoan({ id: loan.id, ...payload });
      } else {
        await addLoan(payload);
      }

      onSuccess?.();
    } catch (error: unknown) {
      let message = 'Gagal menyimpan data.. 🥺';
      const axiosError = error as ApiError;
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {!loan && (
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as 'utang' | 'piutang')}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-slate-200/50 bg-slate-100/80 p-1.5 shadow-inner backdrop-blur-xs">
            <TabsTrigger
              value="utang"
              className="rounded-xl py-2.5 text-[10px] font-black tracking-wider uppercase transition-all data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              HUTANG
            </TabsTrigger>
            <TabsTrigger
              value="piutang"
              className="rounded-xl py-2.5 text-[10px] font-black tracking-wider uppercase transition-all data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              PIUTANG
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <CommonLoanFields
        contactName={contactName}
        setContactName={setContactName}
        description={description}
        setDescription={setDescription}
        transactionDate={transactionDate}
        setTransactionDate={setTransactionDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
      />

      {loan && (
        <LoanPaymentProgress
          loan={loan}
          amount={amount}
          remainingAmount={remainingAmount}
          paymentAmount={paymentAmount}
          handlePaymentChange={handlePaymentChange}
        />
      )}

      {!loan && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label className="px-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              Total (Rp)
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="h-11 w-full rounded-xl border-slate-200/60 bg-slate-50 px-4 font-black text-slate-900 shadow-xs transition-all focus-visible:ring-slate-300"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="px-1 text-[10px] font-black tracking-widest text-pink-500 uppercase">
              Sisa (Rp)
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={remainingAmount}
              onChange={handleRemainingChange}
              className="h-11 w-full rounded-xl border-pink-100 bg-pink-50/30 px-4 font-black text-pink-600 shadow-xs transition-all focus-visible:ring-pink-200"
              required
            />
          </div>
        </div>
      )}

      {(loan ? paymentAmount : remainingAmount) && (
        <div className="mx-1 flex items-center gap-2 rounded-xl border border-blue-100/50 bg-blue-50/50 px-3 py-2">
          <div className="size-1.5 animate-pulse rounded-full bg-blue-400" />
          <span className="text-[10px] font-bold tracking-tight text-blue-600 italic">
            {getTerbilang(
              Number.parseInt(
                (loan ? paymentAmount : remainingAmount).replaceAll('.', '')
              )
            )}{' '}
            Rupiah
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          'group relative mt-4 h-14 w-full overflow-hidden rounded-[24px] text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all active:scale-[0.97]',
          type === 'utang'
            ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600'
            : 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700'
        )}
      >
        <div className="absolute inset-0 translate-y-12 bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
        {loading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loan ? 'Update Progres Bayar ✨' : 'Simpan Titipan ✨'}
          </span>
        )}
      </Button>
    </form>
  );
};

interface CommonLoanFieldsProps {
  contactName: string;
  setContactName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  transactionDate: Date;
  setTransactionDate: (date: Date) => void;
  dueDate?: Date;
  setDueDate: (date?: Date) => void;
}

const CommonLoanFields: React.FC<CommonLoanFieldsProps> = ({
  contactName,
  setContactName,
  description,
  setDescription,
  transactionDate,
  setTransactionDate,
  dueDate,
  setDueDate,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 px-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
          <User className="size-3 text-slate-400" /> Pihak Terkait
        </Label>
        <Input
          placeholder="Misal : Teman Kantor / Saudara"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="h-11 w-full rounded-xl border-slate-200/60 bg-slate-50 px-4 text-sm font-bold shadow-xs transition-all focus:bg-white focus-visible:ring-slate-300"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 px-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
          <FileText className="size-3 text-slate-400" /> Keterangan
        </Label>
        <Input
          placeholder="Sewa kos / Pinjem beli makan"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-11 w-full rounded-xl border-slate-200/60 bg-slate-50 px-4 text-sm font-bold shadow-xs transition-all focus:bg-white focus-visible:ring-slate-300"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 px-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            <CalendarIcon className="size-3 text-slate-400" /> Tgl Mulai
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={'outline'}
                className={cn(
                  'h-11 w-full justify-start rounded-xl border-slate-200/60 bg-slate-50 px-4 text-left text-sm font-bold shadow-xs hover:bg-slate-100',
                  !transactionDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {transactionDate ? (
                  format(transactionDate, 'd MMM yyyy', { locale: id })
                ) : (
                  <span>Pilih</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden rounded-3xl border-none p-0 shadow-2xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={transactionDate}
                onSelect={(d) => d && setTransactionDate(d)}
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 px-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            <CalendarIcon className="size-3 text-slate-400" /> Deadline
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={'outline'}
                className={cn(
                  'h-11 w-full justify-start rounded-xl border-slate-200/60 bg-slate-50 px-4 text-left text-sm font-bold shadow-xs hover:bg-slate-100',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {dueDate ? (
                  format(dueDate, 'd MMM yyyy', { locale: id })
                ) : (
                  <span>Batas Bayar</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden rounded-3xl border-none p-0 shadow-2xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

interface LoanPaymentProgressProps {
  loan: Loan;
  amount: string;
  remainingAmount: string;
  paymentAmount: string;
  handlePaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoanPaymentProgress: React.FC<LoanPaymentProgressProps> = ({
  loan,
  amount,
  remainingAmount,
  paymentAmount,
  handlePaymentChange,
}) => {
  const currentRemaining =
    Number.parseInt(remainingAmount.replaceAll('.', '')) || 0;
  const totalAmount = Number.parseInt(amount.replaceAll('.', '')) || 1;
  const percentPaid = Math.round((1 - currentRemaining / totalAmount) * 100);

  return (
    <div className="group relative mt-2 space-y-5 overflow-hidden rounded-[28px] border border-slate-200/50 bg-slate-50/80 p-5 shadow-sm backdrop-blur-xs">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-24 w-24 rounded-full bg-blue-500/5 transition-transform group-hover:scale-110" />
      <div className="relative z-10 grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label className="block text-[9px] font-black tracking-widest text-slate-400 uppercase">
            Total Amanah
          </Label>
          <p className="text-base font-black text-slate-700">Rp {amount}</p>
        </div>
        <div className="space-y-1">
          <Label className="block text-[9px] font-black tracking-widest text-emerald-500 uppercase">
            Terbayar
          </Label>
          <p className="text-base font-black text-emerald-600">
            Rp{' '}
            {formatToRupiah((loan.amount - loan.remaining_amount).toString())}
          </p>
        </div>
      </div>
      <div className="relative z-10 space-y-2">
        <Label className="flex items-center gap-2 px-1 text-[10px] font-black tracking-[0.15em] text-pink-500 uppercase">
          <Wallet className="size-3.5" /> Nominal Pembayaran Baru
        </Label>
        <div className="relative">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            autoFocus
            value={paymentAmount}
            onChange={handlePaymentChange}
            className="h-14 w-full rounded-2xl border-pink-200 bg-white px-5 text-2xl font-black text-pink-600 shadow-sm transition-all focus:border-pink-400 focus-visible:ring-pink-100"
          />
          <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-pink-200">
            <ArrowUpCircle className="size-6 rotate-45 opacity-20" />
          </div>
        </div>
      </div>
      <div className="relative z-10 space-y-3 pt-2">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-0.5">
            <Label className="block text-[9px] font-black tracking-widest text-slate-400 uppercase">
              Estimasi Sisa
            </Label>
            <span className="text-lg leading-none font-black text-rose-500">
              Rp {remainingAmount}
            </span>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-slate-200/50 px-2 py-0.5 text-[10px] font-black text-slate-400 uppercase">
              {percentPaid}% Lunas
            </span>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200/70 p-0.5 shadow-inner">
          <div
            className="relative h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, percentPaid)}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
};
