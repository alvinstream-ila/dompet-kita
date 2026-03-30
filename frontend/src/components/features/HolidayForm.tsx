import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatToRupiah, getTerbilang } from '@/lib/utils';
import type { Holiday } from '@/hooks/useHolidays';

interface HolidayFormProps {
  initialData?: Partial<Holiday>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HolidayForm: React.FC<HolidayFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    destination: initialData?.destination || '',
    budget: initialData?.budget || 0,
    start_date: initialData?.start_date || '',
    status: initialData?.status || 'planning',
  });

  const isEditing = !!initialData?.destination;
  const submitLabel = isLoading ? (
    <Loader2 className="animate-spin mx-auto" />
  ) : (
    isEditing ? 'Simpan Perubahan' : 'Buat Rencana'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destinasi</Label>
          <Input 
            placeholder="Mau kemana Sayang?" 
            value={formData.destination}
            onChange={(e) => setFormData({...formData, destination: e.target.value})}
            className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Budget Estimasi</Label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
            <Input 
              type="text"
              placeholder="Berapa kira-kira biayanya?" 
              value={formData.budget > 0 ? formatToRupiah(formData.budget.toString()) : ''}
              onChange={(e) => {
                const val = e.target.value.replaceAll(/\D/g, '');
                setFormData({...formData, budget: val ? Number.parseInt(val) : 0});
              }}
              className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 pl-14 pr-6 font-bold text-slate-700"
              required
            />
          </div>
          {formData.budget > 0 && (
            <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mt-2 ml-1">
              {getTerbilang(formData.budget)} Rupiah
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kapan Kita Berangkat? ✈️</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700 justify-start text-left",
                  !formData.start_date && "text-slate-400"
                )}
              >
                <CalendarIcon className="mr-3 size-4 opacity-50" />
                {formData.start_date ? (
                  format(new Date(formData.start_date), "PPP")
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="start">
              <Calendar
                mode="single"
                selected={formData.start_date ? new Date(formData.start_date) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setFormData({ ...formData, start_date: date.toISOString().split('T')[0] });
                  }
                }}
                autoFocus
                className="p-4"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(v) => setFormData({...formData, status: v as Holiday['status']})}
          >
            <SelectTrigger className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="planning" className="rounded-xl font-bold uppercase text-[10px]">Planning</SelectItem>
              <SelectItem value="booked" className="rounded-xl font-bold uppercase text-[10px]">Booked</SelectItem>
              <SelectItem value="completed" className="rounded-xl font-bold uppercase text-[10px]">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button 
          type="button" 
          variant="ghost" 
          className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400" 
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
