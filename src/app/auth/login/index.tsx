import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// ICONOS SVG
// ============================================================

const GoogleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 48 48">
    <Path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <Path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <Path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <Path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 48 48">
    <Path
      fill="#1877F2"
      d="M24 4C12.954 4 4 12.954 4 24c0 9.983 7.806 18.262 17.81 18.74V29.78h-5.2v-5.78h5.2v-4.41c0-5.2 3.104-8.08 7.826-8.08 2.266 0 4.636.4 4.636.4v5.09h-2.61c-2.57 0-3.37 1.6-3.37 3.24v3.76h5.73l-.92 5.78h-4.81V42.74C36.194 40.262 44 31.983 44 24 44 12.954 35.046 4 24 4z"
    />
  </Svg>
);

const InstagramIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 48 48">
    <Path
      fill="#E1306C"
      d="M34.017 41.99l-20 .019c-4.4.004-8.003-3.592-8.008-7.992l-.019-20.001c-.004-4.4 3.592-8.003 7.992-8.008l20-.019c4.4-.004 8.003 3.592 8.008 7.992l.019 20.001c.004 4.4-3.592 8.003-7.992 8.008z"
    />
    <Path
      fill="#fff"
      d="M24 31.5c-4.142 0-7.5-3.358-7.5-7.5s3.358-7.5 7.5-7.5 7.5 3.358 7.5 7.5-3.358 7.5-7.5 7.5zm0-13c-3.037 0-5.5 2.463-5.5 5.5s2.463 5.5 5.5 5.5 5.5-2.463 5.5-5.5-2.463-5.5-5.5-5.5z"
    />
    <Circle cx="33.5" cy="14.5" r="2.5" fill="#fff" />
  </Svg>
);

const TikTokIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 48 48">
    <Path
      fill="#000000"
      d="M36 12.4c-2.5 0-4.8-1.3-6.1-3.4C28.6 7 28 5.1 28 3h-6.9v29.1c-.1 3.5-3 6.4-6.6 6.4-3.6 0-6.6-2.9-6.6-6.4s2.9-6.4 6.6-6.4c.7 0 1.3.1 2 .3v-7.1c-9.3.9-16.8 8.9-16.8 18.7S7.7 48 17.5 48c9.8 0 17.7-8 17.7-17.8V16.5c2.8 2 6.2 3.1 9.8 3.1v-7.2h-.2z"
    />
  </Svg>
);

const YouTubeIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 48 48">
    <Path
      fill="#FF0000"
      d="M43.2 33.6c-.4 1.4-1.4 2.6-2.8 3-2.6.8-12.4.8-12.4.8s-9.8 0-12.4-.8c-1.4-.4-2.4-1.6-2.8-3-.8-2.6-.8-8-.8-8s0-5.4.8-8c.4-1.4 1.4-2.6 2.8-3 2.6-.8 12.4-.8 12.4-.8s9.8 0 12.4.8c1.4.4 2.4 1.6 2.8 3 .8 2.6.8 8 .8 8s0 5.4-.8 8z"
    />
    <Path fill="#fff" d="M19.2 31.2l9.6-6.4-9.6-6.4v12.8z" />
  </Svg>
);

// ============================================================
// LOGIN SCREEN
// ============================================================

export default function LoginScreen(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true); // ✅ Por defecto true
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const { selectedCountry } =
    useLocalSearchParams<{ selectedCountry?: string }>();

  // ✅ VERIFICAR SI YA ESTÁ AUTENTICADO
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        router.replace("/aplication/home-app");
      }
    };
    checkAuth();
  }, [isAuthenticated]);

  // ✅ CARGAR CREDENCIALES GUARDADAS
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPassword = await AsyncStorage.getItem("savedPassword");

        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Error cargando credenciales", error);
      }
    };

    loadCredentials();
  }, []);

  // ✅ VALIDACIONES
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = isValidEmail(email) && password.length >= 3;

  // ✅ HANDLE LOGIN
  const handleLogin = async (): Promise<void> => {
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 3) {
      Alert.alert("Error", "La contraseña debe tener al menos 3 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // ✅ LLAMAR AL LOGIN CON REMEMBER_ME
      await login(email, password, rememberMe);

      // ✅ GUARDAR CREDENCIALES SI REMEMBER_ME ESTÁ ACTIVADO
      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem("savedPassword", password);
      } else {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }

      // ✅ NAVEGAR AL HOME
      router.replace("/aplication/home-app");
    } catch (error: any) {
      console.error("Error en login:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "No se pudo iniciar sesión. Verifica tus datos.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REDES SOCIALES
  const handleSocialRedirect = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir el enlace.")
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/logo.png")}
            style={styles.logo}
          />
        </View>

        {/* TÍTULO */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Ingresar</Text>
        </View>

        <Text style={styles.subtitle}>Accede a tu cuenta para continuar</Text>

        {/* CAMPOS */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#9aa5a0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9aa5a0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {/* RECORDAR */}
        <View style={styles.rememberContainer}>
          <Text style={styles.rememberText}>Recordar credenciales</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{
              false: "#ccc",
              true: "#004d32",
            }}
            thumbColor="#fff"
            disabled={loading}
          />
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          disabled={!isFormValid || loading}
          onPress={handleLogin}
          style={[
            styles.loginButton,
            (!isFormValid || loading) && styles.disabledButton,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        {/* PAÍS */}
        {selectedCountry && (
          <Text style={styles.countryText}>
            País seleccionado: {selectedCountry}
          </Text>
        )}

        {/* REDES SOCIALES */}
        <View style={styles.socialDividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.socialDividerText}>Síguenos</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              handleSocialRedirect("https://www.tiktok.com/@tudealer.app")
            }
          >
            <TikTokIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              handleSocialRedirect(
                "https://www.facebook.com/profile.php?id=61590359920356"
              )
            }
          >
            <FacebookIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              handleSocialRedirect("https://www.instagram.com/tudealerapp/")
            }
          >
            <InstagramIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() =>
              handleSocialRedirect("https://www.youtube.com/@tudealerapp")
            }
          >
            <YouTubeIcon />
          </TouchableOpacity>
        </View>

        {/* LINKS */}
        <View style={styles.linksContainer}>
          <Text
            style={styles.link}
            onPress={() => router.push("/auth/forgot-password")}
          >
            ¿Olvidaste tu contraseña?
          </Text>

          <Text
            style={[styles.link, styles.registerLink]}
            onPress={() => router.push("/auth/signup")}
          >
            ¿No tienes cuenta? Regístrate
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#004d32",
    marginLeft: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#5c7a70",
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f2fdf6",
    borderColor: "#cce3d2",
    color: "#004d32",
    fontSize: 15,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  rememberText: {
    color: "#004d32",
    fontSize: 14,
  },
  loginButton: {
    height: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#004d32",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  countryText: {
    textAlign: "center",
    marginTop: 8,
    color: "#004d32",
    fontWeight: "500",
  },
  socialDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e8e3",
  },
  socialDividerText: {
    marginHorizontal: 16,
    color: "#5c7a70",
    fontSize: 14,
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  socialButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  linksContainer: {
    marginTop: 8,
  },
  link: {
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
    color: "#004d32",
  },
  registerLink: {
    marginTop: 8,
  },
});