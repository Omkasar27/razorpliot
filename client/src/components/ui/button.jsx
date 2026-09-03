import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-accent)] text-white hover:opacity-90',
        outline:
          'border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)]',
        ghost: 'hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]',
        destructive: 'bg-[var(--color-danger)] text-white hover:opacity-90',
        link: 'text-[var(--color-accent)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-5',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };