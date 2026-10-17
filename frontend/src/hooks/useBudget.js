import { useState, useEffect, useCallback } from 'react';
import { budgetApi } from '../api/budgetApi';
import { useAuth } from '../context/AuthContext';
import { getCurrentMonth } from '../utils/dates';

export function useBudget(month) {
  const { dataVersion } = useAuth();
  const targetMonth = month || getCurrentMonth();
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudget = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await budgetApi.get(targetMonth);
      setBudgetStatus(res);
    } catch (err) {
      setError(err.message || 'Failed to load budget');
    } finally {
      setIsLoading(false);
    }
  }, [targetMonth]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget, dataVersion]);

  return {
    budgetStatus,
    isLoading,
    error,
    refetch: fetchBudget,
  };
}
