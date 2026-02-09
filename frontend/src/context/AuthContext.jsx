import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await authApi.login(username, password);
    const { token, username: userName } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username: userName }));
    setUser({ username: userName });
    return response.data;
  };

  const register = async (username, password) => {
    const response = await authApi.register(username, password);
    const { token, username: userName } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username: userName }));
    setUser({ username: userName });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
