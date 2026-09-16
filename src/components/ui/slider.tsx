'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * The minimum fit score control.
 *
 * Accent fills to the left of the thumb, near-black track to the right — the
 * fill is showing how much of the range is being excluded, so it earns the
 * accent. Rendered with a native range input so keyboard and screen-reader
 * behaviour is correct without reimplementing it.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.5,
  label,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  className?: string;
}) {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value.toFixed(1)} out of ${max}`}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background:
            `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percent}%, ` +
            `var(--color-bg-dark) ${percent}%, var(--color-bg-dark) 100%)`,
        }}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-pill',
          '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-pill',
          '[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:rounded-pill [&::-moz-range-thumb]:bg-accent',
        )}
      />
    </div>
  );
}
