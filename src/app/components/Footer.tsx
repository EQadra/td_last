import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Image,
  FlatList,
  Platform,
  StyleSheet,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  darkMode: boolean;
};

export default function Footer({
  darkMode,
}: Props): JSX.Element {
  const { bottom } = useSafeAreaInsets();

  const [visibleModal, setVisibleModal] = useState<
    null | "inicio" | "historial" | "ajustes"
  >(null);

  // STATES
  const [textInputs, setTextInputs] = useState<
    string[]
  >(["", "", ""]);

  const [date, setDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [images, setImages] = useState<
    (string | null)[]
  >([null, null]);

  // IMAGE PICKER
  const pickImage = async (index: number) => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const resetForm = () => {
    setTextInputs(["", "", ""]);
    setDate(new Date());
    setImages([null, null]);
  };

  // MODAL INICIO
  const renderInicio = () => (
    <View>
      <Text style={styles.modalTitle}>
        Inicio
      </Text>

      {[0, 1, 2].map((idx) => (
        <TextInput
          key={`inicio-text-${idx}`}
          style={styles.input}
          placeholder={`Texto ${idx + 1}`}
          value={textInputs[idx]}
          onChangeText={(text) => {
            const newInputs = [...textInputs];
            newInputs[idx] = text;
            setTextInputs(newInputs);
          }}
        />
      ))}

      <View style={styles.imagesRow}>
        {[0, 1].map((idx) => (
          <View key={idx} style={styles.imageBox}>
            <TouchableOpacity
              onPress={() => pickImage(idx)}
              style={styles.imageButton}
            >
              <Text style={styles.imageButtonText}>
                Seleccionar Imagen {idx + 1}
              </Text>
            </TouchableOpacity>

            {images[idx] && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: images[idx]! }}
                  style={styles.image}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  onPress={() =>
                    removeImage(idx)
                  }
                  style={styles.removeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  // MODAL HISTORIAL
  const renderHistorial = () => {
    const data = [
      {
        id: "1",
        transaccion: "Pago $100",
        fecha: "2025-05-01",
        usuario: "Juan",
      },
      {
        id: "2",
        transaccion: "Envío $200",
        fecha: "2025-05-10",
        usuario: "Ana",
      },
      {
        id: "3",
        transaccion: "Recibo $300",
        fecha: "2025-05-20",
        usuario: "Luis",
      },
    ];

    return (
      <View>
        <Text style={styles.modalTitle}>
          Historial
        </Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyText}>
                {item.transaccion} - {item.fecha} -{" "}
                {item.usuario}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };

  // MODAL AJUSTES
  const renderAjustes = () => (
    <View>
      <Text style={styles.modalTitle}>
        Ajustes
      </Text>

      {[0, 1, 2].map((idx) => (
        <TextInput
          key={idx}
          style={styles.input}
          placeholder={`Campo ${idx + 1}`}
          value={textInputs[idx]}
          onChangeText={(text) => {
            const newInputs = [...textInputs];
            newInputs[idx] = text;
            setTextInputs(newInputs);
          }}
        />
      ))}

      <TouchableOpacity
        onPress={() =>
          setShowDatePicker(true)
        }
        style={styles.dateButton}
      >
        <Text>
          {date.toDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          onChange={(
            event,
            selectedDate
          ) => {
            setShowDatePicker(false);

            if (selectedDate)
              setDate(selectedDate);
          }}
        />
      )}
    </View>
  );

  // MODAL CONTENT
  const renderModalContent = () => {
    switch (visibleModal) {
      case "inicio":
        return renderInicio();

      case "historial":
        return renderHistorial();

      case "ajustes":
        return renderAjustes();

      default:
        return null;
    }
  };

  // MENU ITEMS
  const menuItems = [
    {
      key: "inicio",
      label: "Inicio",
      icon: "home",
    },
    {
      key: "historial",
      label: "Historial",
      icon: "history",
    },
    {
      key: "ajustes",
      label: "Ajustes",
      icon: "cog",
    },
  ];

  return (
    <>
      {/* FOOTER */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottom,
            backgroundColor: darkMode
              ? "#1f2937"
              : "#0ea5e9",
          },
        ]}
      >
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() =>
              setVisibleModal(item.key as any)
            }
          >
            <View style={styles.menuItem}>
              <FontAwesome5
                name={item.icon as any}
                size={16}
                color="white"
              />

              <Text style={styles.menuText}>
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* MODAL */}
      <Modal
        transparent
        visible={visibleModal !== null}
        animationType="slide"
        onRequestClose={() => {
          setVisibleModal(null);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {renderModalContent()}

            <Pressable
              onPress={() => {
                setVisibleModal(null);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    height: 68,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuItem: {
    alignItems: "center",
  },

  menuText: {
    fontSize: 12,
    color: "#ffffff",
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
  },

  modalContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  imageBox: {
    width: "48%",
    marginBottom: 16,
  },

  imageButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  imageButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 12,
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 96,
    borderRadius: 8,
  },

  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 999,
    padding: 4,
  },

  historyItem: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },

  historyText: {
    fontSize: 14,
    fontWeight: "500",
  },

  dateButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  closeButton: {
    marginTop: 16,
    backgroundColor: "#4b5563",
    paddingVertical: 10,
    borderRadius: 8,
  },

  closeButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
});