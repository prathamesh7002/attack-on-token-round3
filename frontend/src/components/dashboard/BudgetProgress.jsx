import React from 'react';
import { Link } from 'react-router-dom';
import { formatRupees } from '../../utils/money';
import { getAlertLevelTokens } from '../../utils/alerts';
import { ALERT_LEVELS } from '../../constants/alertLevels';
import Button from '../common/Button';

export default function BudgetProgress({ budgetStatus, onSetBudget }) {
  if (!budgetStatus) return null;

  const {
    budgetAmount = 0,
    totalSpent = 0,
    remaining = 0,
    overspentAmount = 0,
    utilizationPct = 0,
    alertLevel = ALERT_LEVELS.NO_BUDGET,
  } = budgetStatus;

  const tokens = getAlertLevelTokens(alertLevel);
  const hasBudget = budgetAmount > 0;
  const isOverBudget = alertLevel === ALERT_LEVELS.EXCEEDED;

  // Clamped percentage for visual progress bar (0% to 100%)
  const clampedProgress = Math.min(100, Math.max(0, utilizationPct));

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
      {/* Top Hero Amount */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-text-muted">
            {isOverBudget ? 'Over budget by' : 'Left to spend'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                isOverBudget ? 'text-status-exceeded' : 'text-text-primary'
              }`}
            >
              {hasBudget
                ? isOverBudget
                  ? formatRupees(overspentAmount)
                  : formatRupees(remaining)
                : '₹0'}
            </span>
            {hasBudget && !isOverBudget && (
              <span className="text-sm font-medium text-text-muted">remaining</span>
            )}
          </div>
        </div>

        {hasBudget ? (
          <div className="text-left sm:text-right">
            <span className="text-xs text-text-muted block">Budget for this month</span>
            <span className="text-base font-semibold text-text-primary">
              {formatRupees(budgetAmount)}
            </span>
          </div>
        ) : (
          <Link to="/budget">
            <Button size="sm" variant="secondary">
              Set monthly budget
            </Button>
          </Link>
        )}
      </div>

      {/* Progress Bar Container */}
      {hasBudget ? (
        <div className="flex flex-col gap-2">
          {/* Flat Progress Track */}
          <div
            className="w-full h-3.5 bg-background rounded-full border border-surface-border overflow-hidden relative"
            role="progressbar"
            aria-valuenow={Math.round(utilizationPct)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Monthly budget utilization"
          >
            <div
              className={`h-full ${tokens.barColor} transition-all duration-500 ease-out`}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>

          {/* Under bar status text */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-text-muted font-medium pt-0.5">
            <span>
              Spent <strong className="text-text-primary">{formatRupees(totalSpent)}</strong> of{' '}
              {formatRupees(budgetAmount)}
            </span>
            <span className={`font-semibold ${tokens.textColor}`}>
              {utilizationPct}% used
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-background border border-surface-border text-xs text-text-muted flex items-center justify-between">
          <span>You haven't set a budget for this month yet. Setting one helps you avoid overspending.</span>
        </div>
      )}
    </div>
  );
}
