import { useCallback, useEffect, useState } from "react";

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

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useDarkMode } from "../../../../context/app/DarkModeContext";
import { useAssociations } from "../../../../context/AssociationContext";
import { useAuth } from "../../../../context/AuthContext";
import { useProducts } from "../../../../context/ProductContext";

export default function AssociationScreen() {
  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    border: darkMode ? "#1E293B" : "#E5E7EB",
    input: darkMode ? "#1E293B" : "#FFFFFF",
    modal: darkMode ? "#0F172A" : "#FFFFFF",
    button: "#16A34A",
    placeholder: darkMode ? "#94A3B8" : "#999999",
    imagePicker: darkMode ? "#1E293B" : "#E5E7EB",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#facc15",
    overlay: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
  };

  /* =========================================================
     CONTEXTS
  ========================================================= */

  const { user, me, updateAvatar } = useAuth();
  const association = user?.profile;

  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const { createAssociation, updateAssociation } = useAssociations();

  /* =========================================================
     STATES
  ========================================================= */

  const [tab, setTab] = useState<"perfil" | "productos">("perfil");
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    image: "",
    products: [],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Productos
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });
  const [editProductState, setEditProductState] = useState<any>(null);
  const [editProductModal, setEditProductModal] = useState(false);

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    if (association) {
      setForm({
        name: association.name || "",
        description: association.description || "",
        city: association.city || "",
        address: association.address || "",
        phone: association.phone || "",
        website: association.website || "",
        image: association.image || "",
        products: association.products || [],
      });
    }
  }, [association]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await me();
    } catch (e) {
      console.error("Error al refrescar:", e);
    } finally {
      setRefreshing(false);
    }
  }, [me]);

  /* =========================================================
     PROFILE UPDATE
  ========================================================= */

const handleUpdate = async () => {
  try {
    setLoading(true);

    const associationId = form?.id || association?.id;

    if (!associationId) {
      Alert.alert("❌ Error", "No se encontró la asociación");
      return;
    }

    // ✅ PUT /associations/{id} — solo actualiza, nunca crea
    await updateAssociation(associationId, {
      name: form.name,
      description: form.description,
      city: form.city,
      address: form.address,
      phone: form.phone,
      website: form.website,
    });

    await me();

    Alert.alert("✅ Guardado", "Perfil actualizado correctamente");
  } catch (error: any) {
    console.error("❌ Error actualizando:", error);
    Alert.alert(
      "❌ Error",
      error?.response?.data?.message || error?.message || "Error al guardar"
    );
  } finally {
    setLoading(false);
  }
};

  /* =========================================================
     IMAGE PICKER
  ========================================================= */

  const pickImage = async (type: "product" | "profile") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para seleccionar imágenes."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [4, 3],
    });

    if (!result.canceled) {
      if (type === "product") {
        setNewProduct({ ...newProduct, image: result.assets[0].uri });
      } else if (type === "profile") {
        try {
          setUploadingAvatar(true);
          const newUrl = await updateAvatar(result.assets[0].uri);
          console.log("✅ Nueva URL avatar:", newUrl);
          setForm((prev: any) => ({ ...prev, image: newUrl }));
          await me();
          Alert.alert("✅ Éxito", "Foto de perfil actualizada");
        } catch (error: any) {
          Alert.alert(
            "❌ Error",
            error?.message || "No se pudo subir la imagen"
          );
        } finally {
          setUploadingAvatar(false);
        }
      }
    }
  };

  /* =========================================================
     PRODUCT CRUD
  ========================================================= */

  const handleCreateProduct = async () => {
    if (!association) return;

    if (!newProduct.name || !newProduct.price) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description || "");
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock || "0");
      formData.append("association_id", association.id);

      if (newProduct.image) {
        const uriParts = newProduct.image.split("/");
        const fileName = uriParts[uriParts.length - 1] || "product.jpg";
        const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
        const mime =
          ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

        formData.append("image", {
          uri: newProduct.image,
          name: fileName,
          type: mime,
        } as any);
      }

      const created = await createProduct(formData);

      setForm((prev: any) => ({
        ...prev,
        products: [created, ...(prev.products || [])],
      }));

      setShowProductModal(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
      });

      await me();
      Alert.alert("✅ Producto creado");
    } catch (error: any) {
      console.error(error);
      Alert.alert("❌ Error", error?.message || "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar este producto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(productId);
            setForm((prev: any) => ({
              ...prev,
              products: prev.products.filter((p: any) => p.id !== productId),
            }));
            await me();
            Alert.alert("✅ Producto eliminado");
          } catch {
            Alert.alert("❌ Error eliminando");
          }
        },
      },
    ]);
  };

  const handleUpdateProduct = async () => {
    try {
      const updated = await updateProduct(editProductState.id, editProductState);
      setForm((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) =>
          p.id === updated.id ? updated : p
        ),
      }));
      setEditProductModal(false);
      setEditProductState(null);
      await me();
      Alert.alert("✅ Producto actualizado");
    } catch {
      Alert.alert("❌ Error actualizando");
    }
  };

  /* =========================================================
     RENDER ITEMS
  ========================================================= */

  const renderProductItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Image
        key={item.image_url || item.image}   // ✅ fuerza recarga si cambia la URL
        source={{
          uri:
            item.image_url ||
            item.image ||
            "https://via.placeholder.com/400x200/22c55e/ffffff?text=Sin+imagen",
        }}
        style={styles.productImage}
        onError={() =>
          console.log("Error cargando imagen:", item.image_url || item.image)
        }
      />

      <View style={styles.cardContent}>
        <Text style={[styles.postTitle, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text
          style={{ color: colors.secondaryText, marginTop: 4, fontSize: 13 }}
        >
          {item.description}
        </Text>

        <View style={styles.productFooter}>
          <Text style={{ color: colors.green, fontWeight: "700", fontSize: 16 }}>
            S/. {item.price}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                setEditProductState(item);
                setEditProductModal(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.yellow}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteProduct(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.red} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (!association) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
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

      {/* HEADER CON TABS */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => pickImage("profile")}
            style={styles.avatarContainer}
            disabled={uploadingAvatar}
          >
            <Image
              key={form.image}                 // ✅ fuerza re-render al cambiar URL
              source={{
                uri:
                  form.image ||
                  "https://via.placeholder.com/100/22c55e/ffffff?text=Perfil",
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
              {form.name || "Sin nombre"}
            </Text>
            <Text style={{ color: colors.secondaryText, fontSize: 14 }}>
              {form.city || "Sin ciudad"}
            </Text>
          </View>
        </View>

        {/* TABS: SOLO PERFIL Y PRODUCTOS */}
        <View style={styles.tabs}>
          {(["perfil", "productos"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
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

      {/* FAB */}
      {tab === "productos" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.green }]}
          onPress={() => setShowProductModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* SCROLLVIEW */}
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
        {/* PERFIL */}
        {tab === "perfil" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📋 Información del perfil
              </Text>
              <TouchableOpacity
                onPress={handleUpdate}
                style={styles.saveBtnSmall}
                disabled={loading}
              >
                <Text style={styles.saveTextSmall}>
                  {loading ? "Guardando..." : "💾 Guardar"}
                </Text>
              </TouchableOpacity>
            </View>

            {(["name", "description", "city", "address", "phone", "website"] as const).map(
              (field) => (
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
                  value={form[field] || ""}
                  onChangeText={(t) => setForm({ ...form, [field]: t })}
                  multiline={field === "description"}
                />
              )
            )}
          </View>
        )}

        {/* PRODUCTOS */}
        {tab === "productos" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🛍️ Productos ({form.products?.length || 0})
              </Text>
              <TouchableOpacity
                onPress={() => setShowProductModal(true)}
                style={styles.addButtonSmall}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {form.products?.length === 0 ? (
              <Text
                style={{
                  color: colors.secondaryText,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                No hay productos. ¡Crea el primero!
              </Text>
            ) : (
              <FlatList
                data={form.products || []}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* =========================================================
          MODAL CREAR PRODUCTO
      ========================================================= */}
      <Modal visible={showProductModal} animationType="slide" transparent>
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
                  Nuevo Producto
                </Text>
                <TouchableOpacity onPress={() => setShowProductModal(false)}>
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
                onPress={() => pickImage("product")}
                style={[
                  styles.imagePickerButton,
                  { backgroundColor: colors.imagePicker },
                ]}
              >
                <Ionicons name="image-outline" size={20} color={colors.text} />
                <Text style={[styles.imagePickerText, { color: colors.text }]}>
                  🖼️ Seleccionar Imagen
                </Text>
              </TouchableOpacity>

              {newProduct.image && (
                <Image
                  source={{ uri: newProduct.image }}
                  style={styles.previewImage}
                />
              )}

              <TouchableOpacity
                onPress={handleCreateProduct}
                style={styles.saveBtn}
                disabled={loading}
              >
                <Text style={styles.saveText}>
                  {loading ? "Guardando..." : "✅ Guardar"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* =========================================================
          MODAL EDITAR PRODUCTO
      ========================================================= */}
      <Modal visible={editProductModal} animationType="slide" transparent>
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
                  Editar Producto
                </Text>
                <TouchableOpacity onPress={() => setEditProductModal(false)}>
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
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={String(editProductState?.price ?? "")}
                onChangeText={(t) =>
                  setEditProductState({ ...editProductState, price: t })
                }
                placeholder="Precio"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
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
                value={String(editProductState?.stock ?? "")}
                onChangeText={(t) =>
                  setEditProductState({ ...editProductState, stock: t })
                }
                placeholder="Stock"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
              />

              <TouchableOpacity
                onPress={handleUpdateProduct}
                style={styles.saveBtn}
                disabled={loading}
              >
                <Text style={styles.saveText}>
                  {loading ? "Guardando..." : "💾 Guardar cambios"}
                </Text>
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
  tab: { fontWeight: "500", fontSize: 14 },
  activeTab: { fontWeight: "bold", fontSize: 14 },

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

  section: { padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },

  saveBtnSmall: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveTextSmall: { color: "#fff", fontWeight: "600", fontSize: 13 },

  addButtonSmall: {
    backgroundColor: "#16A34A",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  input: {
    marginVertical: 8,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 15,
  },

  saveBtn: {
    marginBottom: 30,
    backgroundColor: "#16A34A",
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  card: {
    marginTop: 8,
    marginVertical: 8,
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
  postTitle: { fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "92%",
    maxHeight: "85%",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  imagePickerText: { fontWeight: "600" },
});