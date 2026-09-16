'use client';

import { motion } from 'motion/react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { duration } from '../motion/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  // The accent means "act here". Exactly one primary per view.
  primary: 'bg-accent text-ink-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-neutral-subtle',
  danger: 'bg-danger-subtle text-danger hover:bg-danger hover:text-ink-on-danger',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, children, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={props.disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: duration('instant') }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors duration-fast ease-out',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
});
