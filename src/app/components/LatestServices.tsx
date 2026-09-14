// components/LatestServices.tsx - VERSIÓN CON API REAL
import {
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

import { useAuth } from "../../context/AuthContext";
import { useComments } from "../../context/CommentContext"; // 👈 IMPORTAR
import { useServices } from "../../context/ServiceContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

// ============================
// TIPOS
// ============================
interface ServiceComment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    url?: string;
  };
  created_at: string;
}

interface ServiceItem {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  duration?: number | string;
  image?: string | null;
  created_at: string;
  updated_at?: string;
  serviceable_type?: string;
  serviceable_id?: number;
  serviceable?: {
    id: number;
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  comments?: ServiceComment[];
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
const LatestServices = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  
  // ============================
  // CONTEXT
  // ============================
  const {
    services,
    loading,
    error,
    fetchServices,
  } = useServices();

  // 👇 CommentContext para comentarios reales
  const {
    createServiceComment,
    fetchServiceComments,
    loading: commentsLoading,
  } = useComments();

  // ============================
  // ESTADOS LOCALES
  // ============================
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [serviceComments, setServiceComments] = useState<ServiceComment[]>([]);
  const [likedServices, setLikedServices] = useState<Record<number, boolean>>({});
  const [serviceLikesCount, setServiceLikesCount] = useState<Record<number, number>>({});

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
    blue: darkMode ? "#60A5FA" : "#3B82F6",
    yellow: darkMode ? "#FBBF24" : "#F59E0B",
    backdrop: "rgba(0,0,0,0.6)",
  };

  // ============================
  // FETCH SERVICES
  // ============================
  useEffect(() => {
    fetchServices();
  }, []);

  // ============================
  // REFRESH
  // ============================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  // ============================
  // OPEN / CLOSE MODAL CON API
  // ============================
  const openComments = useCallback(async (service: ServiceItem) => {
    setActiveService(service);
    setModalVisible(true);
    setCommentText("");
    
    try {
      // Cargar comentarios desde la API
      const comments = await fetchServiceComments(service.id);
      setServiceComments(comments || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      // Si falla, usar los que vienen en el objeto
      setServiceComments(service.comments || []);
    }
  }, [fetchServiceComments]);

  const closeComments = useCallback(() => {
    setModalVisible(false);
    setActiveService(null);
    setCommentText("");
    setServiceComments([]);
  }, []);

  // ============================
  // ADD COMMENT - CON API REAL
  // ============================
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !activeService) {
      Alert.alert("Error", "Escribe un comentario");
      return;
    }

    try {
      // Guardar en la API usando CommentContext
      const newComment = await createServiceComment(activeService.id, commentText.trim());
      
      // Actualizar lista local
      setServiceComments(prev => [newComment, ...prev]);
      setCommentText("");
      
      // Actualizar el servicio activo
      setActiveService(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])]
        };
      });

    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  }, [commentText, activeService, createServiceComment]);

  // ============================
  // SHARE
  // ============================
  const handleShare = useCallback(async (item: ServiceItem) => {
    try {
      const priceDisplay = item.price ? `$${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}` : 'Consultar';
      const durationDisplay = item.duration ? `⏱️ ${item.duration} min` : '';
      
      const message = `🔧 ${item.name}\n\n${item.description || 'Sin descripción'}\n\n💰 Precio: ${priceDisplay}\n${durationDisplay}\n\n${item.serviceable?.name ? `👤 Proveedor: ${item.serviceable.name}\n` : ''}`;
      
      await Share.share({
        message: message,
        title: item.name,
      });
    } catch (error: any) {
      if (error.message !== "User canceled the dialog") {
        Alert.alert("Error", "No se pudo compartir el servicio");
      }
    }
  }, []);

  // ============================
  // LIKE (LOCAL)
  // ============================
  const handleLike = useCallback(async (id: number) => {
    setLikedServices(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    setServiceLikesCount(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + (likedServices[id] ? -1 : 1)
    }));
  }, [likedServices]);

  // ============================
  // RENDER SERVICE ITEM
  // ============================
  const renderServiceItem = useCallback(
    (item: ServiceItem) => {
      const providerName = item.serviceable?.first_name
        ? `${item.serviceable.first_name} ${item.serviceable.last_name || ""}`
        : item.serviceable?.name || "Proveedor";

      const formattedDate = new Date(item.created_at).toLocaleDateString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

      const likesCount = serviceLikesCount[item.id] || item.likes_count || 0;
      const priceDisplay = item.price ? `$${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}` : 'Consultar';
      const durationDisplay = item.duration ? `${item.duration} min` : '';
      const commentCount = item.comments?.length || 0;

      return (
        <View
          key={item.id}
          style={[
            styles.serviceItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.serviceImagePlaceholder, { backgroundColor: colors.blue + '20' }]}>
              <Ionicons name="construct" size={50} color={colors.blue} />
              <Text style={[styles.serviceImageText, { color: colors.blue }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.serviceHeader}>
            <View style={styles.serviceAvatarContainer}>
              <Text style={[styles.serviceAvatarText, { color: colors.text }]}>
                {providerName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.serviceHeaderInfo}>
              <Text style={[styles.serviceName, { color: colors.text }]}>
                {providerName}
              </Text>
              <Text style={[styles.serviceDate, { color: colors.secondaryText }]}>
                {formattedDate}
              </Text>
            </View>

            <View style={styles.serviceTags}>
              <View style={[styles.tag, { backgroundColor: colors.green + '20' }]}>
                <Text style={[styles.tagText, { color: colors.green }]}>
                  {priceDisplay}
                </Text>
              </View>
              {durationDisplay && (
                <View style={[styles.tag, { backgroundColor: colors.blue + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.blue }]}>
                    ⏱️ {durationDisplay}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.serviceTitle, { color: colors.text }]}>
            {item.name}
          </Text>

          <Text
            style={[
              styles.serviceDescription,
              { color: colors.secondaryText },
            ]}
            numberOfLines={2}
          >
            {item.description || "Sin descripción disponible"}
          </Text>

          <View
            style={[
              styles.serviceActions,
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
                {commentCount > 0 ? commentCount : "Comentar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={likedServices[item.id] ? "heart" : "heart-outline"}
                size={20}
                color={likedServices[item.id] ? colors.red : colors.green}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: likedServices[item.id] ? colors.red : colors.green,
                  },
                ]}
              >
                {likesCount > 0 ? `${likesCount} ❤️` : "Like"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, likedServices, serviceLikesCount, handleShare, openComments, handleLike]
  );

  // ============================
  // RENDER EMPTY STATE
  // ============================
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="construct-outline"
          size={60}
          color={colors.secondaryText}
        />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          No hay servicios disponibles
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
  if (loading && !refreshing && !services.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando servicios...
        </Text>
      </View>
    );
  }

  // ============================
  // RENDER ERROR
  // ============================
  if (error && !services.length) {
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
        🔧 Servicios 
      </Text>

      <View style={styles.listContent}>
        {services.length === 0 ? (
          renderEmptyState()
        ) : (
          services.map((item) => renderServiceItem(item))
        )}
      </View>

      {/* MODAL DE COMENTARIOS CON API */}
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

            {activeService && (
              <Text style={[styles.modalServiceTitle, { color: colors.text }]}>
                {activeService.name}
              </Text>
            )}

            {commentsLoading ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="small" color={colors.green} />
                <Text style={[styles.commentsLoadingText, { color: colors.secondaryText }]}>
                  Cargando comentarios...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.commentsScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.commentList}
              >
                {serviceComments && serviceComments.length > 0 ? (
                  serviceComments.map((item) => (
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
            )}

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
                disabled={!commentText.trim() || commentsLoading}
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
// ESTILOS - AGREGAR ESTILOS PARA LOADING
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
  serviceItem: {
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
  serviceImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 12,
  },
  serviceImagePlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceImageText: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  serviceAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00B272",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  serviceAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  serviceHeaderInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: "700",
    fontSize: 15,
  },
  serviceDate: {
    fontSize: 11,
    marginTop: 1,
  },
  serviceTags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceActions: {
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
  modalServiceTitle: {
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
  commentsLoading: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 8,
  },
  commentsLoadingText: {
    fontSize: 14,
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

export default LatestServices;