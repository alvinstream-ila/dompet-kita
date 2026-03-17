import React, { useState } from 'react';
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
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
import { useAddLoan } from '@/hooks/useLoans';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'utang' | 'piutang'>('utang');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const { mutateAsync: addLoan } = useAddLoan();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatToRupiah(value);
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !contactName || !description) return;
    
    setLoading(true);
    try {
      const numAmount = parseInt(amount.replace(/\./g, ''));
      await addLoan({
        type,
        amount: numAmount,
        remaining_amount: numAmount,
        description,
        contact_name: contactName,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        created_at: format(transactionDate, "yyyy-MM-dd"),
        status: 'active'
      });
      
      onClose();
      // Reset form
      setAmount('');
      setContactName('');
      setDescription('');
      setTransactionDate(new Date());
      setDueDate(undefined);
    } catch (error) {
      console.error(error);
      alert('Gagal nambahin titipan sayang.. 🥺');
    } finally {
      setLoading(false);
    }
  };

  const activeColorClass = type === 'utang' ? 'bg-rose-500 border-rose-500' : 'bg-emerald-600 border-emerald-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
        <DialogHeader className={cn("p-6 pb-10 text-white relative overflow-hidden transition-colors duration-500", activeColorClass)}>
          <div className="relative z-10 space-y-0.5">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Catat Titipan Baru</p>
             <DialogTitle className="text-xl font-black flex items-center gap-2 tracking-tight text-white">
               {type === 'utang' ? <ArrowDownCircle className="size-5" /> : <ArrowUpCircle className="size-5" />}
               TAMBAH {type === 'utang' ? 'HUTANG' : 'PIUTANG'}
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
          <Tabs value={type} onValueChange={(v: string) => setType(v as 'utang' | 'piutang')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white shadow-lg rounded-xl border border-slate-100 h-auto">
              <TabsTrigger 
                value="utang" 
                className="py-2.5 rounded-lg font-black text-[10px] transition-all uppercase tracking-wider data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                HUTANG (MASUK)
              </TabsTrigger>
              <TabsTrigger 
                value="piutang" 
                className="py-2.5 rounded-lg font-black text-[10px] transition-all uppercase tracking-wider data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                PIUTANG (KELUAR)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1 flex items-center gap-2">
              <User className="size-3 text-slate-400" /> Nama Pihak Terkait
            </Label>
            <Input
              placeholder="Misal : Teman Kantor / Saudara"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full h-10 bg-slate-50 border-slate-200 rounded-xl px-3.5 focus-visible:ring-slate-200 font-bold text-[12px] placeholder:text-slate-400 placeholder:font-medium"
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1 flex items-center gap-2">
              <FileText className="size-3 text-slate-400" /> Keterangan Titipan
            </Label>
            <Input
              placeholder="Sewa kos / Pinjem beli makan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 bg-slate-50 border-slate-200 rounded-xl px-3.5 focus-visible:ring-slate-200 font-bold text-[12px] placeholder:text-slate-400 placeholder:font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1 flex items-center gap-2">
                <CalendarIcon className="size-3 text-slate-400" /> Tanggal Mulai
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-bold text-[12px] h-10 rounded-xl bg-slate-50 border-slate-200 hover:bg-slate-100 px-3.5",
                      !transactionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                    {transactionDate ? format(transactionDate, "d MMM yyyy", { locale: id }) : <span>Pilih</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
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

            <div className="space-y-1.5 flex flex-col">
              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1 flex items-center gap-2">
                <CalendarIcon className="size-3 text-slate-400" /> Jatuh Tempo
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-bold text-[12px] h-10 rounded-xl bg-slate-50 border-slate-200 hover:bg-slate-100 px-3.5",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
                    {dueDate ? format(dueDate, "d MMM yyyy", { locale: id }) : <span>Jatuh Tempo</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
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

          <div className="space-y-1.5 flex flex-col pt-1">
            <div className="flex justify-between items-end px-1">
              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="size-3 text-slate-400" /> Nominal (Rp)
              </Label>
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

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-11 rounded-2xl shadow-lg active:scale-[0.98] transition-all text-[12px] font-black tracking-widest text-white uppercase mt-4",
              type === 'utang' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
            )}
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "SIMPAN TITIPAN ✨"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
