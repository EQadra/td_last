import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from "@react-native-community/slider";
import * as Brightness from "expo-brightness";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDarkMode } from "../../../../context/app/DarkModeContext";

export default function AparienciaScreen() {
  /* ================= DARK MODE ================= */

  const { darkMode, setDarkMode } = useDarkMode();

  /* ================= STATES ================= */

  const [automatico, setAutomatico] = useState(true);
  const [brillo, setBrillo] = useState(0.5);

  /* ================= COLORS ================= */

  const colors = {
    background: darkMode ? "#020617" : "#FFFFFF",
    card: darkMode ? "#0F172A" : "#F5F5F5",
    text: darkMode ? "#F8FAFC" : "#000000",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    border: darkMode ? "#334155" : "#DDDDDD",
    icon: darkMode ? "#F8FAFC" : "#000000",
    mockLight: darkMode ? "#1E293B" : "#E0E0E0",
    mockDark: darkMode ? "#020617" : "#333333",
  };

  /* ================= BRIGHTNESS ================= */

  useEffect(() => {
    (async () => {
      try {
        const current = await Brightness.getBrightnessAsync();
        setBrillo(current);
      } catch (e) {
        console.log("Error obteniendo brillo", e);
      }
    })();
  }, []);

  const changeBrightness = async (value) => {
    setBrillo(value);

    try {
      await Brightness.setBrightnessAsync(value);
    } catch (e) {
      console.log("No se pudo cambiar el brillo", e);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={28}
          color={colors.icon}
        />

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Apariencia
        </Text>

        <View style={{ width: 28 }} />
      </View>

      {/* ================= TITLE ================= */}

      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        Apariencia
      </Text>

      {/* ================= LIGHT / DARK ================= */}

      <View style={styles.themeRow}>
        {/* LIGHT */}
        <TouchableOpacity
          style={[
            styles.themeCard,
            {
              backgroundColor: colors.card,
              borderColor: !darkMode ? "#1E8E3E" : colors.border,
            },
            !darkMode && styles.selectedCard,
          ]}
          onPress={() => setDarkMode(false)}
        >
          <View
            style={[
              styles.mockup,
              { backgroundColor: colors.mockLight },
            ]}
          />

          <Text style={[styles.themeText, { color: colors.text }]}>
            Light
          </Text>

          <MaterialCommunityIcons
            name={!darkMode ? "check-circle" : "circle-outline"}
            size={20}
            color="#1E8E3E"
          />
        </TouchableOpacity>

        {/* DARK */}
        <TouchableOpacity
          style={[
            styles.themeCard,
            {
              backgroundColor: colors.card,
              borderColor: darkMode ? "#1E8E3E" : colors.border,
            },
            darkMode && styles.selectedCard,
          ]}
          onPress={() => setDarkMode(true)}
        >
          <View
            style={[
              styles.mockup,
              { backgroundColor: colors.mockDark },
            ]}
          />

          <Text style={[styles.themeText, { color: colors.text }]}>
            Dark
          </Text>

          <MaterialCommunityIcons
            name={darkMode ? "check-circle" : "circle-outline"}
            size={20}
            color="#1E8E3E"
          />
        </TouchableOpacity>
      </View>

      {/* ================= AUTOMATICO ================= */}

      <View style={styles.row}>
        <Text style={[styles.rowText, { color: colors.text }]}>
          Automático
        </Text>

        <Switch
          value={automatico}
          onValueChange={setAutomatico}
          trackColor={{ false: "#CCC", true: "#34C759" }}
        />
      </View>

      {/* ================= BRILLO ================= */}

      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        Brillo
      </Text>

      <View style={styles.sliderRow}>
        <MaterialCommunityIcons
          name="brightness-5"
          size={20}
          color={colors.secondaryText}
        />

        <Slider
          style={{ flex: 1, marginHorizontal: 12 }}
          minimumValue={0}
          maximumValue={1}
          value={brillo}
          onValueChange={changeBrightness}
          minimumTrackTintColor="#1E8E3E"
          maximumTrackTintColor={darkMode ? "#334155" : "#DDD"}
          thumbTintColor="#1E8E3E"
        />

        <MaterialCommunityIcons
          name="brightness-7"
          size={20}
          color={colors.secondaryText}
        />
      </View>

      {/* ================= FOOTER ================= */}

      
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginTop: 50,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 12,
  },

  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  themeCard: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },

  selectedCard: {
    borderWidth: 2,
  },

  mockup: {
    width: 70,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },

  themeText: {
    fontSize: 14,
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },

  rowText: {
    fontSize: 15,
  },

  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  footerIcon: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});