import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this information. Please check your connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 bg-surface rounded-xl border border-status-exceeded/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-status-exceeded-bg flex items-center justify-center text-status-exceeded mb-3 border border-status-exceeded/20">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" icon={RefreshCw}>
          Try again
        </Button>
      )}
    </div>
  );
}
