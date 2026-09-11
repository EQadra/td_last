// components/ProductList.tsx - VERSIÓN CORREGIDA
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useAuth } from "../../context/AuthContext";
import { useComments } from "../../context/CommentContext";
import { useFavorites } from "../../context/FavoriteContext";
import { useHistory } from "../../context/HistoryContext";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "./ProductCard";

interface ProductListProps {
  limit?: number;
  title?: string; // 👈 NUEVO: Título personalizable
  showAll?: boolean; // 👈 NUEVO: Mostrar botón "Ver todos"
  onViewAll?: () => void; // 👈 NUEVO: Callback para "Ver todos"
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock?: number;
  productable?: {
    name: string;
    id?: number;
  };
  whatsapp?: string;
  liked?: boolean;
  likes_count?: number;
}

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const ProductList = ({ 
  limit = 10, 
  title = "🛍️ Productos", 
  showAll = false,
  onViewAll 
}: ProductListProps) => {
  const { darkMode } = useDarkMode();
  const { 
    products, 
    loading, 
    fetchLatestProducts, // 👈 USAR ESTE MÉTODO
    fetchProducts 
  } = useProducts();
  const { user } = useAuth();
  const { 
    comments, 
    loading: commentsLoading, 
    fetchProductComments, 
    createProductComment,
    deleteProductComment 
  } = useComments();
  
  const { 
    toggleFavorite, 
    favorites,
    fetchMyFavorites 
  } = useFavorites();

  const { addHistory } = useHistory();

  // ============================================================
  // 🔥 ESTADOS LOCALES
  // ============================================================

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);
  const [favoriteMap, setFavoriteMap] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState("");
  const [productComments, setProductComments] = useState<Comment[]>([]);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [productForWhatsApp, setProductForWhatsApp] = useState<Product | null>(null);

  // ============================================================
  // 🎨 COLORES
  // ============================================================

  const colors = {
    background: darkMode ? "#020617" : "#f5f5f5",
    card: darkMode ? "#1E293B" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    primary: darkMode ? "#4ADE80" : "#00B272",
    inputBackground: darkMode ? "#1E293B" : "#F3F3F3",
    border: darkMode ? "#334155" : "#E5E5E5",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
    red: "#EF4444",
  };

  // ============================================================
  // 🔄 EFECTOS
  // ============================================================

  // 👈 IMPORTANTE: Cargar productos al montar el componente
  useEffect(() => {
    console.log("🔄 ProductList: Cargando productos...");
    fetchLatestProducts(); // 👈 USA fetchLatestProducts para los 5 más recientes
  }, []);

  // Cargar favoritos desde el backend
  useEffect(() => {
    loadFavoritesFromBackend();
  }, []);

  // Actualizar favoritos cuando cambien
  useEffect(() => {
    const map: Record<number, boolean> = {};
    favorites.forEach(fav => {
      if (fav.favoritable_type === 'App\\Models\\Product') {
        map[fav.favoritable_id] = true;
      }
    });
    setFavoriteMap(map);
  }, [favorites]);

  // ============================================================
  // 📥 FUNCIONES AUXILIARES
  // ============================================================

  const loadFavoritesFromBackend = async () => {
    try {
      await fetchMyFavorites();
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const isProductFavorited = (productId: number): boolean => {
    return favoriteMap[productId] || false;
  };

  // ============================================================
  // ⭐ FAVORITOS
  // ============================================================

  const handleToggleFavorite = async (productId: number) => {
    setFavoriteLoading(productId);
    
    try {
      const result = await toggleFavorite('product', productId);
      
      setFavoriteMap(prev => ({
        ...prev,
        [productId]: result.favorited
      }));

      await fetchMyFavorites();

      Alert.alert(
        result.favorited ? "❤️ Agregado a favoritos" : "💔 Eliminado de favoritos",
        result.message
      );
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", error?.message || "No se pudo actualizar favoritos");
    } finally {
      setFavoriteLoading(null);
    }
  };

  // ============================================================
  // 📄 DETALLE DEL PRODUCTO
  // ============================================================

  const openDetail = async (product: Product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
    
    try {
      await addHistory('product', product.id);
      console.log(`📊 Historial registrado: Producto ${product.id}`);
    } catch (error) {
      console.error("Error adding history:", error);
    }
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setSelectedProduct(null);
    setCommentText("");
  };

  // ============================================================
  // 💬 COMENTARIOS
  // ============================================================

  const loadProductComments = async (productId: number) => {
    try {
      await fetchProductComments(productId);
      setProductComments(comments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedProduct) return;

    try {
      const newComment = await createProductComment(selectedProduct.id, commentText.trim());
      setProductComments(prev => [newComment, ...prev]);
      setCommentText("");
      Alert.alert("✅ Comentario agregado", "Tu comentario ha sido publicado.");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Estás seguro de que quieres eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProductComment(commentId);
              setProductComments(prev => prev.filter(c => c.id !== commentId));
              Alert.alert("✅ Eliminado", "Comentario eliminado correctamente.");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          }
        }
      ]
    );
  };

  // ============================================================
  // 💬 WHATSAPP
  // ============================================================

  const openQuantityModal = (product: Product) => {
    setProductForWhatsApp(product);
    setQuantity("1");
    setQuantityModalVisible(true);
    
    try {
      addHistory('product', product.id);
      console.log(`📊 Historial registrado: WhatsApp abierto para producto ${product.id}`);
    } catch (error) {
      console.error("Error adding history:", error);
    }
  };

const sendToWhatsApp = async () => {
  if (!productForWhatsApp) return;

  try {
    await addHistory("product", productForWhatsApp.id);
    console.log(
      `📊 Historial registrado: WhatsApp enviado para producto ${productForWhatsApp.id}`
    );
  } catch (error) {
    console.error("Error adding history:", error);
  }

  try {
    // Obtener el número y eliminar espacios, +, -, etc.
    let phoneNumber = (productForWhatsApp.whatsapp || "").replace(/\D/g, "");

    // Si solo tiene 9 dígitos, asumir Perú (+51)
    if (phoneNumber.length === 9) {
      phoneNumber = `51${phoneNumber}`;
    }

    // Si no hay número, usar uno por defecto
    if (!phoneNumber) {
      phoneNumber = "51933933002";
    }

    const quantityNum = parseInt(quantity, 10) || 1;
    const totalPrice = (
      quantityNum * Number(productForWhatsApp.price)
    ).toFixed(2);

    const message = `Hola, estoy interesado en el producto: ${productForWhatsApp.name}

📦 Cantidad: ${quantityNum}
💰 Precio unitario: S/ ${productForWhatsApp.price}
💵 Total: S/ ${totalPrice}

📝 Por favor, confírmame disponibilidad.`;

    console.log("📱 Número WhatsApp:", phoneNumber);

    // Usar wa.me (más compatible en producción)
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    await Linking.openURL(url);

    setQuantityModalVisible(false);
  } catch (error) {
    console.error("Error opening WhatsApp:", error);

    Alert.alert(
      "Error",
      "No fue posible abrir WhatsApp. Verifica que esté instalado e inténtalo nuevamente."
    );
  }
};

  // ============================================================
  // 🖼️ RENDERIZADO
  // ============================================================

  const renderProductsGrid = () => {
    // 👈 IMPORTANTE: Usar los productos del contexto
    const displayProducts = products.slice(0, limit);
    
    console.log(`📊 Mostrando ${displayProducts.length} de ${products.length} productos`);
    
    if (displayProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={60} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No hay productos disponibles
          </Text>
        </View>
      );
    }

    const rows = [];
    const itemsPerRow = 2;

    for (let i = 0; i < displayProducts.length; i += itemsPerRow) {
      const rowItems = displayProducts.slice(i, i + itemsPerRow);
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPress={(product) => openDetail(product)}
              onWhatsApp={(product) => openQuantityModal(product)}
              showFavoriteButton={true}
              isFavorite={isProductFavorited(item.id)}
              onToggleFavorite={(productId) => handleToggleFavorite(productId)}
              loading={favoriteLoading === item.id}
            />
          ))}
          {rowItems.length === 1 && <View style={styles.emptyCard} />}
        </View>
      );
    }
    return rows;
  };

  const renderComments = () => {
    if (productComments.length === 0) {
      return (
        <View style={styles.noCommentsContainer}>
          <Ionicons name="chatbubble-outline" size={40} color={colors.secondaryText} />
          <Text style={[styles.noCommentsText, { color: colors.secondaryText }]}>
            No hay comentarios aún. ¡Sé el primero en comentar!
          </Text>
        </View>
      );
    }

    return productComments.map((comment) => (
      <View
        key={comment.id}
        style={[styles.commentContainer, { backgroundColor: colors.inputBackground }]}
      >
        <View style={styles.commentHeader}>
          <View style={styles.commentUser}>
            <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.commentAvatarText}>
                {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            <View>
              <Text style={[styles.commentUserName, { color: colors.text }]}>
                {comment.user?.name || "Usuario"}
              </Text>
              <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
                {new Date(comment.created_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
          
          {user?.id === comment.user?.id && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(comment.id)}
              style={styles.deleteCommentButton}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={[styles.commentContent, { color: colors.text }]}>
          {comment.content}
        </Text>
      </View>
    ));
  };

  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    const isFavorite = isProductFavorited(selectedProduct.id);
    const categoryName = selectedProduct.productable?.name || "Producto";
    const formattedDate = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeDetail} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(selectedProduct.id)}
                  style={styles.favoriteButton}
                  disabled={favoriteLoading === selectedProduct.id}
                >
                  {favoriteLoading === selectedProduct.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={28}
                      color={isFavorite ? "#EF4444" : colors.text}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={styles.modalScrollView}
              >
                <Image
                  source={{
                    uri: selectedProduct.image || "https://picsum.photos/seed/" + selectedProduct.id + "/400/400",
                  }}
                  style={styles.detailImage}
                  resizeMode="cover"
                />

                <View style={[styles.detailBadge, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.detailBadgeText, { color: colors.primary }]}>
                    {categoryName}
                  </Text>
                </View>

                <Text style={[styles.detailName, { color: colors.text }]}>
                  {selectedProduct.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={[styles.detailPrice, { color: colors.primary }]}>
                    S/ {selectedProduct.price}
                  </Text>
                  {selectedProduct.stock !== undefined && (
                    <View style={[styles.stockBadge, { backgroundColor: colors.inputBackground }]}>
                      <Ionicons name="cube-outline" size={16} color={colors.primary} />
                      <Text style={[styles.stockText, { color: colors.secondaryText }]}>
                        Stock: {selectedProduct.stock}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.detailDescription, { color: colors.secondaryText }]}>
                  {selectedProduct.description || "Sin descripción disponible"}
                </Text>

                <View style={[styles.detailInfo, { borderTopColor: colors.border }]}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color={colors.secondaryText} />
                    <Text style={[styles.infoText, { color: colors.secondaryText }]}>
                      Publicado: {formattedDate}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={20} color={colors.secondaryText} />
                    <Text style={[styles.infoText, { color: colors.secondaryText }]}>
                      Código: #{selectedProduct.id}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.whatsappButton, { backgroundColor: "#25D366" }]}
                  onPress={() => {
                    closeDetail();
                    openQuantityModal(selectedProduct);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.whatsappButtonText}>
                    Agregar al carrito 🛒
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.favoriteActionButton,
                    { 
                      backgroundColor: isFavorite ? "#EF4444" : colors.inputBackground,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleToggleFavorite(selectedProduct.id)}
                  disabled={favoriteLoading === selectedProduct.id}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorite ? "#FFFFFF" : colors.text}
                  />
                  <Text style={[
                    styles.favoriteActionText,
                    { color: isFavorite ? "#FFFFFF" : colors.text }
                  ]}>
                    {isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.commentsSection}>
                  <View style={styles.commentsHeader}>
                    <Text style={[styles.commentsTitle, { color: colors.text }]}>
                      💬 Comentarios ({productComments.length})
                    </Text>
                  </View>

                  {commentsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} style={styles.commentsLoader} />
                  ) : (
                    renderComments()
                  )}

                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={[
                        styles.commentInput,
                        {
                          backgroundColor: colors.inputBackground,
                          color: colors.text,
                          borderColor: colors.border,
                        }
                      ]}
                      placeholder="Escribe un comentario..."
                      placeholderTextColor={colors.secondaryText}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendCommentButton,
                        { 
                          backgroundColor: commentText.trim() ? colors.primary : colors.secondaryText,
                          opacity: commentText.trim() ? 1 : 0.5,
                        }
                      ]}
                      onPress={handleAddComment}
                      disabled={!commentText.trim() || commentsLoading}
                    >
                      <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  const renderQuantityModal = () => {
    if (!productForWhatsApp) return null;

    return (
      <Modal
        visible={quantityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.quantityOverlay}>
          <View style={[styles.quantityContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.quantityTitle, { color: colors.text }]}>
              {productForWhatsApp.name}
            </Text>
            <Text style={[styles.quantityPrice, { color: colors.primary }]}>
              S/ {productForWhatsApp.price} c/u
            </Text>

            <View style={styles.quantityInputContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.border }]}
                onPress={() => {
                  const current = parseInt(quantity) || 1;
                  if (current > 1) setQuantity(String(current - 1));
                }}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <TextInput
                style={[styles.quantityInput, { color: colors.text, borderColor: colors.border }]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                maxLength={3}
              />

              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.border }]}
                onPress={() => {
                  const current = parseInt(quantity) || 1;
                  setQuantity(String(current + 1));
                }}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.quantityTotal, { color: colors.secondaryText }]}>
              Total: S/ {(parseInt(quantity) || 1) * productForWhatsApp.price}
            </Text>

            <View style={styles.quantityActions}>
              <TouchableOpacity
                style={[styles.quantityCancelButton, { borderColor: colors.border }]}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text style={[styles.quantityCancelText, { color: colors.secondaryText }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quantityConfirmButton, { backgroundColor: "#25D366" }]}
                onPress={sendToWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <Text style={styles.quantityConfirmText}>
                  Enviar a WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ============================================================
  // 🔄 ESTADO DE CARGA
  // ============================================================

  if (loading && products.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  // ============================================================
  // 🖼️ RENDER PRINCIPAL
  // ============================================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <View style={styles.headerRight}>
          {favorites.length > 0 && (
            <TouchableOpacity 
              onPress={() => Alert.alert("Favoritos", `Tienes ${favorites.length} items en favoritos`)}
              style={styles.favoritesBadge}
            >
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.favoritesCount}>{favorites.length}</Text>
            </TouchableOpacity>
          )}
          {showAll && onViewAll && (
            <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.listContent}>
        {renderProductsGrid()}
      </View>

      {renderProductDetail()}
      {renderQuantityModal()}
    </View>
  );
};

// ============================================================
// 📝 ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  favoritesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  favoritesCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emptyCard: {
    width: "48%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: "95%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  detailImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  detailName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: "700",
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  stockText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailInfo: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  whatsappButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  favoriteActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  favoriteActionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  commentsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  commentsLoader: {
    marginVertical: 20,
  },
  noCommentsContainer: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 8,
  },
  noCommentsText: {
    fontSize: 14,
    textAlign: "center",
  },
  commentContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  commentUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  commentUserName: {
    fontWeight: "600",
    fontSize: 14,
  },
  commentDate: {
    fontSize: 11,
  },
  deleteCommentButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 42,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  quantityOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  quantityContainer: {
    width: "90%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  quantityTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  quantityPrice: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    width: 60,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  quantityTotal: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  quantityActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  quantityCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  quantityCancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityConfirmButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quantityConfirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ProductList;