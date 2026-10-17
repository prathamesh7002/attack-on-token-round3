import { useState, useEffect, useCallback } from 'react';
import { expenseApi } from '../api/expenseApi';
import { useAuth } from '../context/AuthContext';

export function useExpenses(filters = {}) {
  const { dataVersion } = useAuth();
  const [data, setData] = useState({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterMonth = filters.month;
  const filterCategory = filters.category;
  const filterSearch = filters.search;
  const filterLimit = filters.limit;
  const filterOffset = filters.offset;

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await expenseApi.list({
        month: filterMonth,
        category: filterCategory,
        search: filterSearch,
        limit: filterLimit,
        offset: filterOffset,
      });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [filterMonth, filterCategory, filterSearch, filterLimit, filterOffset]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, dataVersion]);

  return {
    expenses: data.items,
    total: data.total,
    isLoading,
    error,
    refetch: fetchExpenses,
  };
}
