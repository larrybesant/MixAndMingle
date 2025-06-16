import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('border border-stone-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900', className)}
      {...props}
    />
  )
);
Input.displayName = 'Input';
