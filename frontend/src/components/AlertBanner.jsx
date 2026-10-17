import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AlertBanner({ budgetStatus, onAdjustBudget }) {
  if (!budgetStatus) return null;

  const { alert_status, alert_message, utilization_pct, budget_amount_inr, remaining_budget_inr } = budgetStatus;

  if (alert_status === 'none') {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">No Monthly Budget Configured</h4>
            <p className="text-xs text-slate-400">Set a spending target to activate 80% and 90% proactive warning alerts.</p>
          </div>
        </div>
        <button
          onClick={onAdjustBudget}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
        >
          Set Monthly Budget
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (alert_status === 'safe') {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Budget Healthy</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                {utilization_pct}% Used
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{alert_message}</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[11px] text-slate-400 block">Remaining</span>
          <span className="text-sm font-bold text-emerald-300">₹{remaining_budget_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    );
  }

  if (alert_status === 'warning') {
    return (
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Budget Warning</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {utilization_pct}% Spent
              </span>
            </div>
            <p className="text-xs text-amber-200/90 mt-0.5">{alert_message}</p>
          </div>
        </div>
        <button
          onClick={onAdjustBudget}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
        >
          Review Limits
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (alert_status === 'high_spending') {
    return (
      <div className="bg-orange-950/50 border border-orange-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-orange-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Critical High Spending</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                {utilization_pct}% Reached
              </span>
            </div>
            <p className="text-xs text-orange-200 mt-0.5">{alert_message}</p>
          </div>
        </div>
        <button
          onClick={onAdjustBudget}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-colors"
        >
          Manage Budget
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (alert_status === 'overspent') {
    const overAmount = Math.abs(remaining_budget_inr);
    return (
      <div className="bg-rose-950/60 border border-rose-500/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">Budget Exceeded</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200">
                Over by ₹{overAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-1 font-medium">{alert_message}</p>
          </div>
        </div>
        <button
          onClick={onAdjustBudget}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-md shadow-rose-950"
        >
          Increase Budget Limit
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
}
