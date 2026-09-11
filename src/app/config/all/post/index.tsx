// screens/PostsScreen.tsx - COMPLETO CORREGIDO
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { useAuth } from "../../../../context/AuthContext";
import { useComments } from "../../../../context/CommentContext";
import { usePosts } from "../../../../context/PostContext";

export default function PostsScreen() {
  const {
    posts,
    myPosts,
    fetchMyPosts,
    createPost,
    deletePost,
    updatePost,
    toggleLike,
  } = usePosts();

  const {
    fetchPostComments,
    createPostComment,
    deletePostComment,
  } = useComments();

  const { user } = useAuth();

  // Estados del formulario
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para editar
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Estados para comentarios
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [activePostTitle, setActivePostTitle] = useState("");
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    await fetchMyPosts();
  };

  // Toggle entre ver todas y ver recientes
  const toggleView = () => {
    setShowAll(!showAll);
  };

  // ✅ SELECCIONAR IMAGEN - CORREGIDO
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      console.log('📸 Imagen seleccionada:', {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      });
      setImage(result.assets[0].uri);
    }
  };

  const pickEditImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  // ✅ CREAR POST - CORREGIDO
  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "El título y contenido son obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        title: title.trim(),
        content: content.trim(),
      };

      if (category.trim()) {
        payload.category = category.trim();
      }

      // ✅ MANEJAR IMAGEN CORRECTAMENTE
      if (image) {
        // Solo enviar si es una URI válida
        if (image.startsWith('file://')) {
          payload.image = {
            uri: image,
            name: 'post.jpg',
            type: 'image/jpeg',
          };
        } else {
          // Si es URL o base64, solo enviar si es URL
          if (image.startsWith('http')) {
            payload.image = image;
          }
        }
      }

      console.log('📤 Enviando post:', {
        title: payload.title,
        hasImage: !!payload.image,
        imageType: payload.image ? typeof payload.image : 'none',
      });

      await createPost(payload);

      setTitle("");
      setContent("");
      setCategory("");
      setImage(null);
      setModalVisible(false);

      await loadPosts();
      
      Alert.alert("Éxito", "Publicación creada correctamente");
    } catch (error: any) {
      console.log("❌ Error creando post:", error);
      Alert.alert("Error", error?.message || "No se pudo crear el post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================
  // ABRIR MODAL DE EDICIÓN
  // ============================
  const openEditModal = (post: any) => {
    setEditingId(post.id);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setEditImage(post.image || null);
    setEditCategory(post.category || "");
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditImage(null);
    setEditCategory("");
    setIsEditing(false);
  };

  // ============================
  // ACTUALIZAR POST
  // ============================
  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim() || !editingId) {
      Alert.alert("Error", "El título y contenido son obligatorios");
      return;
    }

    setIsEditing(true);

    try {
      const payload: any = {
        title: editTitle.trim(),
        content: editContent.trim(),
      };

      if (editCategory.trim()) {
        payload.category = editCategory.trim();
      }

      if (editImage) {
        if (editImage.startsWith('file://')) {
          payload.image = {
            uri: editImage,
            name: 'post.jpg',
            type: 'image/jpeg',
          };
        } else if (editImage.startsWith('http')) {
          payload.image = editImage;
        }
      }

      await updatePost(editingId, payload);

      Alert.alert("Éxito", "Publicación actualizada correctamente");
      closeEditModal();
      await loadPosts();
    } catch (error: any) {
      console.log("❌ Error actualizando post:", error);
      Alert.alert("Error", error?.message || "No se pudo actualizar la publicación");
    } finally {
      setIsEditing(false);
    }
  };

  // ============================
  // ELIMINAR POST
  // ============================
  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deletePost(selectedId);
      setSelectedId(null);
      setShowModal(false);
      await loadPosts();
      Alert.alert("Éxito", "Publicación eliminada");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo eliminar la publicación");
    }
  };

  // ============================
  // COMENTARIOS
  // ============================
  const openComments = async (postId: number, postTitle: string) => {
    setActivePostId(postId);
    setActivePostTitle(postTitle);
    setCommentModalVisible(true);
    await loadComments(postId);
  };

  const loadComments = async (postId: number) => {
    setLoadingComments(true);
    try {
      const comments = await fetchPostComments(postId);
      setPostComments(comments || []);
    } catch (error) {
      console.log("Error loading comments:", error);
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activePostId) return;

    try {
      const newComment = await createPostComment(activePostId, commentText.trim());
      setPostComments(prev => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      console.log("Error adding comment:", error);
      Alert.alert("Error", "No se pudo agregar el comentario");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deletePostComment(commentId);
      setPostComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.log("Error deleting comment:", error);
      Alert.alert("Error", "No se pudo eliminar el comentario");
    }
  };

  // Renderizar cada post
  const renderPost = ({ item }: any) => {
    const isLiked = item.liked || false;
    const likesCount = item.likes_count || 0;
    const imageSource = item.image || item.image_url || null;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {item.user?.name || "Usuario"}
            </Text>

            <Text style={styles.postDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {!!imageSource && (
          <Image
            source={{ uri: imageSource }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <Text style={styles.postTitle}>{item.title}</Text>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#DC2626" : "#6B7280"}
            />
            <Text style={[styles.actionText, isLiked && { color: "#DC2626" }]}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openComments(item.id, item.title)}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
            <Text style={styles.actionText}>
              {item.comments?.length || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil-outline" size={22} color="#3B82F6" />
            <Text style={[styles.actionText, { color: "#3B82F6" }]}>
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
            <Text style={[styles.actionText, { color: "#DC2626" }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizar comentario
  const renderComment = ({ item }: any) => (
    <View style={styles.commentBubble}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>
          {item.user?.name || "Usuario"}
        </Text>
        {item.user?.id === user?.id && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
            <Ionicons name="trash-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.commentText}>{item.content}</Text>
      <Text style={styles.commentDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  const displayData = showAll ? posts : (myPosts?.slice(0, 3) || []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>📝 Mis publicaciones</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.toggleButton, { borderColor: "#E5E7EB" }]}
            onPress={toggleView}
          >
            <Text style={styles.toggleText}>
              {showAll ? "Ver recientes" : "Ver todas"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA DE POSTS */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              {showAll
                ? "No tienes publicaciones"
                : "No tienes publicaciones recientes"}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>
                Crear mi primera publicación
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* MODAL CREAR POST */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalWrapper}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📝 Nueva publicación</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Título *"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />

                <TextInput
                  placeholder="¿Qué deseas publicar? *"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={content}
                  onChangeText={setContent}
                  style={[styles.input, styles.contentInput]}
                />

                <TextInput
                  placeholder="Categoría (opcional)"
                  placeholderTextColor="#9CA3AF"
                  value={category}
                  onChangeText={setCategory}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={20} color="#16A34A" />
                  <Text style={styles.imagePickerText}>
                    {image ? "Cambiar imagen" : "Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {image && (
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                  />
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: "#E5E7EB", borderWidth: 1 }]}
                    onPress={() => {
                      setModalVisible(false);
                      setTitle("");
                      setContent("");
                      setCategory("");
                      setImage(null);
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={{ color: "#6B7280", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.publishBtn,
                      (!title.trim() || !content.trim() || isSubmitting) &&
                        styles.publishBtnDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={!title.trim() || !content.trim() || isSubmitting}
                  >
                    <Text style={styles.publishBtnText}>
                      {isSubmitting ? "Publicando..." : "Publicar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL EDITAR POST */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalWrapper}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>✏️ Editar publicación</Text>
                  <TouchableOpacity
                    onPress={closeEditModal}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Título *"
                  placeholderTextColor="#9CA3AF"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={styles.input}
                />

                <TextInput
                  placeholder="¿Qué deseas publicar? *"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={editContent}
                  onChangeText={setEditContent}
                  style={[styles.input, styles.contentInput]}
                />

                <TextInput
                  placeholder="Categoría (opcional)"
                  placeholderTextColor="#9CA3AF"
                  value={editCategory}
                  onChangeText={setEditCategory}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickEditImage}
                >
                  <Ionicons name="image-outline" size={20} color="#16A34A" />
                  <Text style={styles.imagePickerText}>
                    {editImage ? "Cambiar imagen" : "Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {editImage && (
                  <Image
                    source={{ uri: editImage }}
                    style={styles.previewImage}
                  />
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: "#E5E7EB", borderWidth: 1 }]}
                    onPress={closeEditModal}
                    disabled={isEditing}
                  >
                    <Text style={{ color: "#6B7280", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.publishBtn,
                      (!editTitle.trim() || !editContent.trim() || isEditing) &&
                        styles.publishBtnDisabled,
                    ]}
                    onPress={handleUpdate}
                    disabled={!editTitle.trim() || !editContent.trim() || isEditing}
                  >
                    <Text style={styles.publishBtnText}>
                      {isEditing ? "Actualizando..." : "Actualizar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL COMENTARIOS */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setCommentModalVisible(false);
          setPostComments([]);
          setCommentText("");
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalWrapper}
            >
              <View style={[styles.modalContent, styles.commentModalContent]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>💬 Comentarios</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCommentModalVisible(false);
                      setPostComments([]);
                      setCommentText("");
                    }}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {activePostTitle && (
                  <Text style={styles.commentPostTitle}>{activePostTitle}</Text>
                )}

                {loadingComments ? (
                  <View style={styles.loadingContainer}>
                    <Text>Cargando comentarios...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={postComments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderComment}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.commentList}
                    ListEmptyComponent={
                      <View style={styles.noCommentsContainer}>
                        <Ionicons name="chatbubble-outline" size={40} color="#D1D5DB" />
                        <Text style={styles.noComments}>
                          No hay comentarios aún. ¡Sé el primero!
                        </Text>
                      </View>
                    }
                  />
                )}

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor="#9CA3AF"
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
                      { backgroundColor: commentText.trim() ? "#16A34A" : "#D1D5DB" },
                    ]}
                    onPress={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL ELIMINAR */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Ionicons name="alert-triangle-outline" size={48} color="#DC2626" />
              <Text style={styles.modalTitle}>¿Eliminar publicación?</Text>
              <Text style={styles.modalText}>
                Esta acción no se puede deshacer.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: "#E5E7EB", borderWidth: 1 }]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={{ color: "#6B7280", fontWeight: "600" }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: "#DC2626" }]}
                  onPress={handleDelete}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
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

  screenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  listContent: {
    paddingBottom: 120,
  },

  postCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 16,
    padding: 15,
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

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  userName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },

  postDate: {
    color: "#6B7280",
    fontSize: 12,
  },

  postTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },

  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },

  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#E5E7EB",
  },

  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  actionText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "92%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  commentModalContent: {
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  modalClose: {
    padding: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#111827",
  },

  contentInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  imagePicker: {
    flexDirection: "row",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#16A34A",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#F0FDF4",
    gap: 8,
  },

  imagePickerText: {
    color: "#16A34A",
    fontWeight: "600",
  },

  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  publishBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#16A34A",
  },

  publishBtnDisabled: {
    opacity: 0.5,
  },

  publishBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  modalText: {
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },

  confirmBtn: {
    flex: 2,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  commentPostTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  commentList: {
    maxHeight: 300,
    paddingBottom: 8,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  commentBubble: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  commentUser: {
    fontWeight: "700",
    fontSize: 13,
    color: "#111827",
  },

  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },

  commentDate: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "right",
  },

  noCommentsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },

  noComments: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
    gap: 8,
  },

  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
    color: "#111827",
  },

  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    marginTop: 8,
  },

  emptyButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});