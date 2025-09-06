import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconVariants = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-down',
        variants[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconVariants[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{toast.title}</div>
        {toast.description && (
          <div className="text-sm opacity-90 mt-1">{toast.description}</div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(toast.id)}
        className="h-6 w-6 p-0 hover:bg-black/10"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Convenience functions
export const toast = {
  success: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ type: 'success', title, description });
    }
  },
  error: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ type: 'error', title, description });
    }
  },
  info: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ type: 'info', title, description });
    }
  },
  warning: (title: string, description?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.addToast({ type: 'warning', title, description });
    }
  },
};