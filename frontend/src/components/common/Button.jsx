import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-transform duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  // Height is minimum 48px for primary/secondary buttons (touch targets min 44px, design spec min 48px)
  const sizeStyles = {
    sm: 'h-10 px-4 text-sm gap-1.5',
    md: 'h-12 px-5 text-base gap-2',
    lg: 'h-14 px-6 text-lg gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-action-primary text-white hover:bg-action-hover border border-action-primary',
    secondary: 'bg-surface text-text-primary border border-surface-border hover:bg-background',
    accent: 'bg-accent text-white hover:bg-accent-hover border border-accent',
    danger: 'bg-status-exceeded text-white hover:bg-[#B02525] border border-status-exceeded',
    ghost: 'bg-transparent text-text-primary hover:bg-surface-border/40',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="text-current" />
          <span>{loadingText || 'Please wait...'}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
