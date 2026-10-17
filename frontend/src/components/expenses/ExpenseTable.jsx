import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { formatRupees } from '../../utils/money';
import { formatFriendlyDate } from '../../utils/dates';
import { getCategoryMeta } from '../../constants/categories';

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="hidden md:block w-full overflow-x-auto bg-surface rounded-xl border border-surface-border shadow-sm">
      <table className="w-full text-left text-sm text-text-primary border-collapse">
        <thead>
          <tr className="border-b border-surface-border bg-background text-xs font-semibold text-text-muted uppercase tracking-wider">
            <th className="py-3.5 px-4">Date</th>
            <th className="py-3.5 px-4">Description</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Paid via</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {expenses.map((expense) => {
            const meta = getCategoryMeta(expense.category);
            return (
              <tr
                key={expense.id}
                className="hover:bg-background/50 transition-colors"
              >
                <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                  {formatFriendlyDate(expense.expenseDate)}
                </td>
                <td className="py-3.5 px-4 font-semibold text-text-primary">
                  <div className="flex flex-col">
                    <span>{expense.description || meta.shortLabel}</span>
                    {expense.notes && (
                      <span className="text-xs text-text-muted font-normal mt-0.5 max-w-xs truncate">
                        {expense.notes}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-background border border-surface-border">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    {meta.shortLabel}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                  {expense.paymentMethod || 'Cash'}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-text-primary whitespace-nowrap">
                  {formatRupees(expense.amount)}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(expense)}
                      aria-label={`Edit ${expense.description}`}
                      className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(expense)}
                      aria-label={`Delete ${expense.description}`}
                      className="p-1.5 rounded text-text-muted hover:text-status-exceeded hover:bg-status-exceeded-bg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
