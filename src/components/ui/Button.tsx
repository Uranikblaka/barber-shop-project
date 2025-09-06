import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-medium transition-smooth focus-ring disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'button-primary',
    secondary: 'button-secondary',
    accent: 'button-accent',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary/20',
    ghost: 'hover:bg-muted text-foreground focus:ring-muted/20',
    link: 'text-primary underline-offset-4 hover:underline focus:ring-primary/20',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-13 px-8 text-lg',
    xl: 'h-16 px-10 text-xl',
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        'focus-visible:focus-visible',
        className
      )}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };