import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('rp-overlay fixed inset-0 z-50 bg-black/30', className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = forwardRef(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'sheet-content fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl flex flex-col',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 text-[var(--color-ink)]/40 hover:text-[var(--color-ink)] focus-visible:outline-none">
        <X size={18} />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn('flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]', className)}
    {...props}
  />
);

const SheetTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };