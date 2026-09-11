// components/modals/SearchAssociationModal.tsx
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
import { useAssociations } from "../../context/AssociationContext";

interface SearchAssociationModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchAssociationModal = ({ visible, onClose }: SearchAssociationModalProps) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { searchAssociations, searchResults = [], searching = false, clearSearch } = useAssociations();
  
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
      await searchAssociations(text);
    } else if (text.length === 0) {
      clearSearch();
    }
  };

  // Colores (mismos que en LatestAssociations)
  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    badge: darkMode ? "#2A2A2A" : "#FFF8DD",
    green: "#00B272",
    shadow: "#000",
    border: darkMode ? "#333" : "#E0E0E0",
    inputBg: darkMode ? "#2A2A2A" : "#F5F5F5",
  };

  const handlePress = (id: number) => {
    onClose(); // Cerrar modal antes de navegar
    router.push(`/detail/association/${id}`);
  };

  const results = Array.isArray(searchResults) ? searchResults : [];
  const hasResults = results.length > 0;
  const isSearching = searching === true;

  // Render de cada resultado con el mismo estilo que LatestAssociations
  const renderResultItem = (item: any) => (
    <TouchableOpacity
      key={item.id.toString()}
      style={[
        styles.resultCard,
        {
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
        },
      ]}
      activeOpacity={0.85}
      onPress={() => handlePress(item.id)}
    >
      {/* IMAGE */}
      <Image
        source={{
          uri: item.image || "https://tudealer.app/avatar_asociation.jpg",
        }}
        style={styles.avatar}
      />

      {/* INFO */}
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          style={[styles.description, { color: colors.subText }]}
          numberOfLines={2}
        >
          {item.description || "Asociación"}
        </Text>

        {/* BOTTOM */}
        <View style={styles.bottomRow}>
          {/* CITY */}
          <View style={styles.cityContainer}>
            <Ionicons name="location-outline" size={13} color={colors.muted} />
            <Text style={[styles.city, { color: colors.muted }]} numberOfLines={1}>
              {item.city || "Ciudad no especificada"}
            </Text>
          </View>

          {/* RATING (simulado, puedes usar item.rating si existe) */}
          <View style={[styles.ratingContainer, { backgroundColor: colors.badge }]}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={[styles.rating, { color: darkMode ? "#FFF" : "#444" }]}>
              {item.rating || "4.5"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Buscar asociaciones
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Input de búsqueda */}
        <View style={[styles.searchContainer, { 
          backgroundColor: colors.inputBg,
          borderColor: colors.border,
        }]}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre, ciudad o descripción..."
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

        {/* Contenido */}
        {isSearching ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Buscando...
            </Text>
          </View>
        ) : hasResults ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {results.map(renderResultItem)}
          </ScrollView>
        ) : query.length >= 2 ? (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={64} color={colors.muted} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No se encontraron resultados
            </Text>
            <Text style={[styles.noResultsSub, { color: colors.muted }]}>
              No hay asociaciones que coincidan con "{query}"
            </Text>
          </View>
        ) : query.length > 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="text-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Escribe al menos 2 caracteres
            </Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="people-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Busca asociaciones por nombre, ciudad o descripción
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  /* ===== ESTILOS DE TARJETA (IGUAL QUE LATESTASSOCIATIONS) ===== */
  resultCard: {
    width: "100%",
    borderRadius: 30,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  city: {
    fontSize: 12,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  noResultsSub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
});

export default SearchAssociationModal;