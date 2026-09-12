// LawyerScreen.tsx - VERSIÓN FINAL CORREGIDA
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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../../../context/AuthContext";
import { useLawyers } from "../../../../context/LawyerContext";
import { usePosts } from "../../../../context/PostContext";
import { useServices } from "../../../../context/ServiceContext";
import { useDarkMode } from "../../../../context/app/DarkModeContext";

// ============================================================
// TIPOS
// ============================================================
interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at?: string;
}

interface PostWithComments {
  id: number;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  liked?: boolean;
  likes_count?: number;
  comments: Comment[];
}

export default function LawyerScreen() {
  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    input: darkMode ? "#1E293B" : "#F3F4F6",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    border: darkMode ? "#334155" : "#E5E7EB",
    button: "#3B82F6",
    placeholder: darkMode ? "#94A3B8" : "#999999",
    danger: "#EF4444",
    green: "#22c55e",
    blue: "#3B82F6",
    overlay: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
  };

  // =========================================================
  // CONTEXTS
  // =========================================================
  const { user, me, updateAvatar } = useAuth();
  const { updateLawyer } = useLawyers();

  const {
    myPosts,
    loadingMyPosts,
    fetchHomePosts,
    fetchMyPosts,
    createPost,
    deletePost,
    toggleLike,
    addComment,
  } = usePosts();

  const {
    services,
    loading: servicesLoading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices();

  // =========================================================
  // ESTADOS LOCALES
  // =========================================================
  const [tab, setTab] = useState("perfil");
  const [form, setForm] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Servicios
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");

  // Posts
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");

  // Comentarios
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePost, setActivePost] = useState<PostWithComments | null>(null);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  // Likes locales
  const [localLikes, setLocalLikes] = useState<
    Record<number, { liked: boolean; count: number }>
  >({});

  // =========================================================
  // PERFIL DESDE AUTH
  // =========================================================
  const lawyer = user?.profile;

  // =========================================================
  // EFFECTS
  // =========================================================
  useEffect(() => {
    if (lawyer?.id) {
      loadAllData();
    }
  }, [lawyer?.id]);

  useEffect(() => {
    if (lawyer) {
      setForm({
        id: lawyer.id,
        first_name: lawyer.first_name || "",
        last_name: lawyer.last_name || "",
        specialty: lawyer.specialty || "",
        city: lawyer.city || "",
        university: lawyer.university || "",
        description: lawyer.description || "",
        schedule: lawyer.schedule || "",
        license_code: lawyer.license_code || "",
        phone: lawyer.phone || "",
        office_phone: lawyer.office_phone || "",
        image: lawyer.image || "",
      });
    }
  }, [lawyer]);

  // =========================================================
  // CARGA DE DATOS
  // =========================================================
  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([fetchServices(), fetchHomePosts(), fetchMyPosts()]);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, [fetchServices, fetchHomePosts, fetchMyPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAllData(), me()]);
    setRefreshing(false);
  }, [loadAllData, me]);

  // =========================================================
  // IMAGE PICKER (AVATAR) — usa /auth/update-avatar
  // =========================================================
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    try {
      setUploadingAvatar(true);
      const imageUri = result.assets[0].uri;

      // ✅ Actualiza users.avatar + lawyers.image
      const newUrl = await updateAvatar(imageUri);
      console.log("✅ Avatar abogado actualizado:", newUrl);

      setForm((prev: any) => ({ ...prev, image: newUrl }));
      await me();

      Alert.alert("✅ Éxito", "Foto actualizada correctamente");
    } catch (error: any) {
      console.error("Error subiendo imagen:", error);
      Alert.alert("❌ Error", error?.message || "No se pudo subir la imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // =========================================================
  // ACTUALIZAR PERFIL (TEXTO) — usa updateLawyer del contexto
  // =========================================================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const lawyerId = lawyer?.id || form?.id;
      if (!lawyerId) {
        Alert.alert("Error", "No se encontró el ID del abogado");
        return;
      }

      await updateLawyer(lawyerId, {
        first_name: form.first_name,
        last_name: form.last_name,
        specialty: form.specialty,
        city: form.city,
        university: form.university,
        description: form.description,
        schedule: form.schedule,
        license_code: form.license_code,
        phone: form.phone,
        office_phone: form.office_phone,
      });

      await me();
      Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("❌ Error:", err);
      Alert.alert(
        "❌ Error",
        err?.response?.data?.message ||
          err?.message ||
          "Error al actualizar el perfil"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SERVICIOS
  // =========================================================
  const handleCreateService = async () => {
    if (!serviceName.trim() || !servicePrice.trim()) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, {
          name: serviceName.trim(),
          description: serviceDescription.trim(),
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration) || 30,
        });
        Alert.alert("✅ Éxito", "Servicio actualizado correctamente");
      } else {
        await createService({
          name: serviceName.trim(),
          description: serviceDescription.trim(),
          price: parseFloat(servicePrice),
          duration: parseInt(serviceDuration) || 30,
          serviceable_type: "App\\Models\\Lawyer",
          serviceable_id: lawyer?.id || 0,
        });
        Alert.alert("✅ Éxito", "Servicio creado correctamente");
      }

      resetServiceModal();
      await fetchServices();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo guardar el servicio");
    }
  };

  const handleDeleteService = (id: number) => {
    Alert.alert("Eliminar servicio", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteService(id);
            await fetchServices();
            Alert.alert("✅ Éxito", "Servicio eliminado");
          } catch (error: any) {
            Alert.alert("Error", error?.message || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  // =========================================================
  // POSTS
  // =========================================================
  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      Alert.alert("Error", "Título y contenido son obligatorios");
      return;
    }

    try {
      await createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
      });

      resetPostModal();
      await Promise.all([fetchHomePosts(), fetchMyPosts()]);
      Alert.alert("✅ Éxito", "Post creado correctamente");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo guardar el post");
    }
  };

  const handleDeletePost = (id: number) => {
    Alert.alert("Eliminar post", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(id);
            await Promise.all([fetchHomePosts(), fetchMyPosts()]);
            Alert.alert("✅ Éxito", "Post eliminado");
          } catch (error: any) {
            Alert.alert("Error", error?.message || "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const currentLiked = localLikes[postId]?.liked ?? false;
      const currentCount = localLikes[postId]?.count ?? 0;

      setLocalLikes((prev) => ({
        ...prev,
        [postId]: {
          liked: !currentLiked,
          count: currentLiked ? currentCount - 1 : currentCount + 1,
        },
      }));

      await toggleLike(postId);
      await Promise.all([fetchHomePosts(), fetchMyPosts()]);
    } catch (error: any) {
      setLocalLikes((prev) => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
      Alert.alert("Error", error?.message || "No se pudo dar like");
    }
  };

  // =========================================================
  // COMENTARIOS
  // =========================================================
  const openCommentModal = (post: PostWithComments) => {
    setActivePost(post);
    setLocalComments(post.comments || []);
    setCommentText("");
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activePost) return;

    try {
      const newComment = await addComment(activePost.id, commentText.trim());
      setLocalComments((prev) => [newComment, ...prev]);
      setCommentText("");
      await Promise.all([fetchHomePosts(), fetchMyPosts()]);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setActivePost(null);
    setLocalComments([]);
    setCommentText("");
  };

  // =========================================================
  // RESET MODALS
  // =========================================================
  const resetServiceModal = () => {
    setServiceModalVisible(false);
    setEditingService(null);
    setServiceName("");
    setServiceDescription("");
    setServicePrice("");
    setServiceDuration("");
  };

  const resetPostModal = () => {
    setPostModalVisible(false);
    setEditingPost(null);
    setPostTitle("");
    setPostContent("");
    setPostCategory("general");
  };

  // =========================================================
  // RENDER COMENTARIO
  // =========================================================
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.commentAuthor, { color: colors.blue }]}>
        {item.user?.name || "Usuario"}
      </Text>
      <Text style={[styles.commentContent, { color: colors.text }]}>
        {item.content}
      </Text>
      <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
        {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
      </Text>
    </View>
  );

  // =========================================================
  // RENDER POST
  // =========================================================
  const renderPost = ({ item }: { item: any }) => {
    const likeState = localLikes[item.id] || {
      liked: item.liked || false,
      count: item.likes_count || 0,
    };

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleToggleLike(item.id)}
              style={styles.actionButton}
            >
              <Ionicons
                name={likeState.liked ? "heart" : "heart-outline"}
                size={20}
                color={likeState.liked ? colors.danger : colors.secondaryText}
              />
              <Text
                style={[
                  styles.likeCount,
                  {
                    color: likeState.liked
                      ? colors.danger
                      : colors.secondaryText,
                  },
                ]}
              >
                {likeState.count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openCommentModal(item)}
              style={styles.actionButton}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.blue}
              />
              <Text style={[styles.commentCount, { color: colors.blue }]}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setEditingPost(item);
                setPostTitle(item.title);
                setPostContent(item.content);
                setPostCategory(item.category || "general");
                setPostModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={20} color={colors.blue} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
              <Ionicons name="trash" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[styles.cardDescription, { color: colors.secondaryText }]}
          numberOfLines={3}
        >
          {item.content}
        </Text>

        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}

        <Text style={[styles.dateText, { color: colors.secondaryText }]}>
          📅 {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  // =========================================================
  // RENDER LISTA SERVICIOS
  // =========================================================
  const renderServicesList = () => {
    if (servicesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.blue} />
        </View>
      );
    }

    if (services && services.length > 0) {
      return services.map((s: any) => (
        <View
          key={s.id}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {s.name}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditingService(s);
                  setServiceName(s.name);
                  setServiceDescription(s.description || "");
                  setServicePrice(s.price?.toString() || "");
                  setServiceDuration(s.duration?.toString() || "");
                  setServiceModalVisible(true);
                }}
              >
                <Ionicons name="pencil" size={20} color={colors.blue} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteService(s.id)}>
                <Ionicons name="trash" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={[styles.cardDescription, { color: colors.secondaryText }]}
          >
            {s.description}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.price}>${s.price}</Text>
            {s.duration && (
              <Text style={[styles.duration, { color: colors.secondaryText }]}>
                ⏱ {s.duration} min
              </Text>
            )}
          </View>
        </View>
      ));
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="briefcase-outline"
          size={50}
          color={colors.secondaryText}
        />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          No tienes servicios aún
        </Text>
      </View>
    );
  };

  // =========================================================
  // RENDER CONTENIDO SEGÚN TAB
  // =========================================================
  const renderContent = () => {
    if (tab === "perfil") {
      return (
        <View style={styles.formContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Nombre"
            placeholderTextColor={colors.placeholder}
            value={form.first_name}
            onChangeText={(t) => setForm({ ...form, first_name: t })}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Apellido"
            placeholderTextColor={colors.placeholder}
            value={form.last_name}
            onChangeText={(t) => setForm({ ...form, last_name: t })}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Especialidad"
            placeholderTextColor={colors.placeholder}
            value={form.specialty}
            onChangeText={(t) => setForm({ ...form, specialty: t })}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Teléfono"
            placeholderTextColor={colors.placeholder}
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Teléfono de oficina"
            placeholderTextColor={colors.placeholder}
            value={form.office_phone}
            onChangeText={(t) => setForm({ ...form, office_phone: t })}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Ciudad"
            placeholderTextColor={colors.placeholder}
            value={form.city}
            onChangeText={(t) => setForm({ ...form, city: t })}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Universidad"
            placeholderTextColor={colors.placeholder}
            value={form.university}
            onChangeText={(t) => setForm({ ...form, university: t })}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Código de licencia"
            placeholderTextColor={colors.placeholder}
            value={form.license_code}
            onChangeText={(t) => setForm({ ...form, license_code: t })}
          />
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Descripción"
            placeholderTextColor={colors.placeholder}
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Horario (ej: L-V 9:00-18:00)"
            placeholderTextColor={colors.placeholder}
            value={form.schedule}
            onChangeText={(t) => setForm({ ...form, schedule: t })}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading ? "Guardando..." : "💾 Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (tab === "services") {
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.blue }]}
            onPress={() => {
              setEditingService(null);
              setServiceName("");
              setServiceDescription("");
              setServicePrice("");
              setServiceDuration("");
              setServiceModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={colors.blue} />
            <Text style={[styles.addButtonText, { color: colors.blue }]}>
              Agregar servicio
            </Text>
          </TouchableOpacity>

          {renderServicesList()}
        </View>
      );
    }

    if (tab === "posts") {
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.blue }]}
            onPress={() => {
              setEditingPost(null);
              setPostTitle("");
              setPostContent("");
              setPostCategory("general");
              setPostModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={colors.blue} />
            <Text style={[styles.addButtonText, { color: colors.blue }]}>
              Crear post
            </Text>
          </TouchableOpacity>

          {loadingMyPosts ? (
            <ActivityIndicator size="small" color={colors.blue} />
          ) : myPosts && myPosts.length > 0 ? (
            myPosts.map((item) => (
              <React.Fragment key={item.id.toString()}>
                {renderPost({ item })}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="newspaper-outline"
                size={50}
                color={colors.secondaryText}
              />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No tienes posts aún
              </Text>
            </View>
          )}
        </View>
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (!lawyer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  // =========================================================
  // RENDER PRINCIPAL
  // =========================================================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.avatarContainer}
            disabled={uploadingAvatar}
          >
            <Image
              key={form.image || lawyer.image}
              source={{
                uri:
                  form.image ||
                  lawyer.image ||
                  "https://picsum.photos/seed/lawyer/200",
              }}
              style={styles.avatar}
            />
            {uploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {form.first_name} {form.last_name}
            </Text>
            <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
              {form.specialty || "Especialidad no especificada"}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text
                style={[styles.ratingText, { color: colors.secondaryText }]}
              >
                {lawyer?.rating || 0} / 5
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          {["perfil", "services", "posts"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabButton,
                tab === t && { backgroundColor: colors.blue + "15" },
              ]}
            >
              <Text
                style={
                  tab === t
                    ? [styles.activeTab, { color: colors.blue }]
                    : [styles.tab, { color: colors.secondaryText }]
                }
              >
                {t === "perfil"
                  ? "PERFIL"
                  : t === "services"
                  ? "SERVICIOS"
                  : "POSTS"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* FAB */}
      {(tab === "services" || tab === "posts") && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.blue }]}
          onPress={() => {
            if (tab === "services") {
              setEditingService(null);
              setServiceName("");
              setServiceDescription("");
              setServicePrice("");
              setServiceDuration("");
              setServiceModalVisible(true);
            } else {
              setEditingPost(null);
              setPostTitle("");
              setPostContent("");
              setPostCategory("general");
              setPostModalVisible(true);
            }
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue}
            colors={[colors.blue]}
          />
        }
      >
        {renderContent()}
      </ScrollView>

      {/* MODAL SERVICIO */}
      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetServiceModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={[styles.modalContainer, { backgroundColor: colors.card }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingService ? "✏️ Editar servicio" : "➕ Nuevo servicio"}
                </Text>
                <TouchableOpacity onPress={resetServiceModal}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Nombre del servicio"
                placeholderTextColor={colors.placeholder}
                value={serviceName}
                onChangeText={setServiceName}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  styles.textArea,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Descripción"
                placeholderTextColor={colors.placeholder}
                value={serviceDescription}
                onChangeText={setServiceDescription}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Precio ($)"
                placeholderTextColor={colors.placeholder}
                value={servicePrice}
                onChangeText={setServicePrice}
                keyboardType="numeric"
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Duración (minutos)"
                placeholderTextColor={colors.placeholder}
                value={serviceDuration}
                onChangeText={setServiceDuration}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={resetServiceModal}
                >
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveModalButton,
                    { backgroundColor: colors.blue },
                  ]}
                  onPress={handleCreateService}
                >
                  <Text style={styles.modalButtonText}>
                    {editingService ? "Actualizar" : "Crear"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL POST */}
      <Modal
        visible={postModalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetPostModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={[styles.modalContainer, { backgroundColor: colors.card }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingPost ? "✏️ Editar post" : "➕ Nuevo post"}
                </Text>
                <TouchableOpacity onPress={resetPostModal}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Título del post"
                placeholderTextColor={colors.placeholder}
                value={postTitle}
                onChangeText={setPostTitle}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  styles.textArea,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Contenido del post"
                placeholderTextColor={colors.placeholder}
                value={postContent}
                onChangeText={setPostContent}
                multiline
                numberOfLines={5}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={resetPostModal}
                >
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveModalButton,
                    { backgroundColor: colors.blue },
                  ]}
                  onPress={handleCreatePost}
                >
                  <Text style={styles.modalButtonText}>
                    {editingPost ? "Actualizar" : "Crear"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL COMENTARIOS */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCommentModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: colors.card, maxHeight: "80%" },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  💬 Comentarios
                </Text>
                <TouchableOpacity onPress={closeCommentModal}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {activePost && (
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.secondaryText },
                  ]}
                >
                  {activePost.title}
                </Text>
              )}

              <FlatList
                data={localComments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderComment}
                contentContainerStyle={styles.commentsList}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.emptyComments,
                      { color: colors.secondaryText },
                    ]}
                  >
                    No hay comentarios aún. ¡Sé el primero!
                  </Text>
                }
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={true}
              />

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor={colors.placeholder}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendCommentButton,
                    {
                      backgroundColor: commentText.trim()
                        ? colors.blue
                        : colors.secondaryText,
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
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 100 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: { paddingVertical: 20, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },

  header: {
    paddingTop: Platform.OS === "android" ? 55 : 25,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  avatarContainer: { position: "relative", marginRight: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold" },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  ratingText: { fontSize: 14 },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tab: { fontSize: 14, fontWeight: "500" },
  activeTab: { fontSize: 14, fontWeight: "700" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },

  formContainer: { padding: 16 },
  input: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  saveBtn: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  tabContent: { padding: 16, paddingBottom: 40 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: { fontSize: 15, fontWeight: "600" },

  card: { marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  cardActions: { flexDirection: "row", gap: 12, alignItems: "center" },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardDescription: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: { fontWeight: "bold", color: "#3B82F6", fontSize: 16 },
  duration: { fontSize: 13 },
  categoryBadge: {
    backgroundColor: "#3B82F620",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  categoryText: { color: "#3B82F6", fontSize: 12, fontWeight: "500" },
  dateText: { fontSize: 12, marginTop: 6 },
  likeCount: { fontSize: 12, fontWeight: "500" },
  commentCount: { fontSize: 12, fontWeight: "500" },

  emptyContainer: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: { width: "100%", padding: 20, borderRadius: 16, gap: 12 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center", flex: 1 },
  modalSubtitle: { fontSize: 14, textAlign: "center", marginBottom: 8 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelModalButton: { backgroundColor: "#E5E7EB" },
  saveModalButton: { backgroundColor: "#3B82F6" },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  commentsList: { paddingVertical: 8 },
  commentItem: { paddingVertical: 10, borderBottomWidth: 1 },
  commentAuthor: { fontWeight: "bold", fontSize: 14 },
  commentContent: { fontSize: 14, marginTop: 2 },
  commentDate: { fontSize: 10, marginTop: 2 },
  emptyComments: { textAlign: "center", paddingVertical: 20, fontSize: 14 },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },
  sendCommentButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
});