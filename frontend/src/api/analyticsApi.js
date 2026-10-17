import apiClient from './client';
import { USE_MOCK } from '../config/api';
import { mockAnalyticsApi } from './mock';
import { adaptCategoryStats, adaptMonthlySummary } from './adapters';

export const analyticsApi = {
  async getCategoryWise(month) {
    if (USE_MOCK) {
      const res = await mockAnalyticsApi.categoryWise({ month });
      return adaptCategoryStats(res);
    }
    const params = month ? { month } : {};
    const res = await apiClient.get('/api/analytics/category-wise', { params });
    return adaptCategoryStats(res);
  },

  async getMonthlySummary(month) {
    if (USE_MOCK) {
      const res = await mockAnalyticsApi.monthlySummary({ month });
      return adaptMonthlySummary(res, month);
    }
    const params = month ? { month } : {};
    const res = await apiClient.get('/api/analytics/monthly-summary', { params });
    return adaptMonthlySummary(res, month);
  },
};
