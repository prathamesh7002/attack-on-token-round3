import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  WalletCards, 
  Calendar, 
  Check, 
  Loader2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Info
} from 'lucide-react';

export default function BudgetSettings() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [budgetAmount, setBudgetAmount] = useState('');
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [highSpendingThreshold, setHighSpendingThreshold] = useState(90);
  
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budget?month=${selectedMonth}`);
      setBudgetStatus(res.data);
      if (res.data.budget_amount_inr > 0) {
        setBudgetAmount(res.data.budget_amount_inr.toString());
        setWarningThreshold(res.data.warning_threshold_pct || 80);
        setHighSpendingThreshold(res.data.high_spending_threshold_pct || 90);
      } else {
        setBudgetAmount('');
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
    setMessage({ type: '', text: '' });
  }, [selectedMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid monthly budget amount greater than zero.' });
      return;
    }

    if (warningThreshold >= highSpendingThreshold) {
      setMessage({ type: 'error', text: 'Warning threshold must be strictly less than high spending threshold.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        month: selectedMonth,
        budget_amount: parsedAmount,
        warning_threshold_pct: parseFloat(warningThreshold),
        high_spending_threshold_pct: parseFloat(highSpendingThreshold),
      };

      const res = await api.post('/budget', payload);
      setBudgetStatus(res.data);
      setMessage({ type: 'success', text: `Monthly budget of ₹${parsedAmount.toLocaleString('en-IN')} saved successfully for ${selectedMonth}!` });
    } catch (err) {
      console.error('Error saving budget:', err);
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update budget settings.' });
    } finally {
      setSaving(false);
    }
  };

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

  const spentAmount = budgetStatus?.total_expenses_inr || 0;
  const currentBudget = parseFloat(budgetAmount) || 0;
  const simulatedRemaining = currentBudget - spentAmount;
  const simulatedUtilization = currentBudget > 0 ? Math.round((spentAmount / currentBudget) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-amber-400" />
            Monthly Budget & Threshold Guardrails
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure spending targets and automatic 80%, 90%, and 100% alert thresholds.
          </p>
        </div>

        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-sm"
          >
            {getMonthOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time Status Card */}
      {budgetStatus && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status for {selectedMonth}</span>
              <div className="text-sm font-semibold text-white mt-0.5">{budgetStatus.alert_message}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Utilization:</span>
              <span className="text-sm font-mono font-bold text-amber-400">{budgetStatus.utilization_pct}%</span>
            </div>
          </div>

          {/* Progress Bar Visualization */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>₹0</span>
              <span className="font-semibold text-white">
                Spent: ₹{budgetStatus.total_expenses_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span>Budget: ₹{budgetStatus.budget_amount_inr.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetStatus.utilization_pct >= 100
                    ? 'bg-rose-500'
                    : budgetStatus.utilization_pct >= (budgetStatus.warning_threshold_pct || 80)
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetStatus.utilization_pct, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Safe (&lt; {warningThreshold}%)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-3 h-3" /> Warning ({warningThreshold}% - {highSpendingThreshold}%)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="w-3 h-3" /> Overspent (&ge; 100%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Configured Budget</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                ₹{budgetStatus.budget_amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Total Spent</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                ₹{budgetStatus.total_expenses_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">
                {budgetStatus.remaining_budget_inr >= 0 ? "Remaining Balance" : "Excess Overspent"}
              </div>
              <div className={`text-base font-bold font-mono mt-0.5 ${budgetStatus.remaining_budget_inr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{Math.abs(budgetStatus.remaining_budget_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-base font-bold text-white mb-1">
          Configure Budget for {selectedMonth}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Set your total expense target and threshold limits. Financial changes take effect immediately across all charts and notifications.
        </p>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success' 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Budget Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Monthly Budget Amount (₹) <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-mono text-base font-bold">₹</span>
              <input
                type="number"
                step="1"
                min="100"
                required
                placeholder="e.g. 40000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Formula: Remaining Budget = Monthly Budget − Total Expenses for the Selected Month.
            </p>
          </div>

          {/* Threshold Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            
            {/* Warning Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Warning Threshold
                </label>
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/15">
                  {warningThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Triggers warning banner when spending reaches {warningThreshold}% of budget limit.
              </p>
            </div>

            {/* High Spending Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                  High Spending Threshold
                </label>
                <span className="text-xs font-mono font-bold text-orange-400 px-2 py-0.5 rounded-lg bg-orange-500/15">
                  {highSpendingThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={highSpendingThreshold}
                onChange={(e) => setHighSpendingThreshold(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Triggers critical high spending alert at {highSpendingThreshold}% utilization.
              </p>
            </div>

          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Budget...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Monthly Budget & Limits
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
