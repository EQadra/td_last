// context/HistoryContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import api from '../utils/axios';

// ============================================================
// TIPOS
// ============================================================

interface HistoryItem {
  id: number;
  user_id: number;
  historyable_type: string;
  historyable_id: number;
  views: number;
  last_viewed_at: string;
  created_at: string;
  updated_at: string;
  historyable: any;
}

interface HistoryContextProps {
  history: HistoryItem[]; // 👈 Siempre será un array
  loading: boolean;
  error: string | null;
  fetchMyHistory: () => Promise<void>;
  fetchHistoryByType: (type: string) => Promise<void>;
  fetchMostViewed: (type: string) => Promise<HistoryItem[]>;
  addHistory: (type: string, id: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const HistoryContext = createContext<HistoryContextProps>(
  {} as HistoryContextProps
);

// ============================================================
// PROVIDER
// ============================================================

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  // 👈 IMPORTANTE: Inicializar como array vacío
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // HELPERS
  // ============================================================

  const getToken = async () => {
    return await SecureStore.getItemAsync('token');
  };

  const getHeaders = async () => {
    const token = await getToken();
    return {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    };
  };

  // ============================================================
  // FETCH: Obtener todo el historial del usuario
  // ============================================================

  const fetchMyHistory = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const res = await api.get('/history/my', headers);
      // 👈 Asegurar que siempre sea un array
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar historial';
      setError(errorMsg);
      console.error('Error fetching history:', err);
      // 👈 En caso de error, mantener array vacío
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH: Obtener historial por tipo
  // ============================================================

  const fetchHistoryByType = async (type: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const res = await api.get(`/history/type/${type}`, headers);
      // 👈 Asegurar que siempre sea un array
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Error al cargar historial de ${type}`;
      setError(errorMsg);
      console.error('Error fetching history by type:', err);
      // 👈 En caso de error, mantener array vacío
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH: Obtener los más vistos
  // ============================================================

  const fetchMostViewed = async (type: string): Promise<HistoryItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const res = await api.get(`/history/most-viewed/${type}`, headers);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Error al cargar los más vistos`;
      setError(errorMsg);
      console.error('Error fetching most viewed:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADD: Agregar al historial
  // ============================================================

  const addHistory = async (type: string, id: number): Promise<void> => {
    try {
      const headers = await getHeaders();
      await api.post('/history/store', { type, id }, headers);
    } catch (err: any) {
      console.error('Error adding history:', err);
      // No lanzamos el error para no interrumpir la experiencia del usuario
    }
  };

  // ============================================================
  // DELETE: Limpiar historial
  // ============================================================

  const clearHistory = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      await api.delete('/history/clear', headers);
      // 👈 Limpiar el estado local
      setHistory([]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al limpiar historial';
      setError(errorMsg);
      console.error('Error clearing history:', err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VALUE
  // ============================================================

  return (
    <HistoryContext.Provider
      value={{
        history, // 👈 Siempre será un array (vacío o con datos)
        loading,
        error,
        fetchMyHistory,
        fetchHistoryByType,
        fetchMostViewed,
        addHistory,
        clearHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useHistory = (): HistoryContextProps => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory debe usarse dentro de HistoryProvider');
  }
  return context;
};