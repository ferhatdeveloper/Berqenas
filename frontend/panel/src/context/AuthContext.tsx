import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (formData: FormData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('berqenas_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const userData = await api.auth.me(token!);
      if (userData.username) {
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData: FormData) => {
    try {
      const response = await api.auth.login(formData);
      if (response.access_token) {
        const newToken = response.access_token;
        localStorage.setItem('berqenas_token', newToken);
        setToken(newToken);
        // fetchUser will be triggered by useEffect
      } else {
        throw new Error(response.detail || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('berqenas_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}