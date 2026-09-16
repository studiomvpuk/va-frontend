import { cn } from '@/lib/cn';
import { CountUp } from '../motion/count-up';

/** A dashboard figure. The number counts up; the label does not move. */
export function StatTile({
  value,
  label,
  decimals = 0,
  className,
}: {
  value: number;
  label: string;
  decimals?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1 px-6 py-6', className)}>
      <CountUp
        value={value}
        decimals={decimals}
        className="font-display text-3xl font-bold text-ink"
      />
      <p className="text-base text-ink-muted">{label}</p>
    </div>
  );
}
