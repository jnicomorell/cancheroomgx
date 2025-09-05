import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import api from '@/lib/api';

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'client';
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sanctum_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.get<User>('/api/v1/auth/user');
        setUser(data);
        localStorage.setItem('cancheroo_user', JSON.stringify(data));
      } catch {
        localStorage.removeItem('sanctum_token');
        localStorage.removeItem('cancheroo_user');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ token: string }>('/api/v1/auth/login', {
        email,
        password,
      });
      localStorage.setItem('sanctum_token', data.token);
      const userRes = await api.get<User>('/api/v1/auth/user');
      setUser(userRes.data);
      localStorage.setItem('cancheroo_user', JSON.stringify(userRes.data));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ token: string }>('/api/v1/auth/register', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        password: userData.password,
        password_confirmation: userData.password,
      });
      localStorage.setItem('sanctum_token', data.token);
      const userRes = await api.get<User>('/api/v1/auth/user');
      setUser(userRes.data);
      localStorage.setItem('cancheroo_user', JSON.stringify(userRes.data));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // ignore errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('cancheroo_user');
      localStorage.removeItem('sanctum_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};