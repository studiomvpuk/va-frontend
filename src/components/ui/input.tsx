import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const FIELD = cn(
  'w-full rounded-md border border-line bg-surface px-4 py-3.5 text-base text-ink',
  'placeholder:text-ink-muted',
  'transition-colors duration-fast ease-out hover:border-line-strong',
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60',
);

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(FIELD, error && 'border-danger', className)}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, className, id, ...props }, ref) {
    const generated = useId();
    const fieldId = id ?? generated;
    const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={5}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(FIELD, 'resize-y', error && 'border-danger', className)}
          {...props}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="text-sm text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="text-sm text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
