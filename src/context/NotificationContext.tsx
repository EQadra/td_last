// context/NotificationContext.tsx
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from "../utils/axios";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'feedback' | 'comment' | 'post' | 'service';
  read: boolean;
  data?: any;
  created_at: string;
}

interface NotificationsContextProps {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}
const READ_KEY = 'notifications_read_ids';

const NotificationsContext = createContext<NotificationsContextProps>(
  {} as NotificationsContextProps
);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const ensureToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        await setAuthToken(token);
      }
    } catch (error) {
      console.error('Error ensuring token:', error);
    }
  };

  // Función para extraer datos de la respuesta
  const extractData = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data) {
      if (Array.isArray(response.data)) return response.data;
      if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    }
    return [];
  };

  // Cargar notificaciones del usuario
// Cargar notificaciones del usuario
const fetchNotifications = async () => {
  setLoading(true);
  try {
    await ensureToken();

    const res = await api.get('/notifications');
    const data = extractData(res.data);

    console.log('📊 Notificaciones obtenidas:', data.length);

    // El backend ya devuelve el formato correcto
    const parsed: Notification[] = data.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.time || new Date(n.created_at).toLocaleString(),
      type: n.type,
      read: n.read ?? false,
      data: n.data,
      created_at: n.created_at,
    }));

    setNotifications(parsed);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};

 const markAsRead = async (id: string) => {
  setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, read: true } : n)
  );
  // Guardar en SecureStore
  try {
    const stored = await SecureStore.getItemAsync(READ_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (!ids.includes(id)) {
      ids.push(id);
      await SecureStore.setItemAsync(READ_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    console.warn('Error guardando read:', e);
  }
};

const markAllAsRead = async () => {
  const allIds = notifications.map(n => n.id);
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  try {
    await SecureStore.setItemAsync(READ_KEY, JSON.stringify(allIds));
  } catch (e) {
    console.warn('Error guardando read all:', e);
  }
};

  // Agregar notificación en tiempo real
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Contar no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Cargar notificaciones al inicio
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};