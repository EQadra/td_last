import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { CreateLawyerPayload } from "../types/createLawyer";
import { Lawyer } from "../types/lawyer";
import api from "../utils/axios";



interface LawyerContextProps {
  // Estados principales
  lawyers: Lawyer[];
  latestLawyers: Lawyer[];
  lawyer: Lawyer | null;
  loading: boolean;
  error: string | null;
  
  // Estados de búsqueda (NUEVOS)
  searchResults: Lawyer[];
  searching: boolean;

  // Métodos CRUD
  fetchLawyers: () => Promise<void>;
  fetchLatestLawyers: () => Promise<void>;
  fetchLawyerById: (id: number) => Promise<void>;
  createLawyer: (data: CreateLawyerPayload) => Promise<Lawyer>;
  updateLawyer: (
    id: number,
    data: Partial<CreateLawyerPayload>
  ) => Promise<Lawyer>;
  deleteLawyer: (id: number) => Promise<void>;
  fetchMyLawyer: () => Promise<void>;
  
  // Métodos de búsqueda (NUEVOS)
  searchLaawyers: (query: string) => Promise<Lawyer[]>;
  clearSearch: () => void;
}

const LawyerContext = createContext<LawyerContextProps>(
  {} as LawyerContextProps
);

export const LawyerProvider = ({ children }: { children: ReactNode }) => {
  // Estados principales
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [latestLawyers, setLatestLawyers] = useState<Lawyer[]>([]);
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda (NUEVOS)
  const [searchResults, setSearchResults] = useState<Lawyer[]>([]);
  const [searching, setSearching] = useState(false);

  /* -----------------------------
   | GET /lawyers
   ----------------------------- */
  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/lawyers");
      setLawyers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar abogados");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /lawyers/latest
   ----------------------------- */
  const fetchLatestLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/lawyers/latest");
      setLatestLawyers(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar abogados recientes"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /lawyers/{id}
   ----------------------------- */
// En LawyerContext.jsx - CORREGIDO
const fetchLawyerById = async (id) => {
  try {
    setLoading(true);
    setError(null);
    
    // ✅ Verifica que estás en la URL correcta
    const response = await api.get(`/lawyers/${id}`);
    
    // 🔥 IMPORTANTE: Dependiendo de cómo devuelva el backend
    // Si devuelve { data: {...} } usa response.data.data
    // Si devuelve directamente el objeto usa response.data
    
    // En tu caso, por el log exitoso de /lawyers/me, parece que devuelve directamente el objeto
    setLawyer(response.data);
    
    console.log("✅ Abogado cargado:", response.data.id);
    
  } catch (err) {
    console.error("❌ Error en fetchLawyerById:", err);
    
    // Muestra el error específico
    const errorMsg = err.response?.data?.message || err.message || "Error al cargar abogado";
    setError(errorMsg);
    setLawyer(null);
  } finally {
    setLoading(false);
  }
};

  /* -----------------------------
   | POST /lawyers
   ----------------------------- */
  const createLawyer = async (
    data: CreateLawyerPayload
  ): Promise<Lawyer> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/lawyers", data);
      const newLawyer = res.data.data;

      setLawyers((prev) => [newLawyer, ...prev]);
      return newLawyer;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear abogado");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | PUT /lawyers/{id}
   ----------------------------- */
  const updateLawyer = async (
    id: number,
    data: Partial<CreateLawyerPayload>
  ): Promise<Lawyer> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(`/lawyers/${id}`, data);
      const updatedLawyer = res.data.data;

      setLawyers((prev) =>
        prev.map((l) => (l.id === id ? updatedLawyer : l))
      );

      if (lawyer?.id === id) {
        setLawyer(updatedLawyer);
      }

      return updatedLawyer;
    } catch (err: any) {
      setError(err.response?.data?.message || "No autorizado");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /lawyers/me
   ----------------------------- */
  const fetchMyLawyer = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/lawyers/me");
      setLawyer(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | DELETE /lawyers/{id}
   ----------------------------- */
  const deleteLawyer = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/lawyers/${id}`);
      setLawyers((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "No autorizado");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     MÉTODOS DE BÚSQUEDA (NUEVOS)
  ================================ */

  /* -----------------------------
   | GET /lawyers/search?q={query}
   ----------------------------- */
 const searchLawyers = useCallback(async (query: string): Promise<Lawyer[]> => {
    // Si la consulta está vacía, limpiar resultados
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const res = await api.get(`/lawyers/search?q=${encodeURIComponent(query.trim())}`);
      const data = res.data || [];
      setSearchResults(data);
      return data;
    } catch (err: any) {
      // 🔥 MANEJO ESPECÍFICO PARA 404 (sin resultados)
      if (err.response?.status === 404) {
        console.log(`🔍 No se encontraron abogados para: "${query}"`);
        setSearchResults([]); // Array vacío en lugar de error
        return []; // Retornar array vacío
      }
      
      // Para otros errores (network, 500, etc.)
      setError(err.response?.data?.message || "Error al buscar abogados");
      setSearchResults([]);
      throw err; // Solo lanzar errores que no son 404
    } finally {
      setSearching(false);
    }
  }, []);

  /* -----------------------------
   | CLEAR SEARCH
   ----------------------------- */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearching(false);
  }, []);

  /* -----------------------------
   | GET /lawyers/search?q={query}
   ----------------------------- */

  /* ================================
     PROVIDER CON TODOS LOS VALORES
  ================================ */

  return (
    <LawyerContext.Provider
      value={{
        // Estados principales
        lawyers,
        latestLawyers,
        lawyer,
        loading,
        error,
        
        // Estados de búsqueda (NUEVOS)
        searchResults,
        searching,
        
        // Métodos CRUD
        fetchLawyers,
        fetchLatestLawyers,
        fetchLawyerById,
        createLawyer,
        updateLawyer,
        fetchMyLawyer,
        deleteLawyer,
        
        // Métodos de búsqueda (NUEVOS)
        searchLawyers,
        clearSearch,
      }}
    >
      {children}
    </LawyerContext.Provider>
  );
};

export const useLawyers = () => {
  const context = useContext(LawyerContext);
  if (!context) {
    throw new Error("useLawyers must be used within a LawyerProvider");
  }
  return context;
};

export default LawyerContext;