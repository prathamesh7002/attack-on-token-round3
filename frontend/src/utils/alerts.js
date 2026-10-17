import { ALERT_LEVELS } from '../constants/alertLevels';
import { formatRupees } from './money';

/**
 * Compute the alert level based on spent, budget, and thresholds.
 * Boundary checks:
 *   79.9% -> safe (< 80)
 *   80%   -> warning (>= 80 && < 90)
 *   89.9% -> warning (< 90)
 *   90%   -> high (>= 90 && < 100)
 *   99.9% -> high (< 100)
 *   100%  -> exceeded (>= 100)
 *   100.01% -> exceeded
 *   budget <= 0 -> no_budget (NEVER divide by zero or show NaN)
 */
export function computeAlertLevel(spent, budget, warningThresholdPct = 80, highThresholdPct = 90) {
  const budgetNum = Number(budget) || 0;
  const spentNum = Number(spent) || 0;

  if (budgetNum <= 0) {
    return ALERT_LEVELS.NO_BUDGET;
  }

  const utilization = (spentNum / budgetNum) * 100;
  // Use a small epsilon to handle floating point precision on exact boundaries
  const warn = Number(warningThresholdPct) || 80;
  const high = Number(highThresholdPct) || 90;

  if (utilization >= 100) {
    return ALERT_LEVELS.EXCEEDED;
  }
  if (utilization >= high) {
    return ALERT_LEVELS.HIGH;
  }
  if (utilization >= warn) {
    return ALERT_LEVELS.WARNING;
  }
  return ALERT_LEVELS.SAFE;
}

/**
 * Calculate full budget status summary object
 */
export function calculateBudgetStatus({
  month,
  budgetAmount = 0,
  totalSpent = 0,
  warningThresholdPct = 80,
  highThresholdPct = 90,
  explicitAlertLevel = null,
  customMessage = null,
}) {
  const budget = Number(budgetAmount) || 0;
  const spent = Number(totalSpent) || 0;

  const hasBudget = budget > 0;
  const remaining = hasBudget ? Math.max(0, budget - spent) : 0;
  const overspentAmount = hasBudget && spent > budget ? spent - budget : 0;
  const utilizationPct = hasBudget ? Math.round((spent / budget) * 1000) / 10 : 0; // 1 decimal place

  // Fallback to local computation if backend didn't supply an alert level
  const alertLevel = explicitAlertLevel || computeAlertLevel(spent, budget, warningThresholdPct, highThresholdPct);

  let message = customMessage;
  if (!message) {
    switch (alertLevel) {
      case ALERT_LEVELS.NO_BUDGET:
        message = 'No budget set for this month. Set a budget to track your limits.';
        break;
      case ALERT_LEVELS.EXCEEDED:
        message = `You are over budget by ${formatRupees(overspentAmount)}. Limit reached.`;
        break;
      case ALERT_LEVELS.HIGH:
        message = `High spending: used ${utilizationPct}% of budget. ${formatRupees(remaining)} left. Avoid non-essential restocks.`;
        break;
      case ALERT_LEVELS.WARNING:
        message = `Approaching your monthly budget: used ${utilizationPct}%. ${formatRupees(remaining)} left to spend.`;
        break;
      case ALERT_LEVELS.SAFE:
      default:
        message = hasBudget
          ? `You have used ${utilizationPct}% of this month's budget. ${formatRupees(remaining)} left.`
          : 'No budget set for this month.';
        break;
    }
  }

  return {
    month,
    budgetAmount: budget,
    totalSpent: spent,
    remaining,
    overspentAmount,
    utilizationPct,
    alertLevel,
    warningThresholdPct: Number(warningThresholdPct) || 80,
    highThresholdPct: Number(highThresholdPct) || 90,
    message,
  };
}

/**
 * UI visual tokens for each alert level (flat colors, no gradients)
 */
export function getAlertLevelTokens(level) {
  switch (level) {
    case ALERT_LEVELS.SAFE:
      return {
        label: 'Safe',
        textColor: 'text-status-safe',
        bgColor: 'bg-status-safe-bg',
        borderColor: 'border-status-safe',
        barColor: 'bg-status-safe',
        icon: 'CheckCircle2',
      };
    case ALERT_LEVELS.WARNING:
      return {
        label: 'Warning',
        textColor: 'text-status-warning',
        bgColor: 'bg-status-warning-bg',
        borderColor: 'border-status-warning',
        barColor: 'bg-status-warning',
        icon: 'AlertTriangle',
      };
    case ALERT_LEVELS.HIGH:
      return {
        label: 'High Spending',
        textColor: 'text-status-high',
        bgColor: 'bg-status-high-bg',
        borderColor: 'border-status-high',
        barColor: 'bg-status-high',
        icon: 'AlertCircle',
      };
    case ALERT_LEVELS.EXCEEDED:
      return {
        label: 'Budget Exceeded',
        textColor: 'text-status-exceeded',
        bgColor: 'bg-status-exceeded-bg',
        borderColor: 'border-status-exceeded',
        barColor: 'bg-status-exceeded',
        icon: 'AlertOctagon',
      };
    case ALERT_LEVELS.NO_BUDGET:
    default:
      return {
        label: 'No Budget Set',
        textColor: 'text-text-muted',
        bgColor: 'bg-status-neutral-bg',
        borderColor: 'border-surface-border',
        barColor: 'bg-text-muted',
        icon: 'Info',
      };
  }
}
