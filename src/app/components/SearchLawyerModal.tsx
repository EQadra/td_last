// SearchLawyerModal.tsx - Versión con diseño de tarjeta mejorado
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
import { useLawyers } from "../../context/LawyerContext";

interface SearchLawyerModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchLawyerModal = ({ visible, onClose }: SearchLawyerModalProps) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { searchLawyers, searchResults, searching, clearSearch } = useLawyers();
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
      await searchLawyers(text);
    } else if (text.length === 0) {
      clearSearch();
    }
  };

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
    badge: darkMode ? "#2A2A2A" : "#FFF8DD",
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Buscar abogados
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Input */}
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
            placeholder="Buscar por nombre, especialidad o ciudad..."
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

        {/* Resultados */}
        {searching ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Buscando...
            </Text>
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
                  router.push(`/detail/lawyer/${item.id}`);
                }}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.image || "https://tudealer.app/avatar_lawyer.jpg" }}
                  style={styles.avatar}
                />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={[styles.resultSpecialty, { color: colors.subText }]} numberOfLines={1}>
                    ⚖️ {item.specialty || "Abogado"}
                  </Text>
                  <View style={styles.bottomRow}>
                    <View style={styles.cityContainer}>
                      <Ionicons name="location-outline" size={13} color={colors.muted} />
                      <Text style={[styles.city, { color: colors.muted }]} numberOfLines={1}>
                        {item.city || "Ciudad no especificada"}
                      </Text>
                    </View>
                    <View style={[styles.feedbackContainer, { backgroundColor: colors.badge }]}>
                      <Ionicons name="chatbubble-outline" size={13} color={colors.muted} />
                      <Text style={[styles.feedbackCount, { color: darkMode ? "#FFF" : "#444" }]}>
                        {item.feedbacks?.length || 0}
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
              No hay abogados que coincidan con "{query}"
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
              Busca abogados por nombre, especialidad o ciudad
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
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  noResultsTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  noResultsSub: { fontSize: 14, textAlign: "center", marginTop: 8 },
  messageText: { fontSize: 16, textAlign: "center", marginTop: 12 },
});

export default SearchLawyerModal;