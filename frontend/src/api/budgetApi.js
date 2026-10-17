import apiClient from './client';
import { USE_MOCK } from '../config/api';
import { mockBudgetApi } from './mock';
import { adaptBudgetStatus, adaptBudgetPayload } from './adapters';

export const budgetApi = {
  async get(month) {
    if (USE_MOCK) {
      const res = await mockBudgetApi.get({ month });
      return adaptBudgetStatus(res, month);
    }
    const params = month ? { month } : {};
    const res = await apiClient.get('/api/budget', { params });
    return adaptBudgetStatus(res, month);
  },

  async set(uiBudget) {
    const payload = adaptBudgetPayload(uiBudget);
    if (USE_MOCK) {
      const res = await mockBudgetApi.set(payload);
      return adaptBudgetStatus(res, uiBudget.month);
    }
    const res = await apiClient.post('/api/budget', payload);
    return adaptBudgetStatus(res, uiBudget.month);
  },

  async getAlerts(month) {
    if (USE_MOCK) {
      return mockBudgetApi.getAlerts({ month });
    }
    const params = month ? { month } : {};
    return apiClient.get('/api/budget/alerts', { params });
  },
};
