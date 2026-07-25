import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { api, tokenStorage } from '@/lib/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const hydrateUser = async () => {
    const access = tokenStorage.getAccess();
    const refresh = tokenStorage.getRefresh();

    if (!access || !refresh) {
      tokenStorage.clear();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/users/me/');
      setUser(response.data);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const login = async ({ username, password }) => {
    const response = await api.post('/api/users/login/', { username, password });
    tokenStorage.setTokens(response.data);
    const profile = await api.get('/api/users/me/');
    setUser(profile.data);
    pushToast({ title: 'Welcome back', description: `${profile.data.username} is signed in.` });
    return profile.data;
  };

  const register = async (payload) => {
    await api.post('/api/users/register/', payload);
    return login({ username: payload.username, password: payload.password });
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
    pushToast({ title: 'Signed out', description: 'Your session has been cleared.' });
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      roleLabel: user?.role === 'admin' ? 'Admin' : 'Customer',
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}