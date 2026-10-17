import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = [
  "Ingredients and raw materials",
  "Vegetables and fruits",
  "Cooking oil and spices",
  "LPG and fuel",
  "Packaging materials",
  "Transportation",
  "Stall rent and maintenance",
  "Cleaning supplies",
  "Equipment and repairs",
  "Miscellaneous"
];

export default function ExpenseModal({ isOpen, onClose, onSaved, initialExpense = null }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialExpense) {
      setDescription(initialExpense.description || '');
      setAmount(initialExpense.amount_inr ? initialExpense.amount_inr.toString() : '');
      setCategory(initialExpense.category || CATEGORIES[0]);
      setExpenseDate(initialExpense.expense_date || new Date().toISOString().split('T')[0]);
      setNotes(initialExpense.notes || '');
    } else {
      setDescription('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [initialExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Please provide an expense description.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount in ₹.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        description: description.trim(),
        amount: parsedAmount,
        category,
        expense_date: expenseDate,
        notes: notes.trim() || null,
      };

      if (initialExpense?.id) {
        await api.put(`/expenses/${initialExpense.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(err.response?.data?.detail || 'Failed to save expense. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              {initialExpense ? 'Edit Expense Record' : 'Record Daily Expense'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Accurately stored in integer paise with zero floating-point rounding errors.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Potatoes 50kg bag, Sunflower oil 15L, LPG refill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount (₹) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category <span className="text-amber-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Optional Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Purchased from Azadpur mandi at wholesale rate"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {initialExpense ? 'Update Expense' : 'Save Expense'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
