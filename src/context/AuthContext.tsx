import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  login: (username: string, passwordHashRaw: string) => Promise<void>;
  setupAdmin: (username: string, passwordHashRaw: string) => Promise<void>;
  logout: () => void;
  checkSetupStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSetupStatus = async () => {
    try {
      const response = await api.get('/api/auth/status');
      setInitialized(response.data.initialized);
    } catch (err) {
      console.error('Failed to check setup status:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      await checkSetupStatus();

      if (storedToken && storedUser) {
        try {
          // Verify token by requesting /me
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, passwordHashRaw: string) => {
    const response = await api.post('/api/auth/login', { username, password: passwordHashRaw });
    const { accessToken, user: loggedUser } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const setupAdmin = async (username: string, passwordHashRaw: string) => {
    await api.post('/api/auth/setup', { username, password: passwordHashRaw });
    setInitialized(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initialized,
        loading,
        login,
        setupAdmin,
        logout,
        checkSetupStatus,
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
