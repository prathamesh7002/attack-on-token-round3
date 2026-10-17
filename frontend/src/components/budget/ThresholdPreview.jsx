import React from 'react';
import { formatRupees } from '../../utils/money';

export default function ThresholdPreview({
  budgetAmount = 0,
  warningThresholdPct = 80,
  highSpendingThresholdPct = 90,
}) {
  const budget = Number(budgetAmount) || 0;
  const warnPct = Number(warningThresholdPct) || 80;
  const highPct = Number(highSpendingThresholdPct) || 90;

  const warnAmount = Math.round((budget * warnPct) / 100);
  const highAmount = Math.round((budget * highPct) / 100);

  const zones = [
    {
      label: 'Safe Zone',
      range: `< ${warnPct}%`,
      amountText: `Up to ${formatRupees(warnAmount)}`,
      badgeClass: 'bg-status-safe-bg text-status-safe border-status-safe/40',
      description: 'Healthy spending within operational limits.',
    },
    {
      label: 'Warning Zone',
      range: `${warnPct}% – ${(highPct - 0.1).toFixed(1)}%`,
      amountText: `${formatRupees(warnAmount)} to ${formatRupees(highAmount)}`,
      badgeClass: 'bg-status-warning-bg text-status-warning border-status-warning/40',
      description: 'First reminder to review inventory restocks.',
    },
    {
      label: 'High Spending Zone',
      range: `${highPct}% – 99.9%`,
      amountText: `${formatRupees(highAmount)} to ${formatRupees(budget)}`,
      badgeClass: 'bg-status-high-bg text-status-high border-status-high/40',
      description: 'Critical limit: pause non-essential restocks.',
    },
    {
      label: 'Budget Exceeded',
      range: '≥ 100%',
      amountText: `Above ${formatRupees(budget)}`,
      badgeClass: 'bg-status-exceeded-bg text-status-exceeded border-status-exceeded/40',
      description: 'Overspent: prompt alert shows excess amount.',
    },
  ];

  return (
    <div className="bg-surface rounded-xl border border-surface-border p-5 flex flex-col gap-3 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">
        Live Alert Zones Preview
      </h3>
      <p className="text-xs text-text-muted">
        Based on your ₹{budget.toLocaleString('en-IN')} budget, StreetLedger will trigger these visual thresholds:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
        {zones.map((zone) => (
          <div
            key={zone.label}
            className="p-3 rounded-lg border border-surface-border bg-background flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${zone.badgeClass}`}>
                {zone.label}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {zone.range}
              </span>
            </div>
            <span className="text-sm font-bold text-text-primary mt-1">
              {zone.amountText}
            </span>
            <span className="text-[11px] text-text-muted">
              {zone.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
