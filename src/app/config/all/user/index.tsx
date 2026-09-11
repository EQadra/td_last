import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";

export default function User() {
  const router = useRouter();
  const { user, updateUserProfile, updateAvatar, deleteAvatar, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    address: "",
    city: "",
    role: "user",
    status: "active",
    profile: {} as any,
    profileFields: {} as any,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      console.log("📱 Datos del usuario:", user);
      
      // Obtener el teléfono del usuario o del perfil
      const userPhone = user.phone || user.profile?.phone || "";
      
      // Obtener dirección del usuario o del perfil
      const userAddress = user.address || user.profile?.address || "";
      const userCity = user.city || user.profile?.city || "";

      console.log("📞 Teléfono:", userPhone);
      console.log("🆔 DNI:", user.dni);
      console.log("📍 Dirección:", userAddress);
      console.log("🏙️ Ciudad:", userCity);

      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: userPhone,
        dni: user.dni || "",
        address: userAddress,
        city: userCity,
        role: user.profileType || "user",
        status: user.profile?.status || "active",
        profile: user.profile || {},
        profileFields: user.profile || {},
      });
    }
  }, [user]);

  // Solicitar permisos de cámara/galería
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        "Permisos necesarios",
        "Necesitamos permisos para acceder a tu cámara y galería para cambiar tu foto de perfil."
      );
      return false;
    }
    return true;
  };

  // Seleccionar imagen de la galería
  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  // Subir imagen de perfil
  const uploadProfileImage = async (imageUri: string) => {
    try {
      setUploadingAvatar(true);
      await updateAvatar(imageUri);
      Alert.alert("Éxito", "Foto de perfil actualizada correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar la foto de perfil");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Eliminar avatar
  const handleDeleteAvatar = async () => {
    Alert.alert(
      "Eliminar foto",
      "¿Estás seguro de que deseas eliminar tu foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setUploadingAvatar(true);
              await deleteAvatar();
              Alert.alert("Éxito", "Foto de perfil eliminada correctamente");
            } catch (error: any) {
              Alert.alert("Error", error.message || "No se pudo eliminar la foto");
            } finally {
              setUploadingAvatar(false);
            }
          },
        },
      ]
    );
  };

  // Manejar clic en avatar
  const handleAvatarPress = () => {
    if (uploadingAvatar) return;

    const options = [
      { text: "Tomar foto", onPress: takePhoto },
      { text: "Elegir de galería", onPress: pickImageFromGallery },
    ];

    // Si tiene avatar, agregar opción para eliminar
    if (user?.avatar_url) {
      options.push({ text: "Eliminar foto", onPress: handleDeleteAvatar, style: "destructive" as const });
    }

    options.push({ text: "Cancelar", style: "cancel" as const });

    Alert.alert("Cambiar foto de perfil", "Selecciona una opción", options);
  };

  // Guardar cambios del perfil
  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      Alert.alert("Campos requeridos", "Nombre y correo son obligatorios.");
      return;
    }

    try {
      setSavingProfile(true);

      // Preparar datos para actualizar - campos del usuario base
      const updateData: any = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        dni: form.dni,
        address: form.address,
        city: form.city,
      };

      // Si el usuario tiene un perfil específico (doctor, lawyer, etc.)
      if (user?.profileType && user?.profileType !== 'user') {
        updateData.profile = {
          ...form.profileFields,
          phone: form.phone,
          city: form.city,
          address: form.address,
        };
      }

      console.log("📤 Enviando actualización:", updateData);
      await updateUserProfile(updateData);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  // Renderizar campos específicos según el tipo de perfil
  const renderProfileSpecificFields = () => {
    if (!user?.profileType || user.profileType === 'user') return null;

    switch (user.profileType) {
      case 'doctor':
        return (
          <>
            <Text style={styles.sectionTitle}>Información Médica</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={form.profileFields?.first_name || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, first_name: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={form.profileFields?.last_name || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, last_name: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Especialidad"
              value={form.profileFields?.specialty || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, specialty: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Universidad"
              value={form.profileFields?.university || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, university: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Título / Grado"
              value={form.profileFields?.degree || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, degree: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Código de graduación"
              value={form.profileFields?.graduation_code || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, graduation_code: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono de emergencia"
              keyboardType="phone-pad"
              value={form.profileFields?.emergency_phone || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, emergency_phone: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono de la clínica"
              keyboardType="phone-pad"
              value={form.profileFields?.clinic_phone || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, clinic_phone: text },
                })
              }
            />
          </>
        );

      case 'lawyer':
        return (
          <>
            <Text style={styles.sectionTitle}>Información Legal</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={form.profileFields?.first_name || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, first_name: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={form.profileFields?.last_name || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, last_name: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Especialidad"
              value={form.profileFields?.specialty || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, specialty: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Universidad"
              value={form.profileFields?.university || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, university: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Código de licencia"
              value={form.profileFields?.license_code || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, license_code: text },
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono de oficina"
              keyboardType="phone-pad"
              value={form.profileFields?.office_phone || ""}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  profileFields: { ...form.profileFields, office_phone: text },
                })
              }
            />
          </>
        );

      default:
        return null;
    }
  };

  // Mostrar información del perfil en modo vista
  const renderProfileInfo = () => {
    if (!user) return null;

    const infoItems = [];

    // ✅ Datos básicos del usuario (SIEMPRE VISIBLES)
    infoItems.push(
      { label: "Nombre", value: user.name || "No especificado" },
      { label: "Email", value: user.email || "No especificado" },
    );

    // ✅ Teléfono (del usuario o del perfil)
    const phone = user.phone || user.profile?.phone;
    if (phone) {
      infoItems.push({ label: "Teléfono", value: phone });
    }

    // ✅ DNI (si existe)
    if (user.dni) {
      infoItems.push({ label: "DNI", value: user.dni });
    }

    // ✅ Dirección (si existe en usuario o perfil)
    const address = user.address || user.profile?.address;
    if (address) {
      infoItems.push({ label: "Dirección", value: address });
    }

    // ✅ Ciudad (si existe en usuario o perfil)
    const city = user.city || user.profile?.city;
    if (city) {
      infoItems.push({ label: "Ciudad", value: city });
    }

    // ✅ Datos específicos del perfil (solo si no es 'user')
    if (user.profileType !== 'user' && user.profile) {
      if (user.profileType === 'doctor') {
        if (user.profile.specialty) infoItems.push({ label: "Especialidad", value: user.profile.specialty });
        if (user.profile.university) infoItems.push({ label: "Universidad", value: user.profile.university });
        if (user.profile.graduation_code) infoItems.push({ label: "Código", value: user.profile.graduation_code });
        if (user.profile.emergency_phone) {
          infoItems.push({ 
            label: "Teléfono de emergencia", 
            value: user.profile.formatted_emergency_phone || user.profile.emergency_phone 
          });
        }
        if (user.profile.clinic_phone) {
          infoItems.push({ 
            label: "Teléfono de clínica", 
            value: user.profile.formatted_clinic_phone || user.profile.clinic_phone 
          });
        }
      } else if (user.profileType === 'lawyer') {
        if (user.profile.specialty) infoItems.push({ label: "Especialidad", value: user.profile.specialty });
        if (user.profile.university) infoItems.push({ label: "Universidad", value: user.profile.university });
        if (user.profile.license_code) infoItems.push({ label: "Código de licencia", value: user.profile.license_code });
        if (user.profile.office_phone) {
          infoItems.push({ 
            label: "Teléfono de oficina", 
            value: user.profile.formatted_office_phone || user.profile.office_phone 
          });
        }
      } else if (user.profileType === 'association') {
        if (user.profile.description) infoItems.push({ label: "Descripción", value: user.profile.description });
        if (user.profile.website) infoItems.push({ label: "Sitio web", value: user.profile.website });
      } else if (user.profileType === 'shop') {
        if (user.profile.description) infoItems.push({ label: "Descripción", value: user.profile.description });
        if (user.profile.schedule) infoItems.push({ label: "Horario", value: user.profile.schedule });
      }
    }

    if (infoItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay información disponible</Text>
        </View>
      );
    }

    return infoItems.map((item, index) => (
      <View key={index} style={styles.infoContainer}>
        <Text style={styles.infoLabel}>{item.label}:</Text>
        <Text style={styles.infoValue}>{item.value}</Text>
      </View>
    ));
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  // Verificar que form tenga los valores
  console.log("📝 Form state:", form);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Mi Perfil</Text>

      {/* Avatar / Foto de perfil */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        disabled={uploadingAvatar}
      >
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}
        {uploadingAvatar && (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
        <View style={styles.editAvatarBadge}>
          <Text style={styles.editAvatarText}>📷</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.userName}>{user?.name || "Usuario"}</Text>
      <Text style={styles.userEmail}>{user?.email || "usuario@email.com"}</Text>

      <View style={styles.divider} />

      {/* Tipo de perfil - Solo mostrar, no editable */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Tipo de perfil:</Text>
        <Text style={[styles.infoValue, styles.profileTypeBadge]}>
          {user?.profileType
            ? user.profileType.charAt(0).toUpperCase() + user.profileType.slice(1)
            : "Usuario"}
        </Text>
      </View>

      {/* Información del perfil */}
      {!isEditing ? (
        <>
          {renderProfileInfo()}

          {/* Botones de acción */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Formulario de edición
        <View style={styles.editForm}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="DNI"
            keyboardType="numeric"
            value={form.dni}
            onChangeText={(text) => setForm({ ...form, dni: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Dirección"
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Ciudad"
            value={form.city}
            onChangeText={(text) => setForm({ ...form, city: text })}
          />

          {/* Campos específicos del perfil */}
          {renderProfileSpecificFields()}

          {/* Mostrar el rol pero no editable */}
          <Text style={styles.label}>Rol (no editable):</Text>
          <View style={[styles.pickerContainer, styles.disabledPicker]}>
            <Picker
              selectedValue={form.role}
              enabled={false}
            >
              <Picker.Item label="Usuario" value="user" />
              <Picker.Item label="Doctor" value="doctor" />
              <Picker.Item label="Abogado" value="lawyer" />
              <Picker.Item label="Asociación" value="association" />
              <Picker.Item label="Tienda" value="shop" />
              <Picker.Item label="Administrador" value="admin" />
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                // Restaurar datos originales
                if (user) {
                  setForm({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || user.profile?.phone || "",
                    dni: user.dni || "",
                    address: user.address || user.profile?.address || "",
                    city: user.city || user.profile?.city || "",
                    role: user.profileType || "user",
                    status: user.profile?.status || "active",
                    profile: user.profile || {},
                    profileFields: user.profile || {},
                  });
                }
                setIsEditing(false);
              }}
              disabled={savingProfile}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSubmit}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backLink}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f7f9fc",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  avatarPlaceholder: {
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  editAvatarText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "400",
    flex: 2,
    textAlign: "right",
  },
  profileTypeBadge: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  editForm: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
  },
  disabledPicker: {
    backgroundColor: "#e8e8e8",
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  backLink: {
    textAlign: "center",
    color: "#0066cc",
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});