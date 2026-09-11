// components/LatestShops.tsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useShops } from "../../context/ShopContext";
import { useDarkMode } from "../../context/app/DarkModeContext";
import SearchShopModal from "../components/SearchShopModal";

const LatestShops = () => {
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const { darkMode } = useDarkMode();

  const { latestShops, loading } = useShops();

  /* =========================
     COLORS
  ========================= */

  const colors = {
    background: darkMode ? "#020617" : "#F8FAFC",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#124E2C",
    secondary: darkMode ? "#94A3B8" : "#64748B",
    green: darkMode ? "#4ADE80" : "#00B272",
    badge: darkMode ? "#1E293B" : "#ECFDF5",
    meta: darkMode ? "#111827" : "#F1F5F9",
    border: darkMode ? "#1E293B" : "#E2E8F0",
  };

  /* =========================
     SAFE ARRAY
  ========================= */

  const displayedShops = useMemo(() => {
    if (!latestShops) return [];

    const shopsArray = Array.isArray(latestShops)
      ? latestShops
      : latestShops?.data || [];

    return shopsArray
      .filter(Boolean)
      .slice(0, 6);
  }, [latestShops]);

  /* =========================
     LOADING
  ========================= */

  if (loading && displayedShops.length === 0) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginVertical: 20 }}
      />
    );
  }

  /* =========================
     EMPTY
  ========================= */

  if (!loading && displayedShops.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Últimas Tiendas
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
            { color: colors.secondary },
          ]}
        >
          No hay tiendas disponibles
        </Text>

        <SearchShopModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
        />
      </View>
    );
  }

  /* =========================
     COMPONENT
  ========================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Tiendas
        </Text>

        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={styles.searchButton}
        >
          <Ionicons name="search-outline" size={24} color={colors.green} />
        </TouchableOpacity>
      </View>

      {/* LIST - Usando View + map en lugar de FlatList */}
      <View style={styles.listContent}>
        {displayedShops.map((item) => (
          <TouchableOpacity
            key={`${item.id}-${item.name}`}
            activeOpacity={0.85}
            style={[
              styles.badgeCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              if (!item?.id) return;
              router.push(`/detail/store/${item.id}`);
            }}
          >
            {/* IMAGE */}
            <Image
              source={{
                uri: item.image || "https://tudealer.app/avatar_store.jpg",
              }}
              style={styles.avatar}
            />

            {/* INFO */}
            <View style={styles.info}>
              <Text
                style={[
                  styles.name,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    color: colors.secondary,
                  },
                ]}
                numberOfLines={2}
              >
                {item.description || "Sin descripción"}
              </Text>

              {/* BOTTOM ROW */}
              <View style={styles.bottomRow}>
                {/* CITY */}
                <View style={styles.cityContainer}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.secondary}
                  />
                  <Text
                    style={[
                      styles.city,
                      { color: colors.secondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.city || "Sin ciudad"}
                  </Text>
                </View>

                {/* PRODUCTS COUNT */}
                <View
                  style={[
                    styles.servicesContainer,
                    {
                      backgroundColor: colors.badge,
                    },
                  ]}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={13}
                    color={colors.green}
                  />
                  <Text
                    style={[
                      styles.services,
                      { color: colors.green },
                    ]}
                  >
                    {item.products?.length ?? 0}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal de búsqueda */}
      <SearchShopModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </View>
  );
};

export default LatestShops;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  /* ================================
     HEADER
  ================================ */

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
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
     LIST CONTENT
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

    borderWidth: 1,

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