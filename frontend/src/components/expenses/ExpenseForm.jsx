import React, { useState, useEffect } from 'react';
import { validateAmount } from '../../utils/money';
import { getTodayDate } from '../../utils/dates';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { PAYMENT_METHODS } from '../../constants/paymentMethods';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

export default function ExpenseForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: DEFAULT_CATEGORIES[0].name,
    expenseDate: getTodayDate(),
    paymentMethod: 'Cash',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        category: initialData.category || DEFAULT_CATEGORIES[0].name,
        expenseDate: initialData.expenseDate || getTodayDate(),
        paymentMethod: initialData.paymentMethod || 'Cash',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a short description';
    }

    const amountValidation = validateAmount(formData.amount);
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error;
    }

    if (!formData.category) {
      newErrors.category = 'Please choose a category';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <Input
        id="expense-description"
        name="description"
        label="Description / Item name"
        value={formData.description}
        onChange={handleChange}
        placeholder="e.g. 20kg Onions from Wholesale Mandi"
        required
        error={errors.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="expense-amount"
          name="amount"
          label="Amount (in Rupees)"
          type="text"
          inputMode="decimal"
          prefix="₹"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
          error={errors.amount}
        />

        <Select
          id="expense-category"
          name="category"
          label="Category"
          value={formData.category}
          onChange={handleChange}
          options={DEFAULT_CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
          required
          error={errors.category}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="expense-date"
          name="expenseDate"
          label="Expense date"
          type="date"
          max={getTodayDate()}
          value={formData.expenseDate}
          onChange={handleChange}
          required
          error={errors.expenseDate}
        />

        <Select
          id="expense-payment-method"
          name="paymentMethod"
          label="Payment method"
          value={formData.paymentMethod}
          onChange={handleChange}
          options={PAYMENT_METHODS.map((pm) => ({ value: pm, label: pm }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="expense-notes" className="text-sm font-semibold text-text-primary">
          Notes (optional)
        </label>
        <textarea
          id="expense-notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Any bill number, vendor contact, or additional details"
          className="w-full p-3 text-sm bg-surface border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted/60 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="md"
          isLoading={isSubmitting}
          loadingText={isEditing ? 'Updating...' : 'Adding...'}
        >
          {isEditing ? 'Update expense' : 'Save expense'}
        </Button>
      </div>
    </form>
  );
}
