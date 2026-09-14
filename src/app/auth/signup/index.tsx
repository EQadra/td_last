import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";

// ============================================================
// ROLES CON SUS ICONOS Y AVATARES POR SEXO
// ============================================================
const roles = [
  { 
    label: "Usuario", 
    value: "usuario", 
    icon: require("../../../assets/7.png"),
    showGender: true,
    avatarMale: "https://tudealer.app/avatar_user.jpg",
    avatarFemale: "https://tudealer.app/avatar_usuaria.jpg",
    avatarLgbt: "https://tudealer.app/avatar_user.jpg"
  },
  { 
    label: "Abogado", 
    value: "abogado", 
    icon: require("../../../assets/8.png"),
    showGender: true,
    avatarMale: "https://tudealer.app/avatar_lawyer.jpg",
    avatarFemale: "https://tudealer.app/avatar_abogada.jpg",
    avatarLgbt: "https://tudealer.app/avatar_lawyer.jpg"
  },
  { 
    label: "Doctor / Veterinario", 
    value: "doctor", 
    icon: require("../../../assets/6.png"),
    showGender: true,
    avatarMale: "https://tudealer.app/avatar_doctor.jpg",
    avatarFemale: "https://tudealer.app/avatar_doctora.jpg",
    avatarLgbt: "https://tudealer.app/avatar_doctor.jpg"
  },
  { 
    label: "Asociación / Farmacia", 
    value: "asociacion", 
    icon: require("../../../assets/10.png"),
    showGender: false,
    avatarMale: "https://tudealer.app/avatar_association.jpg",
    avatarFemale: "https://tudealer.app/avatar_association.jpg",
    avatarLgbt: "https://tudealer.app/avatar_association.jpg"
  },
  { 
    label: "Tienda / Comercio", 
    value: "tienda", 
    icon: require("../../../assets/9.png"),
    showGender: false,
    avatarMale: "https://tudealer.app/avatar_store.jpg",
    avatarFemale: "https://tudealer.app/avatar_store.jpg",
    avatarLgbt: "https://tudealer.app/avatar_store.jpg"
  },
];

// ============================================================
// OPCIONES DE SEXO CON LGBT+
// ============================================================
type GenderOption = "male" | "female" | "lgbt";

const genderOptions: { value: GenderOption; label: string; icon: string }[] = [
  { value: "male", label: "Hombre", icon: "male" },
  { value: "female", label: "Mujer", icon: "female" },
  { value: "lgbt", label: "LGBT+", icon: "rainbow" },
];

const SignupScreen = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [selectedForm, setSelectedForm] = useState("usuario");
  const [selectedGender, setSelectedGender] = useState<GenderOption>("male");
  const [showModal, setShowModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [formData, setFormData] = useState({
    usuario: { name: "", email: "", password: "", repeatPassword: "", dni: "" },
    abogado: { name: "", email: "", password: "", repeatPassword: "", licencia: "" },
    doctor: { name: "", email: "", password: "", repeatPassword: "", codigoDoctor: "" },
    asociacion: { name: "", email: "", password: "", repeatPassword: "", ruc: "" },
    tienda: { name: "", email: "", password: "", repeatPassword: "", ruc: "" },
  });

  const selectedRole = roles.find((role) => role.value === selectedForm);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ============================================================
  // OBTENER AVATAR SEGÚN ROL Y SEXO
  // ============================================================
  const getAvatarForRole = (role: string, gender: GenderOption) => {
    const roleMap: Record<string, { male: string; female: string; lgbt: string }> = {
      usuario: { 
        male: "https://tudealer.app/avatar_user.jpg", 
        female: "https://tudealer.app/avatar_usuaria.jpg",
        lgbt: "https://tudealer.app/avatar_user.jpg"
      },
      abogado: { 
        male: "https://tudealer.app/avatar_lawyer.jpg", 
        female: "https://tudealer.app/avatar_abogada.jpg",
        lgbt: "https://tudealer.app/avatar_lawyer.jpg"
      },
      doctor: { 
        male: "https://tudealer.app/avatar_doctor.jpg", 
        female: "https://tudealer.app/avatar_doctora.jpg",
        lgbt: "https://tudealer.app/avatar_doctor.jpg"
      },
      asociacion: { 
        male: "https://tudealer.app/avatar_association.jpg", 
        female: "https://tudealer.app/avatar_association.jpg",
        lgbt: "https://tudealer.app/avatar_association.jpg"
      },
      tienda: { 
        male: "https://tudealer.app/avatar_store.jpg", 
        female: "https://tudealer.app/avatar_store.jpg",
        lgbt: "https://tudealer.app/avatar_store.jpg"
      },
    };
    return roleMap[role]?.[gender] || "https://tudealer.app/avatar_user.jpg";
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [selectedForm]: { ...prev[selectedForm], [field]: value },
    }));
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // ✅ MAPEO DE SEXO PARA EL BACKEND
  const sexoMap = {
    male: "masculino",
    female: "femenino",
    lgbt: "lgbt",
  };

  const handleSignup = async () => {
    const data = formData[selectedForm];

    if (!data.email || !data.password || !data.repeatPassword) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos.");
      return;
    }

    if (!validatePassword(data.password)) {
      Alert.alert("Contraseña inválida", "La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (data.password !== data.repeatPassword) {
      Alert.alert("Contraseñas diferentes", "Las contraseñas no coinciden.");
      return;
    }

    try {
      const avatarUrl = getAvatarForRole(selectedForm, selectedGender);

      let payload: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.repeatPassword,
        avatar: avatarUrl,
        sexo: sexoMap[selectedGender], // ✅ ENVIAR EN FORMATO CORRECTO
      };

      console.log("📝 Enviando registro:", {
        name: payload.name,
        email: payload.email,
        sexo: payload.sexo,
        role: selectedForm,
      });

      switch (selectedForm) {
        case "usuario":
          payload.dni = data.dni;
          break;

        case "abogado": {
          const nameParts = data.name.trim().split(" ");
          payload.first_name = nameParts[0] || "";
          payload.last_name = nameParts.slice(1).join(" ") || "---";
          payload.licencia = data.licencia;
          payload.image = avatarUrl;
          break;
        }

        case "doctor": {
          const nameParts = data.name.trim().split(" ");
          payload.first_name = nameParts[0] || "";
          payload.last_name = nameParts.slice(1).join(" ") || "---";
          payload.degree = "Médico";
          payload.specialty = "General";
          payload.codigoDoctor = data.codigoDoctor;
          payload.image = avatarUrl;
          break;
        }

        case "asociacion":
          payload.ruc = data.ruc;
          payload.type = "asociacion";
          payload.image = avatarUrl;
          break;

        case "tienda":
          payload.ruc = data.ruc;
          payload.type = "tienda";
          payload.image = avatarUrl;
          break;
      }

      await register(payload);

      Alert.alert(
        "✅ Registro exitoso",
        "Tu cuenta fue creada correctamente."
      );

      router.replace("/auth/login");

    } catch (error: any) {
      console.error("❌ Error en registro:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Ocurrió un problema al registrarte."
      );
    }
  };

  const inputStyle = (field: string) => ({
    ...styles.input,
    borderColor: focusedField === field ? "#004d32" : "#b4dccf",
    borderWidth: focusedField === field ? 2 : 1,
  });

  const isFormValid = () => {
    const data = formData[selectedForm];

    if (!data.name || !data.email || !data.password || !data.repeatPassword) {
      return false;
    }

    if (!validatePassword(data.password)) return false;

    if (data.password !== data.repeatPassword) return false;

    if (selectedForm === "usuario" && !data.dni) return false;
    if (selectedForm === "abogado" && !data.licencia) return false;
    if (selectedForm === "doctor" && !data.codigoDoctor) return false;
    if ((selectedForm === "asociacion" || selectedForm === "tienda") && !data.ruc) return false;

    return true;
  };

  // ============================================================
  // RENDER: SELECTOR DE SEXO CON LGBT+
  // ============================================================
  const renderGenderSelector = () => {
    if (!selectedRole?.showGender) return null;

    return (
      <View style={styles.genderContainer}>
        <Text style={styles.genderLabel}>👤 Sexo:</Text>
        <View style={styles.genderOptions}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                selectedGender === option.value && styles.genderOptionActive,
              ]}
              onPress={() => setSelectedGender(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={option.icon as any}
                size={22} 
                color={selectedGender === option.value ? "#fff" : "#004d32"} 
              />
              <Text
                style={[
                  styles.genderOptionText,
                  selectedGender === option.value && styles.genderOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ============================================================
  // RENDER: VISTA PREVIA DEL AVATAR
  // ============================================================
  const renderAvatarPreview = () => {
    const avatarUrl = getAvatarForRole(selectedForm, selectedGender);
    const genderLabel = genderOptions.find(g => g.value === selectedGender)?.label || "Hombre";
    
    return (
      <View style={styles.avatarPreviewContainer}>
        <Text style={styles.avatarPreviewLabel}>🖼️ Tu foto de perfil:</Text>
        <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
        <Text style={styles.avatarPreviewHint}>
          {selectedRole?.showGender 
            ? `Imagen para ${genderLabel}` 
            : "Imagen predeterminada"}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>✨ Crea Tu Cuenta</Text>

          <Text style={styles.helperText}>
            Selecciona el tipo de cuenta que deseas crear
          </Text>

          {/* SELECTOR DE ROL */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.selectorLeft}>
              <Image source={selectedRole?.icon} style={styles.selectorIcon} />
              <Text style={styles.selectorText}>
                {selectedRole?.label}
              </Text>
            </View>

            <Ionicons
              name={showModal ? "chevron-up" : "chevron-down"}
              size={20}
              color="#004d32"
            />
          </TouchableOpacity>

          {/* MODAL DE ROLES */}
          <Modal visible={showModal} transparent animationType="fade">
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowModal(false)}
              activeOpacity={1}
            >
              <View style={styles.modalContainer}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.modalOption,
                      selectedForm === role.value && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedForm(role.value);
                      setShowModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={role.icon} style={styles.modalIcon} />
                    <Text style={[
                      styles.modalLabel,
                      selectedForm === role.value && styles.modalLabelActive,
                    ]}>
                      {role.label}
                    </Text>
                    {selectedForm === role.value && (
                      <Ionicons name="checkmark-circle" size={22} color="#004d32" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* SELECTOR DE SEXO CON LGBT+ */}
          {renderGenderSelector()}

          {/* VISTA PREVIA DEL AVATAR */}
          {renderAvatarPreview()}

          {/* CAMPOS DEL FORMULARIO */}
          {Object.keys(formData[selectedForm]).map((field) => (
            <View key={field} style={styles.inputWrapper}>
              <TextInput
                style={inputStyle(field)}
                placeholder={
                  field === "name" ? "👤 Nombre completo" :
                  field === "email" ? "📧 Correo electrónico" :
                  field === "password" ? "🔒 Contraseña" :
                  field === "repeatPassword" ? "🔒 Repetir contraseña" :
                  field === "dni" ? "🪪 DNI" :
                  field === "licencia" ? "📜 Número de licencia" :
                  field === "codigoDoctor" ? "🏥 Código de doctor" :
                  field === "ruc" ? "🏢 RUC" :
                  field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={formData[selectedForm][field]}
                onChangeText={(value) => handleInputChange(field, value)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={
                  field === "password" || field === "repeatPassword"
                }
                placeholderTextColor="#7CA290"
                autoCapitalize={field === "email" ? "none" : "words"}
              />

              {field === "password" && (
                <Text
                  style={[
                    styles.passwordHint,
                    {
                      color: validatePassword(
                        formData[selectedForm].password
                      )
                        ? "#008f5d"
                        : "#cc3d3d",
                    },
                  ]}
                >
                  {validatePassword(formData[selectedForm].password)
                    ? "✅ Contraseña válida"
                    : "⚠️ Mínimo 8 caracteres"}
                </Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                backgroundColor: isFormValid()
                  ? "#004d32"
                  : "#b4dccf",
              },
            ]}
            onPress={handleSignup}
            disabled={!isFormValid()}
            activeOpacity={0.8}
          >
            <Text style={styles.registerText}>
              {isFormValid() ? "🚀 Registrar" : "⏳ Completa los campos"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("auth/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.link}>
              ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },

  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
    color: "#004d32",
    textAlign: "center",
  },

  helperText: {
    fontSize: 14,
    color: "#7CA290",
    marginBottom: 20,
    textAlign: "center",
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4fdf9",
    borderColor: "#b4dccf",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    width: "100%",
  },

  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  selectorIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },

  selectorText: {
    fontSize: 16,
    color: "#004d32",
    fontWeight: "600",
  },

  genderContainer: {
    width: "100%",
    marginBottom: 14,
  },

  genderLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#004d32",
    marginBottom: 8,
    marginLeft: 4,
  },

  genderOptions: {
    flexDirection: "row",
    gap: 10,
  },

  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#b4dccf",
    backgroundColor: "#f4fdf9",
    gap: 6,
  },

  genderOptionActive: {
    backgroundColor: "#004d32",
    borderColor: "#004d32",
  },

  genderOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#004d32",
  },

  genderOptionTextActive: {
    color: "#ffffff",
  },

  avatarPreviewContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 14,
    backgroundColor: "#f4fdf9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#b4dccf",
  },

  avatarPreviewLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#004d32",
    marginBottom: 8,
  },

  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#004d32",
  },

  avatarPreviewHint: {
    fontSize: 12,
    color: "#7CA290",
    marginTop: 6,
  },

  inputWrapper: {
    width: "100%",
    marginBottom: 4,
  },

  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#f4fdf9",
    color: "#004d32",
    fontSize: 15,
  },

  passwordHint: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },

  registerButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 60,
    marginTop: 8,
    shadowColor: "#004d32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  registerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    textAlign: "center",
  },

  link: {
    color: "#7CA290",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    marginBottom: 100,
  },

  linkBold: {
    color: "#004d32",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 32,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  modalOptionActive: {
    backgroundColor: "#f4fdf9",
  },

  modalIcon: {
    width: 28,
    height: 28,
    marginRight: 14,
  },

  modalLabel: {
    fontSize: 16,
    color: "#004d32",
    flex: 1,
  },

  modalLabelActive: {
    fontWeight: "700",
  },

  bottomSpacer: {
    height: 20,
  },
});

export default SignupScreen;