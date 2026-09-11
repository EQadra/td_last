// context/NewsContext.tsx
import React, { createContext, useCallback, useContext, useState } from "react";
import api from "../utils/axios";

/* =========================
   TYPES
========================= */
export interface News {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string;
  fecha_publicacion: string;
  created_at: string;
  updated_at: string;
  newable_type: string;
  newable_id: number;
  newable: any;
  comments: any[];
  liked?: boolean;
  likes_count?: number;
}

interface NewsContextType {
  // Estados
  news: News[];
  loading: boolean;
  error: string | null;
  
  // CRUD
  fetchNews: () => Promise<void>;
  createNews: (data: any) => Promise<any>;
  updateNews: (id: number, data: any) => Promise<any>;
  deleteNews: (id: number) => Promise<any>;
  
  // Likes
  toggleLike: (id: number) => Promise<any>;
  checkLike: (id: number) => Promise<{ liked: boolean; likes_count: number }>;
  
  // Obtener una noticia por ID
  getNews: (id: number) => Promise<any>;
}

/* =========================
   CONTEXT
========================= */
const NewsContext = createContext<NewsContextType | null>(null);

/* =========================
   PROVIDER
========================= */
export const NewsProvider = ({ children }: any) => {
  // 🔥 ESTADOS AGREGADOS
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH NEWS - 🔥 NUEVO
  ========================== */
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news");
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.error("Error al cargar noticias:", error);
      setError(error.response?.data?.message || "Error al cargar noticias");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     CREATE NEWS
  ========================== */
  const createNews = useCallback(async (data: any) => {
    try {
      const res = await api.post("/news", data);
      // Actualizar la lista
      setNews(prev => [res.data.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("Error al crear noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     UPDATE NEWS
  ========================== */
  const updateNews = useCallback(async (id: number, data: any) => {
    try {
      const res = await api.put(`/news/${id}`, data);
      // Actualizar en la lista
      setNews(prev => prev.map(item => 
        item.id === id ? res.data.data : item
      ));
      return res.data;
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     DELETE NEWS
  ========================== */
  const deleteNews = useCallback(async (id: number) => {
    try {
      const res = await api.delete(`/news/${id}`);
      // Remover de la lista
      setNews(prev => prev.filter(item => item.id !== id));
      return res.data;
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     GET NEWS BY ID
  ========================== */
  const getNews = useCallback(async (id: number) => {
    try {
      const res = await api.get(`/news/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     TOGGLE LIKE
  ========================== */
  const toggleLike = useCallback(async (id: number) => {
    try {
      const res = await api.post(`/news/${id}/like`);
      // Actualizar estado local
      setNews(prev => prev.map(item => {
        if (item.id === id) {
          const data = res.data.data;
          return {
            ...item,
            liked: data.liked,
            likes_count: data.likes_count,
          };
        }
        return item;
      }));
      return res.data.data;
    } catch (error) {
      console.error("Error al toggle like:", error);
      throw error;
    }
  }, []);

  /* =========================
     CHECK LIKE
  ========================== */
  const checkLike = useCallback(async (id: number) => {
    try {
      const res = await api.get(`/news/${id}/check-like`);
      return res.data.data;
    } catch (error) {
      console.error("Error al verificar like:", error);
      throw error;
    }
  }, []);

  /* =========================
     VALUE
  ========================== */
  const value = {
    // Estados
    news,
    loading,
    error,
    // Métodos
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
    getNews,
    toggleLike,
    checkLike,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews debe usarse dentro de NewsProvider");
  }
  return context;
};