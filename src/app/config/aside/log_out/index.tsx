// App.tsx o el componente donde quieras mostrar el modal
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
    Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Para íconos similares

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(false);
    // Aquí coloca tu lógica real de logout (ej: borrar token, navegar a login, etc.)
    Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
  };

  return (
    <View style={styles.container}>
      {/* Botón para abrir el modal (puedes ponerlo donde quieras, ej: en el drawer) */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.openButtonText}>Abrir modal de cerrar sesión</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Ícono: hoja de cannabis (aproximado) dentro de burbuja */}
            <View style={styles.iconContainer}>
              <Image
                         source={{
                           uri: "https://tudealer.app/imagenes_app/logo.png",
                         }}
                         style={{ width: 58, height: 58 }}
                       />
            </View>

            <Text style={styles.title}>Cerrar sesión</Text>
            <Text style={styles.message}>¿Estás seguro de cerrar sesión?</Text>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  openButton: {
    padding: 15,
    backgroundColor: '#228B22',
    borderRadius: 10,
  },
  openButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A4B3A', // Verde oscuro como en la imagen
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#555', // Gris oscuro
  },
  logoutButton: {
    backgroundColor: '#2E8B57', // Verde más claro
  },
  cancelText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});