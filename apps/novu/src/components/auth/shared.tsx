
import { useNavigate } from 'react-router-dom';
import { cn } from '@merge-rd/ui/lib/utils';
import { CaretLeft } from '@phosphor-icons/react';

interface StepIndicatorProps {
  step: number;
  className?: string;
  hideBackButton?: boolean;
}

export function StepIndicator({ step, className, hideBackButton }: StepIndicatorProps) {
  const navigate = useNavigate();

  function handleGoBack() {
    navigate(-1);
  }

  return (
    <div className={cn('text-foreground-600 inline-flex items-center gap-0.5', className)}>
      {!hideBackButton && (
        <button
          onClick={handleGoBack}
          className="transition-colors hover:text-gray-700"
          type="button"
          aria-label="Go back to previous step"
        >
          <CaretLeft className="h-4 w-4" />
        </button>
      )}
      <span className="font-label-x-small text-xs">{step}/3</span>
    </div>
  );
}
