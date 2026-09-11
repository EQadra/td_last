// src/Components/CustomButton.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#86EFAC", // verde pastel claro
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#065F46", // verde oscuro para contraste
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
