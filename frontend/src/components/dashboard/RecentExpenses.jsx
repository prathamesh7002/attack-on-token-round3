import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { formatRupees } from '../../utils/money';
import { formatFriendlyDate } from '../../utils/dates';
import { getCategoryMeta } from '../../constants/categories';
import { expenseApi } from '../../api/expenseApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function RecentExpenses({ expenses = [] }) {
  const { refreshData } = useAuth();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await expenseApi.delete(deletingId);
      showToast('Expense removed', 'info');
      setDeletingId(null);
      refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Recent Expenses</h2>
        <Link
          to="/expenses"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 select-none"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-muted">
          No expenses recorded yet. Use the quick logger above to add one.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-surface-border">
          {expenses.slice(0, 5).map((expense) => {
            const meta = getCategoryMeta(expense.category);
            return (
              <div
                key={expense.id}
                className="py-3 flex items-center justify-between gap-3 transition-colors hover:bg-background/60 rounded px-1 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {expense.description || meta.shortLabel}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                      <span className="truncate">{meta.shortLabel}</span>
                      <span>•</span>
                      <span>{formatFriendlyDate(expense.expenseDate)}</span>
                      {expense.paymentMethod && (
                        <>
                          <span>•</span>
                          <span>{expense.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-base font-bold text-text-primary">
                    {formatRupees(expense.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeletingId(expense.id)}
                    aria-label={`Delete expense ${expense.description}`}
                    className="p-1.5 rounded text-text-muted hover:text-status-exceeded hover:bg-status-exceeded-bg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Delete Expense?"
      >
        <p className="text-sm text-text-muted leading-relaxed">
          Are you sure you want to delete this expense record? This action will update your monthly budget immediately.
        </p>
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeletingId(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
