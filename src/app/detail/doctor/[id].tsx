import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { useComments } from "../../../context/CommentContext";
import { useDoctors } from "../../../context/DoctorContext";
import { usePosts } from "../../../context/PostContext";
import { useServices } from "../../../context/ServiceContext";
import api from "../../../utils/axios";

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { doctor, fetchDoctorById, loading, error } = useDoctors();
  const { createPost, toggleLike } = usePosts();
  const { createService } = useServices();

  const {
    loading: commentsLoading,
    fetchPostComments,
    createPostComment,
    deletePostComment,
    fetchServiceComments,
    createServiceComment,
    deleteServiceComment,
  } = useComments();

  const [activeTab, setActiveTab] = useState("sobre");
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Estados para comentarios
  const [commentText, setCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentingServiceId, setCommentingServiceId] = useState<number | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<{ type: "post" | "service"; id: number } | null>(null);
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [serviceComments, setServiceComments] = useState<Record<number, any[]>>({});

  // Modal para agregar comentario
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentModalType, setCommentModalType] = useState<"post" | "service" | null>(null);
  const [commentModalId, setCommentModalId] = useState<number | null>(null);
  const [commentModalText, setCommentModalText] = useState("");

  // Modal para feedback
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // ✅ ESTADOS PARA CREAR POST
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postCategory, setPostCategory] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // ✅ ESTADOS PARA CREAR SERVICIO
  const [createServiceModalVisible, setCreateServiceModalVisible] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [serviceImage, setServiceImage] = useState<string | null>(null);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  // ✅ VERIFICAR SI EL USUARIO ES DUEÑO DEL DOCTOR
  useEffect(() => {
    if (user && doctor) {
      setIsOwner(user.id === doctor.user_id);
    }
  }, [user, doctor]);

  useEffect(() => {
    if (id) {
      fetchDoctorById(Number(id));
    }
  }, [id]);

  const rating = useMemo(() => {
    if (!doctor?.feedbacks?.length) return 0;
    const total = doctor.feedbacks.reduce((acc, f) => acc + Number(f.rating), 0);
    return total / doctor.feedbacks.length;
  }, [doctor]);

  // ==================== REFRESH ====================
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDoctorById(Number(id));
    } catch (error) {
      console.error("❌ Error refrescando:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // ✅ FUNCIONES PARA CREAR POST
  // ============================================================
  const pickPostImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      console.log('📸 Imagen seleccionada para post:', result.assets[0].uri);
      setPostImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      Alert.alert("Error", "Título y contenido son obligatorios");
      return;
    }

    if (!doctor || !doctor.id) {
      Alert.alert("Error", "No se encontró el doctor");
      return;
    }

    setIsSubmittingPost(true);

    try {
      const payload: any = {
        title: postTitle.trim(),
        content: postContent.trim(),
        postable_type: 'App\\Models\\Doctor',
        postable_id: doctor.id,
      };

      if (postCategory.trim()) {
        payload.category = postCategory.trim();
      }

      if (postImage) {
        if (postImage.startsWith('file://')) {
          const uriParts = postImage.split('/');
          const fileName = uriParts[uriParts.length - 1] || 'post.jpg';
          const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
          let mimeType = 'image/jpeg';
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'webp') mimeType = 'image/webp';

          payload.image = {
            uri: postImage,
            name: fileName,
            type: mimeType,
          };
        } else if (postImage.startsWith('http')) {
          payload.image = postImage;
        }
      }

      console.log('📤 Enviando post:', {
        title: payload.title,
        hasImage: !!payload.image,
        postable_id: payload.postable_id,
      });

      await createPost(payload);

      Alert.alert("Éxito", "Post creado correctamente");
      setCreatePostModalVisible(false);
      setPostTitle("");
      setPostContent("");
      setPostImage(null);
      setPostCategory("");
      await onRefresh();
    } catch (error: any) {
      console.error('❌ Error creando post:', error);
      Alert.alert("Error", error?.message || "No se pudo crear el post");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // ============================================================
  // ✅ FUNCIONES PARA CREAR SERVICIO - CON IMAGEN
  // ============================================================
  const pickServiceImage = async () => {
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
      console.log('📸 Imagen seleccionada para servicio:', result.assets[0].uri);
      setServiceImage(result.assets[0].uri);
    }
  };

  const handleCreateService = async () => {
    if (!serviceName.trim() || !servicePrice) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    const profile = doctor;
    if (!profile || !profile.id) {
      Alert.alert("Error", "No se encontró el perfil del doctor");
      return;
    }

    setIsSubmittingService(true);

    try {
      const payload: any = {
        name: serviceName.trim(),
        description: serviceDescription.trim() || undefined,
        price: parseFloat(servicePrice),
        duration: serviceDuration ? parseInt(serviceDuration) : undefined,
        serviceable_type: 'App\\Models\\Doctor',
        serviceable_id: profile.id,
      };

      if (serviceImage) {
        if (serviceImage.startsWith('file://')) {
          const uriParts = serviceImage.split('/');
          const fileName = uriParts[uriParts.length - 1] || 'service.jpg';
          const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
          let mimeType = 'image/jpeg';
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'webp') mimeType = 'image/webp';

          payload.image = {
            uri: serviceImage,
            name: fileName,
            type: mimeType,
          };
        } else if (serviceImage.startsWith('http')) {
          payload.image = serviceImage;
        }
      }

      console.log('📤 Enviando servicio:', {
        name: payload.name,
        hasImage: !!payload.image,
        serviceable_id: payload.serviceable_id,
      });

      await createService(payload);

      Alert.alert("Éxito", "Servicio creado correctamente");
      setCreateServiceModalVisible(false);
      setServiceName("");
      setServiceDescription("");
      setServicePrice("");
      setServiceDuration("");
      setServiceImage(null);
      await onRefresh();
    } catch (error: any) {
      console.error('❌ Error creando servicio:', error);
      Alert.alert("Error", error?.message || "No se pudo crear el servicio");
    } finally {
      setIsSubmittingService(false);
    }
  };

  // ==================== FUNCIONES DE COMENTARIOS ====================
  const loadPostComments = async (postId: number) => {
    try {
      const data = await fetchPostComments(postId);
      setPostComments((prev) => ({ ...prev, [postId]: data }));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  };

  const loadServiceComments = async (serviceId: number) => {
    try {
      const data = await fetchServiceComments(serviceId);
      setServiceComments((prev) => ({ ...prev, [serviceId]: data }));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  };

  const openCommentModal = (type: "post" | "service", id: number) => {
    setCommentModalType(type);
    setCommentModalId(id);
    setCommentModalText("");
    setCommentModalVisible(true);
  };

  const submitCommentFromModal = async () => {
    if (!commentModalText.trim()) {
      Alert.alert("Error", "Escribe un comentario");
      return;
    }

    if (!commentModalId || !commentModalType) return;

    try {
      if (commentModalType === "post") {
        const newComment = await createPostComment(commentModalId, commentModalText);
        setPostComments((prev) => ({
          ...prev,
          [commentModalId!]: [newComment, ...(prev[commentModalId!] || [])],
        }));
      } else {
        const newComment = await createServiceComment(commentModalId, commentModalText);
        setServiceComments((prev) => ({
          ...prev,
          [commentModalId!]: [newComment, ...(prev[commentModalId!] || [])],
        }));
      }

      setCommentModalVisible(false);
      setCommentModalText("");
      Alert.alert("Éxito", "Comentario agregado");
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el comentario");
    }
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0) {
      Alert.alert("Error", "Selecciona una calificación");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post("/feedbacks", {
        feedbackable_type: "App\\Models\\Doctor",
        feedbackable_id: doctor.id,
        rating: feedbackRating,
        comment: feedbackComment,
      });

      Alert.alert("Éxito", "¡Reseña agregada correctamente!");
      setFeedbackModalVisible(false);
      setFeedbackRating(0);
      setFeedbackComment("");
      await onRefresh();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "No se pudo agregar la reseña");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDeletePostComment = async (commentId: number, postId: number) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePostComment(commentId);
              setPostComments((prev) => ({
                ...prev,
                [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
              }));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          },
        },
      ]
    );
  };

  const handleDeleteServiceComment = async (commentId: number, serviceId: number) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteServiceComment(commentId);
              setServiceComments((prev) => ({
                ...prev,
                [serviceId]: (prev[serviceId] || []).filter((c) => c.id !== commentId),
              }));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          },
        },
      ]
    );
  };

  const toggleComments = async (type: "post" | "service", id: number) => {
    if (showCommentsFor?.type === type && showCommentsFor?.id === id) {
      setShowCommentsFor(null);
    } else {
      setShowCommentsFor({ type, id });
      if (type === "post") {
        await loadPostComments(id);
      } else {
        await loadServiceComments(id);
      }
    }
  };

  // ============================================================
  // ✅ FUNCIÓN PARA OBTENER URL DE IMAGEN
  // ============================================================
  const getImageUrl = (item: any): string | null => {
    if (!item) return null;
    
    // Buscar en diferentes campos
    let imageUrl = item.image || item.image_url || null;
    
    // Si es una ruta relativa, construir URL completa
    if (imageUrl && !imageUrl.startsWith('http')) {
      const baseUrl = 'http://10.105.198.82:8000';
      imageUrl = baseUrl + '/' + imageUrl.replace(/^\/+/, '');
    }
    
    return imageUrl;
  };

  // ==================== COMPONENTE DE COMENTARIOS ====================
  const CommentSection = ({
    comments,
    onDeleteComment,
    type,
    itemId,
  }: {
    comments: any[];
    onDeleteComment: (id: number) => void;
    type: "post" | "service";
    itemId: number;
  }) => {
    if (commentsLoading) {
      return <ActivityIndicator size="small" color="#1C7C54" />;
    }

    return (
      <View style={styles.commentContainer}>
        {comments?.length > 0 ? (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentUserInfo}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.user?.name?.charAt(0) || "U"}
                    </Text>
                  </View>
                  <Text style={styles.commentAuthor}>{comment.user?.name || "Usuario"}</Text>
                </View>
                <TouchableOpacity onPress={() => onDeleteComment(comment.id)} style={styles.deleteCommentBtn}>
                  <Text style={styles.deleteCommentText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noComments}>No hay comentarios</Text>
        )}

        <TouchableOpacity style={styles.addCommentBtn} onPress={() => openCommentModal(type, itemId)}>
          <Text style={styles.addCommentText}>+ Agregar comentario</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1C7C54" />
        <Text style={{ marginTop: 10 }}>Cargando doctor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text>Doctor no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1C7C54" />}
      >
        {/* HEADER */}
        <View style={styles.headerCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: doctor.image || "https://tudealer.app/avatar_doctor.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>
            {doctor.first_name} {doctor.last_name}
          </Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>📋 {doctor.graduation_code}</Text>
            <Text style={styles.sub}>📍 {doctor.city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>🎓 {doctor.university}</Text>
            <Text style={styles.sub}>🕓 {doctor.schedule}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>👤 {doctor.user?.name}</Text>
          </View>

          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={[styles.ownerButton, { backgroundColor: "#1C7C54" }]}
                onPress={() => setCreatePostModalVisible(true)}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.ownerButtonText}>Crear Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ownerButton, { backgroundColor: "#3B82F6" }]}
                onPress={() => setCreateServiceModalVisible(true)}
              >
                <Ionicons name="construct-outline" size={18} color="#fff" />
                <Text style={styles.ownerButtonText}>Crear Servicio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["sobre", "posts", "servicios", "feedbacks"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>
                {tab === "sobre" ? "Sobre" : tab === "posts" ? "Posts" : tab === "servicios" ? "Servicios" : "Opiniones"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SOBRE */}
        {activeTab === "sobre" && (
          <View style={styles.card}>
            <Text style={styles.title}>Descripción</Text>
            <Text style={styles.text}>{doctor.description || "Sin descripción"}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({doctor.feedbacks?.length || 0} reseñas)</Text>
            </View>
          </View>
        )}

        {/* POSTS CON IMAGEN */}
        {activeTab === "posts" && (
          <View>
            {doctor.posts && doctor.posts.length > 0 ? (
              doctor.posts.map((post) => {
                const imageUrl = getImageUrl(post);
                return (
                  <View key={post.id} style={styles.card}>
                    {imageUrl && (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    )}
                    <Text style={styles.title}>{post.title}</Text>
                    <Text style={styles.text}>{post.short_content || post.content}</Text>

                    <TouchableOpacity style={styles.commentToggleBtn} onPress={() => toggleComments("post", post.id)}>
                      <Text style={styles.commentToggleText}>
                        {showCommentsFor?.type === "post" && showCommentsFor?.id === post.id
                          ? "Ocultar comentarios"
                          : `Ver comentarios (${postComments[post.id]?.length || 0})`}
                      </Text>
                    </TouchableOpacity>

                    {showCommentsFor?.type === "post" && showCommentsFor?.id === post.id && (
                      <CommentSection
                        comments={postComments[post.id] || []}
                        onDeleteComment={(commentId) => handleDeletePostComment(commentId, post.id)}
                        type="post"
                        itemId={post.id}
                      />
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Este doctor no tiene posts aún</Text>
              </View>
            )}
          </View>
        )}

        {/* SERVICIOS CON IMAGEN */}
        {activeTab === "servicios" && (
          <View>
            {doctor.services && doctor.services.length > 0 ? (
              doctor.services.map((s) => {
                const imageUrl = getImageUrl(s);
                console.log('🖼️ Servicio:', s.name, 'Imagen:', imageUrl);
                return (
                  <View key={s.id} style={styles.card}>
                    {imageUrl && (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    )}
                    <Text style={styles.title}>{s.name}</Text>
                    <Text style={styles.text}>{s.description}</Text>
                    <Text style={styles.price}>S/ {Number(s.price).toFixed(2)}</Text>
                    {s.duration && <Text style={styles.duration}>⏱ {s.duration} min</Text>}

                    <TouchableOpacity style={styles.commentToggleBtn} onPress={() => toggleComments("service", s.id)}>
                      <Text style={styles.commentToggleText}>
                        {showCommentsFor?.type === "service" && showCommentsFor?.id === s.id
                          ? "Ocultar comentarios"
                          : `Ver comentarios (${serviceComments[s.id]?.length || 0})`}
                      </Text>
                    </TouchableOpacity>

                    {showCommentsFor?.type === "service" && showCommentsFor?.id === s.id && (
                      <CommentSection
                        comments={serviceComments[s.id] || []}
                        onDeleteComment={(commentId) => handleDeleteServiceComment(commentId, s.id)}
                        type="service"
                        itemId={s.id}
                      />
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Este doctor no tiene servicios aún</Text>
              </View>
            )}
          </View>
        )}

        {/* FEEDBACKS */}
        {activeTab === "feedbacks" && (
          <View>
            <TouchableOpacity style={[styles.btn, styles.addFeedbackBtn]} onPress={() => setFeedbackModalVisible(true)}>
              <Text style={styles.btnText}>+ Agregar reseña</Text>
            </TouchableOpacity>

            {doctor.feedbacks && doctor.feedbacks.length > 0 ? (
              doctor.feedbacks.map((f) => (
                <View key={f.id} style={styles.card}>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.commentUserInfo}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>{f.user?.name?.charAt(0) || "U"}</Text>
                      </View>
                      <Text style={styles.feedbackUser}>{f.user?.name || "Usuario"}</Text>
                    </View>
                    <Text style={styles.rating}>⭐ {f.rating}</Text>
                  </View>
                  <Text style={styles.text}>{f.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>No hay reseñas aún</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ============ MODALES ============ */}

      {/* MODAL COMENTARIO */}
      <Modal visible={commentModalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={[styles.modalContent, styles.commentModalContent]}>
            <Text style={styles.modalTitle}>Agregar comentario</Text>
            <TextInput
              style={styles.commentModalInput}
              placeholder="Escribe tu comentario..."
              value={commentModalText}
              onChangeText={setCommentModalText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.commentModalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelModalBtn]}
                onPress={() => {
                  setCommentModalVisible(false);
                  setCommentModalText("");
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={submitCommentFromModal}>
                <Text style={styles.btnText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL FEEDBACK */}
      <Modal visible={feedbackModalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={[styles.modalContent, styles.commentModalContent]}>
            <Text style={styles.modalTitle}>Calificar a {doctor.first_name}</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)} style={styles.starButton}>
                  <Text style={[styles.starText, feedbackRating >= star && styles.starActive]}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {feedbackRating > 0
                ? `${feedbackRating} estrella${feedbackRating > 1 ? "s" : ""}`
                : "Selecciona una calificación"}
            </Text>
            <TextInput
              style={styles.commentModalInput}
              placeholder="Escribe tu reseña..."
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.commentModalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelModalBtn]}
                onPress={() => {
                  setFeedbackModalVisible(false);
                  setFeedbackRating(0);
                  setFeedbackComment("");
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={submitFeedback} disabled={submittingFeedback}>
                <Text style={styles.btnText}>{submittingFeedback ? "Enviando..." : "Enviar reseña"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL CREAR POST CON IMAGEN */}
      <Modal
        visible={createPostModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreatePostModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalWrapper}>
              <View style={[styles.modalContentLarge, styles.modalContentPost]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📝 Nueva publicación</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCreatePostModalVisible(false);
                      setPostTitle("");
                      setPostContent("");
                      setPostImage(null);
                      setPostCategory("");
                    }}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Título *"
                  placeholderTextColor="#9CA3AF"
                  value={postTitle}
                  onChangeText={setPostTitle}
                  style={styles.input}
                />
                <TextInput
                  placeholder="¿Qué deseas publicar? *"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={postContent}
                  onChangeText={setPostContent}
                  style={[styles.input, styles.contentInput]}
                />
                <TextInput
                  placeholder="Categoría (opcional)"
                  placeholderTextColor="#9CA3AF"
                  value={postCategory}
                  onChangeText={setPostCategory}
                  style={styles.input}
                />

                <TouchableOpacity style={styles.imagePicker} onPress={pickPostImage}>
                  <Ionicons name="image-outline" size={20} color="#1C7C54" />
                  <Text style={styles.imagePickerText}>
                    {postImage ? "Cambiar imagen" : "Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {postImage && <Image source={{ uri: postImage }} style={styles.previewImage} />}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: "#E5E7EB", borderWidth: 1 }]}
                    onPress={() => {
                      setCreatePostModalVisible(false);
                      setPostTitle("");
                      setPostContent("");
                      setPostImage(null);
                      setPostCategory("");
                    }}
                    disabled={isSubmittingPost}
                  >
                    <Text style={{ color: "#6B7280", fontWeight: "600" }}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.publishBtn,
                      (!postTitle.trim() || !postContent.trim() || isSubmittingPost) && styles.publishBtnDisabled,
                    ]}
                    onPress={handleCreatePost}
                    disabled={!postTitle.trim() || !postContent.trim() || isSubmittingPost}
                  >
                    <Text style={styles.publishBtnText}>{isSubmittingPost ? "Publicando..." : "Publicar"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ✅ MODAL CREAR SERVICIO CON IMAGEN */}
      <Modal
        visible={createServiceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateServiceModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalWrapper}>
              <View style={[styles.modalContentLarge, styles.modalContentService]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>💼 Nuevo Servicio</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCreateServiceModalVisible(false);
                      setServiceName("");
                      setServiceDescription("");
                      setServicePrice("");
                      setServiceDuration("");
                      setServiceImage(null);
                    }}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Nombre del servicio *"
                  placeholderTextColor="#9CA3AF"
                  value={serviceName}
                  onChangeText={setServiceName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Descripción"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={serviceDescription}
                  onChangeText={setServiceDescription}
                  style={[styles.input, styles.contentInput]}
                />

                <View style={styles.rowInputs}>
                  <TextInput
                    placeholder="Precio *"
                    placeholderTextColor="#9CA3AF"
                    value={servicePrice}
                    onChangeText={setServicePrice}
                    keyboardType="numeric"
                    style={[styles.input, styles.rowInputHalf]}
                  />
                  <TextInput
                    placeholder="Duración (min)"
                    placeholderTextColor="#9CA3AF"
                    value={serviceDuration}
                    onChangeText={setServiceDuration}
                    keyboardType="numeric"
                    style={[styles.input, styles.rowInputHalf]}
                  />
                </View>

                <TouchableOpacity style={styles.imagePicker} onPress={pickServiceImage}>
                  <Ionicons name="image-outline" size={20} color="#1C7C54" />
                  <Text style={styles.imagePickerText}>
                    {serviceImage ? "Cambiar imagen" : "Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {serviceImage && <Image source={{ uri: serviceImage }} style={styles.previewImage} />}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: "#E5E7EB", borderWidth: 1 }]}
                    onPress={() => {
                      setCreateServiceModalVisible(false);
                      setServiceName("");
                      setServiceDescription("");
                      setServicePrice("");
                      setServiceDuration("");
                      setServiceImage(null);
                    }}
                    disabled={isSubmittingService}
                  >
                    <Text style={{ color: "#6B7280", fontWeight: "600" }}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.publishBtn,
                      (!serviceName.trim() || !servicePrice || isSubmittingService) && styles.publishBtnDisabled,
                    ]}
                    onPress={handleCreateService}
                    disabled={!serviceName.trim() || !servicePrice || isSubmittingService}
                  >
                    <Text style={styles.publishBtnText}>{isSubmittingService ? "Creando..." : "Crear"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ============================================================
// ESTILOS COMPLETOS
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#1C7C54",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
    color: "#1A1A2E",
    textAlign: "center",
  },
  specialty: {
    color: "#1C7C54",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 6,
    flexWrap: "wrap",
  },
  sub: {
    color: "#666",
    fontSize: 14,
  },
  ownerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    width: "100%",
  },
  ownerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  ownerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingVertical: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: "#1C7C54",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  tabActive: {
    backgroundColor: "#1C7C54",
  },
  tabText: {
    color: "#1C7C54",
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 16,
    color: "#1A1A2E",
  },
  text: {
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  rating: {
    color: "#FF9900",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  ratingCount: {
    color: "#666",
    fontSize: 14,
  },
  price: {
    color: "#1C7C54",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
  },
  duration: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  btn: {
    backgroundColor: "#1C7C54",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: "#1C7C54",
  },
  addFeedbackBtn: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  cancelModalBtn: {
    backgroundColor: "#999",
    marginRight: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  modalContentLarge: {
    width: "92%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentPost: {
    maxHeight: "80%",
  },
  modalContentService: {
    maxHeight: "80%",
  },
  commentModalContent: {
    maxHeight: "60%",
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
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  rowInputHalf: {
    flex: 1,
  },
  imagePicker: {
    flexDirection: "row",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#1C7C54",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#F0FDF4",
    gap: 8,
  },
  imagePickerText: {
    color: "#1C7C54",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 150,
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
    backgroundColor: "#1C7C54",
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  keyboardView: {
    width: "100%",
  },
  commentContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
    paddingTop: 12,
  },
  commentItem: {
    backgroundColor: "#F5F7F9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1C7C54",
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  commentContent: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    marginLeft: 38,
  },
  commentDate: {
    fontSize: 11,
    color: "#999",
    marginLeft: 38,
  },
  deleteCommentBtn: {
    padding: 4,
  },
  deleteCommentText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
  },
  commentToggleBtn: {
    marginTop: 8,
    paddingVertical: 6,
  },
  commentToggleText: {
    color: "#1C7C54",
    fontSize: 14,
    fontWeight: "600",
  },
  addCommentBtn: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#F0F7F4",
    borderRadius: 8,
  },
  addCommentText: {
    color: "#1C7C54",
    fontSize: 14,
    fontWeight: "500",
  },
  commentModalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  commentModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  feedbackUser: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  noComments: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
  },
  ratingSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 16,
  },
  starButton: {
    padding: 8,
  },
  starText: {
    fontSize: 32,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  ratingLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
});