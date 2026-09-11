import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../../../context/AuthContext";
import { useProducts } from "../../../../context/ProductContext";
import { useShops } from "../../../../context/ShopContext";
import { useDarkMode } from "../../../../context/app/DarkModeContext";

import api from "../../../../utils/axios";

export default function ShopScreen() {
  /* =========================================================
     DARK MODE
  ========================================================= */

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    border: darkMode ? "#1E293B" : "#E5E7EB",
    input: darkMode ? "#1E293B" : "#F3F4F6",
    modal: darkMode ? "#0F172A" : "#FFFFFF",
    button: "#16A34A",
    placeholder: darkMode ? "#94A3B8" : "#999999",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#facc15",
    overlay: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
  };

  /* =========================================================
     CONTEXTS
  ========================================================= */

  const { user, me, loading: authLoading, updateAvatar } = useAuth();
  const { createProduct, updateProduct, deleteProduct } = useProducts();
  const { shops, fetchShops, loading: shopsLoading } = useShops();

  /* =========================================================
     STATES
  ========================================================= */

  const [shop, setShop] = useState<any>(null);
  const [tab, setTab] = useState<"perfil" | "productos">("perfil");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    schedule: "",
  });

  /* =========================================================
     CREATE PRODUCT
  ========================================================= */

  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

  const [editModal, setEditModal] = useState(false);
  const [editProductState, setEditProductState] = useState<any>(null);

  /* =========================================================
     EFFECTS
  ========================================================= */

  // ✅ Asegurar que la lista de shops esté cargada
  useEffect(() => {
    if (!shops?.length) {
      fetchShops();
    }
  }, []);

  // ✅ Buscar mi tienda por user_id (con productos)
  useEffect(() => {
    if (!shops?.length || !user?.id) return;

    const myShop = shops.find((s: any) => s.user_id === user.id);

    if (myShop) {
      console.log("🏪 [ShopScreen] Mi tienda:", myShop.name);
      console.log("🛍️ [ShopScreen] Productos:", myShop.products?.length);
      setShop(myShop);
    }
  }, [shops, user?.id]);

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || "",
        description: shop.description || "",
        address: shop.address || "",
        city: shop.city || "",
        phone: shop.phone || "",
        schedule: shop.schedule || "",
      });
    }
  }, [shop]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchShops();
      await me();
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     IMAGE PICKER (PERFIL) — usa el AuthContext
  ========================================================= */

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Permite acceso a galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      try {
        // ✅ updateAvatar del AuthContext → actualiza users.avatar + shops.image
        const newAvatarUrl = await updateAvatar(result.assets[0].uri);

        // Refrescar shop + user para que se vea al instante
        setShop((prev: any) => ({ ...prev, image: newAvatarUrl }));
        await fetchShops();
        await me();

        Alert.alert("✅ Éxito", "Foto actualizada correctamente");
      } catch (error: any) {
        console.error(error);
        Alert.alert("❌ Error", error?.message || "No se pudo subir la imagen");
      }
    }
  };

  /* =========================================================
     IMAGE PICKER (PRODUCTO)
  ========================================================= */

  const pickProductImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Permite acceso a galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setNewProduct({ ...newProduct, image: result.assets[0].uri });
    }
  };

  /* =========================================================
     UPDATE SHOP
  ========================================================= */

  const handleSubmit = async () => {
    if (!shop) return;
    try {
      setLoading(true);
      await api.put(`/shops/${shop.id}`, form);
      await fetchShops();
      await me();
      Alert.alert("✅ Éxito", "Tienda actualizada");
    } catch {
      Alert.alert("❌ Error", "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CREATE PRODUCT
  ========================================================= */

  const handleCreateProduct = async () => {
    if (!shop) return;
    if (!newProduct.name || !newProduct.price) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description || "");
      formData.append("price", String(newProduct.price));
      formData.append("stock", String(newProduct.stock || "0"));
      formData.append("store_id", String(shop.id));

      if (newProduct.image) {
        formData.append("image", {
          uri: newProduct.image,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      }

      const created = await createProduct(formData);

      setShop((prev: any) => ({
        ...prev,
        products: [created, ...(prev.products || [])],
      }));

      setShowModal(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
      });

      await fetchShops();
      Alert.alert("✅ Producto creado");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "❌ Error al crear producto",
        error?.message || "Inténtalo de nuevo"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar este producto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(productId);
            setShop((prev: any) => ({
              ...prev,
              products: prev.products.filter((p: any) => p.id !== productId),
            }));
            await fetchShops();
            Alert.alert("✅ Producto eliminado");
          } catch {
            Alert.alert("❌ Error eliminando");
          }
        },
      },
    ]);
  };

  /* =========================================================
     UPDATE PRODUCT
  ========================================================= */

  const handleUpdateProduct = async () => {
    try {
      const updated = await updateProduct(editProductState.id, editProductState);
      setShop((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) =>
          p.id === updated.id ? updated : p
        ),
      }));
      setEditModal(false);
      setEditProductState(null);
      await fetchShops();
      Alert.alert("✅ Producto actualizado");
    } catch {
      Alert.alert("❌ Error actualizando");
    }
  };

  /* =========================================================
     RENDER PRODUCTO
  ========================================================= */

  const renderProduct = (p: any) => (
    <View
      key={p.id}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Image
        source={{
          uri:
            p.image_url ||
            p.image ||
            "https://via.placeholder.com/400x200/22c55e/ffffff?text=Sin+imagen",
        }}
        style={styles.productImage}
        onError={() => console.log("Error cargando imagen")}
      />

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{p.name}</Text>

        <Text
          style={{ color: colors.secondaryText, marginTop: 4, fontSize: 13 }}
          numberOfLines={2}
        >
          {p.description}
        </Text>

        <View style={styles.productFooter}>
          <Text style={{ color: colors.green, fontWeight: "700", fontSize: 16 }}>
            S/. {p.price}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                setEditProductState(p);
                setEditModal(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={22} color={colors.yellow} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteProduct(p.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={22} color={colors.red} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (authLoading || (shopsLoading && !shop)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No tienes tienda</Text>
      </View>
    );
  }

  /* =========================================================
     RENDER PRINCIPAL
  ========================================================= */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={pickProfileImage} style={styles.avatarContainer}>
            <Image
              source={{ uri: shop.image || "https://picsum.photos/200" }}
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{shop.name}</Text>
            <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
              {shop.city || "Sin ciudad"}
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {["perfil", "productos"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t as any)}
              style={[
                styles.tabButton,
                tab === t && { backgroundColor: colors.green + "15" },
              ]}
            >
              <Text
                style={
                  tab === t
                    ? [styles.activeTab, { color: colors.green }]
                    : [styles.tab, { color: colors.secondaryText }]
                }
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === "productos" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.green }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "perfil" && (
          <View style={styles.formContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📋 Información de la tienda
              </Text>
            </View>

            {Object.keys(form).map((field) => (
              <TextInput
                key={field}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor={colors.placeholder}
                value={form[field as keyof typeof form]}
                onChangeText={(t) => setForm({ ...form, [field]: t })}
              />
            ))}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {loading ? "Guardando..." : "💾 Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === "productos" && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🛍️ Productos
              </Text>
            </View>

            {shop.products?.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="storefront-outline"
                  size={50}
                  color={colors.secondaryText}
                />
                <Text
                  style={{
                    color: colors.secondaryText,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  No hay productos. ¡Crea el primero!
                </Text>
              </View>
            ) : (
              shop.products?.map(renderProduct)
            )}
          </View>
        )}
      </ScrollView>

      {/* ============ MODAL CREAR PRODUCTO ============ */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ScrollView
              style={[styles.modalContainer, { backgroundColor: colors.modal }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  ➕ Nuevo Producto
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Nombre *"
                placeholderTextColor={colors.placeholder}
                value={newProduct.name}
                onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
              <TextInput
                placeholder="Descripción"
                placeholderTextColor={colors.placeholder}
                value={newProduct.description}
                onChangeText={(t) =>
                  setNewProduct({ ...newProduct, description: t })
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
              <TextInput
                placeholder="Precio *"
                placeholderTextColor={colors.placeholder}
                value={newProduct.price}
                onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
              <TextInput
                placeholder="Stock"
                placeholderTextColor={colors.placeholder}
                value={newProduct.stock}
                onChangeText={(t) => setNewProduct({ ...newProduct, stock: t })}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />

              <TouchableOpacity
                onPress={pickProductImage}
                style={[styles.imagePickerButton, { backgroundColor: colors.input }]}
              >
                <Ionicons name="image-outline" size={20} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  🖼️ Seleccionar Imagen
                </Text>
              </TouchableOpacity>

              {newProduct.image && (
                <Image
                  source={{ uri: newProduct.image }}
                  style={styles.previewImage}
                />
              )}

              <TouchableOpacity onPress={handleCreateProduct} style={styles.saveBtn}>
                <Text style={styles.saveText}>✅ Guardar</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ============ MODAL EDITAR PRODUCTO ============ */}
      <Modal
        visible={editModal}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ScrollView
              style={[styles.modalContainer, { backgroundColor: colors.modal }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  ✏️ Editar Producto
                </Text>
                <TouchableOpacity onPress={() => setEditModal(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editProductState?.name}
                onChangeText={(t) =>
                  setEditProductState({ ...editProductState, name: t })
                }
                placeholder="Nombre"
                placeholderTextColor={colors.placeholder}
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
                value={editProductState?.description}
                onChangeText={(t) =>
                  setEditProductState({ ...editProductState, description: t })
                }
                placeholder="Descripción"
                placeholderTextColor={colors.placeholder}
              />

              <TouchableOpacity onPress={handleUpdateProduct} style={styles.saveBtn}>
                <Text style={styles.saveText}>💾 Guardar cambios</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: Platform.OS === "android" ? 55 : 25,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  avatarContainer: { position: "relative", marginRight: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#22c55e",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold" },
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
  tabContent: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  input: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: {
    marginBottom: 12,
    padding: 0,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  productImage: { width: "100%", height: 180 },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginVertical: 10,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  actions: { flexDirection: "row", gap: 12 },
  actionButton: { padding: 6, borderRadius: 8 },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "70%",
    maxWidth: 300,
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", flex: 1 },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
  },
});