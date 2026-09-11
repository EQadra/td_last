import { MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from "@expo/vector-icons/Ionicons";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* =========================
   CARD FAQ
========================= */

const Card = ({ title, content }: { title: string; content: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

/* =========================
   SCREEN
========================= */

export default function AyudaScreen() {
  const [activeTab, setActiveTab] = useState<'faq' | 'help'>('faq');
  const router = useRouter();

  const openLanding = () => {
    // 👉 AQUÍ PONES TU URL
    Linking.openURL('https://tusitio.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
       <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
               <MaterialCommunityIcons name="chevron-left" size={28} color="#111" />
             </TouchableOpacity>
     
             <Text style={styles.headerTitle}>Cuenta con Nosotros para las preguntas que surgan</Text>
     
             <TouchableOpacity>
               <MaterialCommunityIcons name="dots-horizontal" size={24} color="#111" />
             </TouchableOpacity>
           </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={activeTab === 'faq' ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab('faq')}
        >
          <Text
            style={
              activeTab === 'faq'
                ? styles.tabTextActive
                : styles.tabText
            }
          >
            FAQs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === 'help' ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab('help')}
        >
          <Icon
            name="help-circle-outline"
            size={16}
            color={activeTab === 'help' ? '#fff' : '#065F46'}
          />
          <Text
            style={
              activeTab === 'help'
                ? styles.tabTextActive
                : styles.tabText
            }
          >
            Ayuda
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      {activeTab === 'faq' ? (
        <>
          <Card
            title="¿Qué es TuDealer?"
            content="Es una plataforma que conecta usuarios con profesionales, asociaciones y tiendas relacionadas al cannabis medicinal."
          />

          <Card
            title="¿Cómo puedo contactar un proveedor?"
            content="Puedes ingresar al perfil del proveedor y usar los botones de contacto disponibles."
          />

          <Card
            title="¿La información es verificada?"
            content="Trabajamos para mostrar perfiles confiables, pero siempre recomendamos validar directamente con el proveedor."
          />
        </>
      ) : (
        <View style={styles.helpContainer}>
            <Image
              source={{ uri: 'https://tudealer.app/imagenes_app/logo.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          <Text style={styles.helpText}>
            ¿Necesitas ayuda personalizada?
          </Text>

          <TouchableOpacity style={styles.helpBtn} onPress={openLanding}>
            <Text style={styles.helpBtnText}>Ir a soporte</Text>
          </TouchableOpacity>
        </View>
       

      )}
     
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
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },

  /* TABS */
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E5F6EF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },

  tabActive: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#0E9F6E',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },

  tabText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* CARD */
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  cardContent: {
    padding: 14,
    backgroundColor: '#F9FAFB',
  },

  cardText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },

  /* HELP */
  helpContainer: {
    alignItems: 'center',
    marginTop: 40,
  },

  helpText: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
  },

  helpBtn: {
    marginTop: 16,
    backgroundColor: '#0E9F6E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  helpBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  logo: {
  width: 50,
  height: 50,
  borderRadius: 5,
  backgroundColor: '#fff',
  padding: 2,
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
      header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 40,
    marginBottom: 20,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
});