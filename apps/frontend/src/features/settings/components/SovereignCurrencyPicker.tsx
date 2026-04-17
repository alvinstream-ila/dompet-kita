'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// --- Sovereign Currency Data (2026 Standard) ---
export interface CurrencyMetadata {
  code: string;
  name: string;
  symbol: string;
  countryCode: string;
}

const CURRENCIES: CurrencyMetadata[] = [
  { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp', countryCode: 'ID' },
  { code: 'USD', name: 'US Dollar', symbol: '$', countryCode: 'US' },
  { code: 'EUR', name: 'Euro', symbol: '€', countryCode: 'EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', countryCode: 'GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', countryCode: 'JP' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', countryCode: 'SG' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', countryCode: 'MY' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', countryCode: 'SA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', countryCode: 'AU' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', countryCode: 'KR' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', countryCode: 'CN' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', countryCode: 'HK' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', countryCode: 'CA' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr.', countryCode: 'CH' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', countryCode: 'TH' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', countryCode: 'VN' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', countryCode: 'PH' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', countryCode: 'IN' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', countryCode: 'BR' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', countryCode: 'MX' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', countryCode: 'TR' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', countryCode: 'ZA' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', countryCode: 'NZ' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', countryCode: 'AE' },
];

const RECOMMENDED_CODES = new Set(['IDR', 'USD', 'EUR', 'SGD', 'JPY']);

interface SovereignCurrencyPickerProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

/**
 * Sovereign Currency Picker (2026 Future-Standard) 🎆
 * A professional Bento-Search selection interface with SVG flag integration.
 */
export function SovereignCurrencyPicker({
  value,
  onValueChange,
}: SovereignCurrencyPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCurrency = useMemo(
    () => CURRENCIES.find((c) => c.code === value) || CURRENCIES[0],
    [value]
  );

  const filteredCurrencies = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  const recommendedCurrencies = useMemo(
    () => filteredCurrencies.filter((c) => RECOMMENDED_CODES.has(c.code)),
    [filteredCurrencies]
  );

  const otherCurrencies = useMemo(
    () => filteredCurrencies.filter((c) => !RECOMMENDED_CODES.has(c.code)),
    [filteredCurrencies]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between rounded-xl border-slate-200 bg-white px-4 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="relative size-6 overflow-hidden rounded-[4px] border border-slate-100 shadow-sm">
              <img
                src={`https://flagsapi.com/${selectedCurrency.countryCode}/flat/64.png`}
                alt={selectedCurrency.code}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-black tracking-tight text-slate-800">
                {selectedCurrency.code} — {selectedCurrency.symbol}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                {selectedCurrency.name}
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Search className="size-3.5 text-slate-300" />
          </motion.div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] overflow-hidden rounded-2xl border-white/40 bg-white/80 p-0 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col">
          {/* Search Header */}
          <div className="relative flex items-center border-b border-slate-100 p-3">
            <Search className="absolute left-6 size-4 text-slate-300" />
            <input
              autoFocus
              className="h-9 w-full rounded-xl bg-slate-100/50 pr-4 pl-9 text-xs font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none"
              placeholder="Cari mata uang, nama, atau simbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-6 rounded-full bg-slate-200/50 p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>

          <div className="scrollbar-hide max-h-[380px] overflow-y-auto p-2">
            {/* Recommended Section */}
            {recommendedCurrencies.length > 0 && !search && (
              <div className="mb-4">
                <div className="mb-2 px-3 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  Rekomendasi Pintar (AI)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {recommendedCurrencies.map((c) => (
                    <CurrencyItem
                      key={c.code}
                      currency={c}
                      isSelected={value === c.code}
                      onClick={() => {
                        onValueChange(c.code);
                        setOpen(false);
                        setSearch('');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main List */}
            <div className="space-y-1">
              <div className="mb-2 px-3 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                {search ? 'Hasil Pencarian' : 'Semua Mata Uang'}
              </div>
              {filteredCurrencies.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-bold text-slate-300">
                  Mata uang tidak ditemukan, Sayang! 🔍
                </div>
              ) : (
                otherCurrencies.map((c) => (
                  <CurrencyRow
                    key={c.code}
                    currency={c}
                    isSelected={value === c.code}
                    onClick={() => {
                      onValueChange(c.code);
                      setOpen(false);
                      setSearch('');
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Internal Sub-components ---

function CurrencyItem({
  currency,
  isSelected,
  onClick,
}: Readonly<{
  currency: CurrencyMetadata;
  isSelected: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
        isSelected
          ? 'border-blue-royal/20 bg-blue-royal/5 ring-blue-royal/10 ring-1'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
      )}
    >
      <div className="relative size-8 overflow-hidden rounded-md border border-slate-100 shadow-sm">
        <img
          src={`https://flagsapi.com/${currency.countryCode}/flat/64.png`}
          alt={currency.code}
          className="size-full object-cover"
        />
      </div>
      <div className="text-center">
        <div className="text-[11px] font-black text-slate-800">
          {currency.code}
        </div>
        <div className="text-[9px] font-bold text-slate-400">
          {currency.symbol}
        </div>
      </div>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-blue-royal absolute top-1 right-1 rounded-full p-0.5 text-white"
          >
            <Check className="size-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function CurrencyRow({
  currency,
  isSelected,
  onClick,
}: Readonly<{
  currency: CurrencyMetadata;
  isSelected: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all',
        isSelected
          ? 'bg-slate-900 text-white shadow-lg'
          : 'hover:bg-slate-100/80 active:scale-[0.99]'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="size-6 overflow-hidden rounded-[4px] border border-slate-200">
          <img
            src={`https://flagsapi.com/${currency.countryCode}/flat/64.png`}
            alt={currency.code}
            className="size-full object-cover"
          />
        </div>
        <div className="text-start">
          <div
            className={cn(
              'text-[10px] leading-tight font-black',
              isSelected ? 'text-white' : 'text-slate-800'
            )}
          >
            {currency.code} — {currency.name}
          </div>
          <div className="text-[9px] font-bold text-slate-400">
            Simbol: {currency.symbol}
          </div>
        </div>
      </div>
      {isSelected && <Check className="size-3 text-white" />}
    </button>
  );
}
