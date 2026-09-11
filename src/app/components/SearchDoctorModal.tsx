// components/SearchDoctorModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { useDoctors } from "../../context/DoctorContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

interface SearchDoctorModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchDoctorModal: React.FC<SearchDoctorModalProps> = ({ visible, onClose }) => {
  const { darkMode } = useDarkMode();
  const { latestDoctors, loading } = useDoctors();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");

  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    badge: darkMode ? "#2A2A2A" : "#FFF8DD",
    green: "#00B272",
    shadow: "#000",
    inputBackground: darkMode ? "#2A2A2A" : "#F3F3F3",
    placeholder: darkMode ? "#888888" : "#999999",
    icon: darkMode ? "#CCCCCC" : "#777777",
  };

  // Filtrado local sobre los últimos doctores
  const filteredDoctors = useMemo(() => {
    if (!searchText.trim()) return [];
    const text = searchText.toLowerCase();
    return latestDoctors.filter((doctor: any) => {
      const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
      const specialty = doctor.specialty?.toLowerCase() || "";
      const city = doctor.city?.toLowerCase() || "";
      return fullName.includes(text) || specialty.includes(text) || city.includes(text);
    });
  }, [searchText, latestDoctors]);

  const handlePress = (id: number) => {
    router.push(`/detail/doctor/${id}`);
    onClose();
    setSearchText("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Buscar doctores</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Input de búsqueda */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre, especialidad o ciudad..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>

        {/* Resultados */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Cargando doctores...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsContainer}
          >
            {filteredDoctors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={60} color={colors.placeholder} />
                <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                  {searchText.trim() ? "No se encontraron doctores" : "Busca un doctor"}
                </Text>
                {searchText.trim() && (
                  <Text style={[styles.emptySubText, { color: colors.subText }]}>
                    Intenta con otras palabras clave
                  </Text>
                )}
              </View>
            ) : (
              filteredDoctors.map((item: any) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  style={[
                    styles.resultItem,
                    {
                      backgroundColor: colors.card,
                      shadowColor: colors.shadow,
                    },
                  ]}
                  onPress={() => handlePress(item.id)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: item.image || "https://tudealer.app/avatar_doctor.jpg" }}
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                      Dr. {item.first_name} {item.last_name}
                    </Text>
                    <Text style={[styles.specialty, { color: colors.subText }]} numberOfLines={1}>
                      {item.specialty || "Médico General"}
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
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, paddingVertical: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14 },
  resultsContainer: { paddingBottom: 40 },
  emptyContainer: { alignItems: "center", paddingVertical: 80 },
  emptyText: { fontSize: 16, marginTop: 12 },
  emptySubText: { fontSize: 14, marginTop: 4 },
  resultItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 36,
    marginBottom: 14,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 14 },
  info: { flex: 1, justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "700" },
  specialty: { fontSize: 13, marginTop: 4 },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  city: { fontSize: 12, marginLeft: 4, flex: 1 },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  feedbackCount: { marginLeft: 4, fontSize: 12, fontWeight: "700" },
});

export default SearchDoctorModal;