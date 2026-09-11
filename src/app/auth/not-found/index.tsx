import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export default function NotFoundScreen(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.text}>
          retornar a la página principal
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dcfce7",
  },

  text: {
    textAlign: "center",
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
});