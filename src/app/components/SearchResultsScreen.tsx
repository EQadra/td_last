import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../../context/ProductContext";

const SearchResultsScreen = () => {
  const { products, loading, fetchProducts } = useProducts();
  const [searchText, setSearchText] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔎 Filtro
  const filteredProducts = useMemo(() => {
    if (!searchText) return products;

    return products.filter((item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, products]);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔍 Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Buscar productos..."
          placeholderTextColor="#999"
          style={styles.input}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      {/* 📦 Lista */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#00A86B"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron productos
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openModal(item)}
            >
              <Image
                source={{
                  uri: item.image || "https://picsum.photos/200",
                }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardPrice}>
                S/ {item.price}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 🔥 MODAL DE DETALLE */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedProduct && (
              <ScrollView>
                <Image
                  source={{
                    uri:
                      selectedProduct.image ||
                      "https://picsum.photos/400",
                  }}
                  style={styles.modalImage}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {selectedProduct.name}
                  </Text>

                  <Text style={styles.modalPrice}>
                    S/ {selectedProduct.price}
                  </Text>

                  <Text style={styles.modalStock}>
                    Stock: {selectedProduct.stock}
                  </Text>

                  <Text style={styles.modalAssociation}>
                    Tienda: {selectedProduct.productable?.name}
                  </Text>

                  {selectedProduct.description && (
                    <Text style={styles.modalDescription}>
                      {selectedProduct.description}
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    color: "#222",
  },

  card: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 12,
  },

  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },

  cardTitle: {
    fontWeight: "600",
    marginTop: 6,
  },

  cardPrice: {
    color: "#00A86B",
    fontWeight: "700",
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },

  // 🔥 Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    height: "85%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  modalImage: {
    width: "100%",
    height: 250,
  },

  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },

  modalContent: {
    padding: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  modalPrice: {
    fontSize: 18,
    color: "#00A86B",
    fontWeight: "700",
    marginBottom: 6,
  },

  modalStock: {
    color: "#555",
    marginBottom: 4,
  },

  modalAssociation: {
    color: "#777",
    marginBottom: 12,
  },

  modalDescription: {
    marginTop: 8,
    color: "#444",
    lineHeight: 20,
  },
});

export default SearchResultsScreen;