import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
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
import { cn, formatToRupiah, getTerbilang } from '@/lib/utils';
import type { Holiday } from '../hooks/useHolidays';

interface HolidayFormProps {
  initialData?: Partial<Holiday>;
  onSubmit: (data: Partial<Holiday>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HolidayForm: React.FC<HolidayFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    destination: initialData?.destination || '',
    budget: initialData?.budget || 0,
    start_date: initialData?.start_date || '',
    status: initialData?.status || 'planning',
    image_url: initialData?.image_url || '',
  });

  const previewUrl = formData.destination
    ? `https://loremflickr.com/800/450/${encodeURIComponent(formData.destination)},landscape,travel`
    : 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80';

  const isEditing = !!initialData?.destination;

  let submitLabel: React.ReactNode;
  if (isLoading) {
    submitLabel = <Loader2 className="mx-auto animate-spin" />;
  } else if (isEditing) {
    submitLabel = 'Simpan Perubahan';
  } else {
    submitLabel = 'Buat Rencana';
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {/* Destination Preview */}
      <div className="relative mb-8 h-48 w-full overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50">
        <Image
          src={formData.image_url || previewUrl}
          alt="Preview"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-white/60 to-transparent" />
        <div className="absolute bottom-6 left-6 font-black tracking-tight text-slate-800">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Preview Destinasi
          </p>
          <h3 className="text-xl">
            {formData.destination || 'Tentukan Tujuan Sayang...'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Destinasi
          </Label>
          <Input
            placeholder="Mau kemana Sayang?"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Budget Estimasi
          </Label>
          <div className="relative">
            <span className="absolute top-1/2 left-6 -translate-y-1/2 font-black text-slate-400">
              Rp
            </span>
            <Input
              type="text"
              placeholder="Berapa kira-kira biayanya?"
              value={
                formData.budget > 0
                  ? formatToRupiah(formData.budget.toString())
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value.replaceAll(/\D/g, '');
                setFormData({
                  ...formData,
                  budget: val ? Number.parseInt(val, 10) : 0,
                });
              }}
              className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pr-6 pl-14 font-bold text-slate-700"
              required
            />
          </div>
          {formData.budget > 0 && (
            <p className="mt-2 ml-1 text-[10px] font-black tracking-widest text-pink-500 uppercase">
              {getTerbilang(formData.budget)} Rupiah
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Kapan Kita Berangkat? ✈️
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-14 w-full justify-start rounded-2xl border-slate-100 bg-slate-50/50 px-6 text-left font-bold text-slate-700',
                  !formData.start_date && 'text-slate-400'
                )}
              >
                <CalendarIcon className="mr-3 size-4 opacity-50" />
                {formData.start_date ? (
                  format(new Date(formData.start_date), 'PPP')
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto rounded-3xl border-none p-0 shadow-2xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={
                  formData.start_date
                    ? new Date(formData.start_date)
                    : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    setFormData({
                      ...formData,
                      start_date: date.toISOString().split('T')[0],
                    });
                  }
                }}
                autoFocus
                className="p-4"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData({ ...formData, status: v as Holiday['status'] })
            }
          >
            <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem
                value="planning"
                className="rounded-xl text-[10px] font-bold uppercase"
              >
                Planning
              </SelectItem>
              <SelectItem
                value="booked"
                className="rounded-xl text-[10px] font-bold uppercase"
              >
                Booked
              </SelectItem>
              <SelectItem
                value="completed"
                className="rounded-xl text-[10px] font-bold uppercase"
              >
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="h-14 flex-1 rounded-2xl font-black tracking-widest text-slate-400 uppercase"
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-14 flex-1 rounded-2xl bg-slate-900 font-black tracking-widest text-white uppercase shadow-xl shadow-slate-200 hover:bg-slate-800"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
