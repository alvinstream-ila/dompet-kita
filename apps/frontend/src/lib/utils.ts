import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToRupiah(value: string | number): string {
  const numberString = value.toString().replaceAll(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(
    Number.parseInt(numberString, 10)
  );
}

export function getTerbilang(amount: number): string {
  if (!amount || amount === 0) return '';
  if (amount < 1000) return `${amount}`;

  const units = [
    { value: 1e12, label: 'Triliun' },
    { value: 1e9, label: 'Miliar' },
    { value: 1e6, label: 'Juta' },
    { value: 1e3, label: 'Ribu' },
  ];

  for (const unit of units) {
    if (amount >= unit.value) {
      const result = Math.floor(amount / unit.value);
      const remainder = amount % unit.value;
      const mainStr = `${result} ${unit.label}`;

      // Show one more level if it's significant (e.g., 1 Juta 500 Ribu)
      if (remainder >= unit.value / 1000 && remainder > 0) {
        const subUnitValue = unit.value / 1000;
        const subValue = Math.floor(remainder / subUnitValue);
        if (subValue > 0) {
          const subLabel =
            units.find((u) => u.value === subUnitValue)?.label || 'Ribu';
          return `${mainStr} ${subValue} ${subLabel}`;
        }
      }
      return mainStr;
    }
  }
  return '';
}

export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  // Handle ISO strings like "2026-04-22T00:00:00.000000Z"
  // or strings like "2026-04-22 00:00:00"
  const datePart = dateString.includes('T')
    ? dateString.split('T')[0]
    : dateString.split(' ')[0];

  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d);
}
