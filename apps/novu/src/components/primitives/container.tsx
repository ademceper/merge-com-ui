import { cn } from '@merge/ui/lib/utils';

export const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('mx-auto w-full max-w-[1152px] px-14 py-14', className)}>{children}</div>;
};
