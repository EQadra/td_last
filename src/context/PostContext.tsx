// src/context/PostContext.tsx - COMPLETO CORREGIDO CON MANEJO DE IMAGEN PARA RN

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Platform } from "react-native";
import { Post, PostComment } from "../types/post";
import api from "../utils/axios";

interface CreatePostPayload {
  title: string;
  content: string;
  image?: any;
  category?: string;
  postable_type?: string;
  postable_id?: number;
}

interface UpdatePostPayload {
  title?: string;
  content?: string;
  image?: any;
  category?: string;
}

interface PostContextProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  myPosts: Post[];
  loadingMyPosts: boolean;

  fetchPosts: () => Promise<void>;
  fetchHomePosts: () => Promise<void>;
  fetchMyPosts: () => Promise<void>;

  createPost: (data: CreatePostPayload) => Promise<Post>;
  updatePost: (id: number, data: UpdatePostPayload) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;

  addComment: (postId: number, content: string) => Promise<PostComment>;
  deleteComment: (commentId: number) => Promise<void>;

  toggleLike: (postId: number) => Promise<void>;
}

const PostContext = createContext<PostContextProps>(
  {} as PostContextProps
);

export const PostProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
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

      console.log('🖼️ Preparando imagen:', { uri, filename, mimeType });

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

  /* =========================
     📥 GET ALL POSTS
  ========================= */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/posts");
      
      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setPosts(res.data.data);
      } else {
        setPosts([]);
        console.warn('Formato inesperado en fetchPosts:', res.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar posts"
      );
      console.error("Error fetching posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     🏠 GET HOME POSTS
  ========================= */
  const fetchHomePosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/posts/home");
      
      if (res.data?.data && Array.isArray(res.data.data)) {
        setPosts(res.data.data);
      } else if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
        setPosts([]);
        console.warn('Formato inesperado en fetchHomePosts:', res.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al cargar posts del home"
      );
      console.error("Error fetching home posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     👤 GET MY POSTS
  ========================= */
  const fetchMyPosts = useCallback(async () => {
    setLoadingMyPosts(true);
    setError(null);

    try {
      const response = await api.get("/my-posts/latestPosts");
      
      if (Array.isArray(response.data)) {
        setMyPosts(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setMyPosts(response.data.data);
      } else {
        setMyPosts([]);
      }
    } catch (error) {
      console.error("Error fetching my posts:", error);
      setError("Error al cargar tus posts");
      setMyPosts([]);
    } finally {
      setLoadingMyPosts(false);
    }
  }, []);

  /* =========================
     ➕ CREATE POST - CORREGIDO CON IMAGEN PARA RN
  ========================= */
  const createPost = useCallback(
    async (data: CreatePostPayload): Promise<Post> => {
      setLoading(true);
      setError(null);

      try {
        // ✅ VALIDAR CAMPOS OBLIGATORIOS
        if (!data.title || data.title.trim() === '') {
          throw new Error('El título es obligatorio');
        }
        if (!data.content || data.content.trim() === '') {
          throw new Error('El contenido es obligatorio');
        }

        console.log('📤 Enviando post:', {
          title: data.title,
          content: data.content.substring(0, 50) + '...',
          hasImage: !!data.image,
          category: data.category || 'sin categoría',
          postable_type: data.postable_type || 'App\\Models\\Association',
          postable_id: data.postable_id,
        });

        const formData = new FormData();

        formData.append("title", data.title.trim());
        formData.append("content", data.content.trim());

        if (data.category && data.category.trim()) {
          formData.append("category", data.category.trim());
        }

        // ✅ ENVIAR postable_type y postable_id
        const postableType = data.postable_type || 'App\\Models\\Association';
        formData.append("postable_type", postableType);
        
        if (data.postable_id) {
          formData.append("postable_id", String(data.postable_id));
        }

        // ✅ MANEJAR IMAGEN CORRECTAMENTE PARA REACT NATIVE
        if (data.image) {
          const imageFile = prepareImageForFormData(data.image);
          
          if (imageFile && typeof imageFile === 'object' && imageFile.uri) {
            // ✅ Es un objeto con uri (React Native)
            console.log('📎 Adjuntando imagen RN:', imageFile);
            formData.append("image", imageFile as any);
          } else if (typeof imageFile === 'string') {
            // ✅ Es una URL o base64
            console.log('📎 Adjuntando imagen string:', imageFile);
            formData.append("image", imageFile);
          } else {
            console.warn('⚠️ Formato de imagen no reconocido:', data.image);
          }
        }

        // ✅ LOG DE LO QUE SE ENVÍA
        console.log('📦 FormData enviado:');
        if ((formData as any)._parts) {
          for (let pair of (formData as any)._parts) {
            console.log(`  ${pair[0]}: ${typeof pair[1] === 'object' ? 'FILE' : pair[1]}`);
          }
        }

        const res = await api.post("/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log('✅ Post creado exitosamente');

        const newPost = res.data.data || res.data;

        setPosts((prev) => [newPost, ...prev]);
        setMyPosts((prev) => [newPost, ...prev]);

        return newPost;
      } catch (err: any) {
        console.error("❌ Error creating post:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        
        // ✅ MANEJAR ERRORES DE VALIDACIÓN (422)
        if (err.response?.status === 422) {
          const errors = err.response?.data?.errors || {};
          const errorMessages = Object.values(errors).flat().join('\n');
          setError(errorMessages || 'Error de validación');
          throw new Error(errorMessages || 'Error de validación');
        }
        
        setError(err.message || "Error al crear el post");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================
     ✏️ UPDATE POST
  ========================= */
  const updatePost = useCallback(
    async (id: number, data: UpdatePostPayload): Promise<Post> => {
      setLoading(true);
      setError(null);

      try {
        console.log('📤 Actualizando post:', { id, ...data });

        const formData = new FormData();

        if (data.title && data.title.trim()) {
          formData.append("title", data.title.trim());
        }
        if (data.content && data.content.trim()) {
          formData.append("content", data.content.trim());
        }
        if (data.category && data.category.trim()) {
          formData.append("category", data.category.trim());
        }

        if (data.image) {
          const imageFile = prepareImageForFormData(data.image);
          
          if (imageFile && typeof imageFile === 'object' && imageFile.uri) {
            formData.append("image", imageFile as any);
          } else if (typeof imageFile === 'string') {
            formData.append("image", imageFile);
          }
        }

        const res = await api.post(`/posts/${id}?_method=PUT`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const updatedPost = res.data.data || res.data;
        console.log('✅ Post actualizado:', updatedPost);

        const updateItem = (post: Post) =>
          post.id === id ? { ...post, ...updatedPost } : post;

        setPosts((prev) => prev.map(updateItem));
        setMyPosts((prev) => prev.map(updateItem));

        return updatedPost;
      } catch (err: any) {
        console.error("❌ Error updating post:", err);
        
        if (err.response?.status === 422) {
          const errors = err.response?.data?.errors || {};
          const errorMessages = Object.values(errors).flat().join('\n');
          setError(errorMessages || 'Error de validación');
          throw new Error(errorMessages || 'Error de validación');
        }
        
        setError(err.message || "Error al actualizar el post");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================
     🗑 DELETE POST
  ========================= */
  const deletePost = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/posts/${id}`);
      console.log('🗑️ Post eliminado:', id);

      setPosts((prev) => prev.filter((post) => post.id !== id));
      setMyPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar post");
      console.error("Error deleting post:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     💬 ADD COMMENT
  ========================= */
  const addComment = useCallback(
    async (postId: number, content: string): Promise<PostComment> => {
      setLoading(true);
      setError(null);

      try {
        if (!content || content.trim() === '') {
          throw new Error('El comentario no puede estar vacío');
        }

        const res = await api.post(`/posts/${postId}/comments`, {
          content: content.trim(),
        });

        const newComment = res.data.data || res.data;
        console.log('💬 Comentario agregado:', newComment);

        const updateComments = (post: Post) =>
          post.id === postId
            ? {
                ...post,
                comments: [newComment, ...(post.comments || [])],
              }
            : post;

        setPosts((prev) => prev.map(updateComments));
        setMyPosts((prev) => prev.map(updateComments));

        return newComment;
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error al agregar comentario"
        );
        console.error("Error adding comment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================
     🗑 DELETE COMMENT
  ========================= */
  const deleteComment = useCallback(async (commentId: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/posts/comments/${commentId}`);
      console.log('🗑️ Comentario eliminado:', commentId);

      const removeComment = (post: Post) => ({
        ...post,
        comments: (post.comments || []).filter((c) => c.id !== commentId),
      });

      setPosts((prev) => prev.map(removeComment));
      setMyPosts((prev) => prev.map(removeComment));
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al eliminar comentario"
      );
      console.error("Error deleting comment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     ❤️ TOGGLE LIKE
  ========================= */
  const toggleLike = useCallback(async (postId: number) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      const data = res.data.data || res.data;

      console.log('❤️ Like toggled:', { postId, liked: data.liked });

      const updateLike = (post: Post) =>
        post.id === postId
          ? {
              ...post,
              liked: data.liked,
              likes_count: data.likes_count,
            }
          : post;

      setPosts((prev) => prev.map(updateLike));
      setMyPosts((prev) => prev.map(updateLike));
    } catch (err: any) {
      console.error("Error toggling like:", err);
      throw new Error(err.response?.data?.message || "Error al dar like");
    }
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        myPosts,
        loadingMyPosts,
        fetchPosts,
        fetchMyPosts,
        fetchHomePosts,
        createPost,
        updatePost,
        deletePost,
        addComment,
        deleteComment,
        toggleLike,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePosts debe usarse dentro de PostProvider");
  }
  return context;
};