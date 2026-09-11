import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/* =========================
   COMPONENT
========================= */

export default function SoporteScreen() {
  // Función para abrir enlace externo
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error al abrir enlace:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Soporte</Text>
      <Text style={styles.subtitle}>Centro de contacto</Text>

      {/* WHATSAPP */}
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons
          name="whatsapp"
          size={36}
          color="#25D366"
        />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>WhatsApp</Text>
          <Text style={styles.cardText}>
            Conéctate de forma rápida con nuestro equipo a través de WhatsApp.
            Obtén soporte personalizado y resuelve tus dudas en tiempo real.
          </Text>
        </View>
      </TouchableOpacity>

      {/* CORREO */}
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons
          name="email-outline"
          size={36}
          color="#EA4335"
        />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>Correo</Text>
          <Text style={styles.cardText}>
            Si prefieres el correo electrónico, envíanos tu consulta o comentario.
            Nuestro equipo de soporte te responderá lo antes posible.
          </Text>
        </View>
      </TouchableOpacity>

      {/* REPORTAR PROBLEMA */}
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={36}
          color="#F4B400"
        />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>Reportar un problema</Text>
          <Text style={styles.cardText}>
            ¿Algo no funciona bien en tu Dealer? Cuéntanos qué ocurrió.
            Revisaremos tu caso y te daremos una solución.
          </Text>
        </View>
      </TouchableOpacity>

      {/* BOTÓN VERDE - IR A TUDEALER.APP */}
      <TouchableOpacity 
        style={styles.verdeButton}
        onPress={() => openLink('https://tudealer.app/')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name="web" 
          size={24} 
          color="#FFFFFF" 
        />
        <Text style={styles.verdeButtonText}>Visitar tudealer.app</Text>
        <MaterialCommunityIcons 
          name="arrow-right" 
          size={24} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>

      {/* ESPACIO PARA SEPARAR DEL BORDE */}
      <View style={{ height: 20 }} />
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    marginTop: 40,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    color: '#111',
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
    color: '#111',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  textContainer: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },

  cardText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  // ✅ NUEVO ESTILO PARA EL BOTÓN VERDE
  verdeButton: {
    flexDirection: 'row',
    backgroundColor: '#25A844', // Verde característico
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  verdeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  footerIcon: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});