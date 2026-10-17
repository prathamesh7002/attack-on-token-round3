import apiClient from './client';
import { USE_MOCK } from '../config/api';
import { mockExpenseApi } from './mock';
import { adaptExpense, adaptExpenseList, adaptExpensePayload } from './adapters';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export const expenseApi = {
  async list({ month, category, search, limit = 50, offset = 0 } = {}) {
    if (USE_MOCK) {
      const res = await mockExpenseApi.list({ month, category, search, limit, offset });
      return adaptExpenseList(res);
    }
    const params = {};
    if (month) params.month = month;
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const res = await apiClient.get('/api/expenses', { params });
    return adaptExpenseList(res);
  },

  async create(uiExpense) {
    const payload = adaptExpensePayload(uiExpense);
    if (USE_MOCK) {
      const res = await mockExpenseApi.create(payload);
      return adaptExpense(res);
    }
    const res = await apiClient.post('/api/expenses', payload);
    return adaptExpense(res);
  },

  async getById(id) {
    if (USE_MOCK) {
      const res = await mockExpenseApi.getById(id);
      return adaptExpense(res);
    }
    const res = await apiClient.get(`/api/expenses/${id}`);
    return adaptExpense(res);
  },

  async update(id, uiExpense) {
    const payload = adaptExpensePayload(uiExpense);
    if (USE_MOCK) {
      const res = await mockExpenseApi.update(id, payload);
      return adaptExpense(res);
    }
    const res = await apiClient.put(`/api/expenses/${id}`, payload);
    return adaptExpense(res);
  },

  async delete(id) {
    if (USE_MOCK) {
      return mockExpenseApi.delete(id);
    }
    return apiClient.delete(`/api/expenses/${id}`);
  },

  async getCategories() {
    if (USE_MOCK) {
      return mockExpenseApi.getCategories();
    }
    try {
      const res = await apiClient.get('/api/expenses/categories');
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.categories)) return res.categories;
      return DEFAULT_CATEGORIES.map((c) => c.name);
    } catch {
      // Graceful fallback to built-in categories list if API fails
      return DEFAULT_CATEGORIES.map((c) => c.name);
    }
  },
};
