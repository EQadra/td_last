import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Product = {
  id: string | number;
  name: string;
  image: string;
  description: string;
  price?: string;
};

type GridTabsProps = {
  tabs: string[];
  tabContent: Record<string, Product[]>;
  initialTab?: string;
};

const GridTabs = ({ tabs, tabContent, initialTab }: GridTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(initialTab || tabs[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products = tabContent[selectedTab] || [];

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // Renderizar productos en grid de 2 columnas con View + map
  const renderProductsGrid = () => {
    const rows = [];
    const itemsPerRow = 2;

    for (let i = 0; i < products.length; i += itemsPerRow) {
      const rowItems = products.slice(i, i + itemsPerRow);
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => (
            <View key={item.id.toString()} style={styles.productCard}>
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription}>{item.description}</Text>
                {item.price && (
                  <Text style={styles.productPrice}>{item.price}</Text>
                )}
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openModal(item)}
                >
                  <MaterialIcons name="info-outline" size={20} color="#2A59FE" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => console.log('Add to cart', item)}
                >
                  <MaterialCommunityIcons name="cart-plus" size={20} color="#2A59FE" />
                </TouchableOpacity>
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
      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products Grid - View + map en lugar de FlatList */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
          </View>
        ) : (
          renderProductsGrid()
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedProduct && (
              <>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                />
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedProduct.description}
                  </Text>
                  {selectedProduct.price && (
                    <Text style={styles.modalPrice}>{selectedProduct.price}</Text>
                  )}
                </View>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D1FAE5", // fondo verde muy claro
  },
  scrollContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ECFDF5', // verde pastel claro
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0', // verde tenue
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#6EE7B7', // verde menta vivo
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563', // gris verdoso
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  productsContainer: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '48%',
  },
  emptyCard: {
    flex: 1,
    margin: 8,
    maxWidth: '48%',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064E3B', // verde oscuro accesible
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981', // verde vibrante
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#065F46', // verde fuerte
  },
  modalDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  closeButton: {
    backgroundColor: '#10B981',
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
});

export default GridTabs;