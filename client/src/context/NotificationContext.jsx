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
      const userId = (user._id || user.id)?.toString();
      // Admin sees all notifications, others filter by their userId
      let myNotifications;
      if (user.role === 'admin') {
        myNotifications = list; // Show all for admin
      } else {
        myNotifications = list.filter(n => n.userId === userId);
      }
      const unread = myNotifications.filter(n => !n.read).length;
      setCount(unread);
    } catch (e) { console.error('Notification count error:', e); }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshCount();
      const interval = setInterval(refreshCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user, refreshCount]);

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