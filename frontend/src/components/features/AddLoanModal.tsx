import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  X,
  Calendar as CalendarIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  User,
  FileText,
  Wallet
} from 'lucide-react';
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAddLoan, useUpdateLoan } from '@/hooks/useLoans';
import type { Loan } from '@/types';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan?: Loan | null;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, loan }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'utang' | 'piutang'>('utang');
  const [amount, setAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<'active' | 'paid'>('active');

  const { mutateAsync: addLoan } = useAddLoan();
  const { mutateAsync: updateLoan } = useUpdateLoan();

  useEffect(() => {
    if (loan && isOpen) {
      setType(loan.type);
      setAmount(formatToRupiah(loan.amount.toString()));
      setRemainingAmount(formatToRupiah(loan.remaining_amount.toString()));
      setPaymentAmount('');
      setContactName(loan.contact_name);
      setDescription(loan.description);
      setTransactionDate(loan.created_at ? parseISO(loan.created_at) : new Date());
      setDueDate(loan.due_date ? parseISO(loan.due_date) : undefined);
      setStatus(loan.status);
    } else if (!loan && isOpen) {
      // Reset form for fresh add
      setType('utang');
      setAmount('');
      setRemainingAmount('');
      setPaymentAmount('');
      setContactName('');
      setDescription('');
      setTransactionDate(new Date());
      setDueDate(undefined);
      setStatus('active');
    }
  }, [loan, isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatToRupiah(value);
    setAmount(formatted);
    // If adding new, set remaining default to amount
    if (!loan) {
      setRemainingAmount(formatted);
    }
  };

  const handleRemainingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatToRupiah(value);
    setRemainingAmount(formatted);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!loan) return;
    const value = e.target.value;
    const formatted = formatToRupiah(value);
    setPaymentAmount(formatted);
    
    // Calculate new remaining
    const paymentVal = parseInt(formatted.replace(/\./g, '')) || 0;
    const newRemaining = Math.max(0, loan.remaining_amount - paymentVal);
    setRemainingAmount(formatToRupiah(newRemaining.toString()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !contactName || !description) return;
    
    setLoading(true);
    try {
      const numAmount = parseInt(amount.replace(/\./g, ''));
      const numRemaining = parseInt(remainingAmount.replace(/\./g, '') || amount.replace(/\./g, ''));
      
      const payload = {
        type,
        amount: numAmount,
        remaining_amount: numRemaining,
        description,
        contact_name: contactName,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        created_at: format(transactionDate, "yyyy-MM-dd"),
        status: numRemaining <= 0 ? 'paid' : status
      };

      if (loan) {
        await updateLoan({
          id: loan.id,
          ...payload
        });
      } else {
        await addLoan(payload);
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      const errorMsg = (error as any).response?.data?.message || 'Gagal menyimpan titipan sayang.. 🥺';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const activeColorClass = type === 'utang' ? 'bg-rose-500 border-rose-500' : 'bg-emerald-600 border-emerald-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[440px] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl bg-white">
        <DialogHeader className={cn("p-6 pb-8 text-white relative overflow-hidden transition-colors duration-500 min-h-[120px] flex flex-col justify-end", activeColorClass)}>
          <div className="relative z-10 space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">{loan ? 'Update Progress Pelunasan' : 'Catat Titipan Baru'}</p>
             <DialogTitle className="text-2xl font-black flex items-center gap-2.5 tracking-tighter text-white">
               {type === 'utang' ? <ArrowDownCircle className="size-6" /> : <ArrowUpCircle className="size-6" />}
               {loan ? 'BAYAR' : 'TAMBAH'} {type === 'utang' ? 'HUTANG' : 'PIUTANG'}
             </DialogTitle>
             <DialogDescription className="sr-only">
               Formulir untuk menambah atau mengupdate data hutang dan piutang.
             </DialogDescription>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute -left-10 bottom-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />
          
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full text-white hover:bg-white/20 hover:text-white transition-all active:scale-90 z-50 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto scrollbar-none px-6 pb-8 -mt-4 relative z-20">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {!loan && (
              <Tabs value={type} onValueChange={(v: string) => setType(v as 'utang' | 'piutang')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100/80 backdrop-blur-xs shadow-inner rounded-2xl border border-slate-200/50 h-auto">
                  <TabsTrigger 
                    value="utang" 
                    className="py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-wider data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    HUTANG
                  </TabsTrigger>
                  <TabsTrigger 
                    value="piutang" 
                    className="py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-wider data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                  >
                    PIUTANG
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <User className="size-3 text-slate-400" /> Pihak Terkait
                </Label>
                <Input
                  placeholder="Misal : Teman Kantor / Saudara"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full h-11 bg-slate-50 border-slate-200/60 rounded-xl px-4 focus-visible:ring-slate-300 font-bold text-sm shadow-xs transition-all focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FileText className="size-3 text-slate-400" /> Keterangan
                </Label>
                <Input
                  placeholder="Sewa kos / Pinjem beli makan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 bg-slate-50 border-slate-200/60 rounded-xl px-4 focus-visible:ring-slate-300 font-bold text-sm shadow-xs transition-all focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <CalendarIcon className="size-3 text-slate-400" /> Tgl Mulai
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-bold text-sm h-11 rounded-xl bg-slate-50 border-slate-200/60 hover:bg-slate-100 px-4 shadow-xs",
                          !transactionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {transactionDate ? format(transactionDate, "d MMM yyyy", { locale: id }) : <span>Pilih</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="start">
                      <Calendar
                        mode="single"
                        selected={transactionDate}
                        onSelect={(d) => d && setTransactionDate(d)}
                        initialFocus
                        className="bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <CalendarIcon className="size-3 text-slate-400" /> Deadline
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-bold text-sm h-11 rounded-xl bg-slate-50 border-slate-200/60 hover:bg-slate-100 px-4 shadow-xs",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {dueDate ? format(dueDate, "d MMM yyyy", { locale: id }) : <span>Batas Bayar</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        className="bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {loan ? (
              <div className="mt-2 space-y-5 bg-slate-50/80 backdrop-blur-xs p-5 rounded-[28px] border border-slate-200/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Amanah</Label>
                    <p className="text-base font-black text-slate-700">Rp {amount}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block">Terbayar</Label>
                    <p className="text-base font-black text-emerald-600">
                      Rp {formatToRupiah((loan.amount - loan.remaining_amount).toString())}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <Label className="text-[10px] font-black text-pink-500 uppercase tracking-[0.15em] flex items-center gap-2 px-1">
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
                      className="w-full h-14 bg-white border-pink-200 focus:border-pink-400 rounded-2xl px-5 text-2xl font-black text-pink-600 focus-visible:ring-pink-100 shadow-sm transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-200 pointer-events-none">
                      <ArrowUpCircle className="size-6 rotate-45 opacity-20" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 relative z-10 space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <div className="space-y-0.5">
                      <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Estimasi Sisa</Label>
                      <span className="text-lg font-black text-rose-500 leading-none">Rp {remainingAmount}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-200/50 px-2 py-0.5 rounded-full">
                        {Math.round((1 - (parseInt(remainingAmount.replace(/\./g, '')) || 0) / (parseInt(amount.replace(/\./g, '')) || 1)) * 100)}% Lunas
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200/70 rounded-full overflow-hidden shadow-inner p-0.5">
                     <div 
                      className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out relative group-hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      style={{ 
                        width: `${Math.min(100, (1 - (parseInt(remainingAmount.replace(/\./g, '')) || 0) / (parseInt(amount.replace(/\./g, '')) || 1)) * 100)}%` 
                      }}
                     >
                       <div className="absolute inset-0 bg-white/20 animate-pulse" />
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Total (Rp)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full h-11 bg-slate-50 border-slate-200/60 rounded-xl px-4 font-black text-slate-900 focus-visible:ring-slate-300 shadow-xs transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-pink-500 uppercase tracking-widest px-1">Sisa (Rp)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={remainingAmount}
                    onChange={handleRemainingChange}
                    className="w-full h-11 bg-pink-50/30 border-pink-100 rounded-xl px-4 font-black text-pink-600 focus-visible:ring-pink-200 shadow-xs transition-all"
                    required
                  />
                </div>
              </div>
            )}
            
            {(loan ? paymentAmount : remainingAmount) && (
              <div className="mx-1 px-3 py-2 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-center gap-2">
                 <div className="size-1.5 bg-blue-400 rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold text-blue-600 italic tracking-tight">
                   {getTerbilang(parseInt((loan ? paymentAmount : remainingAmount).replace(/\./g, '')))} Rupiah
                 </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-14 rounded-[24px] shadow-xl active:scale-[0.97] transition-all text-sm font-black tracking-widest text-white uppercase mt-4 overflow-hidden group relative",
                type === 'utang' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              )}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                   {loan ? "Update Progres Bayar ✨" : "Simpan Titipan ✨"}
                </span>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
