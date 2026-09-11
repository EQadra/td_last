import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useAssociations } from "../../../context/AssociationContext";
import { useAuth } from "../../../context/AuthContext";
import { useComments } from "../../../context/CommentContext";
import { usePosts } from "../../../context/PostContext";
import { useServices } from "../../../context/ServiceContext";
import api from "../../../utils/axios";

export default function AssociationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { fetchAssociationById } = useAssociations();
  const { createPost, toggleLike } = usePosts();
  const { createService } = useServices();

  const {
    loading: commentsLoading,
    fetchPostComments,
    createPostComment,
    deletePostComment,
    fetchProductComments,
    createProductComment,
    deleteProductComment,
  } = useComments();

  const [association, setAssociation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [isOwner, setIsOwner] = useState(false);
  
  // Estados para el carrito
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState<{product: any, quantity: number}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Estados para comentarios
  const [commentText, setCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentingProductId, setCommentingProductId] = useState<number | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<{type: 'post' | 'product', id: number} | null>(null);
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [productComments, setProductComments] = useState<Record<number, any[]>>({});
  
  // Modal para agregar comentario
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentModalType, setCommentModalType] = useState<'post' | 'product' | null>(null);
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

  // Número de WhatsApp de la asociación
  const WHATSAPP_NUMBER = "+51933933002";

  // ✅ VERIFICAR SI EL USUARIO ES DUEÑO DE LA ASOCIACIÓN
  useEffect(() => {
    if (user && association) {
      setIsOwner(user.id === association.user_id);
    }
  }, [user, association]);

  useEffect(() => {
    const loadAssociation = async () => {
      const associationId = Array.isArray(id) ? id[0] : id;
      console.log("🔄 Cargando asociación ID:", associationId);
      
      try {
        const data = await fetchAssociationById(Number(associationId));
        console.log("📦 Data recibida:", data);
        
        if (data) {
          setAssociation(data);
        } else {
          console.log("❌ No se encontró la asociación");
        }
      } catch (error) {
        console.error("❌ Error cargando asociación:", error);
        Alert.alert("Error", "No se pudo cargar la asociación");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadAssociation();
  }, [id]);

  const rating = useMemo(() => {
    if (!association?.feedbacks?.length) return 0;
    const total = association.feedbacks.reduce((acc: number, f: any) => acc + Number(f.rating), 0);
    return total / association.feedbacks.length;
  }, [association]);

  // ==================== REFRESH ====================
  const onRefresh = async () => {
    setRefreshing(true);
    const associationId = Array.isArray(id) ? id[0] : id;
    try {
      const data = await fetchAssociationById(Number(associationId));
      if (data) setAssociation(data);
    } catch (error) {
      console.error("❌ Error refrescando:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ==================== FUNCIONES DEL CARRITO ====================
  const addToCart = (product: any) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setQuantityModalVisible(true);
  };

  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === selectedProduct.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === selectedProduct.id 
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      }
      return [...prev, { product: selectedProduct, quantity: selectedQuantity }];
    });
    
    setQuantityModalVisible(false);
    setSelectedProduct(null);
    setSelectedQuantity(1);
    Alert.alert("Éxito", `Producto agregado al carrito`);
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  };

  const sendOrderToWhatsApp = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Error", "El carrito está vacío");
      return;
    }

    try {
      let phoneNumber = association.phone || WHATSAPP_NUMBER;
      phoneNumber = phoneNumber.replace(/\D/g, '');

      if (phoneNumber.length === 9) {
        phoneNumber = `51${phoneNumber}`;
      }

      if (!phoneNumber || phoneNumber.length < 9) {
        phoneNumber = "51933933002";
      }

      let message = `🛒 *Pedido para ${association.name}*\n\n`;
      message += `📋 *Productos:*\n`;
      
      cartItems.forEach((item, index) => {
        message += `${index + 1}. ${item.product.name} x${item.quantity} - S/ ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\n💰 *Total: S/ ${getCartTotal().toFixed(2)}*\n`;
      message += `\n📞 *Teléfono de contacto:* [Tu número aquí]\n`;
      message += `\n📍 *Asociación:* ${association.name}\n`;
      message += `\n¡Gracias por tu pedido! 🙌`;

      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      await Linking.openURL(url);
      setCartItems([]);
      setCartModalVisible(false);
      Alert.alert("Éxito", "Pedido enviado correctamente");
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      Alert.alert("Error", "No fue posible abrir WhatsApp");
    }
  };

  // ============================================================
  // ✅ FUNCIONES PARA CREAR POST - CORREGIDAS
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
      console.log('📸 Imagen seleccionada para post:', {
        uri: result.assets[0].uri,
      });
      setPostImage(result.assets[0].uri);
    }
  };

  ///////////////// FUNCION CORREGIDA DE CREATEPOST EN DETAIL VIEW //////////////////
// ✅ HANDLE CREATE POST - CORREGIDO DEFINITIVO
const handleCreatePost = async () => {
  if (!postTitle.trim() || !postContent.trim()) {
    Alert.alert("Error", "Título y contenido son obligatorios");
    return;
  }

  // ✅ VERIFICAR QUE TENEMOS LA ASOCIACIÓN CON ID
  if (!association || !association.id) {
    Alert.alert("Error", "No se encontró la asociación o no tiene ID");
    console.log('❌ association:', association);
    return;
  }

  setIsSubmittingPost(true);

  try {
    const payload: any = {
      title: postTitle.trim(),
      content: postContent.trim(),
      postable_type: 'App\\Models\\Association',
      postable_id: association.id,
    };

    if (postCategory.trim()) {
      payload.category = postCategory.trim();
    }

    // ✅ MANEJO DE IMAGEN - ENVIAR COMO OBJETO { uri, name, type }
    if (postImage) {
      // Obtener el nombre del archivo desde el URI
      const uriParts = postImage.split('/');
      let fileName = uriParts[uriParts.length - 1] || 'post.jpg';
      
      // Detectar la extensión para el MIME type correcto
      const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'gif') mimeType = 'image/gif';
      
      // ✅ ENVIAR COMO OBJETO - ESTO ES LO QUE ESPERA EL CONTEXT
      payload.image = {
        uri: postImage,      // El URI del archivo
        name: fileName,      // El nombre del archivo
        type: mimeType,      // El tipo MIME correcto
      };
    }

    console.log('📤 Enviando post:', {
      title: payload.title,
      hasImage: !!payload.image,
      imageType: payload.image ? typeof payload.image : 'none',
      imageObj: payload.image,
      postable_id: payload.postable_id,
      postable_type: payload.postable_type,
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
  // ✅ FUNCIONES PARA CREAR SERVICIO - CORREGIDAS
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
      console.log('📸 Imagen seleccionada para servicio:', {
        uri: result.assets[0].uri,
      });
      setServiceImage(result.assets[0].uri);
    }
  };

  // ✅ HANDLE CREATE SERVICE - CORREGIDO
  const handleCreateService = async () => {
    if (!serviceName.trim() || !servicePrice) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    const profile = association;
    if (!profile || !profile.id) {
      Alert.alert("Error", "No se encontró el perfil de la asociación");
      return;
    }

    setIsSubmittingService(true);

    try {
      const payload: any = {
        name: serviceName.trim(),
        description: serviceDescription.trim() || undefined,
        price: parseFloat(servicePrice),
        duration: serviceDuration ? parseInt(serviceDuration) : undefined,
        serviceable_type: 'App\\Models\\Association',
        serviceable_id: profile.id,
      };

      // ✅ MANEJO DE IMAGEN - COPIA EXACTA DE PostsScreen
      if (serviceImage) {
        if (serviceImage.startsWith('file://')) {
          payload.image = {
            uri: serviceImage,
            name: 'service.jpg',
            type: 'image/jpeg',
          };
        } else if (serviceImage.startsWith('http')) {
          payload.image = serviceImage;
        } else {
          payload.image = {
            uri: serviceImage,
            name: 'service.jpg',
            type: 'image/jpeg',
          };
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
      setPostComments(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  };

  const loadProductComments = async (productId: number) => {
    try {
      const data = await fetchProductComments(productId);
      setProductComments(prev => ({ ...prev, [productId]: data }));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  };

  const openCommentModal = (type: 'post' | 'product', id: number) => {
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
      if (commentModalType === 'post') {
        const newComment = await createPostComment(commentModalId, commentModalText);
        setPostComments(prev => ({
          ...prev,
          [commentModalId!]: [newComment, ...(prev[commentModalId!] || [])]
        }));
      } else {
        const newComment = await createProductComment(commentModalId, commentModalText);
        setProductComments(prev => ({
          ...prev,
          [commentModalId!]: [newComment, ...(prev[commentModalId!] || [])]
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
      await api.post('/feedbacks', {
        feedbackable_type: 'App\\Models\\Association',
        feedbackable_id: association.id,
        rating: feedbackRating,
        comment: feedbackComment
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
              setPostComments(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
              }));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          }
        }
      ]
    );
  };

  const handleDeleteProductComment = async (commentId: number, productId: number) => {
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
              await deleteProductComment(commentId);
              setProductComments(prev => ({
                ...prev,
                [productId]: (prev[productId] || []).filter(c => c.id !== commentId)
              }));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          }
        }
      ]
    );
  };

  const toggleComments = async (type: 'post' | 'product', id: number) => {
    if (showCommentsFor?.type === type && showCommentsFor?.id === id) {
      setShowCommentsFor(null);
    } else {
      setShowCommentsFor({ type, id });
      if (type === 'post') {
        await loadPostComments(id);
      } else {
        await loadProductComments(id);
      }
    }
  };

  // ==================== RENDER: SECCIÓN DE COMENTARIOS ====================
  const CommentSection = ({ 
    comments, 
    onDeleteComment,
    type,
    itemId
  }: { 
    comments: any[];
    onDeleteComment: (id: number) => void;
    type: 'post' | 'product';
    itemId: number;
  }) => {
    if (commentsLoading) {
      return <ActivityIndicator size="small" color="#00B272" />;
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
                  <Text style={styles.commentAuthor}>
                    {comment.user?.name || "Usuario"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onDeleteComment(comment.id)}
                  style={styles.deleteCommentBtn}
                >
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
        
        <TouchableOpacity
          style={styles.addCommentBtn}
          onPress={() => openCommentModal(type, itemId)}
        >
          <Text style={styles.addCommentText}>+ Agregar comentario</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>Cargando asociación...</Text>
      </View>
    );
  }

  if (!association) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#64748B" }}>Asociación no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B272" />
        }
      >
        {/* HEADER */}
        <View style={styles.headerCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: association.image || "https://tudealer.app/avatar/avatar_association.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>{association.name}</Text>
          <Text style={styles.specialty}>📍 {association.city}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.sub}>📞 {association.phone || "No disponible"}</Text>
            <Text style={styles.sub}>🌐 {association.website || "No disponible"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>🏠 {association.address || "No disponible"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>👤 {association.user?.name || "No disponible"}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>
              ({association.feedbacks?.length || 0} reseñas)
            </Text>
          </View>

          {/* ✅ BOTONES DE ACCIÓN PARA EL DUEÑO */}
          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={[styles.ownerButton, { backgroundColor: "#00B272" }]}
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
          {["perfil", "posts", "productos", "servicios", "feedbacks"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>
                {tab === "perfil" ? "Perfil" : 
                 tab === "posts" ? "Posts" : 
                 tab === "productos" ? "Productos" : 
                 tab === "servicios" ? "Servicios" : "Opiniones"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PERFIL */}
        {activeTab === "perfil" && (
          <View style={styles.card}>
            <Text style={styles.title}>Descripción</Text>
            <Text style={styles.text}>{association.description || "Sin descripción"}</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Ciudad</Text>
                <Text style={styles.infoValue}>{association.city || "-"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞 Teléfono</Text>
                <Text style={styles.infoValue}>{association.phone || "-"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🌐 Website</Text>
                <Text style={styles.infoValue}>{association.website || "-"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Dirección</Text>
                <Text style={styles.infoValue}>{association.address || "-"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* POSTS */}
        {activeTab === "posts" && (
          <View>
            {association.posts && association.posts.length > 0 ? (
              association.posts.map((post: any) => (
                <View key={post.id} style={styles.card}>
                  {post.image && (
                    <Image
                      source={{ uri: post.image }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.title}>{post.title}</Text>
                  <Text style={styles.text}>{post.short_content || post.content}</Text>
                  
                  <TouchableOpacity
                    style={styles.commentToggleBtn}
                    onPress={() => toggleComments('post', post.id)}
                  >
                    <Text style={styles.commentToggleText}>
                      {showCommentsFor?.type === 'post' && showCommentsFor?.id === post.id
                        ? "Ocultar comentarios"
                        : `Ver comentarios (${postComments[post.id]?.length || 0})`}
                    </Text>
                  </TouchableOpacity>

                  {showCommentsFor?.type === 'post' && showCommentsFor?.id === post.id && (
                    <CommentSection
                      comments={postComments[post.id] || []}
                      onDeleteComment={(commentId) => handleDeletePostComment(commentId, post.id)}
                      type="post"
                      itemId={post.id}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Esta asociación no tiene posts aún</Text>
              </View>
            )}
          </View>
        )}

        {/* PRODUCTOS */}
        {activeTab === "productos" && (
          <View>
            <TouchableOpacity
              style={[styles.cartButton, styles.cartButtonFloat]}
              onPress={() => setCartModalVisible(true)}
            >
              <Ionicons name="cart" size={24} color="#fff" />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
              <Text style={styles.cartButtonText}>Ver Carrito</Text>
            </TouchableOpacity>

            {association.products && association.products.length > 0 ? (
              association.products.map((product: any) => (
                <View key={product.id} style={styles.card}>
                  {product.image && (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.title}>{product.name}</Text>
                  <Text style={styles.text}>{product.description}</Text>
                  <Text style={styles.price}>S/ {Number(product.price).toFixed(2)}</Text>
                  
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addToCartText}>Agregar al carrito</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.commentToggleBtn}
                    onPress={() => toggleComments('product', product.id)}
                  >
                    <Text style={styles.commentToggleText}>
                      {showCommentsFor?.type === 'product' && showCommentsFor?.id === product.id
                        ? "Ocultar comentarios"
                        : `Ver comentarios (${productComments[product.id]?.length || 0})`}
                    </Text>
                  </TouchableOpacity>

                  {showCommentsFor?.type === 'product' && showCommentsFor?.id === product.id && (
                    <CommentSection
                      comments={productComments[product.id] || []}
                      onDeleteComment={(commentId) => handleDeleteProductComment(commentId, product.id)}
                      type="product"
                      itemId={product.id}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Esta asociación no tiene productos aún</Text>
              </View>
            )}
          </View>
        )}

        {/* SERVICIOS */}
        {activeTab === "servicios" && (
          <View>
            {association.services && association.services.length > 0 ? (
              association.services.map((service: any) => (
                <View key={service.id} style={styles.card}>
                  {service.image && (
                    <Image
                      source={{ uri: service.image }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.title}>{service.name}</Text>
                  <Text style={styles.text}>{service.description}</Text>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.price}>S/ {Number(service.price).toFixed(2)}</Text>
                    {service.duration && (
                      <Text style={styles.duration}>⏱ {service.duration} min</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Esta asociación no tiene servicios aún</Text>
              </View>
            )}
          </View>
        )}

        {/* FEEDBACKS */}
        {activeTab === "feedbacks" && (
          <View>
            <TouchableOpacity
              style={[styles.btn, styles.addFeedbackBtn]}
              onPress={() => setFeedbackModalVisible(true)}
            >
              <Text style={styles.btnText}>+ Agregar reseña</Text>
            </TouchableOpacity>

            {association.feedbacks && association.feedbacks.length > 0 ? (
              association.feedbacks.map((f: any) => (
                <View key={f.id} style={styles.card}>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.commentUserInfo}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {f.user?.name?.charAt(0) || "U"}
                        </Text>
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

      {/* MODAL DE CANTIDAD */}
      <Modal visible={quantityModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.quantityModal}>
            <Text style={styles.modalTitle}>Seleccionar cantidad</Text>
            <Text style={styles.quantityProductName}>{selectedProduct?.name}</Text>
            
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
              >
                <Text style={styles.quantityBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{selectedQuantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setSelectedQuantity(selectedQuantity + 1)}
              >
                <Text style={styles.quantityBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.quantityPrice}>
              Total: S/ {(parseFloat(selectedProduct?.price || 0) * selectedQuantity).toFixed(2)}
            </Text>

            <View style={styles.commentModalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelModalBtn]}
                onPress={() => {
                  setQuantityModalVisible(false);
                  setSelectedProduct(null);
                  setSelectedQuantity(1);
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn}
                onPress={confirmAddToCart}
              >
                <Text style={styles.btnText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DEL CARRITO */}
      <Modal visible={cartModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.cartModalContent]}>
            <View style={styles.cartHeader}>
              <Text style={styles.modalTitle}>🛒 Carrito de compras</Text>
              <TouchableOpacity
                onPress={() => setCartModalVisible(false)}
                style={styles.closeCartBtn}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={60} color="#ccc" />
                <Text style={styles.emptyCartText}>Tu carrito está vacío</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cartItems}
                  keyExtractor={(item) => item.product.id.toString()}
                  style={styles.cartList}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Image
                        source={{ uri: item.product.image || "https://picsum.photos/60" }}
                        style={styles.cartItemImage}
                      />
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName} numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.cartItemPrice}>
                          S/ {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </Text>
                        <View style={styles.cartItemQuantity}>
                          <TouchableOpacity
                            style={styles.cartQtyBtn}
                            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Text style={styles.cartQtyBtnText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.cartQtyText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.cartQtyBtn}
                            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Text style={styles.cartQtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.cartRemoveBtn}
                        onPress={() => removeFromCart(item.product.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  )}
                />

                <View style={styles.cartFooter}>
                  <View style={styles.cartTotalRow}>
                    <Text style={styles.cartTotalLabel}>Total:</Text>
                    <Text style={styles.cartTotalValue}>S/ {getCartTotal().toFixed(2)}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.whatsappBtn}
                    onPress={sendOrderToWhatsApp}
                  >
                    <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                    <Text style={styles.whatsappBtnText}>Enviar pedido por WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL - Agregar comentario */}
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
              <TouchableOpacity
                style={styles.btn}
                onPress={submitCommentFromModal}
              >
                <Text style={styles.btnText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL - Agregar Feedback */}
      <Modal visible={feedbackModalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={[styles.modalContent, styles.commentModalContent]}>
            <Text style={styles.modalTitle}>Calificar a {association.name}</Text>
            
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFeedbackRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[
                    styles.starText,
                    feedbackRating >= star && styles.starActive
                  ]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>
              {feedbackRating > 0 ? `${feedbackRating} estrella${feedbackRating > 1 ? 's' : ''}` : 'Selecciona una calificación'}
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
              <TouchableOpacity
                style={styles.btn}
                onPress={submitFeedback}
                disabled={submittingFeedback}
              >
                <Text style={styles.btnText}>
                  {submittingFeedback ? 'Enviando...' : 'Enviar reseña'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL - CREAR POST */}
      <Modal visible={createPostModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContent, styles.editModalContainer]}>
              <View style={styles.editModalHeader}>
                <Text style={styles.modalTitle}>📝 Crear Post</Text>
                <TouchableOpacity onPress={() => setCreatePostModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.input}
                  placeholder="Título del post *"
                  placeholderTextColor="#999"
                  value={postTitle}
                  onChangeText={setPostTitle}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Contenido *"
                  placeholderTextColor="#999"
                  value={postContent}
                  onChangeText={setPostContent}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Categoría (opcional)"
                  placeholderTextColor="#999"
                  value={postCategory}
                  onChangeText={setPostCategory}
                />

                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickPostImage}
                >
                  <Ionicons name="image-outline" size={24} color="#00B272" />
                  <Text style={styles.imagePickerText}>
                    {postImage ? "🔄 Cambiar imagen" : "📷 Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {postImage && (
                  <Image source={{ uri: postImage }} style={styles.previewImage} />
                )}

                <View style={styles.commentModalActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelModalBtn]}
                    onPress={() => {
                      setCreatePostModalVisible(false);
                      setPostTitle("");
                      setPostContent("");
                      setPostImage(null);
                      setPostCategory("");
                    }}
                  >
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.submitBtn]}
                    onPress={handleCreatePost}
                    disabled={!postTitle.trim() || !postContent.trim() || isSubmittingPost}
                  >
                    <Text style={styles.btnText}>
                      {isSubmittingPost ? "Creando..." : "Publicar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ✅ MODAL - CREAR SERVICIO */}
      <Modal visible={createServiceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContent, styles.editModalContainer]}>
              <View style={styles.editModalHeader}>
                <Text style={styles.modalTitle}>💼 Crear Servicio</Text>
                <TouchableOpacity onPress={() => setCreateServiceModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del servicio *"
                  placeholderTextColor="#999"
                  value={serviceName}
                  onChangeText={setServiceName}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción"
                  placeholderTextColor="#999"
                  value={serviceDescription}
                  onChangeText={setServiceDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.rowInput]}
                    placeholder="Precio *"
                    placeholderTextColor="#999"
                    value={servicePrice}
                    onChangeText={setServicePrice}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.rowInput]}
                    placeholder="Duración (min)"
                    placeholderTextColor="#999"
                    value={serviceDuration}
                    onChangeText={setServiceDuration}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickServiceImage}
                >
                  <Ionicons name="image-outline" size={24} color="#00B272" />
                  <Text style={styles.imagePickerText}>
                    {serviceImage ? "🔄 Cambiar imagen" : "📷 Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {serviceImage && (
                  <Image source={{ uri: serviceImage }} style={styles.previewImage} />
                )}

                <View style={styles.commentModalActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelModalBtn]}
                    onPress={() => {
                      setCreateServiceModalVisible(false);
                      setServiceName("");
                      setServiceDescription("");
                      setServicePrice("");
                      setServiceDuration("");
                      setServiceImage(null);
                    }}
                  >
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.submitBtn]}
                    onPress={handleCreateService}
                    disabled={!serviceName.trim() || !servicePrice || isSubmittingService}
                  >
                    <Text style={styles.btnText}>
                      {isSubmittingService ? "Creando..." : "Crear Servicio"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
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
  scrollContent: {
    paddingBottom: 30,
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
    borderColor: "#00B272",
    overflow: "hidden",
    marginBottom: 12,
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
    color: "#00B272",
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  rating: {
    color: "#FF9900",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingCount: {
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
    borderColor: "#00B272",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  tabActive: {
    backgroundColor: "#00B272",
  },
  tabText: {
    color: "#00B272",
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontSize: 13,
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
  price: {
    color: "#00B272",
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  duration: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  btn: {
    backgroundColor: "#00B272",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: "#00B272",
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
  addToCartBtn: {
    backgroundColor: "#00B272",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cartButtonFloat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00B272",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00B272",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  commentModalContent: {
    maxHeight: "60%",
  },
  cartModalContent: {
    maxHeight: "90%",
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
  },
  editModalContainer: {
    maxHeight: "90%",
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1A1A2E",
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
  keyboardView: {
    width: "100%",
  },
  quantityModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
  },
  quantityProductName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F7F4",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBtnText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00B272",
  },
  quantityText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A2E",
    minWidth: 40,
    textAlign: "center",
  },
  quantityPrice: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#00B272",
    marginBottom: 16,
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  closeCartBtn: {
    padding: 4,
  },
  cartList: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#00B272",
    fontWeight: "bold",
    marginTop: 2,
  },
  cartItemQuantity: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  cartQtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F7F4",
    alignItems: "center",
    justifyContent: "center",
  },
  cartQtyBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00B272",
  },
  cartQtyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
    minWidth: 24,
    textAlign: "center",
  },
  cartRemoveBtn: {
    padding: 8,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
    backgroundColor: "#fff",
  },
  cartTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  cartTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00B272",
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  whatsappBtn: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  whatsappBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#00B272",
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
    color: "#00B272",
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
    color: "#00B272",
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
    flexDirection: 'row',
    justifyContent: 'center',
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
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
    fontSize: 14,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#fff",
    marginBottom: 12,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#00B272",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 12,
    borderStyle: "dashed",
    backgroundColor: "#F0FDF4",
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#00B272",
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
  },
});