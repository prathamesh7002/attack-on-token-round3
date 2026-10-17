import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatRupees } from '../../utils/money';
import { getCategoryMeta } from '../../constants/categories';

export default function CategoryBarChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  // Format data with category short labels and colors
  const chartData = data.map((item) => {
    const meta = getCategoryMeta(item.category);
    return {
      name: meta.shortLabel,
      fullName: item.category,
      amount: item.amount,
      color: meta.color,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-surface border border-surface-border p-2.5 rounded-lg shadow-sm text-xs select-none">
          <p className="font-semibold text-text-primary mb-0.5">{item.fullName}</p>
          <p className="text-text-muted">
            Spent: <span className="font-semibold text-text-primary">{formatRupees(item.amount)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 16, left: 6, bottom: 32 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B6560' }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={40}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B6560' }}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={400}
          >
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
