import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { useAuth } from '../context/AuthContext';
import { getCurrentMonth } from '../utils/dates';

export function useAnalytics(month) {
  const { dataVersion } = useAuth();
  const targetMonth = month || getCurrentMonth();
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cats, summary] = await Promise.all([
        analyticsApi.getCategoryWise(targetMonth),
        analyticsApi.getMonthlySummary(targetMonth),
      ]);
      setCategoryStats(cats);
      setMonthlySummary(summary);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [targetMonth]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, dataVersion]);

  return {
    categoryStats,
    monthlySummary,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
