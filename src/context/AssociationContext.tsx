// context/AssociationContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Association } from "../types/association";
import api from "../utils/axios";

interface AssociationContextProps {
  associations: Association[];
  latestAssociations: Association[];
  association: Association | null;
  loading: boolean;
  error: string | null;
  searchResults: Association[];
  searching: boolean;

  fetchAssociations: () => Promise<void>;
  fetchLatestAssociations: () => Promise<void>;
  fetchAssociationById: (id: number) => Promise<Association | null>;
  createAssociation: (data: any) => Promise<Association>;
  updateAssociation: (id: number, data: any) => Promise<Association>;
  deleteAssociation: (id: number) => Promise<void>;
  fetchMyAssociation: () => Promise<void>;
  searchAssociations: (query: string) => Promise<Association[]>;
  clearSearch: () => void;
}

const AssociationContext = createContext<AssociationContextProps>(
  {} as AssociationContextProps
);

export const AssociationProvider = ({ children }: { children: ReactNode }) => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [latestAssociations, setLatestAssociations] = useState<Association[]>([]);
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Association[]>([]);
  const [searching, setSearching] = useState(false);

  /* =========================
     🧹 FUNCIÓN PARA SANITIZAR TEXTO
     ========================= */
  const sanitizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);
    try {
      return text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/�/g, '')
        .replace(/\ufffd/g, '')
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '');
    } catch {
      return '';
    }
  };

  /* =========================
     🧹 FUNCIÓN PARA SANITIZAR ASOCIACIÓN
     ========================= */
  const sanitizeAssociation = (item: any): Association => {
    if (!item) return item;
    try {
      return {
        ...item,
        name: sanitizeText(item.name),
        description: sanitizeText(item.description),
        city: sanitizeText(item.city),
        address: sanitizeText(item.address),
        phone: sanitizeText(item.phone),
        website: sanitizeText(item.website),
        posts: item.posts?.map((post: any) => ({
          ...post,
          title: sanitizeText(post.title),
          content: sanitizeText(post.content),
          short_content: sanitizeText(post.short_content),
          comments: post.comments?.map((comment: any) => ({
            ...comment,
            content: sanitizeText(comment.content),
          })),
        })),
        products: item.products?.map((product: any) => ({
          ...product,
          name: sanitizeText(product.name),
          description: sanitizeText(product.description),
        })),
        feedbacks: item.feedbacks?.map((feedback: any) => ({
          ...feedback,
          comment: sanitizeText(feedback.comment),
          user: feedback.user ? {
            ...feedback.user,
            name: sanitizeText(feedback.user.name),
          } : feedback.user,
        })),
        user: item.user ? {
          ...item.user,
          name: sanitizeText(item.user.name),
        } : item.user,
        news: item.news?.map((news: any) => ({
          ...news,
          titulo: sanitizeText(news.titulo),
          descripcion: sanitizeText(news.descripcion),
        })),
      };
    } catch (error) {
      console.warn('⚠️ Error sanitizando asociación:', error);
      return item;
    }
  };

  /* =========================
     🧹 FUNCIÓN PARA SANITIZAR ARRAY DE ASOCIACIONES
     ========================= */
  const sanitizeAssociations = (items: any[]): Association[] => {
    if (!Array.isArray(items)) return [];
    return items.map(item => sanitizeAssociation(item));
  };

  /* -----------------------------
   | GET /associations
   ----------------------------- */
  const fetchAssociations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations");
      console.log("✅ GET /associations response:", res.data);
      
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      
      const sanitized = sanitizeAssociations(data);
      setAssociations(sanitized);
      console.log(`📊 Asociaciones cargadas: ${sanitized.length}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar asociaciones");
      console.error("Error fetchAssociations:", err);
      setAssociations([]);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/latest - CORREGIDO CON LOGS
   ----------------------------- */
  const fetchLatestAssociations = async () => {
    console.log("🔄 [fetchLatestAssociations] Iniciando...");
    setLoading(true);
    setError(null);

    try {
      console.log("📡 [fetchLatestAssociations] Haciendo GET a /associations/latest");
      const res = await api.get("/associations/latest");
      console.log("✅ [fetchLatestAssociations] Response recibida:", res.data);
      console.log("📊 [fetchLatestAssociations] Tipo de response:", typeof res.data);
      
      // Extraer datos correctamente
      let data = [];
      
      // Caso 1: La respuesta es un array directamente
      if (Array.isArray(res.data)) {
        data = res.data;
        console.log(`✅ [fetchLatestAssociations] Caso 1: Array directo con ${data.length} items`);
      }
      // Caso 2: La respuesta tiene una propiedad 'data' que es un array
      else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
        console.log(`✅ [fetchLatestAssociations] Caso 2: res.data.data array con ${data.length} items`);
      }
      // Caso 3: La respuesta es un objeto único con datos de asociación
      else if (res.data && (res.data.id || res.data.name)) {
        data = [res.data];
        console.log(`✅ [fetchLatestAssociations] Caso 3: Objeto único con id: ${res.data.id}`);
      }
      // Caso 4: La respuesta tiene 'data' pero es un objeto único
      else if (res.data && res.data.data && !Array.isArray(res.data.data)) {
        data = [res.data.data];
        console.log(`✅ [fetchLatestAssociations] Caso 4: res.data.data objeto único`);
      }
      // Caso 5: Intentar encontrar cualquier propiedad que sea un array
      else if (res.data && typeof res.data === 'object') {
        console.log("🔍 [fetchLatestAssociations] Buscando arrays en la respuesta...");
        for (const key in res.data) {
          if (Array.isArray(res.data[key])) {
            data = res.data[key];
            console.log(`✅ [fetchLatestAssociations] Caso 5: Encontrado array en propiedad "${key}" con ${data.length} items`);
            break;
          }
        }
      }
      
      console.log(`📊 [fetchLatestAssociations] Datos extraídos: ${data.length} items`);
      
      if (data.length > 0) {
        console.log("📝 [fetchLatestAssociations] Primer item:", JSON.stringify(data[0], null, 2).substring(0, 500));
      } else {
        console.log("⚠️ [fetchLatestAssociations] No se encontraron datos");
      }
      
      const sanitized = sanitizeAssociations(data);
      setLatestAssociations(sanitized);
      
      console.log(`📊 [fetchLatestAssociations] Cargadas ${sanitized.length} asociaciones recientes`);
      console.log("📊 [fetchLatestAssociations] Estado final latestAssociations:", sanitized);
    } catch (err: any) {
      console.error("❌ [fetchLatestAssociations] Error:", err);
      console.error("❌ [fetchLatestAssociations] Error response:", err.response?.data);
      setError(
        err.response?.data?.message || "Error al cargar asociaciones recientes"
      );
      setLatestAssociations([]);
    } finally {
      setLoading(false);
      console.log("🏁 [fetchLatestAssociations] Finalizado");
    }
  };

  /* -----------------------------
   | GET /associations/{id}
   ----------------------------- */
  const fetchAssociationById = async (id: number): Promise<Association | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Buscando asociación ID:", id);
      const res = await api.get(`/associations/${id}`);
      console.log("✅ Asociación recibida:", res.data);
      
      let data = res.data;
      if (data?.data) {
        data = data.data;
      }
      
      const sanitized = sanitizeAssociation(data);
      setAssociation(sanitized);
      return sanitized;
    } catch (err: any) {
      console.error("❌ Error fetchAssociationById:", err);
      setError(err.response?.data?.message || "Error al cargar asociación");
      setAssociation(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | POST /associations
   ----------------------------- */
  const createAssociation = async (data: any): Promise<Association> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/associations", data);
      let newAssociation = res.data;
      
      if (newAssociation?.data) {
        newAssociation = newAssociation.data;
      }
      
      const sanitized = sanitizeAssociation(newAssociation);

      setAssociations((prev) => [sanitized, ...prev]);
      setLatestAssociations((prev) => [sanitized, ...prev].slice(0, 5));
      
      return sanitized;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear asociación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | PUT /associations/{id}
   ----------------------------- */
  const updateAssociation = async (id: number, data: any): Promise<Association> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(`/associations/${id}`, data);
      let updatedAssociation = res.data.data || res.data;
      const sanitized = sanitizeAssociation(updatedAssociation);

      setAssociations((prev) =>
        prev.map((l) => (l.id === id ? sanitized : l))
      );

      setLatestAssociations((prev) =>
        prev.map((l) => (l.id === id ? sanitized : l))
      );

      if (association?.id === id) {
        setAssociation(sanitized);
      }

      return sanitized;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar asociación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/me
   ----------------------------- */
  const fetchMyAssociation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations/me");
      let data = res.data;
      
      if (data?.data) {
        data = data.data;
      }
      
      const sanitized = sanitizeAssociation(data);
      setAssociation(sanitized);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar perfil");
      setAssociation(null);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | DELETE /associations/{id}
   ----------------------------- */
  const deleteAssociation = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/associations/${id}`);
      setAssociations((prev) => prev.filter((l) => l.id !== id));
      setLatestAssociations((prev) => prev.filter((l) => l.id !== id));
      
      if (association?.id === id) {
        setAssociation(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar asociación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | SEARCH
   ----------------------------- */
  const searchAssociations = useCallback(async (query: string): Promise<Association[]> => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const res = await api.get(`/associations/search?q=${encodeURIComponent(query.trim())}`);
      
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      
      const sanitized = sanitizeAssociations(data);
      setSearchResults(sanitized);
      return sanitized;
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSearchResults([]);
        return [];
      }
      setError(err.response?.data?.message || "Error al buscar asociaciones");
      setSearchResults([]);
      return [];
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearching(false);
  }, []);

  return (
    <AssociationContext.Provider
      value={{
        associations,
        latestAssociations,
        association,
        loading,
        error,
        searchResults,
        searching,
        fetchAssociations,
        fetchLatestAssociations,
        fetchAssociationById,
        createAssociation,
        updateAssociation,
        deleteAssociation,
        fetchMyAssociation,
        searchAssociations,
        clearSearch,
      }}
    >
      {children}
    </AssociationContext.Provider>
  );
};

export const useAssociations = () => {
  const context = useContext(AssociationContext);
  if (!context) {
    throw new Error("useAssociations must be used within an AssociationProvider");
  }
  return context;
};

export default AssociationContext;