// components/modals/SearchShopModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useShops } from "../../context/ShopContext";

interface SearchShopModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchShopModal = ({ visible, onClose }: SearchShopModalProps) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { searchShops, searchResults = [], searching = false, clearSearch, error } = useShops();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) {
      setQuery("");
      clearSearch();
    }
  }, [visible]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      await searchShops(text);
    } else if (text.length === 0) {
      clearSearch();
    }
  };

  // Colores consistentes con los otros modales
  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    border: darkMode ? "#333" : "#E0E0E0",
    inputBg: darkMode ? "#2A2A2A" : "#F5F5F5",
    green: "#00B272",
    shadow: "#000",
    badge: darkMode ? "#2A2A2A" : "#ECFDF5",
    red: "#FF4444",
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Buscar tiendas</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Input de búsqueda */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre, categoría o ciudad..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: darkMode ? "#2A1A1A" : "#FFE5E5" }]}>
            <Ionicons name="alert-circle" size={20} color={colors.red} />
            <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
          </View>
        )}

        {/* Contenido */}
        {searching ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={[styles.messageText, { color: colors.muted }]}>Buscando tiendas...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.resultItem,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.shadow,
                  },
                ]}
                onPress={() => {
                  onClose();
                  router.push(`/detail/store/${item.id}`);
                }}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.image || "https://tudealer.app/avatar_store.jpg" }}
                  style={styles.avatar}
                />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.resultSpecialty, { color: colors.subText }]} numberOfLines={1}>
                    🏪 {item.category || "Tienda"}
                  </Text>
                  <View style={styles.bottomRow}>
                    <View style={styles.cityContainer}>
                      <Ionicons name="location-outline" size={13} color={colors.muted} />
                      <Text style={[styles.city, { color: colors.muted }]} numberOfLines={1}>
                        {item.city || "Ciudad no especificada"}
                      </Text>
                    </View>
                    <View style={[styles.feedbackContainer, { backgroundColor: colors.badge }]}>
                      <Ionicons name="star" size={13} color="#FFD700" />
                      <Text style={[styles.feedbackCount, { color: darkMode ? "#FFF" : "#444" }]}>
                        {item.rating || 0}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.badgesRow}>
                    <View style={[styles.badge, { backgroundColor: colors.badge }]}>
                      <Ionicons name="construct-outline" size={12} color={colors.green} />
                      <Text style={[styles.badgeText, { color: colors.subText }]}>
                        {item.services?.length || 0} servicios
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.badge }]}>
                      <Ionicons name="bag-handle-outline" size={12} color={colors.green} />
                      <Text style={[styles.badgeText, { color: colors.subText }]}>
                        {item.products?.length || 0} productos
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : query.length >= 2 ? (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={64} color={colors.muted} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No se encontraron resultados
            </Text>
            <Text style={[styles.noResultsSub, { color: colors.muted }]}>
              No hay tiendas que coincidan con "{query}"
            </Text>
            <TouchableOpacity
              style={[styles.tryAgainButton, { borderColor: colors.green }]}
              onPress={() => handleSearch(query)}
            >
              <Text style={[styles.tryAgainText, { color: colors.green }]}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        ) : query.length > 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="text-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>Escribe al menos 2 caracteres</Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="storefront-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Busca tiendas por nombre, categoría o ciudad
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  closeButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 8, padding: 0 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  errorText: { fontSize: 14, marginLeft: 8, flex: 1 },
  scrollView: { flex: 1 },
  listContent: { paddingBottom: 20 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 30,
    marginBottom: 12,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: "700" },
  resultSpecialty: { fontSize: 13, marginTop: 2 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  cityContainer: { flexDirection: "row", alignItems: "center" },
  city: { fontSize: 12, marginLeft: 4 },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  feedbackCount: { marginLeft: 4, fontSize: 12, fontWeight: "700" },
  badgesRow: { flexDirection: "row", marginTop: 6, gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { fontSize: 10, fontWeight: "600", marginLeft: 4 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  noResultsTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  noResultsSub: { fontSize: 14, textAlign: "center", marginTop: 8 },
  messageText: { fontSize: 16, textAlign: "center", marginTop: 12 },
  tryAgainButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  tryAgainText: { fontSize: 14, fontWeight: "600" },
});

export default SearchShopModal;