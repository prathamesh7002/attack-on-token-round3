import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TOKEN_STORAGE_KEY, VENDOR_STORAGE_KEY, LAST_CATEGORY_KEY } from '../config/api';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [vendor, setVendor] = useState(() => {
    try {
      const saved = localStorage.getItem(VENDOR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lastUsedCategory, setLastCategoryState] = useState(() => {
    try {
      return localStorage.getItem(LAST_CATEGORY_KEY) || 'Vegetables and fruits';
    } catch {
      return 'Vegetables and fruits';
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(1);

  // Trigger global reactive refresh across hooks (expenses, budget, charts, alerts)
  const refreshData = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const setLastUsedCategory = useCallback((category) => {
    if (!category) return;
    setLastCategoryState(category);
    try {
      localStorage.setItem(LAST_CATEGORY_KEY, category);
    } catch {
      // ignore
    }
  }, []);

  // Restore authenticated session on app boot
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentVendor = await authApi.me();
        if (isMounted) {
          setVendor(currentVendor);
          localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(currentVendor));
        }
      } catch (err) {
        // If token is expired or invalid, wipe session
        if (isMounted) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(VENDOR_STORAGE_KEY);
          setToken(null);
          setVendor(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
    }
    if (res.vendor) {
      localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(res.vendor));
      setVendor(res.vendor);
    }
    refreshData();
    return res;
  }, [refreshData]);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    // If backend returns token upon register, store it immediately
    if (res.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      if (res.vendor) {
        localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(res.vendor));
        setVendor(res.vendor);
      }
    } else {
      // If registration only returned user object without token, log in with credentials
      return login(payload.email, payload.password);
    }
    refreshData();
    return res;
  }, [login, refreshData]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(VENDOR_STORAGE_KEY);
      setToken(null);
      setVendor(null);
    }
  }, []);

  const updateVendorState = useCallback((updatedVendor) => {
    setVendor(updatedVendor);
    try {
      localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(updatedVendor));
    } catch {
      // ignore
    }
  }, []);

  const value = {
    token,
    vendor,
    isAuthenticated: Boolean(token),
    isLoading,
    dataVersion,
    refreshData,
    login,
    register,
    logout,
    updateVendorState,
    lastUsedCategory,
    setLastUsedCategory,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
