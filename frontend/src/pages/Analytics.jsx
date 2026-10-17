import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Award, 
  Flame, 
  Loader2, 
  ShoppingBag 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

const PALETTE = [
  '#2563eb', '#60a5fa', '#93c5fd', '#1d4ed8', '#3b82f6',
  '#7dd3fc', '#1e40af', '#38bdf8', '#bfdbfe', '#0ea5e9'
];

export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [analyticsData, setAnalyticsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [catRes, sumRes] = await Promise.all([
        api.get(`/analytics/category-wise?month=${selectedMonth}`),
        api.get(`/analytics/monthly-summary?month=${selectedMonth}`)
      ]);
      setAnalyticsData(catRes.data);
      setSummaryData(sumRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth]);

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value: val, label });
    }
    return options;
  };

  const categories = analyticsData?.categories || [];
  const totalSpending = analyticsData?.total_spending_inr || 0;

  return (
    <div className="space-y-6">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-start sm:items-center gap-2">
            <PieIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            Spending Analytics & Category Breakdown
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive Recharts visualizations derived strictly from your verified expenses.
          </p>
        </div>

        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-sm"
          >
            {getMonthOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Highlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Monthly Spend */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Spent</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {categories.length} spending categories active
          </p>
        </div>

        {/* Top Spending Category */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Expenditure</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-400 truncate">
            {summaryData?.top_category || 'No expenses yet'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Highest cost center this month
          </p>
        </div>

        {/* Daily Burn Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily Average</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            ₹{(summaryData?.daily_avg_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Average daily cost for operational supplies
          </p>
        </div>

      </div>

      {/* Main Charts Row */}
      {loading ? (
        <div className="h-72 flex flex-col items-center justify-center bg-slate-900/60 rounded-3xl border border-slate-800">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Generating Recharts visualizations...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center bg-slate-900/60 rounded-3xl border border-slate-800 p-6">
          <ShoppingBag className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Data to Visualize</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            You don't have any expense records recorded in {selectedMonth}. Record expenses to generate interactive charts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recharts Donut / Pie Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-400" />
                Percentage Share by Category
              </h2>
              <p className="text-xs text-slate-400">Relative distribution of monthly budget utilization</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total_inr"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, entry) => [
                      `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${entry.payload.percentage}%)`,
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#dbeafe', borderRadius: '12px', fontSize: '12px', color: '#334155' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Category Spending Comparison (₹)
              </h2>
              <p className="text-xs text-slate-400">Direct comparison across food stall cost centers</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#dbeafe', borderRadius: '12px', fontSize: '12px', color: '#334155' }}
                  />
                  <Bar dataKey="total_inr" radius={[6, 6, 0, 0]}>
                    {categories.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Category Breakdown Detailed Table */}
      {categories.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-white">Category Breakdown Table</h2>
            <p className="text-xs text-slate-400">Complete tabulated financial totals and percentage distribution</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Transactions</th>
                  <th className="py-3 px-4 text-right">Share (%)</th>
                  <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((item, idx) => (
                  <tr key={item.category} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {item.count} items
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-300">
                      {item.percentage}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 text-sm">
                      ₹{item.total_inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
