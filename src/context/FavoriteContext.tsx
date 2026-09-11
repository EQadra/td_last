// context/FavoriteContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import api from '../utils/axios';

interface FavoriteItem {
  id: number;
  user_id: number;
  favoritable_type: string;
  favoritable_id: number;
  favoritable: any;
  created_at: string;
  updated_at: string;
}

interface FavoriteContextProps {
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  fetchMyFavorites: () => Promise<void>;
  fetchFavoritesByType: (type: string) => Promise<void>;
  toggleFavorite: (type: string, id: number) => Promise<{ favorited: boolean; message: string }>;
  checkFavorite: (type: string, id: number) => Promise<boolean>;
  clearFavorites: () => void;
}

const FavoriteContext = createContext<FavoriteContextProps>(
  {} as FavoriteContextProps
);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    return await SecureStore.getItemAsync('token');
  };

  // Obtener todos los favoritos del usuario
  const fetchMyFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await api.get('/favorites/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar favoritos');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener favoritos por tipo
  const fetchFavoritesByType = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await api.get(`/favorites/type/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al cargar ${type}`);
      console.error('Error fetching favorites by type:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorito (agregar/quitar)
// context/FavoriteContext.tsx - Actualizado para manejar la respuesta

const toggleFavorite = async (type: string, id: number) => {
  try {
    const token = await getToken();
    const res = await api.post('/favorites/toggle', { type, id }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Actualizar la lista local
    if (!res.data.favorited) {
      setFavorites(prev => prev.filter(f => !(f.favoritable_type === type && f.favoritable_id === id)));
    } else {
      await fetchMyFavorites();
    }

    return res.data;
  } catch (err: any) {
    console.error('Error toggling favorite:', err);
    throw new Error(err.response?.data?.message || 'Error al actualizar favorito');
  }
};

  // Verificar si un item está en favoritos
  const checkFavorite = async (type: string, id: number): Promise<boolean> => {
    try {
      const token = await getToken();
      const res = await api.get(`/favorites/check/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.favorited;
    } catch (err: any) {
      console.error('Error checking favorite:', err);
      return false;
    }
  };
  

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        loading,
        error,
        fetchMyFavorites,
        fetchFavoritesByType,
        toggleFavorite,
        checkFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoriteProvider');
  }
  return context;
};