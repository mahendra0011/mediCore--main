import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      api.me()
        .then(u => setUser(u))
        .catch((err) => {
          const isAuthError = err?.message?.includes('401') || 
                           err?.message?.toLowerCase().includes('not authorized') ||
                           err?.message?.toLowerCase().includes('token') ||
                           err?.message?.toLowerCase().includes('unauthorized');
          if (isAuthError) {
            localStorage.removeItem('hms_token');
            localStorage.removeItem('token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const data = await api.login({ email, password, role });
    localStorage.removeItem('token');
    localStorage.setItem('hms_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password, role }) => {
    const data = await api.register({ name, email, password, role });
    localStorage.removeItem('token');
    localStorage.setItem('hms_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('token');
    setUser(null);
  };

  const completeOtpLogin = ({ token, user }) => {
    localStorage.removeItem('token');
    localStorage.setItem('hms_token', token);
    setUser(user);
  };

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }));

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, completeOtpLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
