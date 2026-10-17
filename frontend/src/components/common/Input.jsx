import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  prefix,
  suffix,
  className = '',
  inputClassName = '',
  autoComplete,
  autoFocus = false,
  inputMode,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || Math.random().toString(36).substring(2, 9);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-primary flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-status-exceeded ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {prefix && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted font-medium text-base">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`w-full h-12 bg-surface text-text-primary text-base placeholder:text-text-muted/60 rounded-lg border transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50 disabled:bg-background ${
            prefix ? 'pl-9' : 'pl-3.5'
          } ${isPassword || suffix ? 'pr-20' : 'pr-3.5'} ${
            error ? 'border-status-exceeded' : 'border-surface-border'
          } ${inputClassName}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 px-2.5 py-1 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-background rounded flex items-center gap-1 transition-colors select-none"
          >
            {showPassword ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show</span>
              </>
            )}
          </button>
        )}

        {!isPassword && suffix && (
          <div className="absolute right-3.5 flex items-center pointer-events-none text-text-muted text-sm">
            {suffix}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-status-exceeded mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="text-xs text-text-muted mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
