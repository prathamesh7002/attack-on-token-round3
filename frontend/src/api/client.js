import axios from 'axios';
import { VITE_API_BASE_URL, TOKEN_STORAGE_KEY, VENDOR_STORAGE_KEY } from '../config/api';

// Create single Axios client instance
const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Bearer token to all protected requests
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore storage access issues in restricted contexts
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s and normalize FastAPI error shapes
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status || 500;
    const responseData = error.response?.data;
    const requestUrl = error.config?.url || '';

    // Handle 401 Unauthorized
    // Avoid redirect loop when login itself returns 401
    const isLoginEndpoint = requestUrl.includes('/api/auth/login');
    if (status === 401 && !isLoginEndpoint) {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(VENDOR_STORAGE_KEY);
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Normalize error shapes
    let message = 'Something went wrong. Please try again.';
    const fieldErrors = {};

    if (responseData) {
      if (typeof responseData.detail === 'string') {
        message = responseData.detail;
      } else if (Array.isArray(responseData.detail)) {
        // FastAPI 422 Unprocessable Entity returns an array of validation errors:
        // [ { loc: ["body", "email"], msg: "...", type: "..." } ]
        message = 'Please correct the highlighted fields.';
        responseData.detail.forEach((item) => {
          if (item.loc && Array.isArray(item.loc) && item.loc.length > 0) {
            const field = item.loc[item.loc.length - 1];
            // Format friendly messages if needed
            let fieldMsg = item.msg || 'Invalid value';
            if (fieldMsg.startsWith('Value error, ')) {
              fieldMsg = fieldMsg.replace('Value error, ', '');
            }
            fieldErrors[field] = fieldMsg;
          }
        });
      } else if (responseData.message) {
        message = responseData.message;
      }
    } else if (error.message) {
      if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please check your connection.';
      } else if (error.message.includes('Network Error')) {
        message = 'Unable to connect to the server. Please check if the backend is running.';
      } else {
        message = error.message;
      }
    }

    // Friendly mapping for duplicate email errors
    if ((status === 400 || status === 409) && message.toLowerCase().includes('already registered')) {
      fieldErrors.email = 'This email is already registered';
      message = 'An account with this email already exists';
    }

    const normalizedError = {
      status,
      message,
      fieldErrors,
      raw: error,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
