// context/ServiceContext.tsx - COMPLETO CORREGIDO CON MANEJO DE IMAGEN PARA RN

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { Platform } from "react-native";
import api from "../utils/axios";

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  image?: string;
  image_url?: string;
  serviceable_type?: string;
  serviceable_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  price: number;
  duration?: number;
  image?: any;
  serviceable_type: string;
  serviceable_id: number;
}

interface ServiceContextProps {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  createService: (data: CreateServicePayload) => Promise<Service>;
  updateService: (id: number, data: Partial<CreateServicePayload>) => Promise<Service>;
  deleteService: (id: number) => Promise<void>;
  uploadServiceImage: (id: number, imageUri: string) => Promise<string>;
  deleteServiceImage: (id: number) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextProps>(
  {} as ServiceContextProps
);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 🛠️ FUNCIÓN PARA PREPARAR LA IMAGEN PARA FormData
  // ============================================================
  const prepareImageForFormData = (image: any) => {
    if (!image) return null;

    // Si es un objeto con uri (React Native ImagePicker)
    if (image.uri) {
      const uri = image.uri;
      const filename = uri.split('/').pop() || 'image.jpg';
      
      // Detectar el tipo MIME basado en la extensión
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 
                       ext === 'webp' ? 'image/webp' : 
                       'image/jpeg';

      console.log('🖼️ Preparando imagen servicio:', { uri, filename, mimeType });

      return {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: mimeType,
      };
    }

    // Si es una URL o base64
    if (typeof image === 'string') {
      return image;
    }

    return null;
  };

  // ============================================================
  // GET ALL SERVICES
  // ============================================================
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/services");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      // ✅ NORMALIZAR URLS DE IMÁGENES
      const baseUrl = 'http://192.168.203.82:8000';
      const normalizedData = data.map((item: any) => {
        if (item.image) {
          if (!item.image.startsWith('http')) {
            item.image_url = baseUrl + '/storage/' + item.image.replace(/^\/storage\//, '');
          } else {
            item.image_url = item.image;
          }
        }
        return item;
      });
      
      setServices(normalizedData);
      console.log('✅ Servicios cargados:', normalizedData.length);
    } catch (err: any) {
      console.log("FETCH SERVICES ERROR:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error loading services");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CREATE SERVICE - CORREGIDO CON MANEJO DE IMAGEN PARA RN
  // ============================================================
  const createService = async (data: CreateServicePayload): Promise<Service> => {
    try {
      setLoading(true);
      setError(null);

      console.log('📤 Creando servicio:', {
        name: data.name,
        price: data.price,
        serviceable_type: data.serviceable_type,
        serviceable_id: data.serviceable_id,
        hasImage: !!data.image,
      });

      let response;
      const baseUrl = 'http://192.168.203.82:8000';

      if (data.image) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('price', String(data.price));
        formData.append('duration', String(data.duration || ''));
        formData.append('serviceable_type', data.serviceable_type);
        formData.append('serviceable_id', String(data.serviceable_id));
        
        // ✅ MANEJAR IMAGEN CORRECTAMENTE PARA REACT NATIVE
        const imageFile = prepareImageForFormData(data.image);
        
        if (imageFile && typeof imageFile === 'object' && imageFile.uri) {
          console.log('📎 Adjuntando imagen servicio RN:', imageFile);
          formData.append('image', imageFile as any);
        } else if (typeof imageFile === 'string') {
          console.log('📎 Adjuntando imagen servicio string:', imageFile);
          formData.append('image', imageFile);
        } else {
          console.warn('⚠️ Formato de imagen no reconocido para servicio:', data.image);
        }

        response = await api.post("/services", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post("/services", data);
      }

      const newService: Service = response.data.data || response.data;
      
      if (newService.image && !newService.image.startsWith('http')) {
        newService.image_url = baseUrl + '/storage/' + newService.image.replace(/^\/storage\//, '');
      } else {
        newService.image_url = newService.image;
      }
      
      setServices((prev) => [newService, ...prev]);
      console.log('✅ Servicio creado:', newService);
      return newService;
    } catch (err: any) {
      console.log("CREATE SERVICE ERROR:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error creating service");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPDATE SERVICE
  // ============================================================
  const updateService = async (
    id: number,
    data: Partial<CreateServicePayload>
  ): Promise<Service> => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const baseUrl = 'http://192.168.203.82:8000';

      if (data.image) {
        // Subir nueva imagen
        const formData = new FormData();
        
        const imageFile = prepareImageForFormData(data.image);
        
        if (imageFile && typeof imageFile === 'object' && imageFile.uri) {
          formData.append('image', imageFile as any);
        } else if (typeof imageFile === 'string') {
          formData.append('image', imageFile);
        }

        await api.post(`/services/${id}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Actualizar datos sin imagen
        const updatePayload: any = {};
        if (data.name) updatePayload.name = data.name;
        if (data.description) updatePayload.description = data.description;
        if (data.price) updatePayload.price = Number(data.price);
        if (data.duration) updatePayload.duration = Number(data.duration);
        
        if (Object.keys(updatePayload).length > 0) {
          await api.put(`/services/${id}`, updatePayload);
        }
        
        // Obtener servicio actualizado
        const res = await api.get(`/services/${id}`);
        const updated: Service = res.data;
        
        if (updated.image && !updated.image.startsWith('http')) {
          updated.image_url = baseUrl + '/storage/' + updated.image.replace(/^\/storage\//, '');
        } else {
          updated.image_url = updated.image;
        }
        
        setServices((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      } else {
        // Sin imagen
        const payload: any = {};
        if (data.name) payload.name = data.name;
        if (data.description) payload.description = data.description;
        if (data.price) payload.price = Number(data.price);
        if (data.duration) payload.duration = Number(data.duration);
        
        const res = await api.put(`/services/${id}`, payload);
        const updated: Service = res.data.data || res.data;
        
        if (updated.image && !updated.image.startsWith('http')) {
          updated.image_url = baseUrl + '/storage/' + updated.image.replace(/^\/storage\//, '');
        } else {
          updated.image_url = updated.image;
        }
        
        setServices((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
      }
    } catch (err: any) {
      console.log("UPDATE SERVICE ERROR:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error updating service");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE SERVICE
  // ============================================================
  const deleteService = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.log("DELETE SERVICE ERROR:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error deleting service");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPLOAD SERVICE IMAGE
  // ============================================================
  const uploadServiceImage = async (id: number, imageUri: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      const filename = imageUri.split('/').pop() || "service.jpg";
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 
                       ext === 'webp' ? 'image/webp' : 
                       'image/jpeg';
      
      formData.append('image', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await api.post(`/services/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const baseUrl = 'http://192.168.203.82:8000';
      let imageUrl = response.data?.data?.image_url || response.data?.image_url;
      
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = baseUrl + '/storage/' + imageUrl.replace(/^\/storage\//, '');
      }
      
      if (imageUrl) {
        setServices((prev) => 
          prev.map((item) => 
            item.id === id ? { ...item, image: imageUrl, image_url: imageUrl } : item
          )
        );
      }
      
      return imageUrl;
    } catch (err: any) {
      console.log("UPLOAD SERVICE IMAGE ERROR:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error uploading image");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE SERVICE IMAGE
  // ============================================================
  const deleteServiceImage = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await api.delete(`/services/${id}/image`);
      
      setServices((prev) => 
        prev.map((item) => 
          item.id === id ? { ...item, image: null, image_url: null } : item
        )
      );
    } catch (err: any) {
      console.log("DELETE SERVICE IMAGE ERROR:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Error deleting image");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        loading,
        error,
        fetchServices,
        createService,
        updateService,
        deleteService,
        uploadServiceImage,
        deleteServiceImage,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used inside ServiceProvider");
  }
  return context;
};