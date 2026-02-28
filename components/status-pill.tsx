import { cn } from '@/lib/utils';
import type { VenueStatus } from '@/lib/types';
import { statusLabels, statusColors } from '@/lib/mock-data';

interface StatusPillProps {
  status: VenueStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const colors = statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {label}
    </span>
  );
}
