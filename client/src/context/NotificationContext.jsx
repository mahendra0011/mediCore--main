import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!user) { setCount(0); return; }
    try {
      const list = await api.getNotifications({});
      const unread = list.filter(n => !n.read).length;
      setCount(unread);
    } catch (e) { console.error('Notification count error:', e); }
  }, [user]);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 15000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  return (
    <NotificationContext.Provider value={{ count, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCount() {
  const context = useContext(NotificationContext);
  return context || { count: 0, refreshCount: () => {} };
}