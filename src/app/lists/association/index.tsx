// app/AssociationListScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../../context/app/DarkModeContext";
import LatestAssociations from "../../components/LatestAssociations";
import LatestNews from "../../components/LatestNews";
import LatestPost from "../../components/LatestPost";
import ProductList from "../../components/ProductList";
import SearchAssociationModal from "../../components/SearchAssociationModal";

type ContentTabType = "posts" | "news";

const AssociationListScreen = () => {
  console.log("🔄 [AssociationListScreen] RENDERIZANDO");
  const { darkMode } = useDarkMode();
  const [searchVisible, setSearchVisible] = useState(false);
  const [contentTab, setContentTab] = useState<ContentTabType>("posts");

  const colors = {
    background: darkMode ? "#020617" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#124E2C",
    subText: darkMode ? "#94A3B8" : "#6B7A6B",
    card: darkMode ? "#1E293B" : "#F0FDF4",
    green: "#00B272",
    border: darkMode ? "#334155" : "#e2e8f0",
    tabActiveBg: darkMode ? "#1E293B" : "#F0FDF4",
    tabInactive: darkMode ? "#475569" : "#94A3B8",
    tabBackground: darkMode ? "#1E293B" : "#FFFFFF",
  };

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: colors.tabBackground }]}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          contentTab === "posts" && { backgroundColor: colors.green },
        ]}
        onPress={() => setContentTab("posts")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            { color: contentTab === "posts" ? "#FFFFFF" : colors.tabInactive },
          ]}
        >
          📝 Posts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          contentTab === "news" && { backgroundColor: colors.green },
        ]}
        onPress={() => setContentTab("news")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            { color: contentTab === "news" ? "#FFFFFF" : colors.tabInactive },
          ]}
        >
          📰 Noticias
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* HEADER - EXACTAMENTE IGUAL QUE DOCTOR */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Asociaciones
        </Text>
        <TouchableOpacity
          style={[
            styles.searchButton,
            {
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={() => setSearchVisible(true)}
        >
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. ÚLTIMAS ASOCIACIONES */}
        <View style={styles.sectionWrapper}>
          <LatestAssociations />
        </View>

        {/* 2. PRODUCTOS */}
        <View style={styles.sectionWrapper}>
          <ProductList limit={6} />
        </View>

        {/* 3. POSTS / NOTICIAS CON TAB */}
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📰 Contenido reciente
            </Text>
          </View>

          {renderTabs()}

          <View style={styles.contentContainer}>
            {contentTab === "posts" ? (
              <LatestPost />
            ) : (
              <LatestNews />
            )}
          </View>
        </View>
      </ScrollView>

      <SearchAssociationModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AssociationListScreen;

// ============================
// ESTILOS - EXACTAMENTE IGUAL QUE DOCTOR
// ============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 70, // ✅ IGUAL QUE DOCTOR
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  searchButton: {
    padding: 10,
    borderRadius: 30,
  },
  sectionWrapper: {
    width: "100%",
    minHeight: 50,
    paddingHorizontal: 0,
  },
  contentSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 30,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentContainer: {
    marginTop: 12,
  },
});