import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('streetledger_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('streetledger_token'));
  const [demoVendors, setDemoVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load demo vendors for 1-click switcher
  const fetchDemoVendors = async () => {
    try {
      const res = await api.get('/auth/demo-vendors');
      setDemoVendors(res.data);
    } catch (err) {
      console.error('Failed to load demo vendors:', err);
    }
  };

  // Verify current user session on mount
  useEffect(() => {
    const initAuth = async () => {
      fetchDemoVendors();
      const storedToken = localStorage.getItem('streetledger_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('streetledger_user', JSON.stringify(res.data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('streetledger_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('streetledger_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('streetledger_token', access_token);
    localStorage.setItem('streetledger_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (registerData) => {
    const res = await api.post('/auth/register', registerData);
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('streetledger_token', access_token);
    localStorage.setItem('streetledger_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    fetchDemoVendors(); // Refresh vendor list
    return newUser;
  };

  const demoLogin = async (vendorId) => {
    const res = await api.post('/auth/demo-login', { vendor_id: vendorId });
    const { access_token, user: demoUser } = res.data;
    localStorage.setItem('streetledger_token', access_token);
    localStorage.setItem('streetledger_user', JSON.stringify(demoUser));
    setToken(access_token);
    setUser(demoUser);
    return demoUser;
  };

  const logout = () => {
    localStorage.removeItem('streetledger_token');
    localStorage.removeItem('streetledger_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('streetledger_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        demoVendors,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        fetchDemoVendors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
