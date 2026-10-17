import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatMonthName, getPreviousMonth, getNextMonth, getCurrentMonth } from '../../utils/dates';

export default function MonthPicker({ currentMonth, onMonthChange, className = '' }) {
  const current = currentMonth || getCurrentMonth();
  const isCurrentMonth = current === getCurrentMonth();

  const handlePrev = () => {
    onMonthChange(getPreviousMonth(current));
  };

  const handleNext = () => {
    onMonthChange(getNextMonth(current));
  };

  const handleResetToCurrent = () => {
    onMonthChange(getCurrentMonth());
  };

  return (
    <div className={`flex items-center gap-1.5 bg-surface border border-surface-border rounded-lg p-1 ${className}`}>
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous month"
        className="w-9 h-9 flex items-center justify-center rounded text-text-primary hover:bg-background active:scale-95 transition-transform"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        <Calendar className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-semibold text-text-primary select-none whitespace-nowrap">
          {formatMonthName(current)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next month"
        className="w-9 h-9 flex items-center justify-center rounded text-text-primary hover:bg-background active:scale-95 transition-transform"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleResetToCurrent}
          className="ml-1 px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/10 rounded transition-colors whitespace-nowrap"
        >
          This month
        </button>
      )}
    </div>
  );
}
