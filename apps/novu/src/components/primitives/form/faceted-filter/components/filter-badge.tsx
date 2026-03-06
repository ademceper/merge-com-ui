import { cn } from '@merge-rd/ui/lib/utils';
import { Badge } from '@/components/primitives/badge';
import { STYLES } from '../styles';
import { SizeType } from '../types';

interface FilterBadgeProps {
  content: React.ReactNode;
  size: SizeType;
  className?: string;
}

export function FilterBadge({ content, size, className }: FilterBadgeProps) {
  return (
    <Badge
      variant="lighter"
      color="gray"
      className={cn(
        'rounded-md border-neutral-100 bg-neutral-50 font-normal text-neutral-600 shadow-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        'transition-colors duration-200 ease-out',
        'hover:text-neutral-650 hover:border-neutral-200/70 hover:bg-neutral-100/50 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/50 dark:hover:text-neutral-200',
        STYLES.size[size].badge,
        className
      )}
    >
      {content}
    </Badge>
  );
}
