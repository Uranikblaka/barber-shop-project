import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  label,
  error,
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium text-foreground",
            required && "after:content-['*'] after:ml-0.5 after:text-destructive"
          )}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-visible:focus-visible',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
        ref={ref}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };