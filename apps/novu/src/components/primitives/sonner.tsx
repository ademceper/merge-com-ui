import { cva, type VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiInformation2Fill, RiLoader4Line } from 'react-icons/ri';
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { cn } from '@/utils/ui';

export const Toaster = (props: ToasterProps) => {
  return <SonnerToaster className="toaster group" {...props} />;
};

const toastIconVariants = cva('size-5 shrink-0', {
  variants: {
    variant: {
      default: 'text-foreground-600',
      success: 'text-success',
      error: 'text-destructive',
      warning: 'text-warning',
      info: 'text-information',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ToastIconVariants = VariantProps<typeof toastIconVariants>;

const icons: Record<string, React.ElementType> = {
  default: RiLoader4Line,
  success: RiCheckboxCircleFill,
  error: RiErrorWarningFill,
  warning: RiErrorWarningFill,
  info: RiInformation2Fill,
};

export const ToastIcon = ({ variant = 'default', className }: ToastIconVariants & { className?: string }) => {
  const Icon = icons[variant ?? 'default'] ?? RiLoader4Line;
  return <Icon className={cn(toastIconVariants({ variant }), className)} />;
};

export type ToastProps = {
  variant?: 'lg' | 'default';
  title?: string;
  className?: string;
  children: ReactNode;
};

export const Toast = ({ variant = 'default', title, className, children }: ToastProps) => {
  return (
    <div
      className={cn(
        'bg-background text-foreground border-border flex items-center gap-2 rounded-lg border p-4 shadow-lg',
        variant === 'lg' && 'min-w-[356px]',
        className
      )}
    >
      {title && <span className="text-sm font-medium">{title}</span>}
      {children}
    </div>
  );
};

export const ToastClose = ({ close }: { close: () => void }) => {
  return (
    <button onClick={close} className="text-foreground-400 hover:text-foreground ml-auto">
      ×
    </button>
  );
};
