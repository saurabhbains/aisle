import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                isCompleted && 'bg-secondary text-secondary-foreground',
                isCurrent && 'bg-primary text-primary-foreground',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 transition-colors',
                  isCompleted ? 'bg-secondary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
