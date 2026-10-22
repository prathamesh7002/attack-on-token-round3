import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-white mb-1">Delete Expense Record?</h3>
        <p className="text-xs text-slate-400 mb-5">
          Are you sure you want to delete <span className="text-white font-medium">"{itemName}"</span>? This will permanently recalculate your monthly budget and analytics.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {loading ? 'Deleting...' : 'Delete Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
