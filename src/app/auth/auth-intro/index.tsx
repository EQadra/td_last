import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function LoginStartScreen(): JSX.Element {
  const router = useRouter();
  const { selectedCountry } = useLocalSearchParams();

  const [loadingButton, setLoadingButton] = useState<
    "login" | "signup" | null
  >(null);

  const startLoadingAndNavigate = (
    button: "login" | "signup",
    path: string,
    params?: object
  ) => {
    setLoadingButton(button);

    setTimeout(() => {
      setLoadingButton(null);

      router.replace({
        pathname: path,
        params,
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Bienvenida */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Bienvenido!</Text>
      </View>

      {/* Botón Ingresar */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() =>
          startLoadingAndNavigate("login", "/aplication/countrys", {
            selectedCountry,
          })
        }
        disabled={!!loadingButton}
      >
        <Text style={styles.loginButtonText}>
          {loadingButton === "login" ? "Cargando..." : "Ingresar"}
        </Text>
      </TouchableOpacity>

      {/* Botón Registrarse */}
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() =>
          startLoadingAndNavigate("signup", "/auth/signup")
        }
        disabled={!!loadingButton}
      >
        <Text
          style={[
            styles.signupButtonText,
            loadingButton === "signup" && styles.disabledText,
          ]}
        >
          {loadingButton === "signup"
            ? "Cargando..."
            : "Registrarse"}
        </Text>
      </TouchableOpacity>

      {/* País seleccionado */}
      {selectedCountry && (
        <Text style={styles.countryText}>
          País seleccionado: {selectedCountry}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
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

  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#004d32",
    marginLeft: 8,
    marginTop: 20,
    marginBottom: 20,
  },

  loginButton: {
    width: 240,
    borderRadius: 999,
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: "#064e3b",
  },

  loginButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },

  signupButton: {
    width: 240,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#004d32",
    borderRadius: 999,
    paddingVertical: 16,
    marginBottom: 16,
  },

  signupButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#004d32",
  },

  disabledText: {
    color: "#9ca3af",
  },

  countryText: {
    textAlign: "center",
    color: "#004d32",
    marginTop: 24,
    fontSize: 16,
  },
});