import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  ...props
}) {
  const selectId = id || name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-text-primary flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-status-exceeded ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-help` : undefined}
          className={`w-full h-12 bg-surface text-text-primary text-base rounded-lg border appearance-none px-3.5 pr-10 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50 disabled:bg-background ${
            error ? 'border-status-exceeded' : 'border-surface-border'
          } ${selectClassName}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-text-muted">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} role="alert" className="text-xs font-medium text-status-exceeded mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-help`} className="text-xs text-text-muted mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
