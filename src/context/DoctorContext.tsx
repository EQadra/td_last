import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { CreateDoctorPayload } from "../types/createDoctor";
import { Doctor } from "../types/doctor";
import api from "../utils/axios";

interface DoctorContextProps {
  // Estados principales
  doctors: Doctor[];
  latestDoctors: Doctor[];
  doctor: Doctor | null;
  loading: boolean;
  error: string | null;
  
  // Estados de búsqueda
  searchResults: Doctor[];
  searching: boolean;

  // Métodos CRUD
  fetchDoctors: () => Promise<void>;
  fetchLatestDoctors: () => Promise<void>;
  fetchDoctorById: (id: number) => Promise<void>;
  fetchMyDoctor: () => Promise<void>;
  createDoctor: (data: CreateDoctorPayload) => Promise<Doctor>;
  updateDoctor: (id: number, data: Partial<CreateDoctorPayload>) => Promise<Doctor>;
  deleteDoctor: (id: number) => Promise<void>;
  
  // Métodos de búsqueda
  searchDoctors: (query: string) => Promise<Doctor[]>;
  clearSearch: () => void;
}

const DoctorContext = createContext<DoctorContextProps>({} as DoctorContextProps);

export const DoctorProvider = ({ children }: { children: ReactNode }) => {
  // Estados principales
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [latestDoctors, setLatestDoctors] = useState<Doctor[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [searching, setSearching] = useState(false);

  /* ================================
     GET /doctors
  ================================ */
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar doctores");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     GET /doctors/latest
  ================================ */
  const fetchLatestDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors/latest");
      setLatestDoctors(res.data);
    } catch {
      setError("Error al cargar doctores recientes");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     GET /doctors/{id}
  ================================ */
  const fetchDoctorById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/doctors/${id}`);
      setDoctor(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar doctor");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     GET /doctors/me
  ================================ */
  const fetchMyDoctor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors/me");
      setDoctor(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     POST /doctors
  ================================ */
  const createDoctor = async (data: CreateDoctorPayload): Promise<Doctor> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/doctors", data);
      const newDoctor = res.data.data ?? res.data;
      setDoctors((prev) => [newDoctor, ...prev]);
      return newDoctor;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear doctor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     PUT /doctors/{id}
  ================================ */
  const updateDoctor = async (
    id: number,
    data: Partial<CreateDoctorPayload>
  ): Promise<Doctor> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.put(`/doctors/${id}`, data);
      const updatedDoctor = res.data.data ?? res.data;

      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? updatedDoctor : d))
      );

      if (doctor?.id === id) setDoctor(updatedDoctor);

      return updatedDoctor;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar doctor");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     DELETE /doctors/{id}
  ================================ */
  const deleteDoctor = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/doctors/${id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar doctor");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     🔍 BÚSQUEDA
  ================================ */

  /* -----------------------------
   | GET /doctors/search?q={query}
   ----------------------------- */
  const searchDoctors = useCallback(async (query: string): Promise<Doctor[]> => {
    // Si la consulta está vacía, limpiar resultados
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const res = await api.get(`/doctors/search?q=${encodeURIComponent(query.trim())}`);
      const data = res.data || [];
      setSearchResults(data);
      
      console.log(`✅ Encontrados ${data.length} doctores para: "${query}"`);
      return data;
    } catch (err: any) {
      // Manejo específico para 404 (sin resultados)
      if (err.response?.status === 404) {
        console.log(`🔍 No se encontraron doctores para: "${query}"`);
        setSearchResults([]);
        return [];
      }
      
      // Para otros errores (network, 500, etc.)
      setError(err.response?.data?.message || "Error al buscar doctores");
      setSearchResults([]);
      throw err;
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

  /* ================================
     PROVIDER
  ================================ */

  return (
    <DoctorContext.Provider
      value={{
        doctors,
        latestDoctors,
        doctor,
        loading,
        error,
        searchResults,
        searching,
        fetchDoctors,
        fetchLatestDoctors,
        fetchDoctorById,
        fetchMyDoctor,
        createDoctor,
        updateDoctor,
        deleteDoctor,
        searchDoctors,
        clearSearch,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctors = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctors must be used within a DoctorProvider");
  }
  return context;
};

export default DoctorContext;