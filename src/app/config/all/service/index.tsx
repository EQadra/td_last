// screens/ServicesScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../../../context/app/DarkModeContext";
import { useAuth } from "../../../../context/AuthContext";
import { useServices } from "../../../../context/ServiceContext";

const ServiceScreen = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();

  const colors = {
    background: darkMode ? "#020617" : "#F0FDF4",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    cardAlt: darkMode ? "#1E293B" : "#ECFDF5",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#CBD5E1" : "#374151",
    border: darkMode ? "#334155" : "#DDDDDD",
    primary: darkMode ? "#22C55E" : "#00B272",
    primaryDark: darkMode ? "#16A34A" : "#00994C",
    danger: "#EF4444",
    buttonText: "#FFFFFF",
  };

  const {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    uploadServiceImage,
    deleteServiceImage,
  } = useServices();

  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
    setImageUri(null);
    setEditingId(null);
    setShowForm(false);
  };

  // ✅ SELECCIONAR IMAGEN
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
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // ✅ OBTENER PERFIL DEL USUARIO
  const getUserProfile = () => {
    console.log("👤 User completo:", JSON.stringify(user, null, 2));

    const profileType = user?.profileType;
    const profile = user?.profile;

    if (!profileType || !profile) {
      console.log("❌ No hay perfil o profileType");
      return null;
    }

    const typeMap: Record<string, string> = {
      doctor: "App\\Models\\Doctor",
      lawyer: "App\\Models\\Lawyer",
      shop: "App\\Models\\Shop",
      association: "App\\Models\\Association",
    };

    const serviceableType = typeMap[profileType];
    if (!serviceableType) {
      console.log("❌ Tipo de perfil no reconocido:", profileType);
      return null;
    }

    if (!profile.id) {
      console.log("❌ El perfil no tiene ID:", profile);
      return null;
    }

    console.log("✅ Perfil encontrado:", {
      serviceable_type: serviceableType,
      serviceable_id: profile.id,
    });

    return {
      serviceable_type: serviceableType,
      serviceable_id: profile.id,
    };
  };

  // ✅ ENVIAR FORMULARIO
  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    const profile = getUserProfile();

    if (!profile) {
      Alert.alert(
        "Error",
        "No tienes un perfil válido para crear servicios."
      );
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      duration: duration ? parseInt(duration) : undefined,
      image: imageUri || undefined,
      serviceable_type: profile.serviceable_type,
      serviceable_id: profile.serviceable_id,
    };

    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    try {
      if (editingId) {
        await updateService(editingId, payload);
        Alert.alert("Éxito", "Servicio actualizado");
      } else {
        await createService(payload);
        Alert.alert("Éxito", "Servicio creado");
      }
      resetForm();
      await fetchServices();
    } catch (err: any) {
      console.error("❌ Error:", err?.response?.data);
      Alert.alert("Error", err?.message || "No se pudo guardar el servicio");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name || "");
    setDescription(item.description || "");
    setPrice(String(item.price || ""));
    setDuration(String(item.duration || ""));
    setImageUri(item.image_url || item.image || null);
    setShowForm(true);
  };

  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteService(selectedId);
      setShowDeleteModal(false);
      setSelectedId(null);
      Alert.alert("Éxito", "Servicio eliminado");
      await fetchServices();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "No se pudo eliminar el servicio");
    }
  };

  // ✅ Función para formatear precio
  const formatPrice = (price: any): string => {
    if (price === null || price === undefined || price === "") {
      return "0.00";
    }
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) {
      return "0.00";
    }
    return num.toFixed(2);
  };

  // ✅ RENDERIZAR ITEM
  const renderItem = ({ item }: { item: any }) => {
    // ✅ OBTENER URL DE IMAGEN
    const imageUrl = item.image_url || item.image || null;
    console.log('🖼️ URL de imagen:', imageUrl);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: colors.primary }]}>
              Activo
            </Text>
          </View>
        </View>

        {/* ✅ IMAGEN DEL SERVICIO */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.serviceImage}
            onError={(e) => console.log('❌ Error cargando imagen:', e.nativeEvent.error)}
            onLoad={() => console.log('✅ Imagen cargada:', imageUrl)}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={40} color={colors.secondaryText} />
            <Text style={[styles.noImageText, { color: colors.secondaryText }]}>
              Sin imagen
            </Text>
          </View>
        )}

        {item.description && (
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            {item.description}
          </Text>
        )}

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            S/ {formatPrice(item.price)}
          </Text>
          {item.duration && (
            <Text style={[styles.duration, { color: colors.secondaryText }]}>
              ⏱ {item.duration} min
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing && !services.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando servicios...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          💼 Mis Servicios
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Formulario */}
      {showForm && (
        <View
          style={[
            styles.form,
            {
              backgroundColor: colors.cardAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {editingId ? "✏️ Editar Servicio" : "➕ Nuevo Servicio"}
            </Text>
            <TouchableOpacity onPress={resetForm}>
              <Ionicons name="close" size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Nombre del servicio *"
            placeholderTextColor={colors.secondaryText}
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <TextInput
            placeholder="Descripción"
            placeholderTextColor={colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <View style={styles.row}>
            <TextInput
              placeholder="Precio *"
              placeholderTextColor={colors.secondaryText}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[
                styles.input,
                styles.rowInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <TextInput
              placeholder="Duración (min)"
              placeholderTextColor={colors.secondaryText}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={[
                styles.input,
                styles.rowInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>

          {/* ✅ SELECTOR DE IMAGEN */}
          <TouchableOpacity
            style={[
              styles.imagePicker,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            onPress={pickImage}
          >
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={24}
                  color={colors.secondaryText}
                />
                <Text
                  style={[
                    styles.imagePlaceholderText,
                    { color: colors.secondaryText },
                  ]}
                >
                  Seleccionar imagen
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.btnText}>
              {editingId ? "Actualizar" : "Crear"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="construct-outline"
              size={60}
              color={colors.secondaryText}
            />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No tienes servicios
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.secondaryText }]}
            >
              Crea tu primer servicio para ofrecer a la comunidad
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Text style={styles.emptyButtonText}>Crear Servicio</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal de confirmación */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.danger} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ¿Eliminar servicio?
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.secondaryText }]}
            >
              Esta acción no se puede deshacer
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.cardAlt }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ color: colors.text, fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleDelete}>
                <Text style={[styles.btnText, { color: colors.buttonText }]}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 80,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  form: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  submitBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    marginVertical: 4,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  duration: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  modalIconContainer: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  // ✅ ESTILOS DE IMAGEN
  imagePicker: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    resizeMode: "cover",
  },
  removeImage: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  imagePlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
  },
  serviceImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
  },
  noImageContainer: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#f0f4f2",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ServiceScreen;