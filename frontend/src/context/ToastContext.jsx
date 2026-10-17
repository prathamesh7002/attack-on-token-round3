import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setToasts((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const value = {
    showToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed z-50 pointer-events-none flex flex-col gap-2 p-4 bottom-16 inset-x-0 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:max-w-md w-full items-center sm:items-end"
      >
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-status-safe" />;
          let borderClass = 'border-status-safe';
          let bgClass = 'bg-surface';

          if (toast.type === 'error' || toast.type === 'danger') {
            icon = <AlertCircle className="w-5 h-5 flex-shrink-0 text-status-exceeded" />;
            borderClass = 'border-status-exceeded';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 flex-shrink-0 text-status-warning" />;
            borderClass = 'border-status-warning';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 flex-shrink-0 text-text-primary" />;
            borderClass = 'border-surface-border';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-center justify-between gap-3 w-full max-w-sm px-4 py-3 rounded-lg border ${borderClass} ${bgClass} shadow-sm text-text-primary text-sm font-medium transition-all duration-200 transform translate-y-0`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
