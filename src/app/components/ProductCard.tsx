// components/ProductCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
    productable?: {
      name: string;
    };
  };
  onPress: (product: any) => void;
  onWhatsApp: (product: any) => void; // Ahora recibe el producto
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
  loading?: boolean;
}

const ProductCard = ({ 
  product, 
  onPress, 
  onWhatsApp,
  showFavoriteButton = true,
  isFavorite = false,
  onToggleFavorite,
  loading = false,
}: ProductCardProps) => {
  const { darkMode } = useDarkMode();

  const colors = {
    card: darkMode ? "#1E293B" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    primary: darkMode ? "#4ADE80" : "#00B272",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
    favorite: darkMode ? "#EF4444" : "#EF4444",
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => onPress(product)}
      activeOpacity={0.85}
    >
      <Image
        source={{
          uri: product.image || "https://picsum.photos/seed/" + product.id + "/200/200",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      {showFavoriteButton && onToggleFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(product.id)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? colors.favorite : "#FFFFFF"}
            />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>
          {product.productable?.name || "Producto"}
        </Text>
      </View>

      <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
        {product.description}
      </Text>
      <Text style={[styles.price, { color: colors.primary }]}>
        S/ {product.price}
      </Text>

      {/* Botón de "Agregar al carrito" que abre el modal de cantidad */}
      <TouchableOpacity
        style={[styles.whatsappButton, { backgroundColor: "#25D366" }]}
        onPress={() => onWhatsApp(product)}
      >
        <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
        <Text style={styles.whatsappText}>Agregar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",
    borderRadius: 16,
    padding: 12,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    marginBottom: 8,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
    zIndex: 1,
  },
  categoryBadge: {
    backgroundColor: "#E6F6EF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#00B272",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  whatsappText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ProductCard;