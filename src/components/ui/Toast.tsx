import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

interface Toast {
  id: string;
  title?: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getToastStyles = (type: Toast['type']) => {
    const baseStyles = 'neural-card p-4 border-l-4 shadow-lg';
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-green-500 bg-green-500/10`;
      case 'error':
        return `${baseStyles} border-l-red-500 bg-red-500/10`;
      case 'warning':
        return `${baseStyles} border-l-yellow-500 bg-yellow-500/10`;
      case 'info':
      default:
        return `${baseStyles} border-l-neural-blue bg-neural-blue/10`;
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      <ToastPrimitive.Provider>
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={getToastStyles(toast.type)}
            duration={toast.duration}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            data-readability="false"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getToastIcon(toast.type)}
              </span>
              
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <ToastPrimitive.Title className="font-semibold text-text-primary mb-1">
                    {toast.title}
                  </ToastPrimitive.Title>
                )}
                
                <ToastPrimitive.Description className="text-sm text-text-secondary">
                  {toast.description}
                </ToastPrimitive.Description>
              </div>
              
              <ToastPrimitive.Close
                className="text-text-tertiary hover:text-text-primary transition-colors ml-2"
                aria-label="Close"
              >
                ✕
              </ToastPrimitive.Close>
            </div>
          </ToastPrimitive.Root>
        ))}
        
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[100vw-16px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

// Convenience hook for common toast actions
export const useToastActions = () => {
  const { addToast } = useToast();
  
  return {
    success: (description: string, title?: string) => 
      addToast({ type: 'success', description, title }),
    error: (description: string, title?: string) => 
      addToast({ type: 'error', description, title }),
    info: (description: string, title?: string) => 
      addToast({ type: 'info', description, title }),
    warning: (description: string, title?: string) => 
      addToast({ type: 'warning', description, title }),
  };
};