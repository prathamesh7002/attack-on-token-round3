import apiClient from './client';
import { USE_MOCK } from '../config/api';
import { mockVendorApi } from './mock';
import { adaptVendorProfile, adaptVendorProfilePayload } from './adapters';

export const vendorApi = {
  async getProfile() {
    if (USE_MOCK) {
      const res = await mockVendorApi.getProfile();
      return adaptVendorProfile(res);
    }
    const res = await apiClient.get('/api/vendor/profile');
    return adaptVendorProfile(res);
  },

  async updateProfile(uiProfile) {
    const payload = adaptVendorProfilePayload(uiProfile);
    if (USE_MOCK) {
      const res = await mockVendorApi.updateProfile(payload);
      return adaptVendorProfile(res);
    }
    const res = await apiClient.put('/api/vendor/profile', payload);
    return adaptVendorProfile(res);
  },
};
