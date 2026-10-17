import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../hooks/useBudget';
import { useExpenses } from '../hooks/useExpenses';
import { useAnalytics } from '../hooks/useAnalytics';
import { getCurrentMonth } from '../utils/dates';

import AppLayout from '../components/layout/AppLayout';
import MonthPicker from '../components/common/MonthPicker';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import AlertBanner from '../components/dashboard/AlertBanner';
import QuickExpenseForm from '../components/dashboard/QuickExpenseForm';
import CategoryDonutPreview from '../components/dashboard/CategoryDonutPreview';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import ErrorState from '../components/common/ErrorState';

export default function DashboardPage() {
  const { vendor } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const {
    budgetStatus,
    isLoading: budgetLoading,
    error: budgetError,
    refetch: refetchBudget,
  } = useBudget(selectedMonth);

  const {
    expenses,
    isLoading: expensesLoading,
    error: expensesError,
    refetch: refetchExpenses,
  } = useExpenses({ month: selectedMonth, limit: 10 });

  const {
    categoryStats,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useAnalytics(selectedMonth);

  const isLoading = budgetLoading || expensesLoading || analyticsLoading;
  const hasError = budgetError || expensesError || analyticsError;

  const handleRetryAll = () => {
    refetchBudget();
    refetchExpenses();
    refetchAnalytics();
  };

  // Extract owner first name (e.g. "Ramesh Sharma" -> "Ramesh")
  const ownerFirstName = vendor?.ownerName
    ? vendor.ownerName.trim().split(' ')[0]
    : 'Vendor';

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Hello, {ownerFirstName}
            </h1>
            <p className="text-sm text-text-muted">
              {vendor?.vendorName || vendor?.stallName || 'Food Stall Ledger'}
            </p>
          </div>

          <MonthPicker
            currentMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* Global Error Banner if any API failed */}
        {hasError && !isLoading && (
          <ErrorState
            title="Failed to load some dashboard details"
            message={budgetError || expensesError || analyticsError || 'Network issue'}
            onRetry={handleRetryAll}
          />
        )}

        {/* Skeleton Loading State */}
        {isLoading && !budgetStatus ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 animate-pulse">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="h-44 bg-surface rounded-xl border border-surface-border" />
              <div className="h-72 bg-surface rounded-xl border border-surface-border" />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="h-64 bg-surface rounded-xl border border-surface-border" />
              <div className="h-64 bg-surface rounded-xl border border-surface-border" />
            </div>
          </div>
        ) : (
          /* Main Dashboard Content: 2-Column Responsive Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Primary Column (Left on desktop) */}
            <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6 min-w-0 w-full">
              {/* Hero Budget Card */}
              <BudgetProgress budgetStatus={budgetStatus} />

              {/* Alert Notification Banner */}
              <AlertBanner budgetStatus={budgetStatus} />

              {/* 3-Tap Quick Logger */}
              <QuickExpenseForm />
            </div>

            {/* Analytics & Recent Column (Right on desktop) */}
            <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6 min-w-0 w-full">
              {/* Category Spending Donut Chart */}
              <CategoryDonutPreview categoryStats={categoryStats} />

              {/* Recent Expenses List with Delete */}
              <RecentExpenses expenses={expenses} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
