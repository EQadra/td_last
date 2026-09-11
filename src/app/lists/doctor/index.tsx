// DoctorListScreen - VERSIÓN CON TAB DE NOTICIAS/POSTS
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// IMPORTAR COMPONENTES
let LatestDoctors, LatestNews, SearchDoctorModal, LatestServices, LatestPost;

try {
  LatestServices = require("../../components/LatestServices").default;
  LatestDoctors = require("../../components/LatestDoctor").default;
  LatestNews = require("../../components/LatestNews").default;
  LatestPost = require("../../components/LatestPost").default;
  SearchDoctorModal = require("../../components/SearchDoctorModal").default;
} catch (error) {
  console.error("Error importing components:", error);
}

import { useDarkMode } from "../../../context/app/DarkModeContext";

// COMPONENTES DE RESPALDO
const FallbackComponent = ({ name }) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackText}>⚠️ {name} no disponible</Text>
  </View>
);

// ============================
// TIPOS
// ============================
type ContentTabType = "news" | "posts";

// ============================
// COMPONENTE PRINCIPAL
// ============================
const DoctorListScreen = () => {
  const { darkMode } = useDarkMode();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  
  // ✅ TAB PARA NOTICIAS/POSTS
  const [contentTab, setContentTab] = useState<ContentTabType>("news");

  const backgroundColor = darkMode ? "#020617" : "#ffffff";
  const textColor = darkMode ? "#FFFFFF" : "#124E2C";

  const colors = {
    background: darkMode ? "#020617" : "#f0f9f4",
    text: darkMode ? "#F8FAFC" : "#222222",
    primary: darkMode ? "#4ADE80" : "#00B272",
    tabInactive: darkMode ? "#475569" : "#94A3B8",
    tabBackground: darkMode ? "#1E293B" : "#FFFFFF",
  };

  useEffect(() => {
    const checkComponents = async () => {
      try {
        const components = {
          LatestServices,
          LatestDoctors,
          LatestNews,
          LatestPost,
          SearchDoctorModal
        };

        const missing = Object.entries(components)
          .filter(([name, comp]) => !comp || typeof comp !== 'function')
          .map(([name]) => name);

        if (missing.length === 0) {
          setComponentsLoaded(true);
        } else {
          console.error('Componentes faltantes o inválidos:', missing);
        }
      } catch (error) {
        console.error('Error verificando componentes:', error);
      } finally {
        setLoading(false);
      }
    };

    checkComponents();
  }, []);

  // Renderizado seguro de componentes
  const SafeComponent = ({ Component, name, fallback, ...props }) => {
    if (!Component || typeof Component !== 'function') {
      return fallback || <FallbackComponent name={name} />;
    }
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error(`Error renderizando ${name}:`, error);
      return <FallbackComponent name={name} />;
    }
  };

  // ============================
  // RENDER: TABS
  // ============================
  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: colors.tabBackground }]}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          contentTab === "news" && { backgroundColor: colors.primary },
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

      <TouchableOpacity
        style={[
          styles.tabButton,
          contentTab === "posts" && { backgroundColor: colors.primary },
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
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Doctores
        </Text>
        <TouchableOpacity
          style={[styles.searchButton, { 
            backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" 
          }]}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor }]}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* ✅ 1. ÚLTIMOS DOCTORES */}
        <View style={styles.sectionWrapper}>
          <SafeComponent 
            Component={LatestDoctors} 
            name="LatestDoctors" 
          />
        </View>
        
        {/* ✅ 2. SERVICIOS */}
        <View style={styles.sectionWrapper}>
          <SafeComponent 
            Component={LatestServices} 
            name="LatestServices" 
          />
        </View>
        
        {/* ✅ 3. NOTICIAS / POSTS CON TAB */}
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              📰 Contenido reciente
            </Text>
          </View>
          
          {renderTabs()}
          
          <View style={styles.contentContainer}>
            {contentTab === "news" ? (
              <SafeComponent 
                Component={LatestNews} 
                name="LatestNews" 
              />
            ) : (
              <SafeComponent 
                Component={LatestPost} 
                name="LatestPost" 
                limit={10}
                showHeader={false}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <SafeComponent 
        Component={SearchDoctorModal}
        name="SearchDoctorModal"
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default DoctorListScreen;

// ============================
// ESTILOS
// ============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 60,
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
  // ✅ NUEVOS ESTILOS PARA LA SECCIÓN DE CONTENIDO
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
  fallbackContainer: {
    padding: 20,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  fallbackText: {
    color: '#dc2626',
    fontSize: 14,
  },
});