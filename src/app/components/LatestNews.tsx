// screens/LatestNews.tsx - COMPLETO CORREGIDO
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../../context/AuthContext";
import { useNewsRole } from "../../context/NewsRoleContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

// ============================
// TIPOS - ACTUALIZADOS
// ============================
interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    url?: string;
  };
  created_at: string;
}

interface NewsItem {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string;        // URL del perfil
  image?: string;      // ✅ IMAGEN DE LA NOTICIA - AGREGADO
  created_at: string;
  newable_type: string;
  newable_id: number;
  newable: {
    id: number;
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  comments: Comment[];
  user?: {
    id: number;
    name: string;
    url?: string;
  };
  liked?: boolean;
  likes_count?: number;
}

// ============================
// COMPONENTE PRINCIPAL
// ============================
const LatestNews = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();

  // ============================
  // CONTEXT
  // ============================
  const {
    latestNews,
    loading,
    error,
    fetchLatestNews,
    addComment,
  } = useNewsRole();

  // ============================
  // ESTADOS LOCALES
  // ============================
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [likedNews, setLikedNews] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // ============================
  // COLORES (DARK MODE)
  // ============================
  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    input: darkMode ? "#1E293B" : "#ffffff",
    inputBorder: darkMode ? "#334155" : "#dddddd",
    comment: darkMode ? "#1E293B" : "#f1f1f1",
    modal: darkMode ? "#0F172A" : "#ffffff",
    green: darkMode ? "#4ADE80" : "#00B272",
    red: darkMode ? "#F87171" : "#EF4444",
    backdrop: "rgba(0,0,0,0.6)",
  };

  // ============================
  // FETCH NEWS
  // ============================
  useEffect(() => {
    fetchLatestNews();
  }, []);

  // ============================
  // LIKES STORAGE (LOCAL)
  // ============================
  useEffect(() => {
    const loadLikes = async () => {
      try {
        const saved = await AsyncStorage.getItem("latestNewsLikes");
        if (saved) {
          setLikedNews(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error al cargar likes:", error);
      }
    };
    loadLikes();
  }, []);

  useEffect(() => {
    const saveLikes = async () => {
      try {
        await AsyncStorage.setItem(
          "latestNewsLikes",
          JSON.stringify(likedNews)
        );
      } catch (error) {
        console.error("Error al guardar likes:", error);
      }
    };
    saveLikes();
  }, [likedNews]);

  // ============================
  // REFRESH
  // ============================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLatestNews();
    setRefreshing(false);
  }, [fetchLatestNews]);

  // ============================
  // OPEN / CLOSE MODAL
  // ============================
  const openComments = useCallback((news: NewsItem) => {
    setActiveNews(news);
    setModalVisible(true);
  }, []);

  const closeComments = useCallback(() => {
    setModalVisible(false);
    setActiveNews(null);
    setCommentText("");
  }, []);

  // ============================
  // SHARE
  // ============================
  const handleShare = useCallback(async (item: NewsItem) => {
    try {
      await Share.share({
        message: `📰 ${item.titulo}\n\n${item.descripcion}`,
        title: item.titulo,
      });
    } catch (error: any) {
      if (error.message !== "User canceled the dialog") {
        Alert.alert("Error", "No se pudo compartir la noticia");
      }
    }
  }, []);

  // ============================
  // LIKE (LOCAL + STORAGE)
  // ============================
  const handleLike = useCallback((id: number) => {
    setLikedNews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // ============================
  // ADD COMMENT
  // ============================
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !activeNews) return;

    try {
      const newComment = await addComment(activeNews.id, commentText.trim());

      setActiveNews((prev: NewsItem | null) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
        };
      });

      setCommentText("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo agregar el comentario"
      );
    }
  }, [commentText, activeNews, addComment]);

  // ============================
  // RENDER NEWS ITEM - CORREGIDO CON IMAGEN
  // ============================
  const renderNewsItem = useCallback(
    (item: NewsItem) => {
      const profileName = item.newable?.first_name
        ? `${item.newable.first_name} ${item.newable.last_name || ""}`
        : item.newable?.name || "Perfil";

      const formattedDate = new Date(item.created_at).toLocaleDateString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

      // ✅ OBTENER LA IMAGEN CORRECTA
      // Prioridad: image (de la BD) > url (fallback) > placeholder
      const imageUrl = item.image || `https://picsum.photos/seed/${item.id}/400/200`;
      
      // Verificar si hay error en la imagen
      const hasImageError = imageErrors[item.id] || false;

      return (
        <View
          key={item.id}
          style={[
            styles.newsItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* ✅ IMAGEN CON FALLBACK */}
          <Image
            source={{ 
              uri: hasImageError 
                ? `https://picsum.photos/seed/${item.id}/400/200` 
                : imageUrl 
            }}
            style={styles.newsImage}
            resizeMode="cover"
            onError={() => {
              console.log('❌ Error cargando imagen:', imageUrl);
              setImageErrors(prev => ({ ...prev, [item.id]: true }));
            }}
          />

          <View style={styles.newsHeader}>
            <View style={styles.newsAvatarContainer}>
              <Text style={[styles.newsAvatarText, { color: colors.text }]}>
                {profileName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.newsHeaderInfo}>
              <Text style={[styles.newsName, { color: colors.text }]}>
                {profileName}
              </Text>
              <Text style={[styles.newsDate, { color: colors.secondaryText }]}>
                {formattedDate}
              </Text>
            </View>
          </View>

          <Text style={[styles.newsTitle, { color: colors.text }]}>
            {item.titulo}
          </Text>

          <Text
            style={[
              styles.newsDescription,
              { color: colors.secondaryText },
            ]}
            numberOfLines={3}
          >
            {item.descripcion}
          </Text>

          <View
            style={[
              styles.newsActions,
              { borderTopColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.green}
              />
              <Text style={[styles.actionText, { color: colors.green }]}>
                Compartir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openComments(item)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.green}
              />
              <Text style={[styles.actionText, { color: colors.green }]}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={likedNews[item.id] ? "heart" : "heart-outline"}
                size={20}
                color={likedNews[item.id] ? colors.red : colors.green}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: likedNews[item.id] ? colors.red : colors.green,
                  },
                ]}
              >
                {likedNews[item.id] ? "Me gusta" : "Like"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, likedNews, imageErrors, handleShare, openComments, handleLike]
  );

  // ============================
  // RENDER EMPTY STATE
  // ============================
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="newspaper-outline"
          size={60}
          color={colors.secondaryText}
        />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          No hay noticias disponibles
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.green }]}
          onPress={onRefresh}
        >
          <Text style={styles.emptyButtonText}>Recargar</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, colors, onRefresh]);

  // ============================
  // RENDER LOADING
  // ============================
  if (loading && !refreshing && !latestNews.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando noticias...
        </Text>
      </View>
    );
  }

  // ============================
  // RENDER ERROR
  // ============================
  if (error && !latestNews.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.green }]}
          onPress={onRefresh}
        >
          <Text style={styles.errorButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================
  // RENDER PRINCIPAL
  // ============================
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        📰 Noticias de mi rol
      </Text>

      <View style={styles.listContent}>
        {latestNews.length === 0 ? (
          renderEmptyState()
        ) : (
          latestNews.map((item) => renderNewsItem(item))
        )}
      </View>

      {/* MODAL DE COMENTARIOS */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeComments}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.backdrop }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.modalContainer, { backgroundColor: colors.modal }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                💬 Comentarios
              </Text>
              <TouchableOpacity onPress={closeComments} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {activeNews && (
              <Text style={[styles.modalNewsTitle, { color: colors.text }]}>
                {activeNews.titulo}
              </Text>
            )}

            <ScrollView
              style={styles.commentsScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentList}
            >
              {activeNews?.comments && activeNews.comments.length > 0 ? (
                activeNews.comments.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.commentBubble,
                      { backgroundColor: colors.comment },
                    ]}
                  >
                    <Text style={[styles.commentUser, { color: colors.text }]}>
                      {item.user?.name || "Usuario"}
                    </Text>
                    <Text style={[styles.commentText, { color: colors.text }]}>
                      {item.content}
                    </Text>
                    <Text
                      style={[
                        styles.commentDate,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noComments, { color: colors.secondaryText }]}>
                  No hay comentarios aún. ¡Sé el primero!
                </Text>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={colors.secondaryText}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleAddComment}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: commentText.trim() ? colors.green : colors.secondaryText,
                    opacity: commentText.trim() ? 1 : 0.5,
                  },
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

// ============================
// ESTILOS
// ============================
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 12,
    paddingVertical: 40,
  },

  errorText: {
    fontSize: 16,
    textAlign: "center",
  },

  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  errorButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
  },

  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  newsItem: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  newsImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },

  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  newsAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00B272",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  newsAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  newsHeaderInfo: {
    flex: 1,
  },

  newsName: {
    fontWeight: "700",
    fontSize: 15,
  },

  newsDate: {
    fontSize: 11,
    marginTop: 1,
  },

  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  newsDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },

  newsActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 10,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  actionText: {
    marginLeft: 4,
    fontWeight: "500",
    fontSize: 13,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "92%",
    maxHeight: "75%",
    borderRadius: 20,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalNewsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.8,
  },

  commentsScrollView: {
    maxHeight: 300,
  },

  commentList: {
    paddingBottom: 8,
  },

  noComments: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 14,
  },

  commentBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  commentUser: {
    fontWeight: "700",
    marginBottom: 2,
    fontSize: 13,
  },

  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },

  commentDate: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
    gap: 8,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },

  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
});

export default LatestNews;