import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart as PieIcon, BarChart3, TrendingUp, Calendar, Tag } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { getCurrentMonth } from '../utils/dates';
import { formatRupees } from '../utils/money';
import { getCategoryMeta } from '../constants/categories';

import AppLayout from '../components/layout/AppLayout';
import MonthPicker from '../components/common/MonthPicker';
import CategoryDonutPreview from '../components/dashboard/CategoryDonutPreview';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMonth = searchParams.get('month') || getCurrentMonth();

  const handleMonthChange = (month) => {
    setSearchParams({ month });
  };

  const { categoryStats, monthlySummary, isLoading, error, refetch } = useAnalytics(currentMonth);

  const hasData = categoryStats && categoryStats.length > 0;
  const totalSpent = monthlySummary?.totalSpent || 0;
  const budgetAmount = monthlySummary?.budgetAmount || 0;
  const dailyAverage = monthlySummary?.dailyAverage || 0;
  const topCategory = monthlySummary?.topCategory || 'None';

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Spending Analytics
            </h1>
            <p className="text-sm text-text-muted">
              Visual breakdowns of what your food stall spent this month.
            </p>
          </div>

          <MonthPicker
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />
        </div>

        {error ? (
          <ErrorState
            title="Failed to load analytics"
            message={error}
            onRetry={refetch}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
            <div className="h-28 bg-surface rounded-xl border border-surface-border" />
            <div className="h-28 bg-surface rounded-xl border border-surface-border" />
            <div className="h-28 bg-surface rounded-xl border border-surface-border" />
          </div>
        ) : !hasData ? (
          <EmptyState
            icon={PieIcon}
            title="No spending records for this month"
            description="Add daily expenses from the dashboard to unlock interactive donut and bar analytics."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Monthly Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface rounded-xl border border-surface-border p-4 sm:p-5 flex flex-col gap-1 shadow-sm">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  Total Spent
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                  {formatRupees(totalSpent)}
                </span>
                <span className="text-xs text-text-muted">
                  {budgetAmount > 0
                    ? `of ${formatRupees(budgetAmount)} budget`
                    : 'No budget set for this month'}
                </span>
              </div>

              <div className="bg-surface rounded-xl border border-surface-border p-4 sm:p-5 flex flex-col gap-1 shadow-sm">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  Daily Average
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                  {formatRupees(dailyAverage)}
                </span>
                <span className="text-xs text-text-muted">spent per operational day</span>
              </div>

              <div className="bg-surface rounded-xl border border-surface-border p-4 sm:p-5 flex flex-col gap-1 shadow-sm">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  Top Category
                </span>
                <span className="text-xl sm:text-2xl font-bold text-text-primary truncate mt-1">
                  {topCategory}
                </span>
                <span className="text-xs text-text-muted">highest spending cost driver</span>
              </div>
            </div>

            {/* Charts Section: Donut + Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 min-w-0 w-full">
                <CategoryDonutPreview categoryStats={categoryStats} />
              </div>

              <div className="lg:col-span-7 min-w-0 w-full bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent" />
                    <span>Category Spending Comparison</span>
                  </h2>
                  <span className="text-xs text-text-muted">Exact values</span>
                </div>
                <CategoryBarChart data={categoryStats} />
              </div>
            </div>

            {/* Detailed Category Breakdown Table */}
            <div className="bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-text-primary">
                Detailed Category Breakdown
              </h2>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm border-collapse min-w-[460px]">
                  <thead>
                    <tr className="border-b border-surface-border text-xs font-semibold text-text-muted uppercase tracking-wider bg-background">
                      <th className="py-3 px-3 sm:px-4">Category</th>
                      <th className="py-3 px-3 sm:px-4 text-center">Transactions</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Amount</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {categoryStats.map((item) => {
                      const meta = getCategoryMeta(item.category);
                      return (
                        <tr key={item.category} className="hover:bg-background/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: meta.color }}
                              />
                              <span className="font-semibold text-text-primary truncate">
                                {item.category}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-text-muted">
                            {item.count} items
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-text-primary">
                            {formatRupees(item.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-background border border-surface-border">
                              {item.percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
