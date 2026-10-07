import { createContext, useContext } from 'react';
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  title?: string;
  bio?: string;
  avatar?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginFn: (email: string, password: string) => Promise<void>;
  logoutFn: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
