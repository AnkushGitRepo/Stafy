import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getMe, login as apiLogin, logout as apiLogout } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [error, setError] = useState(null);

  useEffect(() => {
    getMe()
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    const { data } = await apiLogin(credentials);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user: user ?? null,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoading: user === undefined,
      login,
      logout,
      error,
      setError,
    }),
    [user, login, logout, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
