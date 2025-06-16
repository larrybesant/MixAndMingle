import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'px-4 py-2 rounded font-semibold transition-colors',
          variant === 'default' && 'bg-stone-900 text-white hover:bg-stone-700',
          variant === 'outline' && 'border border-stone-900 text-stone-900 bg-white hover:bg-stone-100',
          variant === 'ghost' && 'bg-transparent hover:bg-stone-100',
          variant === 'link' && 'underline text-stone-900 hover:text-stone-700',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
