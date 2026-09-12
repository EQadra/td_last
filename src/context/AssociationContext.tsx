// context/AssociationContext.tsx
import {
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
     🧹 SANITIZE
     ========================= */
  const sanitizeText = (text: string | null | undefined): string => {
    if (!text) return "";
    if (typeof text !== "string") return String(text);
    try {
      return text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/�/g, "")
        .replace(/\ufffd/g, "")
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "");
    } catch {
      return "";
    }
  };

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
          user: feedback.user
            ? { ...feedback.user, name: sanitizeText(feedback.user.name) }
            : feedback.user,
        })),
        user: item.user
          ? { ...item.user, name: sanitizeText(item.user.name) }
          : item.user,
        news: item.news?.map((news: any) => ({
          ...news,
          titulo: sanitizeText(news.titulo),
          descripcion: sanitizeText(news.descripcion),
        })),
      };
    } catch (error) {
      console.warn("⚠️ Error sanitizando asociación:", error);
      return item;
    }
  };

  const sanitizeAssociations = (items: any[]): Association[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => sanitizeAssociation(item));
  };

  /* -----------------------------
   | GET /associations
  ----------------------------- */
  const fetchAssociations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations");

      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }

      const sanitized = sanitizeAssociations(data);
      setAssociations(sanitized);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar asociaciones");
      console.error("Error fetchAssociations:", err);
      setAssociations([]);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/latest
  ----------------------------- */
  const fetchLatestAssociations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations/latest");

      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data && (res.data.id || res.data.name)) {
        data = [res.data];
      } else if (res.data?.data && !Array.isArray(res.data.data)) {
        data = [res.data.data];
      } else if (res.data && typeof res.data === "object") {
        for (const key in res.data) {
          if (Array.isArray(res.data[key])) {
            data = res.data[key];
            break;
          }
        }
      }

      const sanitized = sanitizeAssociations(data);
      setLatestAssociations(sanitized);
    } catch (err: any) {
      console.error("❌ [fetchLatestAssociations] Error:", err);
      setError(
        err.response?.data?.message || "Error al cargar asociaciones recientes"
      );
      setLatestAssociations([]);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/{id}
  ----------------------------- */
  const fetchAssociationById = async (id: number): Promise<Association | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/associations/${id}`);

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
      // ✅ Solo manda los campos editables (no products/posts/image_url/etc)
      const payload = {
        name: data.name,
        description: data.description,
        city: data.city,
        address: data.address,
        phone: data.phone,
        website: data.website,
      };

      const res = await api.put(`/associations/${id}`, payload);
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
  const searchAssociations = useCallback(
    async (query: string): Promise<Association[]> => {
      if (!query || !query.trim()) {
        setSearchResults([]);
        setSearching(false);
        return [];
      }

      setSearching(true);
      setError(null);

      try {
        const res = await api.get(
          `/associations/search?q=${encodeURIComponent(query.trim())}`
        );

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
    },
    []
  );

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