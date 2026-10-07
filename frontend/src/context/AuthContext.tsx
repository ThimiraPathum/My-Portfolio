import { useState, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api';

import { AuthContext } from './useAuth';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => {
    try { const token = localStorage.getItem('token'); const user = JSON.parse(localStorage.getItem('user') || 'null'); return { token, user }; }
    catch { localStorage.removeItem('token'); localStorage.removeItem('user'); return { token: null, user: null }; }
  });
  const { user, token } = session;
  const isLoading = false;
  const loginFn = async (email: string, password: string) => {
    const { data } = await apiLogin(email, password);
    setSession({ token: data.access_token, user: data.user });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logoutFn = async () => {
    try {
      await apiLogout();
    } catch { /* ignore */ }
    setSession({ token: null, user: null });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      loginFn,
      logoutFn,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
