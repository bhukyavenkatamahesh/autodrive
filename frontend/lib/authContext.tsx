'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, AuthUser } from './api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') => Promise<void>;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Rehydrate from localStorage on first load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore invalid stored data
    }
  }, []);

  async function login(email: string, password: string) {
    const result = await loginUser(email, password);
    setSession(result.token, result.user);
  }

  function setSession(nextToken: string, nextUser: AuthUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('auth_token', nextToken);
    localStorage.setItem('auth_user', JSON.stringify(nextUser));
  }

  async function register(name: string, email: string, password: string, role: 'user' | 'admin' = 'user') {
    const result = await registerUser(name, email, password, role);
    setSession(result.token, result.user);
  }

  function logout() {
    if (token) logoutUser(token);
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
