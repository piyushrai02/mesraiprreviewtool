import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...props, id };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);
    
    return { id };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toastId));
    } else {
      setToasts([]);
    }
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}