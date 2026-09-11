// screens/HomeScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../../context/app/DarkModeContext";
import { useAuth } from "../../../context/AuthContext";
import { useAvatar } from "../../../context/AvatarContext";
import { useNewsRole } from "../../../context/NewsRoleContext";
import { useProducts } from "../../../context/ProductContext";
import { useServices } from "../../../context/ServiceContext";
import LatestNews from "../../components/LatestNews";
import LatestPost from "../../components/LatestPost";
import LatestServices from "../../components/LatestServices";
import ProductList from "../../components/ProductList";
import RoleCarousel from "../../components/RoleCarousel";

type ProductTabType = "products" | "services";
type ContentTabType = "news" | "posts";

const HomeScreen: React.FC = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const { avatarKey } = useAvatar();
  const { fetchLatestProducts } = useProducts();
  const { fetchLatestNews } = useNewsRole();
  const { fetchServices } = useServices();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Cada sección tiene su propio tab independiente
  const [productTab, setProductTab] = useState<ProductTabType>("products");
  const [contentTab, setContentTab] = useState<ContentTabType>("news");

  const colors = {
    background: darkMode ? "#020617" : "#f0f9f4",
    text: darkMode ? "#F8FAFC" : "#222222",
    primary: darkMode ? "#4ADE80" : "#00B272",
    tabInactive: darkMode ? "#475569" : "#94A3B8",
    tabBackground: darkMode ? "#1E293B" : "#FFFFFF",
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchLatestProducts(),
        fetchLatestNews(),
        fetchServices(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchLatestProducts(),
        fetchLatestNews(),
        fetchServices(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // RENDER: TABS DE UNA SECCIÓN (2 tabs lado a lado)
  // ============================================================
  const renderSectionTabs = <T extends string>(
    tabs: { key: T; label: string; icon: string }[],
    active: T,
    onChange: (key: T) => void
  ) => (
    <View style={[styles.tabsContainer, { backgroundColor: colors.tabBackground }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            active === tab.key && { backgroundColor: colors.primary },
          ]}
          onPress={() => onChange(tab.key)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              { color: active === tab.key ? "#FFFFFF" : colors.tabInactive },
            ]}
          >
            {tab.icon} {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ============================================================
  // RENDER: HEADER
  // ============================================================
  const renderHeader = () => {
    const userAvatar =
      user?.profile?.image ||
      user?.avatar ||
      user?.avatar_url ||
      "https://i.pravatar.cc/150";
    const avatarWithCache = `${userAvatar}?t=${avatarKey}`;
    const userName = user?.name || "Usuario";

    return (
      <LinearGradient
        colors={darkMode ? ["#0F172A", "#020617"] : ["#00B272", "#00994C"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola! 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Image
            key={avatarWithCache}
            source={{ uri: avatarWithCache }}
            style={styles.avatar}
          />
        </View>
      </LinearGradient>
    );
  };

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00B272"
            colors={["#00B272"]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carousel se queda igual */}
        <RoleCarousel />

        {/* ========== SECCIÓN 1: Productos / Servicios ========== */}
        <View style={styles.section}>
          {renderSectionTabs(
            [
              { key: "products" as const, label: "Productos", icon: "🛍️" },
              { key: "services" as const, label: "Servicios", icon: "🔧" },
            ],
            productTab,
            setProductTab
          )}
          <View style={styles.contentContainer}>
            {productTab === "products" ? (
              <ProductList limit={10} showHeader={true} />
            ) : (
              <LatestServices />
            )}
          </View>
        </View>

        {/* ========== SECCIÓN 2: Noticias / Posts ========== */}
        <View style={styles.section}>
          {renderSectionTabs(
            [
              { key: "news" as const, label: "Noticias", icon: "📰" },
              { key: "posts" as const, label: "Posts", icon: "📝" },
            ],
            contentTab,
            setContentTab
          )}
          <View style={styles.contentContainer}>
            {contentTab === "news" ? (
              <LatestNews />
            ) : (
              <LatestPost limit={10} showHeader={false} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 10,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  greeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
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

export default HomeScreen;