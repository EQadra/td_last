// app/ShopListScreen.tsx
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../../context/app/DarkModeContext";
import LatestNews from "../../components/LatestNews";
import LatestPost from "../../components/LatestPost";
import LatestShops from "../../components/LatestShops";
import ProductList from "../../components/ProductList";
import SearchShopModal from "../../components/SearchShopModal";

const ShopListScreen = () => {
  console.log("🔄 [ShopListScreen] RENDERIZANDO");
  const { darkMode } = useDarkMode();
  const [searchVisible, setSearchVisible] = useState(false);
  
  // Estado para el tab de Posts/Noticias
  const [activeContentTab, setActiveContentTab] = useState("posts");

  const colors = {
    background: darkMode ? "#020617" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#124E2C",
    subText: darkMode ? "#94A3B8" : "#6B7A6B",
    card: darkMode ? "#1E293B" : "#F0FDF4",
    green: "#00B272",
    border: darkMode ? "#334155" : "#e2e8f0",
    tabActiveBg: darkMode ? "#1E293B" : "#F0FDF4",
  };

  const sections = [
    // ✅ Tiendas (reemplaza a LatestAssociations)
    {
      id: "shops",
      component: <LatestShops />,
    },
    
    // ✅ Productos (se mantiene)
    {
      id: "products",
      component: (
        <View style={styles.section}>
          <ProductList limit={6} />
        </View>
      ),
    },

    // ✅ Tab doble: Posts / Noticias (se mantiene)
    {
      id: "posts_news",
      component: (
        <View style={styles.tabSection}>
          <View style={[styles.tabBar, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeContentTab === "posts" && { backgroundColor: colors.tabActiveBg },
              ]}
              onPress={() => setActiveContentTab("posts")}
            >
              <Text style={[styles.tabText, { color: colors.text }]}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeContentTab === "news" && { backgroundColor: colors.tabActiveBg },
              ]}
              onPress={() => setActiveContentTab("news")}
            >
              <Text style={[styles.tabText, { color: colors.text }]}>Noticias</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: colors.background }}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Espaciado para status bar */}
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} />
      
      {/* Header */}


      {/* FlatList con flexGrow para que no bloquee el header */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.background }}>
            {item.component}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          backgroundColor: colors.background,
        }}
        style={{ flexGrow: 1 }}
      />

      {/* Modal de búsqueda de tiendas */}
      <SearchShopModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </View>
  );
};

export default ShopListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  
  subtitle: {
    fontSize: 20,
    marginTop: 6,
    letterSpacing: 0.3,
    opacity: 1,
    fontWeight: "500",
  },
  
  searchButton: {
    padding: 12,
    borderRadius: 30,
    marginLeft: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  tabSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  
  tabBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});