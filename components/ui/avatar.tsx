import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

export const Avatar = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Root ref={ref} className={cn('inline-flex items-center justify-center overflow-hidden rounded-full bg-stone-200', className)} {...props} />
  )
);
Avatar.displayName = 'Avatar';
