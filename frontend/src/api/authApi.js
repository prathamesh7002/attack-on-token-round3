import apiClient from './client';
import { USE_MOCK } from '../config/api';
import { mockAuthApi } from './mock';
import { adaptAuthResponse } from './adapters';

export const authApi = {
  async register(payload) {
    if (USE_MOCK) {
      const res = await mockAuthApi.register(payload);
      return adaptAuthResponse(res);
    }
    const res = await apiClient.post('/api/auth/register', payload);
    return adaptAuthResponse(res);
  },

  async login(credentials) {
    if (USE_MOCK) {
      const res = await mockAuthApi.login(credentials);
      return adaptAuthResponse(res);
    }
    const res = await apiClient.post('/api/auth/login', credentials);
    return adaptAuthResponse(res);
  },

  async me() {
    if (USE_MOCK) {
      const res = await mockAuthApi.me();
      return adaptAuthResponse({ vendor: res }).vendor;
    }
    const res = await apiClient.get('/api/auth/me');
    return adaptAuthResponse({ vendor: res }).vendor;
  },

  async logout() {
    if (USE_MOCK) {
      return mockAuthApi.logout();
    }
    try {
      return await apiClient.post('/api/auth/logout');
    } catch {
      // Best-effort logout: ignore server failure since client token is cleared anyway
      return { ok: true };
    }
  },
};
