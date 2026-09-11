// context/NewsRoleContext.tsx - COMPLETO CORREGIDO (CON NORMALIZACIÓN DE IMÁGENES)
import * as ImagePicker from 'expo-image-picker';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import api from "../utils/axios";

/* =========================
   TYPES
========================= */
export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at?: string;
}

export interface Newable {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
}

export interface News {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string;
  image?: string;
  image_url?: string;
  fecha_publicacion: string;
  created_at: string;
  updated_at: string;
  newable_type: string | null;
  newable_id: number | null;
  user_id: number;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  newable: Newable | null;
  comments: Comment[];
  liked?: boolean;
  likes_count?: number;
}

interface NewsRoleContextType {
  latestNews: News[];
  userNews: News[];
  allUserNews: News[];
  likedNews: News[];
  loading: boolean;
  error: string | null;

  fetchLatestNews: () => Promise<News[]>;
  fetchUserLatestNews: () => Promise<News[]>;
  fetchAllUserNews: () => Promise<News[]>;
  fetchLikedNews: () => Promise<News[]>;
  getNewsById: (id: number) => News | undefined;

  addComment: (newsId: number, content: string) => Promise<Comment>;

  createNews: (data: any, image?: ImagePicker.ImagePickerAsset | string | null) => Promise<any>;
  updateNews: (id: number, data: any, image?: ImagePicker.ImagePickerAsset | string | null) => Promise<any>;
  deleteNews: (id: number) => Promise<any>;

  toggleLike: (id: number) => Promise<{ liked: boolean; likes_count: number }>;
  checkLike: (id: number) => Promise<{ liked: boolean }>;

  resetNews: () => void;
}

const NewsRoleContext = createContext<NewsRoleContextType | null>(null);

// ============================================================
// ✅ FUNCIÓN PARA NORMALIZAR URLS DE IMÁGENES
// ============================================================
const IMAGE_BASE_URL = 'http://192.168.203.82:8000';

const normalizeImageUrl = (image: string | null | undefined): string | null => {
  if (!image) return null;

  // ✅ SI YA ES URL COMPLETA, DEVOLVERLA
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  // ✅ SI EMPIEZA CON /storage/ O storage/
  if (image.includes('/storage/') || image.startsWith('storage/')) {
    const cleanPath = image.replace(/^\/?/, '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }

  // ✅ SI EMPIEZA CON /imagenes_app/ O imagenes_app/
  if (image.includes('/imagenes_app/') || image.startsWith('imagenes_app/')) {
    const cleanPath = image.replace(/^\/?/, '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }

  // ✅ DEFAULT: agregar base
  return `${IMAGE_BASE_URL}/${image.replace(/^\/?/, '')}`;
};

export const NewsRoleProvider = ({ children }: { children: ReactNode }) => {
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [userNews, setUserNews] = useState<News[]>([]);
  const [allUserNews, setAllUserNews] = useState<News[]>([]);
  const [likedNews, setLikedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetNews = useCallback(() => {
    setLatestNews([]);
    setUserNews([]);
    setAllUserNews([]);
    setLikedNews([]);
    setError(null);
  }, []);

  // ============================================================
  // FETCH LATEST NEWS
  // ============================================================
  const fetchLatestNews = useCallback(async (): Promise<News[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/latest");
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // ✅ NORMALIZAR URLS DE IMÁGENES
      const normalized = data.map((item: any) => ({
        ...item,
        image_url: normalizeImageUrl(item.image_url || item.image || null),
      }));
      
      console.log("📰 Últimas noticias normalizadas:", normalized.map(n => ({
        id: n.id,
        titulo: n.titulo,
        image_url: n.image_url,
      })));
      
      setLatestNews(normalized);
      return normalized;
    } catch (err: any) {
      console.error("Error al obtener últimas noticias:", err);
      setError(err.response?.data?.message || "Error al cargar noticias");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // FETCH USER LATEST NEWS
  // ============================================================
  const fetchUserLatestNews = useCallback(async (): Promise<News[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/my/latest");
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // ✅ NORMALIZAR URLS DE IMÁGENES
      const normalized = data.map((item: any) => ({
        ...item,
        image_url: normalizeImageUrl(item.image_url || item.image || null),
      }));
      
      console.log("📰 Noticias del usuario normalizadas:", normalized.map(n => ({
        id: n.id,
        titulo: n.titulo,
        image_url: n.image_url,
      })));
      
      setUserNews(normalized);
      return normalized;
    } catch (err: any) {
      console.error("Error al obtener noticias del usuario:", err);
      setError(err.response?.data?.message || "Error al cargar tus noticias");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // FETCH ALL USER NEWS
  // ============================================================
  const fetchAllUserNews = useCallback(async (): Promise<News[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/my/all");
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // ✅ NORMALIZAR URLS DE IMÁGENES
      const normalized = data.map((item: any) => ({
        ...item,
        image_url: normalizeImageUrl(item.image_url || item.image || null),
      }));
      
      console.log("📰 Todas las noticias normalizadas:", normalized.map(n => ({
        id: n.id,
        titulo: n.titulo,
        image_url: n.image_url,
      })));
      
      setAllUserNews(normalized);
      return normalized;
    } catch (err: any) {
      console.error("Error al obtener todas las noticias del usuario:", err);
      setError(err.response?.data?.message || "Error al cargar todas tus noticias");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // FETCH LIKED NEWS
  // ============================================================
  const fetchLikedNews = useCallback(async (): Promise<News[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/my/liked");
      
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // ✅ NORMALIZAR URLS DE IMÁGENES
      const normalized = data.map((item: any) => ({
        ...item,
        image_url: normalizeImageUrl(item.image_url || item.image || null),
      }));
      
      setLikedNews(normalized);
      return normalized;
    } catch (err: any) {
      console.error("Error al obtener noticias con like:", err);
      setError(err.response?.data?.message || "Error al cargar noticias con like");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // GET NEWS BY ID
  // ============================================================
  const getNewsById = useCallback(
    (id: number): News | undefined => {
      return (
        latestNews.find((n) => n.id === id) ||
        userNews.find((n) => n.id === id) ||
        allUserNews.find((n) => n.id === id) ||
        likedNews.find((n) => n.id === id)
      );
    },
    [latestNews, userNews, allUserNews, likedNews]
  );

  // ============================================================
  // ADD COMMENT
  // ============================================================
  const addComment = useCallback(
    async (newsId: number, content: string): Promise<Comment> => {
      if (!content.trim()) {
        throw new Error("El comentario no puede estar vacío");
      }

      try {
        const res = await api.post(`/news/${newsId}/comments`, { content });
        const newComment = res.data.data || res.data;

        const updateComments = (news: News) =>
          news.id === newsId
            ? { ...news, comments: [newComment, ...(news.comments || [])] }
            : news;

        setLatestNews((prev) => prev.map(updateComments));
        setUserNews((prev) => prev.map(updateComments));
        setAllUserNews((prev) => prev.map(updateComments));
        setLikedNews((prev) => prev.map(updateComments));

        return newComment;
      } catch (err: any) {
        console.error("Error al agregar comentario:", err);
        throw new Error(err.response?.data?.message || "Error al comentar");
      }
    },
    []
  );

  // ============================================================
  // CREATE NEWS - CORREGIDO CON LOGS
  // ============================================================
  const createNews = useCallback(async (data: any, image?: ImagePicker.ImagePickerAsset | string | null) => {
    try {
      setLoading(true);
      
      console.log("📝 Creando noticia con datos:", data);
      console.log("📸 Imagen recibida:", image);
      console.log("📸 Tipo de imagen:", typeof image);
      
      const userRes = await api.get("/auth/me");
      const user = userRes.data;
      
      let newable_type = null;
      let newable_id = null;

      if (user.doctor) {
        newable_type = "App\\Models\\Doctor";
        newable_id = user.doctor.id;
      } else if (user.lawyer) {
        newable_type = "App\\Models\\Lawyer";
        newable_id = user.lawyer.id;
      } else if (user.shop) {
        newable_type = "App\\Models\\Shop";
        newable_id = user.shop.id;
      } else if (user.association) {
        newable_type = "App\\Models\\Association";
        newable_id = user.association.id;
      }

      const formData = new FormData();
      
      formData.append("titulo", data.titulo);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      if (data.url) formData.append("url", data.url);
      formData.append("fecha_publicacion", data.fecha_publicacion || new Date().toISOString());

      if (newable_type && newable_id) {
        formData.append("newable_type", newable_type);
        formData.append("newable_id", String(newable_id));
      }

      // ✅ MANEJAR IMAGEN CORRECTAMENTE
      if (image) {
        if (typeof image === 'string') {
          formData.append("image", image);
          console.log("📸 Agregando imagen URL:", image);
        } else if (image.uri) {
          const filename = image.uri.split('/').pop() || `news_${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append("image", {
            uri: image.uri,
            name: filename,
            type: type,
          } as any);
          console.log("📸 Agregando imagen archivo:", { uri: image.uri, filename, type });
        }
      }

      const res = await api.post("/news", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("✅ Respuesta del servidor:", res.data);
      
      const newNews = res.data.data || res.data;
      
      // ✅ NORMALIZAR IMAGEN AL GUARDAR
      const normalizedNews = {
        ...newNews,
        image_url: normalizeImageUrl(newNews.image_url || newNews.image || null),
      };
      
      setUserNews((prev) => [normalizedNews, ...prev]);
      setAllUserNews((prev) => [normalizedNews, ...prev]);
      setLatestNews((prev) => [normalizedNews, ...prev]);

      return res.data;
    } catch (error: any) {
      console.error("❌ Error al crear noticia:", error);
      console.error("❌ Detalles del error:", error.response?.data);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // UPDATE NEWS - CORREGIDO CON LOGS
  // ============================================================
  const updateNews = useCallback(async (id: number, data: any, image?: ImagePicker.ImagePickerAsset | string | null) => {
    try {
      setLoading(true);
      
      console.log(`📝 Actualizando noticia ${id}:`, data);
      console.log("📸 Imagen recibida para actualizar:", image);
      
      const formData = new FormData();
      
      if (data.titulo) formData.append("titulo", data.titulo);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      if (data.url) formData.append("url", data.url);
      if (data.fecha_publicacion) formData.append("fecha_publicacion", data.fecha_publicacion);

      if (image) {
        if (typeof image === 'string') {
          formData.append("image", image);
          console.log("📸 Actualizando imagen URL:", image);
        } else if (image.uri) {
          const filename = image.uri.split('/').pop() || `news_${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append("image", {
            uri: image.uri,
            name: filename,
            type: type,
          } as any);
          console.log("📸 Actualizando imagen archivo:", { uri: image.uri, filename, type });
        }
      }

      const res = await api.post(`/news/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("✅ Respuesta de actualización:", res.data);
      
      const updatedNews = res.data.data || res.data;
      
      // ✅ NORMALIZAR IMAGEN AL ACTUALIZAR
      const normalizedNews = {
        ...updatedNews,
        image_url: normalizeImageUrl(updatedNews.image_url || updatedNews.image || null),
      };
      
      const updateItem = (news: News) =>
        news.id === id ? { ...news, ...normalizedNews } : news;

      setLatestNews((prev) => prev.map(updateItem));
      setUserNews((prev) => prev.map(updateItem));
      setAllUserNews((prev) => prev.map(updateItem));
      setLikedNews((prev) => prev.map(updateItem));

      return res.data;
    } catch (error: any) {
      console.error("❌ Error al actualizar noticia:", error);
      console.error("❌ Detalles del error:", error.response?.data);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // DELETE NEWS
  // ============================================================
  const deleteNews = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const res = await api.delete(`/news/${id}`);
      
      const filterItem = (news: News) => news.id !== id;

      setLatestNews((prev) => prev.filter(filterItem));
      setUserNews((prev) => prev.filter(filterItem));
      setAllUserNews((prev) => prev.filter(filterItem));
      setLikedNews((prev) => prev.filter(filterItem));

      return res.data;
    } catch (error: any) {
      console.error("Error al eliminar noticia:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // TOGGLE LIKE
  // ============================================================
  const toggleLike = useCallback(async (id: number): Promise<{ liked: boolean; likes_count: number }> => {
    try {
      const res = await api.post(`/news/${id}/like`);
      const result = res.data.data;

      const updateLikes = (news: News) =>
        news.id === id
          ? { ...news, liked: result.liked, likes_count: result.likes_count }
          : news;

      setLatestNews((prev) => prev.map(updateLikes));
      setUserNews((prev) => prev.map(updateLikes));
      setAllUserNews((prev) => prev.map(updateLikes));
      setLikedNews((prev) => prev.map(updateLikes));

      return result;
    } catch (error: any) {
      console.error("Error al toggle like:", error);
      throw error;
    }
  }, []);

  // ============================================================
  // CHECK LIKE
  // ============================================================
  const checkLike = useCallback(async (id: number): Promise<{ liked: boolean }> => {
    try {
      const res = await api.get(`/news/${id}/check-like`);
      const data = res.data.data || res.data;
      
      const updateLiked = (news: News) =>
        news.id === id ? { ...news, liked: data.liked } : news;

      setLatestNews((prev) => prev.map(updateLiked));
      setUserNews((prev) => prev.map(updateLiked));
      setAllUserNews((prev) => prev.map(updateLiked));
      setLikedNews((prev) => prev.map(updateLiked));

      return { liked: data.liked };
    } catch (error: any) {
      console.error("Error al verificar like:", error);
      return { liked: false };
    }
  }, []);

  // ============================================================
  // VALUE
  // ============================================================
  const value = useMemo(
    () => ({
      latestNews,
      userNews,
      allUserNews,
      likedNews,
      loading,
      error,
      fetchLatestNews,
      fetchUserLatestNews,
      fetchAllUserNews,
      fetchLikedNews,
      getNewsById,
      addComment,
      createNews,
      updateNews,
      deleteNews,
      toggleLike,
      checkLike,
      resetNews,
    }),
    [
      latestNews,
      userNews,
      allUserNews,
      likedNews,
      loading,
      error,
      fetchLatestNews,
      fetchUserLatestNews,
      fetchAllUserNews,
      fetchLikedNews,
      getNewsById,
      addComment,
      createNews,
      updateNews,
      deleteNews,
      toggleLike,
      checkLike,
      resetNews,
    ]
  );

  return (
    <NewsRoleContext.Provider value={value}>
      {children}
    </NewsRoleContext.Provider>
  );
};

export const useNewsRole = () => {
  const context = useContext(NewsRoleContext);
  if (!context) {
    throw new Error("useNewsRole debe usarse dentro de NewsRoleProvider");
  }
  return context;
};