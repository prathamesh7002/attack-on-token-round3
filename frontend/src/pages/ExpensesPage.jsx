import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useExpenses } from '../hooks/useExpenses';
import { expenseApi } from '../api/expenseApi';
import { getCurrentMonth } from '../utils/dates';

import AppLayout from '../components/layout/AppLayout';
import MonthPicker from '../components/common/MonthPicker';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseCard from '../components/expenses/ExpenseCard';
import Pagination from '../components/expenses/Pagination';
import Modal from '../components/common/Modal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function ExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshData } = useAuth();
  const { showToast } = useToast();

  // Read URL query parameters
  const currentMonth = searchParams.get('month') || getCurrentMonth();
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  // Data fetching hook synced with dataVersion and URL filters
  const { expenses, total, isLoading, error, refetch } = useExpenses({
    month: currentMonth,
    category: currentCategory,
    search: currentSearch,
    limit,
    offset,
  });

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isActionPending, setIsActionPending] = useState(false);

  // Update query parameters helper
  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const handleMonthChange = (month) => {
    updateParams({ month, page: '1' });
  };

  const handleSearchChange = (search) => {
    updateParams({ search, page: '1' });
  };

  const handleCategoryChange = (category) => {
    updateParams({ category, page: '1' });
  };

  const handleResetFilters = () => {
    updateParams({ search: '', category: '', page: '1' });
  };

  const handlePageChange = (newOffset) => {
    const newPage = Math.floor(newOffset / limit) + 1;
    updateParams({ page: String(newPage) });
  };

  // Add / Edit Handlers
  const handleSaveExpense = async (formData) => {
    setIsActionPending(true);
    try {
      if (editingExpense) {
        await expenseApi.update(editingExpense.id, formData);
        showToast('Expense updated successfully', 'success');
        setEditingExpense(null);
      } else {
        await expenseApi.create(formData);
        showToast('Expense added successfully', 'success');
        setIsAddOpen(false);
      }
      refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to save expense', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    setIsActionPending(true);
    try {
      await expenseApi.delete(deletingExpense.id);
      showToast('Expense deleted', 'info');
      setDeletingExpense(null);
      refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Expenses
            </h1>
            <p className="text-sm text-text-muted">
              Record, search, and manage daily stall expenses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <MonthPicker
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
            />
            <Button
              onClick={() => setIsAddOpen(true)}
              size="sm"
              icon={Plus}
              className="h-10 px-3.5 whitespace-nowrap"
            >
              Add Expense
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <ExpenseFilters
          search={currentSearch}
          category={currentCategory}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onReset={handleResetFilters}
        />

        {/* Content State */}
        {error ? (
          <ErrorState
            title="Failed to load expenses"
            message={error}
            onRetry={refetch}
          />
        ) : isLoading ? (
          <div className="bg-surface rounded-xl border border-surface-border p-6 animate-pulse flex flex-col gap-4">
            <div className="h-6 w-48 bg-background rounded" />
            <div className="h-40 bg-background rounded" />
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={
              currentSearch || currentCategory
                ? 'No matching expenses'
                : 'No expenses for this month'
            }
            description={
              currentSearch || currentCategory
                ? 'Try adjusting your search query or category filter.'
                : 'Keep your accounting accurate by recording your first purchase.'
            }
            actionLabel="Add an Expense"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Desktop Table */}
            <ExpenseTable
              expenses={expenses}
              onEdit={setEditingExpense}
              onDelete={setDeletingExpense}
            />

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={setEditingExpense}
                  onDelete={setDeletingExpense}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Daily Expense"
        maxWidth="max-w-lg"
      >
        <ExpenseForm
          onSubmit={handleSaveExpense}
          onCancel={() => setIsAddOpen(false)}
          isSubmitting={isActionPending}
        />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
        maxWidth="max-w-lg"
      >
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleSaveExpense}
          onCancel={() => setEditingExpense(null)}
          isSubmitting={isActionPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        title="Delete Expense Record?"
      >
        <p className="text-sm text-text-muted leading-relaxed">
          Are you sure you want to delete this expense of{' '}
          <strong className="text-text-primary">
            {deletingExpense?.description}
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeletingExpense(null)}
            disabled={isActionPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteConfirm}
            isLoading={isActionPending}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
