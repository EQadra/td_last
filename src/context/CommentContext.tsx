// context/CommentContext.tsx - VERSIÓN COMPLETA CON SERVICIOS
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Comment } from '../types/comment';
import { CreateCommentPayload } from '../types/createComment';
import api, { setAuthToken } from "../utils/axios";

interface CommentContextProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  
  // Para noticias
  fetchComments: () => Promise<void>;
  createComment: (data: CreateCommentPayload) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
  
  // Para productos
  fetchProductComments: (productId: number) => Promise<Comment[]>;
  createProductComment: (productId: number, content: string) => Promise<Comment>;
  deleteProductComment: (id: number) => Promise<void>;

  // Para posts
  fetchPostComments: (postId: number) => Promise<Comment[]>;
  createPostComment: (postId: number, content: string) => Promise<Comment>;
  deletePostComment: (id: number) => Promise<void>;

  // 🔥 Para servicios
  fetchServiceComments: (serviceId: number) => Promise<Comment[]>;
  createServiceComment: (serviceId: number, content: string) => Promise<Comment>;
  deleteServiceComment: (id: number) => Promise<void>;
}

const CommentContext = createContext<CommentContextProps>(
  {} as CommentContextProps
);

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureToken = async () => {
    const token = await SecureStore.getItemAsync('token');
    await setAuthToken(token);
  };

  // === Para noticias ===
  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.get('/comments');
      setComments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (data: CreateCommentPayload): Promise<Comment> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.post(`/news/${data.news_id}/comments`, {
        content: data.comment,
      });
      const newComment = res.data.comment ?? res.data.data ?? res.data;
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al comentar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'No autorizado o error');
    } finally {
      setLoading(false);
    }
  };

  // === Para productos ===
  const fetchProductComments = async (productId: number): Promise<Comment[]> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.get(`/products/${productId}/comments`);
      const data = res.data.data ?? res.data;
      setComments(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar comentarios');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProductComment = async (productId: number, content: string): Promise<Comment> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.post(`/products/${productId}/comments`, {
        content: content,
      });
      const newComment = res.data.comment ?? res.data.data ?? res.data;
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al comentar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProductComment = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      await api.delete(`/product-comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'No autorizado o error');
    } finally {
      setLoading(false);
    }
  };

  // === Para posts ===
  const fetchPostComments = async (postId: number): Promise<Comment[]> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.get(`/posts/${postId}/comments`);
      const data = res.data.data ?? res.data;
      setComments(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching post comments:', err);
      setError(err.response?.data?.message || 'Error al cargar comentarios');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPostComment = async (postId: number, content: string): Promise<Comment> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.post(`/posts/${postId}/comments`, {
        content: content,
      });
      const newComment = res.data.comment ?? res.data.data ?? res.data;
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    } catch (err: any) {
      console.error('Error creating post comment:', err);
      setError(err.response?.data?.message || "Error al comentar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePostComment = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting post comment:', err);
      setError(err.response?.data?.message || 'No autorizado o error');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Para servicios
  const fetchServiceComments = async (serviceId: number): Promise<Comment[]> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.get(`/services/${serviceId}/comments`);
      const data = res.data.data ?? res.data;
      setComments(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching service comments:', err);
      setError(err.response?.data?.message || 'Error al cargar comentarios del servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createServiceComment = async (serviceId: number, content: string): Promise<Comment> => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      const res = await api.post(`/services/${serviceId}/comments`, {
        content: content,
      });
      const newComment = res.data.comment ?? res.data.data ?? res.data;
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    } catch (err: any) {
      console.error('Error creating service comment:', err);
      setError(err.response?.data?.message || "Error al comentar en el servicio");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteServiceComment = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ensureToken();
      await api.delete(`/service-comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting service comment:', err);
      setError(err.response?.data?.message || 'No autorizado o error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        error,
        fetchComments,
        createComment,
        deleteComment,
        fetchProductComments,
        createProductComment,
        deleteProductComment,
        fetchPostComments,
        createPostComment,
        deletePostComment,
        fetchServiceComments,
        createServiceComment,
        deleteServiceComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentProvider");
  }
  return context;
};