import React, { useState, useEffect } from 'react';
import { validateAmount } from '../../utils/money';
import { validateThresholds } from '../../utils/validators';
import Input from '../common/Input';
import Button from '../common/Button';
import ThresholdPreview from './ThresholdPreview';

export default function BudgetForm({
  currentBudget,
  onSubmit,
  isSubmitting = false,
}) {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [warningThreshold, setWarningThreshold] = useState('80');
  const [highThreshold, setHighThreshold] = useState('90');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentBudget) {
      setBudgetAmount(
        currentBudget.budgetAmount ? String(currentBudget.budgetAmount) : ''
      );
      setWarningThreshold(
        currentBudget.warningThresholdPct ? String(currentBudget.warningThresholdPct) : '80'
      );
      setHighThreshold(
        currentBudget.highThresholdPct ? String(currentBudget.highThresholdPct) : '90'
      );
    }
  }, [currentBudget]);

  const validate = () => {
    const newErrors = {};

    const amountVal = validateAmount(budgetAmount);
    if (!amountVal.valid) {
      newErrors.budgetAmount = amountVal.error;
    }

    const thresholdErr = validateThresholds(warningThreshold, highThreshold);
    if (thresholdErr) {
      newErrors.thresholds = thresholdErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      budgetAmount: Number(budgetAmount),
      warningThresholdPct: Number(warningThreshold),
      highSpendingThresholdPct: Number(highThreshold),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-text-primary">
          Configure Monthly Spending Limit
        </h2>

        <Input
          id="budget-amount"
          name="budgetAmount"
          label="Total monthly budget (Rupees)"
          type="text"
          inputMode="decimal"
          prefix="₹"
          value={budgetAmount}
          onChange={(e) => {
            setBudgetAmount(e.target.value);
            if (errors.budgetAmount) setErrors((prev) => ({ ...prev, budgetAmount: null }));
          }}
          placeholder="e.g. 25000"
          required
          error={errors.budgetAmount}
          helperText="Maximum target amount your stall should spend this calendar month."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-border">
          <Input
            id="warning-threshold"
            name="warningThreshold"
            label="Warning threshold (%)"
            type="number"
            min="1"
            max="99"
            value={warningThreshold}
            onChange={(e) => {
              setWarningThreshold(e.target.value);
              if (errors.thresholds) setErrors((prev) => ({ ...prev, thresholds: null }));
            }}
            suffix="%"
            helperText="Default: 80%. Triggers amber caution alert."
          />

          <Input
            id="high-threshold"
            name="highThreshold"
            label="High spending threshold (%)"
            type="number"
            min="2"
            max="100"
            value={highThreshold}
            onChange={(e) => {
              setHighThreshold(e.target.value);
              if (errors.thresholds) setErrors((prev) => ({ ...prev, thresholds: null }));
            }}
            suffix="%"
            helperText="Default: 90%. Triggers orange warning alert."
          />
        </div>

        {errors.thresholds && (
          <p role="alert" className="text-xs font-medium text-status-exceeded">
            {errors.thresholds}
          </p>
        )}

        <Button
          type="submit"
          size="md"
          isLoading={isSubmitting}
          loadingText="Saving budget..."
          className="w-full mt-2"
        >
          Save budget settings
        </Button>
      </form>

      {/* Live Preview of resulting alert zones */}
      <ThresholdPreview
        budgetAmount={Number(budgetAmount) || 0}
        warningThresholdPct={Number(warningThreshold) || 80}
        highSpendingThresholdPct={Number(highThreshold) || 90}
      />
    </div>
  );
}
