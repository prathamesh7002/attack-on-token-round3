import React, { useState } from 'react';
import { Check, Plus, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { expenseApi } from '../../api/expenseApi';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { PAYMENT_METHODS } from '../../constants/paymentMethods';
import { validateAmount, formatRupees } from '../../utils/money';
import { getTodayDate } from '../../utils/dates';
import Button from '../common/Button';

export default function QuickExpenseForm({ onExpenseCreated }) {
  const { lastUsedCategory, setLastUsedCategory, refreshData } = useAuth();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(lastUsedCategory || DEFAULT_CATEGORIES[1].name);
  const [expenseDate, setExpenseDate] = useState(getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [amountError, setAmountError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (amountError) setAmountError(null);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setLastUsedCategory(categoryName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateAmount(amount);
    if (!validation.valid) {
      setAmountError(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await expenseApi.create({
        amount: validation.value,
        category: selectedCategory,
        expense_date: expenseDate,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        description: selectedCategory,
      });

      // Show friendly confirmation toast
      showToast(`Saved ${formatRupees(validation.value)} for ${selectedCategory}`, 'success');

      // Reset form fields
      setAmount('');
      setNotes('');
      setAmountError(null);
      setShowExtraDetails(false);

      // Trigger reactive synchronization
      refreshData();
      if (onExpenseCreated) onExpenseCreated(created);
    } catch (err) {
      showToast(err.message || 'Failed to save expense. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-sm p-4 sm:p-6 flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Quick Add Expense</h2>
        <span className="text-xs text-text-muted">Takes under 5 seconds</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Large Amount Input */}
        <div className="flex flex-col gap-1">
          <label htmlFor="quick-amount" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Amount spent
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-2xl font-bold text-text-muted select-none pointer-events-none">
              ₹
            </span>
            <input
              id="quick-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className={`w-full h-14 pl-10 pr-4 text-2xl sm:text-3xl font-bold text-text-primary bg-background rounded-lg border transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
                amountError ? 'border-status-exceeded' : 'border-surface-border'
              }`}
            />
          </div>
          {amountError && (
            <p role="alert" className="text-xs font-medium text-status-exceeded mt-1">
              {amountError}
            </p>
          )}
        </div>

        {/* Category Chips Grid (flex-wrap with no truncation) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Choose Category
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`h-10 px-3.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all select-none whitespace-nowrap ${
                    isSelected
                      ? 'bg-action-primary text-white border-action-primary shadow-sm'
                      : 'bg-background text-text-primary border-surface-border hover:border-text-muted'
                  }`}
                >
                  <span>{cat.shortLabel}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible details (Date, Payment Method, Note) */}
        <div>
          <button
            type="button"
            onClick={() => setShowExtraDetails(!showExtraDetails)}
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 select-none py-1"
          >
            <span>{showExtraDetails ? 'Hide details' : 'Change date or add note'}</span>
            {showExtraDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExtraDetails && (
            <div className="mt-3 pt-3 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
              {/* Date Input */}
              <div className="flex flex-col gap-1">
                <label htmlFor="quick-date" className="text-xs font-semibold text-text-muted">
                  Expense date
                </label>
                <div className="relative flex items-center">
                  <input
                    id="quick-date"
                    type="date"
                    value={expenseDate}
                    max={getTodayDate()}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-background border border-surface-border rounded-lg text-text-primary focus-visible:outline-accent"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-1">
                <label htmlFor="quick-payment" className="text-xs font-semibold text-text-muted">
                  Paid via
                </label>
                <select
                  id="quick-payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-background border border-surface-border rounded-lg text-text-primary focus-visible:outline-accent"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Notes */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label htmlFor="quick-notes" className="text-xs font-semibold text-text-muted">
                  Optional note
                </label>
                <input
                  id="quick-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 5L Fortune oil tin from wholesale"
                  className="w-full h-11 px-3 text-sm bg-background border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted/60 focus-visible:outline-accent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="md"
          isLoading={isSubmitting}
          loadingText="Saving expense..."
          className="w-full mt-1"
          icon={Plus}
        >
          Save expense
        </Button>
      </form>
    </div>
  );
}
