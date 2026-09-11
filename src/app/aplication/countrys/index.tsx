import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const COUNTRIES = [
  { name: "Perú", imageUrl: "https://flagcdn.com/w320/pe.png" },
  { name: "Colombia", imageUrl: "https://flagcdn.com/w320/co.png" },
  { name: "Chile", imageUrl: "https://flagcdn.com/w320/cl.png" },
  { name: "Uruguay", imageUrl: "https://flagcdn.com/w320/uy.png" },
  { name: "Argentina", imageUrl: "https://flagcdn.com/w320/ar.png" },
  { name: "Brasil", imageUrl: "https://flagcdn.com/w320/br.png" },
];

export default function CountrySelector() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const router = useRouter();

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country.name);
    setSelectedImage(country.imageUrl);
    setModalVisible(false);
  };

  const handleNext = () => {
    if (selectedCountry) {
      router.push({
        pathname: "auth/login",
        params: { selectedCountry },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/4.png")}
        style={styles.iconImage}
        resizeMode="contain"
      />

      <Text style={styles.title}>Selecciona tu país</Text>

      <Text style={styles.description}>
        Elige tu país de residencia para continuar.
      </Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorLeft}>
          <Text style={styles.selectorText}>
            {selectedCountry || "Selecciona tu país"}
          </Text>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.flagSmall} />
          )}
        </View>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 6l6 6-6 6"
            stroke="#2F4F4F"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNext}
        style={[
          styles.nextButton,
          { backgroundColor: selectedCountry ? "#004d32" : "#c7c7c7" },
        ]}
        disabled={!selectedCountry}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
      </TouchableOpacity>

      {/* Modal */}
     <Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
      <FlatList
        scrollEnabled={false} // 👈 AGREGAR ESTO
        data={COUNTRIES}
        keyExtractor={(item) => item.name}
        style={{ width: "100%" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(item)}
          >
            <View style={styles.countryInfo}>
              <Image source={{ uri: item.imageUrl }} style={styles.flag} />
              <Text style={styles.countryName}>{item.name}</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 6l6 6-6 6"
                stroke="#2F4F4F"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={styles.closeButton}
      >
        <Text style={{ color: "#fff" }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  iconImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2F4F4F",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#2F4F4F",
    textAlign: "center",
    marginBottom: 24,
  },
  selector: {
    borderWidth: 1,
    borderColor: "#004d32",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    marginBottom: 24,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorText: {
    fontSize: 16,
    color: "#2F4F4F",
    marginRight: 10,
  },
  flagSmall: {
    width: 32,
    height: 20,
    borderRadius: 4,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 80,
  },
  modalBackground: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)", // fondo semitransparente
  justifyContent: "center",
  alignItems: "center",
},

modalContainer: {
  width: "80%",          // ancho del modal
  maxHeight: "70%",      // altura máxima del modal
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 20,
},
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 4,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    justifyContent: "space-between",
  },
  countryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 40,
    height: 26,
    marginRight: 15,
    borderRadius: 4,
  },
  countryName: {
    fontSize: 16,
    color: "#2F4F4F",
  },
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#004d32",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});
