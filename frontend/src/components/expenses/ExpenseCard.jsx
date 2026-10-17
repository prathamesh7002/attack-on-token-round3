import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { formatRupees } from '../../utils/money';
import { formatFriendlyDate } from '../../utils/dates';
import { getCategoryMeta } from '../../constants/categories';

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const meta = getCategoryMeta(expense.category);

  return (
    <div className="md:hidden bg-surface rounded-xl border border-surface-border p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: meta.color }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-text-primary leading-tight truncate">
              {expense.description || meta.shortLabel}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
              <span>{formatFriendlyDate(expense.expenseDate)}</span>
              <span>•</span>
              <span className="truncate">{meta.shortLabel}</span>
              {expense.paymentMethod && (
                <>
                  <span>•</span>
                  <span>{expense.paymentMethod}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span className="text-lg font-bold text-text-primary flex-shrink-0">
          {formatRupees(expense.amount)}
        </span>
      </div>

      {expense.notes && (
        <p className="text-xs text-text-muted bg-background p-2 rounded border border-surface-border leading-relaxed">
          {expense.notes}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
        <button
          type="button"
          onClick={() => onEdit(expense)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-text-primary bg-background border border-surface-border active:scale-95 transition-transform"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(expense)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-status-exceeded bg-status-exceeded-bg border border-status-exceeded/30 active:scale-95 transition-transform"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
