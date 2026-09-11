// contexts/ProductContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import api from "../utils/axios";

// ============================================================
// TIPOS
// ============================================================

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string | null;
  store_id: number;
  association_id?: number;
  productable_type?: string;
  productable_id?: number;
  created_at: string;
  updated_at: string;
}

interface ProductContextType {
  // State
  products: Product[];
  loading: boolean;
  error: string | null;
  
  // Fetch methods
  fetchProducts: () => Promise<void>;
  fetchStoreProducts: (storeId: number) => Promise<void>;
  fetchLatestProducts: () => Promise<void>;
  
  // CRUD
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: number, data: any) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const ProductContext = createContext<ProductContextType | null>(null);

// ============================================================
// PROVIDER
// ============================================================

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH: Todos los productos
  // ============================================================

// context/ProductContext.tsx - fetchProducts corregido
const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await api.get("/products");
    
    console.log("📦 Respuesta de /products:", res.data);
    
    // Manejar respuesta paginada
    const productsData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    console.log("📊 Productos procesados:", productsData.length);
    
    setProducts(productsData);
  } catch (err: any) {
    console.error("Error fetching products:", err);
    setError(err.response?.data?.message || "Error al cargar productos");
    setProducts([]);
  } finally {
    setLoading(false);
  }
}, []);

  // ============================================================
  // FETCH: Productos por tienda
  // ============================================================

  const fetchStoreProducts = useCallback(async (storeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/stores/${storeId}/products`);
      setProducts(res.data);
    } catch (err: any) {
      console.error("Error fetching store products:", err);
      setError(err.response?.data?.message || "Error al cargar productos de la tienda");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // FETCH: Últimos 5 productos
  // ============================================================

  const fetchLatestProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/products/latest");
      setProducts(res.data);
    } catch (err: any) {
      console.error("Error fetching latest products:", err);
      setError(err.response?.data?.message || "Error al cargar productos recientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // CREATE: Crear producto
  // ============================================================

  const createProduct = useCallback(async (formData: any): Promise<Product> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📤 Creando producto...");
      
      const res = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("✅ Producto creado:", res.data);
      
      const newProduct = res.data.data || res.data;
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      console.error("❌ Error al crear producto:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al crear producto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // UPDATE: Actualizar producto
  // ============================================================

  const updateProduct = useCallback(async (id: number, data: any): Promise<Product> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📤 Actualizando producto ID:", id);
      
      let res;
      
      // Si es FormData (tiene imagen), usar POST con _method=PUT
      if (data instanceof FormData) {
        console.log("📤 Enviando con FormData (con imagen)");
        res = await api.post(`/products/${id}?_method=PUT`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        console.log("📤 Enviando con JSON (sin imagen)");
        res = await api.put(`/products/${id}`, data);
      }
      
      console.log("✅ Producto actualizado:", res.data);
      
      const updatedProduct = res.data.data || res.data;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err: any) {
      console.error("❌ Error al actualizar producto:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al actualizar producto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // DELETE: Eliminar producto
  // ============================================================

  const deleteProduct = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🗑️ Eliminando producto ID:", id);
      
      await api.delete(`/products/${id}`);
      
      console.log("✅ Producto eliminado");
      
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("❌ Error al eliminar producto:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al eliminar producto");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // VALUE
  // ============================================================

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        fetchStoreProducts,
        fetchLatestProducts,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts debe usarse dentro de ProductProvider");
  }
  return context;
};