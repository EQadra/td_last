// app/LawyerListScreen.tsx
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import LatestLawyer from "../../components/LatestLawyer";
import LatestNews from "../../components/LatestNews";
import LatestPost from "../../components/LatestPost";
import LatestServices from "../../components/LatestServices";
// import ProductList from "../../components/ProductList"; // ❌ Eliminado

import { useDarkMode } from "../../../context/app/DarkModeContext";

const LawyerListScreen = () => {
  const { darkMode } = useDarkMode();
  
  // Ya no necesitamos el estado de productos/servicios
  // const [activeProductTab, setActiveProductTab] = useState("products");
  const [activeContentTab, setActiveContentTab] = useState("posts"); // "posts" | "news"

  const backgroundColor = darkMode ? "#020617" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";
  const tabActiveBg = darkMode ? "#1e293b" : "#f1f5f9";

  const sections = [
    {
      id: "lawyers",
      component: <LatestLawyer />,
    },

    // ✅ Servicios fijo (sin tab)
    {
      id: "services",
      component: <LatestServices />,
    },

    // ✅ Tab doble: Posts / Noticias
    {
      id: "posts_news",
      component: (
        <View style={styles.tabContainer}>
          {/* Tabs */}
          <View style={[styles.tabBar, { borderColor }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeContentTab === "posts" && { backgroundColor: tabActiveBg },
              ]}
              onPress={() => setActiveContentTab("posts")}
            >
              <Text style={{ color: textColor, fontWeight: "600" }}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeContentTab === "news" && { backgroundColor: tabActiveBg },
              ]}
              onPress={() => setActiveContentTab("news")}
            >
              <Text style={{ color: textColor, fontWeight: "600" }}>Noticias</Text>
            </TouchableOpacity>
          </View>

          {/* Contenido según el tab activo */}
          <View style={{ backgroundColor }}>
            {activeContentTab === "posts" ? (
              <LatestPost />
            ) : (
              <LatestNews />
            )}
          </View>
        </View>
      ),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >
      {/* STATUS BAR */}
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      {/* CONTENIDO */}
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {
            backgroundColor,
          },
        ]}
      >
        {sections.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor,
            }}
          >
            {item.component}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LawyerListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 40,
  },

  // 🔥 Estilos para el tab de Posts/Noticias
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  tabBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});