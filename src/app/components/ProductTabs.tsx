import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProductItem = {
  id: string | number;
  image: string;
  name: string;
  description: string;
};

type Props = {
  tabs: string[];
  tabContent: {
    [key: string]: ProductItem[];
  };
};

export default function ProductTabs({
  tabs,
  tabContent,
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Función para renderizar los productos en filas de 2
  const renderProducts = () => {
    const products = tabContent[activeTab] || [];
    const rows = [];
    const itemsPerRow = 2;

    // Crear filas de 2 items cada una
    for (let i = 0; i < products.length; i += itemsPerRow) {
      const rowItems = products.slice(i, i + itemsPerRow);
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.productName}>
                  {item.name}
                </Text>
                <Text style={styles.description}>
                  {item.description}
                </Text>
                <Text style={styles.moreText}>
                  ver más ...
                </Text>
              </View>
            </View>
          ))}
          {/* Si la fila tiene solo 1 item, agregar un espacio vacío */}
          {rowItems.length === 1 && <View style={styles.emptyCard} />}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.activeTab : styles.inactiveTab,
            ]}
          >
            <Text style={styles.tabText}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content - Ahora sin ScrollView */}
      <View style={styles.contentContainer}>
        {tabContent[activeTab]?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay productos disponibles en esta categoría
            </Text>
          </View>
        ) : (
          renderProducts()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    flex: 1,
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    flexWrap: "wrap",
  },

  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 6,
    marginBottom: 8,
  },

  activeTab: {
    backgroundColor: "#4ade80",
  },

  inactiveTab: {
    backgroundColor: "#dcfce7",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#166534",
  },

  contentContainer: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  emptyCard: {
    flex: 1,
    marginHorizontal: 4,
  },

  image: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  productName: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "600",
    color: "#14532d",
  },

  description: {
    fontSize: 14,
    color: "#15803d",
  },

  moreText: {
    fontSize: 14,
    color: "#22c55e",
    marginTop: 6,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});