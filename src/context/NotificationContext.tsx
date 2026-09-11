// context/NotificationContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      await ensureToken();
      
      // Obtener feedbacks recientes
      let feedbacks: any[] = [];
      try {
        const res = await api.get('/feedbacks');
        feedbacks = extractData(res.data);
        console.log('📊 Feedbacks obtenidos:', feedbacks.length);
      } catch (err) {
        console.log('Error fetching feedbacks:', err);
        feedbacks = [];
      }

      // Obtener comentarios recientes
      let comments: any[] = [];
      try {
        const commentsRes = await api.get('/comments');
        comments = extractData(commentsRes.data);
        console.log('📊 Comentarios obtenidos:', comments.length);
      } catch (err) {
        console.log('Error fetching comments:', err);
        comments = [];
      }

      // Transformar feedbacks a notificaciones
      const feedbackNotifications: Notification[] = feedbacks.map((f: any) => ({
        id: `feedback-${f.id || Date.now()}`,
        title: `Nueva reseña de ${f.user?.name || 'Usuario'}`,
        message: f.comment || `Te calificaron con ${f.rating || 0} estrellas`,
        time: f.created_at ? new Date(f.created_at).toLocaleString() : new Date().toLocaleString(),
        type: 'feedback',
        read: false,
        data: f,
        created_at: f.created_at || new Date().toISOString(),
      }));

      // Transformar comentarios a notificaciones
      const commentNotifications: Notification[] = comments.map((c: any) => ({
        id: `comment-${c.id || Date.now()}`,
        title: `Nuevo comentario de ${c.user?.name || 'Usuario'}`,
        message: c.content || '',
        time: c.created_at ? new Date(c.created_at).toLocaleString() : new Date().toLocaleString(),
        type: 'comment',
        read: false,
        data: c,
        created_at: c.created_at || new Date().toISOString(),
      }));

      // Combinar y ordenar por fecha (más reciente primero)
      const all = [...feedbackNotifications, ...commentNotifications];
      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('📊 Total notificaciones:', all.length);
      setNotifications(all);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como leída
  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
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