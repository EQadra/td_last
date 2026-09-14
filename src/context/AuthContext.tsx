// context/AuthContext.tsx
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { getAuthToken, isTokenValid, refreshToken, setAuthToken } from "../utils/axios";
import { useAvatar } from "./AvatarContext";

type ProfileType = "doctor" | "lawyer" | "association" | "shop" | "user";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dni?: string;
  address?: string;
  city?: string;
  sexo?: string;
  profileType?: ProfileType;
  profile?: any;
  avatar?: string;
  avatar_url?: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  updateUserProfile: (data: Partial<AuthUser>) => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<string>;
  deleteAvatar: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [baseUser, setBaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { refreshAvatar } = useAvatar();

  /* =========================
     HELPERS
  ========================= */
  const ensureToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        await setAuthToken(token);
      }
    } catch (error) {
      console.log("⚠️ Error en ensureToken:", error);
    }
  };

  /**
   * Construye el userData desde la respuesta del backend
   * (/auth/login, /auth/register, /auth/me) que YA trae profile_type y profile
   */
  const buildUserData = (baseUserData: any) => {
    return {
      id: baseUserData.id,
      name: baseUserData.name || "",
      email: baseUserData.email || "",
      phone: baseUserData.phone || "",
      dni: baseUserData.dni || "",
      address: baseUserData.address || "",
      city: baseUserData.city || "",
      sexo: baseUserData.sexo || "no_especificado",
      profileType: baseUserData.profile_type || "user",
      profile: baseUserData.profile || null,
      avatar: baseUserData.avatar || null,
      avatar_url: baseUserData.avatar_url || null,
    };
  };

  /* =========================
     CHECK AUTH
  ========================= */
  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setUser(null);
        return false;
      }

      const valid = await isTokenValid();
      if (!valid) {
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          await setAuthToken(null);
          setUser(null);
          return false;
        }
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data) {
          const userData = buildUserData(response.data);

          console.log(
            "✅ [checkAuth] profile_type:",
            userData.profileType,
            "| tiene profile:",
            !!userData.profile
          );

          setUser(userData);
          await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
          return true;
        }
      } catch (error: any) {
        console.error("❌ Error obteniendo usuario:", error);

        if (error.response?.status === 401) {
          await setAuthToken(null);
          setUser(null);
          return false;
        }

        throw error;
      }

      return false;
    } catch (error) {
      console.error("❌ Error en checkAuth:", error);
      await setAuthToken(null);
      setUser(null);
      return false;
    }
  };

  /* =========================
     LOGIN
  ========================= */
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = true
  ) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });

      const { access_token, expires_in, user: baseUserData } = res.data;

      await setAuthToken(access_token, expires_in);
      setBaseUser(baseUserData);

      // ✅ Usar directamente lo que devuelve /auth/login
      const userData = buildUserData(baseUserData);

      console.log(
        "✅ [login] profile_type:",
        userData.profileType,
        "| tiene profile:",
        !!userData.profile
      );

      setUser(userData);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
    } catch (error: any) {
      console.log("❌ LOGIN ERROR", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     REGISTER
  ========================= */
  const register = async (data: any) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/register", data);
      const { access_token, expires_in, user: baseUserData } = res.data;

      await setAuthToken(access_token, expires_in);
      setBaseUser(baseUserData);

      // ✅ Usar directamente lo que devuelve /auth/register
      const userData = buildUserData(baseUserData);

      setUser(userData);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
    } catch (error: any) {
      console.log("❌ REGISTER ERROR", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ME
  ========================= */
  const me = async () => {
    setLoading(true);

    try {
      await ensureToken();
      const meResponse = await api.get("/auth/me");
      const baseUserData = meResponse.data;

      setBaseUser(baseUserData);

      // ✅ Usar directamente lo que devuelve /auth/me
      const userData = buildUserData(baseUserData);

      console.log(
        "✅ [me] profile_type:",
        userData.profileType,
        "| tiene profile:",
        !!userData.profile
      );

      setUser(userData);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
    } catch (error) {
      console.log("❌ ME ERROR", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESTORE SESSION
  ========================= */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        console.log(
          "🔍 Token al arrancar:",
          token ? `EXISTE (${token.substring(0, 20)}...)` : "NO EXISTE"
        );

        if (token) {
          await setAuthToken(token);
          await checkAuth();
        }
      } catch (error) {
        console.log("❌ Error en restoreSession:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* =========================
     PASSWORD
  ========================= */
  const forgotPassword = async (email: string) => {
    await ensureToken();
    await api.post("/forgot-password", { email });
  };

  const resetPassword = async (data: any) => {
    await ensureToken();
    await api.post("/reset-password", data);
  };

  const changePassword = async (data: any) => {
    await ensureToken();
    await api.post("/change-password", data);
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    console.log("🚪 LOGOUT INICIADO");

    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("token_expiration");
      await SecureStore.deleteItemAsync("user_data");
      console.log("✅ SecureStore limpio");
    } catch (error) {
      console.log("❌ Error borrando SecureStore:", error);
    }

    await setAuthToken(null);
    setUser(null);
    setBaseUser(null);
    console.log("✅ Estado limpiado");

    try {
      await api.post("/auth/logout");
      console.log("✅ Backend logout OK");
    } catch (error) {
      console.log("❌ Logout backend error (ignorado):", error);
    }
  };

  /* =========================
     UPDATE PROFILE
  ========================= */
  const updateUserProfile = async (data: Partial<AuthUser>) => {
    try {
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...data,
          phone: data.phone !== undefined ? data.phone : prev.phone,
          dni: data.dni !== undefined ? data.dni : prev.dni,
          address: data.address !== undefined ? data.address : prev.address,
          city: data.city !== undefined ? data.city : prev.city,
          sexo: data.sexo !== undefined ? data.sexo : prev.sexo,
        };
      });

      setBaseUser((prev: any) => ({
        ...prev,
        phone: data.phone !== undefined ? data.phone : prev?.phone,
        dni: data.dni !== undefined ? data.dni : prev?.dni,
        address: data.address !== undefined ? data.address : prev?.address,
        city: data.city !== undefined ? data.city : prev?.city,
        sexo: data.sexo !== undefined ? data.sexo : prev?.sexo,
        profile: data.profile !== undefined ? data.profile : prev?.profile,
        avatar: data.avatar !== undefined ? data.avatar : prev?.avatar,
        avatar_url: data.avatar_url !== undefined ? data.avatar_url : prev?.avatar_url,
      }));
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      throw error;
    }
  };

  /* =========================
     AVATAR
  ========================= */
  const updateAvatar = async (imageUri: string): Promise<string> => {
    try {
      await ensureToken();

      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const response = await api.post("/auth/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { avatar } = response.data.data;

      setUser((prev) => (prev ? { ...prev, avatar, avatar_url: avatar } : null));
      setBaseUser((prev: any) => ({ ...prev, avatar, avatar_url: avatar }));

      refreshAvatar();
      return avatar;
    } catch (error: any) {
      console.error("❌ Error al actualizar avatar:", error);
      throw new Error(error.response?.data?.message || "Error al actualizar avatar");
    }
  };

  const deleteAvatar = async (): Promise<void> => {
    try {
      await ensureToken();
      await api.delete("/auth/delete-avatar");

      setUser((prev) =>
        prev ? { ...prev, avatar: null, avatar_url: null } : null
      );
      setBaseUser((prev: any) => ({ ...prev, avatar: null, avatar_url: null }));

      refreshAvatar();
    } catch (error: any) {
      console.error("❌ Error al eliminar avatar:", error);
      throw new Error(error.response?.data?.message || "Error al eliminar avatar");
    }
  };

  /* =========================
     PROVIDER
  ========================= */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        me,
        forgotPassword,
        resetPassword,
        changePassword,
        updateUserProfile,
        updateAvatar,
        deleteAvatar,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};