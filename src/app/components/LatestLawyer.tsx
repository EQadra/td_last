import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLawyers } from "../../context/LawyerContext";
import SearchLawyerModal from "./SearchLawyerModal";

/* ================================
   DARK MODE
================================ */

import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestLawyer = () => {

  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const {
    latestLawyers,
    fetchLatestLawyers,
    loading,
  } = useLawyers();

  const { darkMode } = useDarkMode();

  /* ================================
     COLORS
  ================================ */

  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    green: "#00B272",
    badge: darkMode ? "#2A2A2A" : "#EAFBF4",
    shadow: "#000",
  };

  /* ================================
     FETCH LAWYERS
  ================================ */

  useEffect(() => {
    fetchLatestLawyers();
  }, []);

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginTop: 20 }}
      />
    );
  }

  /* ================================
     EMPTY
  ================================ */

  if (!latestLawyers?.length) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background }
        ]}
      >
        {/* Header con botón de búsqueda */}
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Abogados 
          </Text>
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
            style={styles.searchButton}
          >
            <Ionicons name="search-outline" size={24} color={colors.green} />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.emptyText,
            { color: colors.muted },
          ]}
        >
          No hay abogados disponibles
        </Text>

        {/* Modal de búsqueda */}
        <SearchLawyerModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
        />
      </View>
    );
  }

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >

      {/* Header con botón de búsqueda */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          Abogados 
        </Text>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={styles.searchButton}
        >
          <Ionicons name="search-outline" size={24} color={colors.green} />
        </TouchableOpacity>
      </View>

      {/* LISTA DE ABOGADOS - View + map en lugar de FlatList */}
      <View style={styles.listContent}>
        {latestLawyers.map((item) => (
          <TouchableOpacity
            key={item.id.toString()}
            style={[
              styles.badgeCard,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
              },
            ]}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                `/detail/lawyer/${item.id}`
              )
            }
          >
            {/* IMAGE */}
            <Image
              source={{
                uri:
                  item.image ||
                  "https://tudealer.app/avatar_lawyer.jpg",
              }}
              style={styles.avatar}
            />

            {/* INFO */}
            <View style={styles.info}>
              <Text
                style={[
                  styles.name,
                  { color: colors.text },
                ]}
                numberOfLines={1}
              >
                {item.first_name}{" "}
                {item.last_name}
              </Text>

              <Text
                style={[
                  styles.specialty,
                  { color: colors.subText },
                ]}
                numberOfLines={1}
              >
                ⚖️ {item.specialty}
              </Text>

              {/* BOTTOM */}
              <View style={styles.bottomRow}>
                {/* CITY */}
                <View
                  style={styles.cityContainer}
                >
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.muted}
                  />
                  <Text
                    style={[
                      styles.city,
                      { color: colors.muted },
                    ]}
                    numberOfLines={1}
                  >
                    {item.city}
                  </Text>
                </View>

                {/* SERVICES */}
                <View
                  style={[
                    styles.servicesContainer,
                    {
                      backgroundColor:
                        colors.badge,
                    },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={13}
                    color={colors.green}
                  />
                  <Text
                    style={[
                      styles.services,
                      { color: colors.green },
                    ]}
                  >
                    {item.services?.length ?? 0}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal de búsqueda */}
      <SearchLawyerModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />

    </View>

  );
};

export default LatestLawyer;

const styles = StyleSheet.create({

  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  /* ================================
     HEADER
  ================================ */

  headerRow: {
    marginTop: 50,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },

  /* ================================
     LIST CONTENT (NUEVO)
  ================================ */

  listContent: {
    flex: 1,
  },

  /* ================================
     CARD
  ================================ */

  badgeCard: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
  },

  specialty: {
    fontSize: 13,
    marginTop: 4,
  },

  /* ================================
     BOTTOM
  ================================ */

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

  servicesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  services: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "700",
  },

});