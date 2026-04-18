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
      console.log('User object:', user);
      console.log('User role:', user.role);
      const list = await api.getNotifications({});
      console.log('All notifications:', list.length);
      const myNotifications = list.filter(n => n.userId === user._id || n.userId === user.id);
      console.log('My notifications:', myNotifications.length);
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