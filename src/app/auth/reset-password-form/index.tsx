import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import CustomButton from "../../components/CustomButton";

export default function ResetPasswordFormScreen(): JSX.Element {
  const [newPassword, setNewPassword] =
    useState<string>("");

  const [confirmPassword, setConfirmPassword] =
    useState<string>("");

  const [focusedField, setFocusedField] = useState<
    "new" | "confirm" | null
  >(null);

  const router = useRouter();

  const { email } =
    useLocalSearchParams<{ email?: string }>();

  const handleResetPassword = (): void => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        "Error",
        "Please fill in both password fields."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    console.log("Resetting password for:", email);
    console.log("New Password:", newPassword);

    router.replace("/auth/login");
  };

  const inputStyle = (isFocused: boolean) => [
    styles.input,
    {
      borderColor: isFocused
        ? "#004d32"
        : "#cce3d2",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Reset Password
      </Text>

      {email && (
        <Text style={styles.emailText}>
          Resetting for: {email}
        </Text>
      )}

      <TextInput
        style={inputStyle(focusedField === "new")}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        onFocus={() => setFocusedField("new")}
        onBlur={() => setFocusedField(null)}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor="#7CA290"
      />

      <TextInput
        style={inputStyle(focusedField === "confirm")}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onFocus={() => setFocusedField("confirm")}
        onBlur={() => setFocusedField(null)}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor="#7CA290"
      />

      <CustomButton
        title="Reset Password"
        onPress={handleResetPassword}
      />

      <TouchableOpacity
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.backText}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#004d32",
  },

  emailText: {
    textAlign: "center",
    marginBottom: 12,
    color: "#5e8276",
    fontSize: 14,
  },

  input: {
    height: 48,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: "#f4fdf9",
    color: "#004d32",
    marginBottom: 12,
  },

  backText: {
    textAlign: "center",
    color: "#004d32",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "500",
  },
});