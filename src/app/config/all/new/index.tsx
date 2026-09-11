// screens/NewsScreen.tsx - COMPLETO CORREGIDO
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";
import { useNewsRole } from "../../../../context/NewsRoleContext";
import { useDarkMode } from "../../../../context/app/DarkModeContext";
import { useProfileImage } from "../../../../hooks/useProfileImage";

// ============================
// TIPOS
// ============================
interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at?: string;
}

interface NewsItem {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string;
  image?: string;
  image_url?: string;
  created_at: string;
  newable_type: string | null;
  newable_id: number | null;
  user_id?: number | null;
  user?: {
    id: number;
    name: string;
  } | null;
  newable: any;
  comments: Comment[];
  liked?: boolean;
  likes_count?: number;
}

// ============================
// ✅ FUNCIÓN PARA NORMALIZAR URLS DE IMÁGENES
// ============================
const IMAGE_BASE_URL = 'http://192.168.203.82:8000';

const normalizeImageUrl = (image: string | null | undefined): string | null => {
  if (!image) return null;

  // ✅ SI YA ES URL COMPLETA, DEVOLVERLA
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  // ✅ SI EMPIEZA CON /storage/ O storage/
  if (image.includes('/storage/') || image.startsWith('storage/')) {
    const cleanPath = image.replace(/^\/?/, '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }

  // ✅ SI EMPIEZA CON /imagenes_app/ O imagenes_app/
  if (image.includes('/imagenes_app/') || image.startsWith('imagenes_app/')) {
    const cleanPath = image.replace(/^\/?/, '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }

  // ✅ DEFAULT: agregar base
  return `${IMAGE_BASE_URL}/${image.replace(/^\/?/, '')}`;
};

// ============================
// COMPONENTE PRINCIPAL
// ============================
const NewsScreen = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const { profileImage, refreshProfileImage } = useProfileImage();

  const {
    userNews,
    allUserNews,
    loading,
    error,
    fetchUserLatestNews,
    fetchAllUserNews,
    addComment,
    createNews,
    updateNews,
    toggleLike,
    checkLike,
  } = useNewsRole();

  // ============================
  // ESTADOS LOCALES
  // ============================
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageFile, setImageFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================
  // COLORES
  // ============================
  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    input: darkMode ? "#1E293B" : "#f5f5f5",
    inputBorder: darkMode ? "#334155" : "#dddddd",
    comment: darkMode ? "#1E293B" : "#f1f1f1",
    modal: darkMode ? "#0F172A" : "#ffffff",
    green: darkMode ? "#4ADE80" : "#00B272",
    red: darkMode ? "#F87171" : "#EF4444",
    backdrop: "rgba(0,0,0,0.6)",
    placeholder: darkMode ? "#64748B" : "#999999",
    inputText: darkMode ? "#F8FAFC" : "#1A1A1A",
    likeActive: darkMode ? "#4ADE80" : "#00B272",
    likeInactive: darkMode ? "#64748B" : "#999999",
  };

  // ============================
  // FETCH
  // ============================
  useEffect(() => {
    fetchUserLatestNews();
    refreshProfileImage();
  }, []);

  // ============================
  // SOLICITAR PERMISOS
  // ============================
  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          "Permisos necesarios",
          "Necesitamos permisos para acceder a tu cámara y galería."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      return false;
    }
  };

  // ============================
  // SELECCIONAR IMAGEN DE GALERÍA
  // ============================
  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImageFile(selectedImage);
        setImageUrl(selectedImage.uri);
        Alert.alert("Éxito", "Imagen seleccionada correctamente");
      }
    } catch (error: any) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen: " + error.message);
    }
  };

  // ============================
  // TOMAR FOTO CON CÁMARA
  // ============================
  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImageFile(selectedImage);
        setImageUrl(selectedImage.uri);
        Alert.alert("Éxito", "Foto tomada correctamente");
      }
    } catch (error: any) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto: " + error.message);
    }
  };

  // ============================
  // MANEJAR SELECCIÓN DE IMAGEN
  // ============================
  const handleImageSelection = () => {
    Alert.alert(
      "Seleccionar imagen",
      "Elige una opción para agregar una imagen a tu noticia",
      [
        { text: "📷 Tomar foto", onPress: takePhoto },
        { text: "🖼️ Elegir de galería", onPress: pickImageFromGallery },
        { 
          text: "🔗 Ingresar URL", 
          onPress: () => {
            Alert.prompt(
              "URL de imagen",
              "Ingresa la URL de la imagen:",
              [
                { text: "Cancelar", style: "cancel" },
                { 
                  text: "Aceptar", 
                  onPress: (text) => {
                    if (text) {
                      setImageUrl(text);
                      setImageFile(null);
                    }
                  }
                }
              ],
              "plain-text",
              imageUrl
            );
          }
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  // ============================
  // ELIMINAR IMAGEN SELECCIONADA
  // ============================
  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
  };

  // ============================
  // REFRESH
  // ============================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await (showAll ? fetchAllUserNews() : fetchUserLatestNews());
    refreshProfileImage();
    setRefreshing(false);
  }, [fetchUserLatestNews, fetchAllUserNews, showAll, refreshProfileImage]);

  // ============================
  // TOGGLE VIEW
  // ============================
  const toggleView = useCallback(async () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    if (newShowAll) {
      await fetchAllUserNews();
    } else {
      await fetchUserLatestNews();
    }
  }, [showAll, fetchAllUserNews, fetchUserLatestNews]);

  // ============================
  // OPEN / CLOSE MODAL COMENTARIOS
  // ============================
  const openComments = useCallback(async (news: NewsItem) => {
    try {
      const likeStatus = await checkLike(news.id);
      setActiveNews({
        ...news,
        liked: likeStatus.liked,
        likes_count: news.likes_count || 0,
      });
    } catch (error) {
      setActiveNews(news);
    }
    setModalVisible(true);
  }, [checkLike]);

  const closeComments = useCallback(() => {
    setModalVisible(false);
    setActiveNews(null);
    setCommentText("");
  }, []);

  // ============================
  // OPEN / CLOSE EDIT MODAL
  // ============================
  const openEditModal = useCallback((item?: NewsItem) => {
    if (item) {
      setEditingId(item.id);
      setTitulo(item.titulo || "");
      setDescripcion(item.descripcion || "");
      setImageUrl(item.image || item.image_url || "");
      setLinkUrl(item.url || "");
      setImageFile(null);
    } else {
      setEditingId(null);
      setTitulo("");
      setDescripcion("");
      setImageUrl("");
      setLinkUrl("");
      setImageFile(null);
    }
    setEditModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingId(null);
    setTitulo("");
    setDescripcion("");
    setImageUrl("");
    setLinkUrl("");
    setImageFile(null);
    setIsSubmitting(false);
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
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  }, [commentText, activeNews, addComment]);

  // ============================
  // TOGGLE LIKE
  // ============================
  const handleToggleLike = useCallback(async () => {
    if (!activeNews) return;

    try {
      const result = await toggleLike(activeNews.id);
      setActiveNews((prev: NewsItem | null) => {
        if (!prev) return null;
        return {
          ...prev,
          liked: result.liked,
          likes_count: result.likes_count,
        };
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo procesar el like");
    }
  }, [activeNews, toggleLike]);

  // ============================
  // SAVE NEWS - CORREGIDO CON SOPORTE PARA IMAGEN
  // ============================
  const handleSaveNews = useCallback(async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert("Error", "Título y descripción son obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const newsData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        url: linkUrl.trim() || null,
      };

      // ✅ CORREGIDO: Manejar imagen correctamente
      let imageToSend = null;
      
      if (imageFile && imageFile.uri) {
        // ✅ Archivo seleccionado desde cámara/galería
        imageToSend = {
          uri: imageFile.uri,
          name: imageFile.uri.split('/').pop() || `news_${Date.now()}.jpg`,
          type: imageFile.type || 'image/jpeg',
        };
        console.log("📸 Enviando imagen desde archivo:", imageToSend);
      } else if (imageUrl && imageUrl.trim() !== '') {
        // ✅ URL ingresada manualmente
        imageToSend = imageUrl.trim();
        console.log("📸 Enviando imagen desde URL:", imageToSend);
      } else {
        console.log("📸 Sin imagen para enviar");
      }

      let response;
      let successMessage;

      if (editingId) {
        console.log("📤 Actualizando noticia ID:", editingId);
        response = await updateNews(editingId, newsData, imageToSend);
        successMessage = "Noticia actualizada correctamente";
      } else {
        console.log("📝 Creando nueva noticia");
        console.log("📤 Datos a enviar:", newsData);
        response = await createNews(newsData, imageToSend);
        successMessage = "Noticia creada correctamente";
      }

      console.log("✅ Respuesta del servidor:", response);

      Alert.alert("Éxito", successMessage);
      closeEditModal();
      await onRefresh();
    } catch (error: any) {
      console.error("❌ Error al guardar:", error);
      console.error("❌ Detalles del error:", error.response?.data);
      Alert.alert("Error", error?.response?.data?.message || "No se pudo guardar la noticia");
    } finally {
      setIsSubmitting(false);
    }
  }, [titulo, descripcion, linkUrl, imageFile, imageUrl, editingId, closeEditModal, onRefresh, createNews, updateNews]);

  // ============================
  // RENDER COMMENT
  // ============================
  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View style={[styles.commentBubble, { backgroundColor: colors.comment }]}>
        <Text style={[styles.commentUser, { color: colors.text }]}>
          {item.user?.name || "Usuario"}
        </Text>
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.content}
        </Text>
        <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
          {new Date(item.created_at || "").toLocaleString()}
        </Text>
      </View>
    ),
    [colors]
  );

  // ============================
  // RENDER NEWS ITEM - CORREGIDO CON NORMALIZACIÓN DE IMAGEN
  // ============================
  const renderNewsItem = useCallback(
    ({ item }: { item: NewsItem }) => {
      const creatorName = item.user?.name 
        ? `👤 ${item.user.name}`
        : "Usuario";

      const formattedDate = item.created_at 
        ? new Date(item.created_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Fecha no disponible";

      // ✅ NORMALIZAR URL DE IMAGEN
      const rawImage = item.image_url || item.image || null;
      const imageSource = normalizeImageUrl(rawImage);
      
      console.log(`🖼️ Noticia ${item.id}:`, {
        titulo: item.titulo,
        rawImage: rawImage,
        imageSource: imageSource,
      });

      return (
        <View
          style={[
            styles.newsItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={styles.newsImage}
              resizeMode="cover"
              onError={(e) => console.log('❌ Error cargando imagen:', e.nativeEvent.error, 'URL:', imageSource)}
              onLoad={() => console.log('✅ Imagen cargada:', imageSource)}
            />
          ) : (
            <View style={[styles.newsImage, styles.newsImagePlaceholder]}>
              <Ionicons name="newspaper-outline" size={40} color={colors.secondaryText} />
              <Text style={[styles.newsImagePlaceholderText, { color: colors.secondaryText }]}>
                {item.titulo?.charAt(0)?.toUpperCase() || "N"}
              </Text>
            </View>
          )}

          <View style={styles.newsHeader}>
            <View style={styles.newsAvatarContainer}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.newsAvatarImage} 
                />
              ) : (
                <Text style={[styles.newsAvatarText, { color: "#fff" }]}>
                  {creatorName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.newsHeaderInfo}>
              <Text style={[styles.newsName, { color: colors.text }]}>
                {creatorName}
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
            style={[styles.newsDescription, { color: colors.secondaryText }]}
            numberOfLines={3}
          >
            {item.descripcion}
          </Text>

          {item.url && (
            <TouchableOpacity
              style={styles.urlContainer}
              onPress={() => {
                Alert.alert("Enlace", `Abrir: ${item.url}`);
              }}
            >
              <Ionicons name="link-outline" size={16} color={colors.green} />
              <Text style={[styles.urlText, { color: colors.green }]} numberOfLines={1}>
                {item.url}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.newsActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openComments(item)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.green} />
              <Text style={[styles.actionText, { color: colors.green }]}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil-outline" size={20} color={colors.green} />
              <Text style={[styles.actionText, { color: colors.green }]}>
                Editar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, openComments, openEditModal, profileImage]
  );

  // ============================
  // RENDER EMPTY STATE
  // ============================
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={60} color={colors.secondaryText} />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          {showAll ? "No tienes noticias" : "No tienes noticias recientes"}
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.green }]}
          onPress={() => openEditModal()}
        >
          <Text style={styles.emptyButtonText}>Crear mi primera noticia</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, colors, showAll, openEditModal]);

  // ============================
  // RENDER LOADING
  // ============================
  if (loading && !refreshing && !userNews.length && !allUserNews.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando tus noticias...
        </Text>
      </View>
    );
  }

  // ============================
  // RENDER ERROR
  // ============================
  if (error && !userNews.length && !allUserNews.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
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
  // DATA
  // ============================
  const data = showAll ? allUserNews : userNews;

  // ============================
  // RENDER PRINCIPAL
  // ============================
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* HEADER CON TÍTULO Y BOTONES */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          📰 Mis noticias
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.toggleButton, { borderColor: colors.border }]}
            onPress={toggleView}
          >
            <Text style={[styles.toggleText, { color: colors.text }]}>
              {showAll ? "📋 Recientes" : "📚 Todas"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.green }]}
            onPress={() => openEditModal()}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* FLATLIST CON LAS NOTICIAS */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* MODAL DE COMENTARIOS */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeComments}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.backdrop }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                💬 Comentarios
              </Text>
              <TouchableOpacity onPress={closeComments} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {activeNews && (
              <>
                <Text style={[styles.modalNewsTitle, { color: colors.text }]}>
                  {activeNews.titulo}
                </Text>

                <TouchableOpacity
                  style={styles.likeButtonModal}
                  onPress={handleToggleLike}
                >
                  <Ionicons
                    name={activeNews.liked ? "heart" : "heart-outline"}
                    size={24}
                    color={activeNews.liked ? colors.likeActive : colors.likeInactive}
                  />
                  <Text style={[styles.likeCountModal, { color: colors.secondaryText }]}>
                    {activeNews.likes_count || 0} {activeNews.likes_count === 1 ? 'like' : 'likes'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <FlatList
              data={activeNews?.comments || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderComment}
              contentContainerStyle={styles.commentList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.noComments, { color: colors.secondaryText }]}>
                  No hay comentarios aún. ¡Sé el primero!
                </Text>
              }
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
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
          </View>
        </View>
      </Modal>

      {/* MODAL PARA CREAR/EDITAR NOTICIA */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={[styles.editModalContainer, { backgroundColor: colors.modal }]}>
              <View style={styles.editModalHeader}>
                <View style={styles.editModalHeaderLeft}>
                  <TouchableOpacity
                    onPress={closeEditModal}
                    style={styles.editModalClose}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.editModalTitle, { color: colors.text }]}>
                    {editingId ? "✏️ Editar noticia" : "📝 Nueva noticia"}
                  </Text>
                </View>
                {editingId && (
                  <View style={styles.editModalBadge}>
                    <Text style={styles.editModalBadgeText}>ID: {editingId}</Text>
                  </View>
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.editModalScroll}
                keyboardShouldPersistTaps="handled"
              >
                {/* Título */}
                <View style={styles.editField}>
                  <View style={styles.editFieldHeader}>
                    <Text style={[styles.editFieldLabel, { color: colors.text }]}>
                      Título
                    </Text>
                    <Text style={[styles.editFieldRequired, { color: colors.red }]}>
                      *
                    </Text>
                  </View>
                  <View style={[styles.editFieldWrapper, { borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.editFieldInput, { color: colors.inputText }]}
                      placeholder="Ej: Nuevo lanzamiento de producto"
                      placeholderTextColor={colors.placeholder}
                      value={titulo}
                      onChangeText={setTitulo}
                      maxLength={191}
                      editable={!isSubmitting}
                    />
                  </View>
                  <Text style={[styles.editFieldCounter, { color: colors.secondaryText }]}>
                    {titulo.length}/191
                  </Text>
                </View>

                {/* Descripción */}
                <View style={styles.editField}>
                  <View style={styles.editFieldHeader}>
                    <Text style={[styles.editFieldLabel, { color: colors.text }]}>
                      Descripción
                    </Text>
                    <Text style={[styles.editFieldRequired, { color: colors.red }]}>
                      *
                    </Text>
                  </View>
                  <View style={[styles.editFieldWrapper, styles.editFieldTextArea, { borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.editFieldInput, styles.editFieldTextAreaInput, { color: colors.inputText }]}
                      placeholder="Describe tu noticia en detalle..."
                      placeholderTextColor={colors.placeholder}
                      value={descripcion}
                      onChangeText={setDescripcion}
                      multiline
                      numberOfLines={5}
                      maxLength={1000}
                      textAlignVertical="top"
                      editable={!isSubmitting}
                    />
                  </View>
                  <Text style={[styles.editFieldCounter, { color: colors.secondaryText }]}>
                    {descripcion.length}/1000
                  </Text>
                </View>

                {/* Imagen */}
                <View style={styles.editField}>
                  <Text style={[styles.editFieldLabel, { color: colors.text }]}>
                    🖼️ Imagen <Text style={{ color: colors.secondaryText, fontSize: 12 }}>(opcional)</Text>
                  </Text>

                  <TouchableOpacity
                    style={[styles.imagePickerButton, { borderColor: colors.border }]}
                    onPress={handleImageSelection}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="image-outline" size={24} color={colors.green} />
                    <Text style={[styles.imagePickerText, { color: colors.text }]}>
                      {imageUrl ? "🔄 Cambiar imagen" : "📷 Seleccionar imagen"}
                    </Text>
                  </TouchableOpacity>

                  {imageUrl ? (
                    <View style={styles.selectedImageContainer}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.selectedImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={clearImage}
                        disabled={isSubmitting}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.red} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.noImageContainer, { borderColor: colors.border }]}>
                      <Ionicons name="image-outline" size={40} color={colors.secondaryText} />
                      <Text style={[styles.noImageText, { color: colors.secondaryText }]}>
                        Sin imagen seleccionada
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.imageUrlLabel, { color: colors.secondaryText }]}>
                    O ingresa una URL de imagen:
                  </Text>
                  <View style={[styles.editFieldWrapper, { borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.editFieldInput, { color: colors.inputText }]}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      placeholderTextColor={colors.placeholder}
                      value={imageUrl}
                      onChangeText={setImageUrl}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* URL de la página web */}
                <View style={styles.editField}>
                  <Text style={[styles.editFieldLabel, { color: colors.text }]}>
                    🔗 URL de la página web <Text style={{ color: colors.secondaryText, fontSize: 12 }}>(opcional)</Text>
                  </Text>
                  <View style={[styles.editFieldWrapper, { borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.editFieldInput, { color: colors.inputText }]}
                      placeholder="https://ejemplo.com/noticia-completa"
                      placeholderTextColor={colors.placeholder}
                      value={linkUrl}
                      onChangeText={setLinkUrl}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                  </View>
                  <Text style={[styles.editFieldHelper, { color: colors.secondaryText }]}>
                    Enlace a la página web original de la noticia
                  </Text>
                </View>

                {/* Botones */}
                <View style={styles.editModalActions}>
                  <TouchableOpacity
                    style={[styles.editModalButton, styles.editModalCancelButton, { borderColor: colors.border }]}
                    onPress={closeEditModal}
                    disabled={isSubmitting}
                  >
                    <Text style={[styles.editModalButtonText, { color: colors.secondaryText }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.editModalButton,
                      styles.editModalSaveButton,
                      { backgroundColor: colors.green },
                      (!titulo.trim() || !descripcion.trim()) && styles.editModalSaveButtonDisabled,
                    ]}
                    onPress={handleSaveNews}
                    disabled={!titulo.trim() || !descripcion.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.editModalSaveButtonText}>
                        {editingId ? "💾 Actualizar" : "✨ Crear noticia"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

// ============================
// ESTILOS COMPLETOS
// ============================
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 50,
    marginTop: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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
    marginHorizontal: 16,
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
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },
  newsImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  newsImagePlaceholderText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    backgroundColor: "rgba(0,178,114,0.05)",
    borderRadius: 8,
    gap: 8,
  },
  urlText: {
    fontSize: 12,
    flex: 1,
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
    overflow: "hidden",
  },
  newsAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    maxHeight: "85%",
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
  likeButtonModal: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,178,114,0.08)",
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 6,
  },
  likeCountModal: {
    fontSize: 14,
    fontWeight: "600",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContainer: {
    width: "92%",
    maxHeight: "88%",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  editModalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  editModalClose: {
    padding: 4,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  editModalBadge: {
    backgroundColor: "rgba(0,178,114,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editModalBadgeText: {
    color: "#00B272",
    fontSize: 11,
    fontWeight: "600",
  },
  editModalScroll: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  editField: {
    marginBottom: 18,
  },
  editFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  editFieldLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  editFieldRequired: {
    fontSize: 16,
    fontWeight: "700",
  },
  editFieldWrapper: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  editFieldInput: {
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 0,
    minHeight: 48,
  },
  editFieldCounter: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "right",
    paddingRight: 4,
  },
  editFieldTextArea: {
    alignItems: "flex-start",
    minHeight: 130,
    paddingTop: 8,
  },
  editFieldTextAreaInput: {
    width: "100%",
    minHeight: 120,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  editFieldHelper: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 8,
    borderStyle: "dashed",
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedImageContainer: {
    position: "relative",
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  noImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 30,
    marginTop: 12,
    borderStyle: "dashed",
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
  },
  imageUrlLabel: {
    fontSize: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  editModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  editModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editModalCancelButton: {
    borderWidth: 1.5,
  },
  editModalSaveButton: {
    flexDirection: "row",
    gap: 8,
  },
  editModalSaveButtonDisabled: {
    opacity: 0.5,
  },
  editModalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  editModalSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default NewsScreen;