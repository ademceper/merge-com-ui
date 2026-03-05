import { HTMLAttributes } from 'react';
import { cn } from '@merge/ui/lib/utils';

type TabsSectionProps = HTMLAttributes<HTMLDivElement>;

export const TabsSection = (props: TabsSectionProps) => {
  const { className, ...rest } = props;
  return <div className={cn('flex flex-col gap-3 px-3 py-5', className)} {...rest} />;
};
