import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatRupees } from '../../utils/money';
import { getCategoryMeta } from '../../constants/categories';

export default function CategoryDonutPreview({ categoryStats = [] }) {
  const hasData = Array.isArray(categoryStats) && categoryStats.length > 0;
  const totalMonthSpent = categoryStats.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Group top 5 and group remaining as 'Other'
  let displayData = [];
  if (hasData) {
    if (categoryStats.length <= 5) {
      displayData = categoryStats.map((item) => ({
        name: item.category,
        shortLabel: getCategoryMeta(item.category).shortLabel,
        amount: item.amount,
        percentage: item.percentage,
        color: getCategoryMeta(item.category).color,
      }));
    } else {
      const top5 = categoryStats.slice(0, 5);
      const rest = categoryStats.slice(5);
      const restAmount = rest.reduce((sum, item) => sum + item.amount, 0);
      const restPercentage = Math.round((restAmount / (totalMonthSpent || 1)) * 1000) / 10;

      displayData = top5.map((item) => ({
        name: item.category,
        shortLabel: getCategoryMeta(item.category).shortLabel,
        amount: item.amount,
        percentage: item.percentage,
        color: getCategoryMeta(item.category).color,
      }));

      if (restAmount > 0) {
        displayData.push({
          name: 'Other categories',
          shortLabel: 'Other',
          amount: restAmount,
          percentage: restPercentage,
          color: '#868E96',
        });
      }
    }
  }

  // Custom flat tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-surface-border p-2.5 rounded-lg shadow-sm text-xs select-none">
          <p className="font-semibold text-text-primary mb-0.5">{data.name}</p>
          <p className="text-text-muted">
            {formatRupees(data.amount)}{' '}
            <span className="font-semibold text-text-primary">({data.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-5 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Where your money went</h2>
        {hasData && (
          <span className="text-xs font-semibold text-text-muted">
            Total: {formatRupees(totalMonthSpent)}
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-background border border-surface-border flex items-center justify-center text-text-muted mb-2 text-lg font-bold">
            ₹
          </div>
          <p className="text-sm font-semibold text-text-primary">No expenses yet this month</p>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            Add your first expense above to see where your money goes.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 w-full min-w-0">
          {/* Centered Donut Chart Container */}
          <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="amount"
                  isAnimationActive={true}
                  animationDuration={400}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Total inside donut hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-semibold text-text-muted">Total</span>
              <span className="text-sm font-bold text-text-primary">
                {formatRupees(totalMonthSpent)}
              </span>
            </div>
          </div>

          {/* Full-width Category Breakdown Rows (Never squeezed or clipped) */}
          <div className="w-full flex flex-col gap-2 min-w-0 pt-1">
            {displayData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs py-1.5 border-b border-surface-border last:border-b-0 gap-3"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-text-primary font-medium" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-semibold text-text-primary">
                    {formatRupees(item.amount)}
                  </span>
                  <span className="text-text-muted w-9 text-right font-medium">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
