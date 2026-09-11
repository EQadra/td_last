// components/LatestPost.tsx - COMPLETO CORREGIDO CON IMAGENES
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useAuth } from "../../context/AuthContext";
import { usePosts } from "../../context/PostContext";

interface LatestPostProps {
  limit?: number;
  showHeader?: boolean;
  onPostPress?: (post: any) => void;
}

// Función para sanitizar texto
const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '');
};

const LatestPost = ({ limit = 15, showHeader = true, onPostPress }: LatestPostProps) => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const { 
    posts, 
    loading, 
    error, 
    fetchHomePosts,
    addComment, 
    toggleLike 
  } = usePosts();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

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

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      await fetchHomePosts();
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  }, [fetchHomePosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const openComments = useCallback((post: any) => {
    setActivePost(post);
    setModalVisible(true);
    if (onPostPress) onPostPress(post);
  }, [onPostPress]);

  const closeComments = useCallback(() => {
    setModalVisible(false);
    setActivePost(null);
    setCommentText("");
  }, []);

  const handleShare = useCallback(async (post: any) => {
    try {
      await Share.share({
        message: `📝 ${post.title || 'Sin título'}\n\n${post.content || ''}\n\nPublicado por: ${post.user?.name || "Usuario"}`,
        title: post.title || "Publicación",
      });
    } catch (error: any) {
      if (error.message !== "User canceled the dialog") {
        Alert.alert("Error", "No se pudo compartir la publicación");
      }
    }
  }, []);

  const handleLike = useCallback(async (postId: number) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      Alert.alert("Error", "No se pudo dar like");
    }
  }, [toggleLike]);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !activePost) return;

    try {
      const sanitizedComment = sanitizeText(commentText.trim());
      const newComment = await addComment(activePost.id, sanitizedComment);
      setActivePost((prev: any) => ({
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
      }));
      setCommentText("");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  }, [commentText, activePost, addComment]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Renderizar comentario individual
  const renderCommentItem = useCallback((item: any) => (
    <View key={item.id} style={[styles.commentBubble, { backgroundColor: colors.comment }]}>
      <Text style={[styles.commentUser, { color: colors.text }]}>
        {item.user?.name || "Usuario"}
      </Text>
      <Text style={[styles.commentText, { color: colors.text }]}>
        {sanitizeText(item.content)}
      </Text>
      <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
        {formatDate(item.created_at)}
      </Text>
    </View>
  ), [colors]);

  // Renderizar post individual - CORREGIDO CON IMAGEN
  const renderPostItem = useCallback((item: any) => {
    const isLiked = item.liked || false;
    const likeCount = item.likes_count || 0;
    const postableName = item.postable?.first_name
      ? `${item.postable.first_name} ${item.postable.last_name || ""}`
      : item.postable?.name || item.user?.name || "Usuario";

    // ✅ CORREGIDO: Usar image en lugar de image_url
    const imageSource = item.image || item.image_url || null;
    const hasImageError = imageErrors[item.id] || false;
    const finalImageSource = hasImageError ? null : imageSource;

    return (
      <View key={item.id} style={[styles.postItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatarContainer}>
            <Text style={[styles.postAvatarText, { color: colors.text }]}>
              {postableName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={[styles.postName, { color: colors.text }]}>
              {postableName}
            </Text>
            <Text style={[styles.postDate, { color: colors.secondaryText }]}>
              {formatDate(item.created_at)}
            </Text>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{sanitizeText(item.category)}</Text>
              </View>
            )}
          </View>
        </View>

        {item.title && (
          <Text style={[styles.postTitle, { color: colors.text }]}>
            {sanitizeText(item.title)}
          </Text>
        )}

        <Text style={[styles.postContent, { color: colors.text }]}>
          {sanitizeText(item.content)}
        </Text>

        {/* ✅ CORREGIDO: Mostrar imagen si existe */}
        {finalImageSource ? (
          <Image 
            source={{ uri: finalImageSource }} 
            style={styles.postImage} 
            resizeMode="cover"
            onError={() => {
              console.log('❌ Error cargando imagen:', finalImageSource);
              setImageErrors(prev => ({ ...prev, [item.id]: true }));
            }}
          />
        ) : (
          // ✅ Mostrar placeholder si no hay imagen
          <View style={[styles.postImage, styles.postImagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color={colors.secondaryText} />
            <Text style={[styles.postImagePlaceholderText, { color: colors.secondaryText }]}>
              Sin imagen
            </Text>
          </View>
        )}

        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? colors.red : colors.secondaryText}
            />
            <Text style={[styles.actionText, { color: isLiked ? colors.red : colors.secondaryText }]}>
              {likeCount > 0 ? likeCount : "Me gusta"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => openComments(item)}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.secondaryText} />
            <Text style={[styles.actionText, { color: colors.secondaryText }]}>
              {item.comments?.length || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <Ionicons name="share-social-outline" size={20} color={colors.secondaryText} />
            <Text style={[styles.actionText, { color: colors.secondaryText }]}>
              Compartir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, handleLike, openComments, handleShare, imageErrors]);

  if (loading && !refreshing && !posts.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando publicaciones...
        </Text>
      </View>
    );
  }

  if (error && !posts.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error.includes('UTF-8') ? 'Error al cargar publicaciones' : error}
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

  const displayPosts = posts.slice(0, limit);

  // Renderizar posts con View + map
  const renderPosts = () => {
    if (displayPosts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No hay publicaciones
          </Text>
        </View>
      );
    }
    return displayPosts.map((item) => renderPostItem(item));
  };

  // Renderizar comentarios con View + map
  const renderComments = () => {
    if (!activePost?.comments || activePost.comments.length === 0) {
      return (
        <Text style={[styles.noComments, { color: colors.secondaryText }]}>
          No hay comentarios aún. ¡Sé el primero!
        </Text>
      );
    }
    return activePost.comments.map((item: any) => renderCommentItem(item));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {showHeader && (
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            📝 Publicaciones recientes
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Lo que comparte la comunidad
          </Text>
        </View>
      )}

      {/* Posts - Usando View + map */}
      <View style={styles.listContent}>
        {renderPosts()}
      </View>

      {/* Modal de comentarios */}
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

            {activePost && (
              <>
                {activePost.title && (
                  <Text style={[styles.modalPostTitle, { color: colors.text }]}>
                    {sanitizeText(activePost.title)}
                  </Text>
                )}
                <Text style={[styles.modalPostContent, { color: colors.secondaryText }]}>
                  {sanitizeText(activePost.content)}
                </Text>
              </>
            )}

            {/* Comentarios - Usando View + map dentro de ScrollView */}
            <ScrollView
              style={styles.commentsScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentList}
            >
              {renderComments()}
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
                onChangeText={(text) => {
                  const cleaned = text
                    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '');
                  setCommentText(cleaned);
                }}
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 12,
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
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  postItem: {
    marginVertical: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00B272",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  postAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  postHeaderInfo: {
    flex: 1,
  },
  postName: {
    fontWeight: "700",
    fontSize: 15,
  },
  postDate: {
    fontSize: 11,
    marginTop: 1,
    opacity: 0.7,
  },
  categoryBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 3,
  },
  categoryText: {
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#e0e0e0",
  },
  postImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    gap: 8,
  },
  postImagePlaceholderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    borderRadius: 8,
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
    maxHeight: "80%",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
  },
  modalPostTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  modalPostContent: {
    fontSize: 14,
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    lineHeight: 20,
  },
  commentsScrollView: {
    maxHeight: 300,
  },
  commentList: {
    paddingBottom: 8,
  },
  noComments: {
    textAlign: "center",
    paddingVertical: 30,
    fontSize: 14,
    opacity: 0.6,
  },
  commentBubble: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  commentUser: {
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
    opacity: 0.6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
    lineHeight: 18,
  },
  sendButton: {
    padding: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
    minHeight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  postOptions: {
    padding: 4,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    opacity: 0.1,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default LatestPost;