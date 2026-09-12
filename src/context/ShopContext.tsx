// context/ShopContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CreateShopPayload } from "../types/createShop";
import { Shop } from "../types/shop";
import api from "../utils/axios";

type ShopContextType = {
  shops: Shop[];
  latestShops: Shop[];
  shop: Shop | null;
  loading: boolean;
  error: string | null;

  searchResults: Shop[];
  searching: boolean;

  fetchShops: () => Promise<void>;
  fetchLatestShops: () => Promise<void>;
  fetchMyShop: () => Promise<void>;
  fetchShopById: (id: number) => Promise<Shop | null>;
  createShop: (payload: CreateShopPayload) => Promise<Shop | null>;
  deleteShop: (id: number) => Promise<boolean>;

  searchShops: (query: string) => Promise<Shop[]>;
  clearSearch: () => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [latestShops, setLatestShops] = useState<Shop[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [searching, setSearching] = useState(false);

  /* -----------------------------
   | Fetch all shops
  ----------------------------- */
  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/shops");

      console.log("📦 [ShopContext] Respuesta de /shops:", data);

      let shopsData: Shop[] = [];

      if (Array.isArray(data)) {
        shopsData = data;
      } else if (data?.data) {
        shopsData = Array.isArray(data.data) ? data.data : [];
      }

      console.log("📊 [ShopContext] Tiendas procesadas:", shopsData.length);
      setShops(shopsData);
    } catch (err) {
      console.error("Error fetching shops", err);
      setError("Error cargando tiendas");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | Fetch latest shops
  ----------------------------- */
  const fetchLatestShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/shops/latest");
      setLatestShops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching latest shops", err);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | Fetch authenticated shop (/shops/me)
  ----------------------------- */
  const fetchMyShop = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get<Shop>("/shops/me");
      console.log("🏪 [ShopContext] Mi tienda:", data);

      const shopData = (data as any)?.data || data;
      setShop(shopData);
    } catch (err: any) {
      console.error("Error fetching my shop", err);
      setError(err?.response?.data?.message || "Error cargando tu tienda");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | Fetch shop by ID
  ----------------------------- */
  const fetchShopById = async (id: number): Promise<Shop | null> => {
    try {
      const { data } = await api.get(`/shops/${id}`);
      return data?.data || data;
    } catch (err) {
      console.error(`Error fetching shop ${id}`, err);
      return null;
    }
  };

  /* -----------------------------
   | Create shop
  ----------------------------- */
  const createShop = async (payload: CreateShopPayload): Promise<Shop | null> => {
    try {
      const { data } = await api.post<{ message: string; data: Shop }>(
        "/shops",
        payload
      );
      const newShop = data.data;
      setShops((prev) => [newShop, ...prev]);
      return newShop;
    } catch (err) {
      console.error("Error creating shop", err);
      return null;
    }
  };

  /* -----------------------------
   | Delete shop
  ----------------------------- */
  const deleteShop = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/shops/${id}`);
      setShops((prev) => prev.filter((shop) => shop.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting shop", err);
      return false;
    }
  };

  /* ================================
     MÉTODOS DE BÚSQUEDA
  ================================ */

  const searchShops = useCallback(async (query: string): Promise<Shop[]> => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const url = `/shops/search?q=${encodeURIComponent(query.trim())}`;
      const { data } = await api.get(url);
      const results = Array.isArray(data) ? data : [];
      setSearchResults(results);
      return results;
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSearchResults([]);
        return [];
      }
      setError(err.response?.data?.message || "Error al buscar tiendas");
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

  /* -----------------------------
   | Initial fetch
  ----------------------------- */
  useEffect(() => {
    fetchShops();
    fetchLatestShops();
  }, []);

  return (
    <ShopContext.Provider
      value={{
        shops,
        latestShops,
        shop,
        loading,
        error,
        searchResults,
        searching,
        fetchShops,
        fetchLatestShops,
        fetchMyShop,
        fetchShopById,
        createShop,
        deleteShop,
        searchShops,
        clearSearch,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShops = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShops must be used inside ShopProvider");
  }
  return context;
};