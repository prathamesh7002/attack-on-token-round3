import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBudget } from '../hooks/useBudget';
import { budgetApi } from '../api/budgetApi';
import { getCurrentMonth } from '../utils/dates';

import AppLayout from '../components/layout/AppLayout';
import MonthPicker from '../components/common/MonthPicker';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import AlertBanner from '../components/dashboard/AlertBanner';
import BudgetForm from '../components/budget/BudgetForm';
import ErrorState from '../components/common/ErrorState';

export default function BudgetPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMonth = searchParams.get('month') || getCurrentMonth();
  const { refreshData } = useAuth();
  const { showToast } = useToast();

  const handleMonthChange = (month) => {
    setSearchParams({ month });
  };

  const { budgetStatus, isLoading, error, refetch } = useBudget(currentMonth);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBudget = async (budgetData) => {
    setIsSaving(true);
    try {
      await budgetApi.set({
        month: currentMonth,
        budget_amount: budgetData.budgetAmount,
        warning_threshold_pct: budgetData.warningThresholdPct,
        high_spending_threshold_pct: budgetData.highSpendingThresholdPct,
      });

      showToast('Monthly budget updated successfully!', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to update budget', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Monthly Budget
            </h1>
            <p className="text-sm text-text-muted">
              Configure spending limits and threshold alerts for your stall.
            </p>
          </div>

          <MonthPicker
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        </div>

        {error ? (
          <ErrorState
            title="Failed to load budget details"
            message={error}
            onRetry={refetch}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Current Status Card */}
            <BudgetProgress budgetStatus={budgetStatus} />

            {/* Active Alert Banner */}
            <AlertBanner budgetStatus={budgetStatus} />

            {/* Budget Configuration Form */}
            <BudgetForm
              currentBudget={budgetStatus}
              onSubmit={handleSaveBudget}
              isSubmitting={isSaving}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
