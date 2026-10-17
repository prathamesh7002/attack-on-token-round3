import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { 
  ReceiptIndianRupee, 
  Wallet, 
  TrendingDown, 
  Gauge, 
  Plus, 
  Calendar, 
  ArrowRight, 
  ShoppingBag, 
  Pencil, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const CHART_COLORS = ['#2563eb', '#60a5fa', '#93c5fd', '#1d4ed8', '#3b82f6', '#7dd3fc', '#1e40af', '#38bdf8', '#bfdbfe', '#0ea5e9'];

export default function Dashboard({ onNavigateExpenses, onNavigateAnalytics, onNavigateBudget }) {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [budgetRes, categoryRes, expensesRes] = await Promise.all([
        api.get(`/budget?month=${selectedMonth}`),
        api.get(`/analytics/category-wise?month=${selectedMonth}`),
        api.get(`/expenses?month=${selectedMonth}&limit=6`),
      ]);

      setBudgetStatus(budgetRes.data);
      setCategoryData(categoryRes.data.categories || []);
      setRecentExpenses(expensesRes.data.expenses || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, user?.id]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value: val, label });
    }
    return options;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Bar & Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words">
            {user?.profile?.stall_name || user?.vendor_name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Owner: <span className="text-slate-200 font-medium">{user?.owner_name}</span> •{' '}
            <span className="text-amber-400 font-semibold">{user?.profile?.stall_type || 'Street Food'}</span>
            {user?.profile?.location && ` • ${user.profile.location}`}
          </p>
        </div>

        <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2.5 w-full sm:w-auto">
          {/* Month Selector */}
          <div className="relative flex-1 min-w-0 sm:flex-initial">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-sm"
            >
              {getMonthOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Record Expense Button */}
          <button
            onClick={() => {
              setEditingExpense(null);
              setModalOpen(true);
            }}
            className="inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Record</span> Expense
          </button>
        </div>
      </div>

      {/* Proactive Threshold Alert Banner */}
      <AlertBanner budgetStatus={budgetStatus} onAdjustBudget={onNavigateBudget} />

      {/* Financial Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Spent This Month"
          amount={budgetStatus?.total_expenses_inr ?? 0}
          subtitle={`Across ${recentExpenses.length} recorded items`}
          icon={ReceiptIndianRupee}
          color="amber"
          badge={budgetStatus?.total_expenses_inr > 0 ? 'Active' : 'No Spend'}
          onClick={onNavigateExpenses}
        />

        <MetricCard
          title={budgetStatus?.remaining_budget_inr >= 0 ? "Remaining Budget" : "Overspent Amount"}
          amount={budgetStatus ? Math.abs(budgetStatus.remaining_budget_inr) : 0}
          subtitle={budgetStatus?.remaining_budget_inr >= 0 ? "Available balance" : "Exceeded spending target"}
          icon={TrendingDown}
          color={
            !budgetStatus || budgetStatus.budget_amount_inr === 0 
              ? 'slate' 
              : budgetStatus.remaining_budget_inr >= 0 
                ? 'emerald' 
                : 'rose'
          }
          badge={budgetStatus?.alert_status?.toUpperCase() || 'SAFE'}
          onClick={onNavigateBudget}
        />

        <MetricCard
          title="Monthly Budget Limit"
          amount={budgetStatus?.budget_amount_inr ?? 0}
          subtitle={budgetStatus?.budget_amount_inr > 0 ? "Configured monthly limit" : "No budget set"}
          icon={Wallet}
          color="blue"
          badge={selectedMonth}
          onClick={onNavigateBudget}
        />

        <MetricCard
          title="Budget Utilization"
          amount={`${budgetStatus?.utilization_pct ?? 0}%`}
          subtitle={`Warning threshold: ${budgetStatus?.warning_threshold_pct ?? 80}%`}
          icon={Gauge}
          color={
            (budgetStatus?.utilization_pct || 0) >= 100
              ? 'rose'
              : (budgetStatus?.utilization_pct || 0) >= (budgetStatus?.warning_threshold_pct || 80)
                ? 'amber'
                : 'emerald'
          }
          badge={budgetStatus?.utilization_pct >= 100 ? 'Limit Exceeded' : 'Under Limit'}
          onClick={onNavigateBudget}
        />
      </div>

      {/* Charts & Quick Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown Mini-Chart (Recharts Donut) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-white">Category Spending</h2>
              <p className="text-[11px] text-slate-400">Share of monthly expense by ingredient & supplies</p>
            </div>
            <button
              onClick={onNavigateAnalytics}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <ShoppingBag className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No expenses recorded for {selectedMonth}.</p>
              <button
                onClick={() => { setEditingExpense(null); setModalOpen(true); }}
                className="mt-3 text-xs text-amber-400 font-bold hover:underline"
              >
                + Record First Expense
              </button>
            </div>
          ) : (
            <div className="my-auto py-2">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total_inr"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']}
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#dbeafe', borderRadius: '12px', fontSize: '11px', color: '#334155' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top 3 categories quick pill */}
              <div className="space-y-1.5 mt-2">
                {categoryData.slice(0, 3).map((item, idx) => (
                  <div key={item.category} className="flex items-center justify-between text-xs py-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-slate-300 truncate text-[11px]">{item.category}</span>
                    </div>
                    <span className="font-mono font-semibold text-white text-[11px]">
                      ₹{item.total_inr.toLocaleString('en-IN')} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Expenses List */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Daily Expenses</h2>
              <p className="text-[11px] text-slate-400">Recently logged purchases for {selectedMonth}</p>
            </div>
            <button
              onClick={onNavigateExpenses}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <ReceiptIndianRupee className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">No expenses logged yet for this month.</p>
              <button
                onClick={() => { setEditingExpense(null); setModalOpen(true); }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Record Expense
              </button>
            </div>
          ) : (
            <>
            <div className="sm:hidden divide-y divide-slate-200">
              {recentExpenses.map((exp) => (
                <article key={exp.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white break-words">{exp.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{exp.expense_date}</p>
                    </div>
                    <p className="text-xs font-bold text-amber-400 whitespace-nowrap">
                      ₹{exp.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-500 break-words">{exp.category}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingExpense(exp);
                          setModalOpen(true);
                        }}
                        className="min-w-10 min-h-10 inline-flex items-center justify-center text-slate-500 hover:text-blue-700 rounded-lg hover:bg-slate-100"
                        aria-label={`Edit ${exp.description}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(exp)}
                        className="min-w-10 min-h-10 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        aria-label={`Delete ${exp.description}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Description</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5 text-right">Amount</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                        {exp.expense_date}
                      </td>
                      <td className="py-2.5 font-medium text-white max-w-[200px] truncate">
                        {exp.description}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-medium truncate inline-block max-w-[140px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-amber-400">
                        ₹{exp.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingExpense(exp);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}

        </div>

      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchDashboardData}
        initialExpense={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.description}
        loading={deleteLoading}
      />

    </div>
  );
}
