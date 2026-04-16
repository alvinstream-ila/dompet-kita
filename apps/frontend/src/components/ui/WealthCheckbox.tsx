'use client';

import { Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex h-5 w-5 items-center justify-center">
        <input
          type="checkbox"
          className={cn(
            'peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-slate-200 bg-white ring-offset-white transition-all duration-200 checked:border-blue-600 checked:bg-blue-600 hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <Check
          className="pointer-events-none absolute size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          strokeWidth={4}
        />
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
