// src/utils/axios.ts

import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ✅ DEVELOPMENT — IP actual del backend
// export const BASE_URL = 'http://192.168.1.50:8000/api';
// export const IMAGE_BASE_URL = 'http://192.168.1.50:8000';

export const BASE_URL = 'https://apiapk.tudealer.app/api';
export const IMAGE_BASE_URL = 'https://apiapk.tudealer.app';

let memoryToken: string | null = null;
let tokenExpiration: number | null = null;
let isRefreshing = false;
let failedQueue: any[] = [];

/* =========================
   🔐 TOKEN HANDLER CON EXPIRACIÓN
   ========================= */
export const setAuthToken = async (token: string | null, expiresIn?: number) => {
  memoryToken = token;

  if (token) {
    console.log('🟢 setAuthToken → guardando token');
    await SecureStore.setItemAsync('token', token);

    if (expiresIn) {
      const expirationTime = Date.now() + (expiresIn * 1000);
      await SecureStore.setItemAsync('token_expiration', String(expirationTime));
      tokenExpiration = expirationTime;
    }
  } else {
    console.log('🟠 setAuthToken → eliminando token');
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('token_expiration');
    tokenExpiration = null;
    memoryToken = null;
  }
};

/* =========================
   🔐 VERIFICAR SI EL TOKEN ES VÁLIDO
   ========================= */
export const isTokenValid = async (): Promise<boolean> => {
  try {
    if (memoryToken && tokenExpiration) {
      return Date.now() < tokenExpiration;
    }

    const storedToken = await SecureStore.getItemAsync('token');
    const storedExpiration = await SecureStore.getItemAsync('token_expiration');

    if (!storedToken || !storedExpiration) {
      return false;
    }

    const expiration = parseInt(storedExpiration, 10);
    const isValid = Date.now() < expiration;

    if (isValid) {
      memoryToken = storedToken;
      tokenExpiration = expiration;
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return false;
  }
};

/* =========================
   📤 OBTENER TOKEN
   ========================= */
export const getAuthToken = async (): Promise<string | null> => {
  if (memoryToken) {
    return memoryToken;
  }

  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      memoryToken = token;
    }
    return token;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return null;
  }
};

/* =========================
   🧹 FUNCIONES PARA SANITIZAR
   ========================= */
const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  try {
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/�/g, '')
      .replace(/\ufffd/g, '');
  } catch {
    return '';
  }
};

const sanitizeObject = (obj: any): any => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

/* =========================
   🖼️ FUNCIONES PARA MANEJO DE IMÁGENES
   ========================= */
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return 'https://i.pravatar.cc/150?img=1';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${IMAGE_BASE_URL}${imageUrl}`;
  }

  return `${IMAGE_BASE_URL}/${imageUrl}`;
};

export const getImageWithTimestamp = (imageUrl: string | null | undefined): string => {
  const fullUrl = getFullImageUrl(imageUrl);
  const timestamp = Date.now();

  if (fullUrl.includes('?')) {
    return `${fullUrl}&t=${timestamp}`;
  }
  return `${fullUrl}?t=${timestamp}`;
};

function normalizeImageUrlsInObject(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.includes('/imagenes_app/') ||
        obj.includes('image') ||
        obj.includes('avatar') ||
        obj.includes('.jpg') ||
        obj.includes('.png') ||
        obj.includes('.jpeg') ||
        obj.includes('.webp')) {
      return getFullImageUrl(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeImageUrlsInObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const normalized: any = {};
    for (const key of Object.keys(obj)) {
      if (['image', 'image_url', 'avatar', 'avatar_url', 'photo', 'picture'].includes(key)) {
        normalized[key] = getFullImageUrl(obj[key]);
      } else {
        normalized[key] = normalizeImageUrlsInObject(obj[key]);
      }
    }
    return normalized;
  }
  return obj;
}

/* =========================
   🌐 AXIOS INSTANCE
   ========================= */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

/* =========================
   📤 REQUEST INTERCEPTOR
   ========================= */
api.interceptors.request.use(async (config) => {
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

  if (publicRoutes.some(route => config.url?.includes(route))) {
    delete config.headers.Authorization;
    return config;
  }

  let token = memoryToken;
  if (!token) {
    token = await SecureStore.getItemAsync('token');
    if (token) {
      memoryToken = token;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('📤 REQUEST CON TOKEN:', {
      url: config.url,
      method: config.method,
      hasToken: true,
    });
  } else {
    (config as any)._noToken = true;
    console.log('📤 REQUEST SIN TOKEN:', {
      url: config.url,
      method: config.method,
    });
  }

  return config;
});

/* =========================
   🔄 REFRESH TOKEN
   ========================= */
export const refreshToken = async (): Promise<boolean> => {
  if (isRefreshing) {
    console.log('⏳ Refresh en progreso, esperando...');
    return new Promise((resolve) => {
      failedQueue.push(resolve);
    });
  }

  isRefreshing = true;
  console.log('🔄 Intentando refrescar token...');

  try {
    const currentToken = await getAuthToken();
    if (!currentToken) {
      console.log('⚠️ No hay token para refrescar → no es logout');
      isRefreshing = false;
      failedQueue.forEach(resolve => resolve(false));
      failedQueue = [];
      return false;
    }

    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
      }
    );

    const { access_token, expires_in } = response.data;

    if (access_token) {
      await setAuthToken(access_token, expires_in || 86400);
      console.log('✅ Token refrescado exitosamente');

      failedQueue.forEach(resolve => resolve(true));
      failedQueue = [];
      isRefreshing = false;
      return true;
    }

    console.log('⚠️ Refresh sin access_token → cerrando sesión');
    await setAuthToken(null);
    failedQueue.forEach(resolve => resolve(false));
    failedQueue = [];
    isRefreshing = false;
    return false;

  } catch (error: any) {
    console.error('❌ Error refrescando token:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🚨 Refresh rechazado por backend → cerrando sesión');
      await setAuthToken(null);
    } else {
      console.log('⚠️ Error de red en refresh → manteniendo token');
    }

    failedQueue.forEach(resolve => resolve(false));
    failedQueue = [];
    isRefreshing = false;
    return false;
  }
};

/* =========================
   📥 RESPONSE INTERCEPTOR
   ========================= */
api.interceptors.response.use(
  async (response) => {
    // ✅ NO guardar token si la petición es /auth/logout
    const isLogout = response.config.url?.includes('/auth/logout');

    if (response.data?.access_token && !isLogout) {
      const expiresIn = response.data?.expires_in || 86400;
      await setAuthToken(response.data.access_token, expiresIn);
      console.log('🟢 Token guardado automáticamente desde respuesta');
    }

    if (response.data) {
      try {
        response.data = sanitizeObject(response.data);

        if (Array.isArray(response.data)) {
          response.data = response.data.map(item => normalizeImageUrlsInObject(item));
        } else if (typeof response.data === 'object') {
          response.data = normalizeImageUrlsInObject(response.data);
        }
      } catch (error) {
        console.warn('⚠️ Error sanitizando respuesta:', error);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    console.error('🔴 ERROR:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (originalRequest?._noToken) {
      console.log('⚠️ 401 sin token → ignorando logout automático');
      return Promise.reject(error);
    }

    if (originalRequest?.url?.includes('/auth/refresh')) {
      console.log('❌ Falló refresh, cerrando sesión');
      await setAuthToken(null);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      console.log('🚨 401 DETECTADO → intentando refrescar token');

      if (originalRequest) {
        originalRequest._retry = true;
      }

      try {
        const refreshResult = await refreshToken();
        if (refreshResult && originalRequest) {
          const newToken = await getAuthToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('🔄 Reintentando petición con nuevo token:', originalRequest.url);
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('❌ Error refrescando token:', refreshError);
      }

      console.log('🚨 Logout automático por token expirado');
      await setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;