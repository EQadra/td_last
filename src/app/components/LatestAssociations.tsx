import React, { useEffect, useState } from "react";
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

import { useAssociations } from "../../context/AssociationContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestAssociations = () => {
  const router = useRouter();
  const { latestAssociations, fetchLatestAssociations } = useAssociations();
  const { darkMode } = useDarkMode();
  
  const [loading, setLoading] = useState(true);

  /* ================================
     COLORS
  ================================ */

  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    badge: darkMode ? "#2A2A2A" : "#E6F6EF",
    green: "#00B272",
    shadow: "#000",
  };

  /* ================================
     FETCH
  ================================ */

  useEffect(() => {
    const loadAssociations = async () => {
      setLoading(true);
      await fetchLatestAssociations();
      setLoading(false);
    };
    loadAssociations();
  }, []);

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginVertical: 20 }}
      />
    );
  }

  /* ================================
     EMPTY
  ================================ */

  if (!latestAssociations?.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Asociaciones
        </Text>
        <Text style={[styles.emptyText, { color: colors.muted }]}>
          No hay asociaciones disponibles
        </Text>
      </View>
    );
  }

  /* ================================
     RENDER CON MAP (SIN SCROLL)
  ================================ */

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TITLE */}
      {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Asociaciones 
      </Text> */}

      {latestAssociations.map((item) => (
        <TouchableOpacity
          key={item.id.toString()}
          style={[
            styles.badgeCard,
            {
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
            },
          ]}
          onPress={() => router.push(`/detail/association/${item.id}`)}
          activeOpacity={0.85}
        >
          {/* IMAGE - Circular */}
          <Image
            source={{
              uri: item.image || "https://tudealer.app/avatar/avatar_association.jpg",
            }}
            style={styles.avatar}
          />

          {/* INFO */}
          <View style={styles.info}>
            {/* NOMBRE */}
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name || "Sin nombre"}
            </Text>

            {/* DESCRIPCIÓN */}
            <Text style={[styles.description, { color: colors.subText }]} numberOfLines={2}>
              {item.description || "Sin descripción"}
            </Text>

            {/* BOTTOM ROW - Ciudad + Contador */}
            <View style={styles.bottomRow}>
              {/* CIUDAD */}
              <View style={styles.cityContainer}>
                <Ionicons name="location-outline" size={13} color={colors.muted} />
                <Text style={[styles.city, { color: colors.muted }]} numberOfLines={1}>
                  {item.city || "Sin ciudad"}
                </Text>
              </View>

              {/* CONTADOR DE FEEDBACKS */}
              <View
                style={[
                  styles.feedbackContainer,
                  {
                    backgroundColor: colors.badge,
                  },
                ]}
              >
                <Ionicons name="chatbubble-outline" size={13} color={colors.muted} />
                <Text
                  style={[
                    styles.feedbackCount,
                    {
                      color: darkMode ? "#FFF" : "#444",
                    },
                  ]}
                >
                  {item.feedbacks?.length || 0}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LatestAssociations;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },

  /* ================================
     CARD
  ================================ */

  badgeCard: {
    width: "100%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,

    flexDirection: "row",
    alignItems: "center",

    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    lineHeight: 16,
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
    flex: 1,
  },

  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  feedbackCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },
});