import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDarkMode } from "../../../../context/app/DarkModeContext";

export default function AboutUs() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#FFFFFF",
    card: darkMode ? "#0F172A" : "#ECFDF5",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#CBD5E1" : "#374151",
    border: darkMode ? "#334155" : "#DDDDDD",
    primary: darkMode ? "#22C55E" : "#065F46",
    warning: darkMode ? "#3F2A00" : "#FEF3C7",
    warningText: darkMode ? "#FCD34D" : "#92400E",
    buttonText: "#FFFFFF",
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: top + 20,
        paddingBottom: 140,
      }}
    >
      {/* HEADER */}
       <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
               <MaterialCommunityIcons name="chevron-left" size={28} color="#111" />
             </TouchableOpacity>
     
             <Text style={styles.headerTitle}>Tu Dealer </Text>
     {/* HEADER */}
          
           </View>

      {/* DESCRIPCIÓN */}
      <Text
        style={[
          styles.paragraph,
          { color: colors.secondaryText },
        ]}
      >
        Somos una red social dedicada a la{" "}
        <Text
          style={{
            color: colors.primary,
            fontWeight: "700",
          }}
        >
          educación, información y acompañamiento
        </Text>{" "}
        sobre el uso de cannabis con fines medicinales.
      </Text>

      <Text
        style={[
          styles.paragraph,
          { color: colors.secondaryText },
        ]}
      >
        Nuestra misión es crear una comunidad segura donde pacientes,
        médicos, especialistas y usuarios puedan compartir experiencias,
        resolver dudas y acceder a información confiable basada en
        evidencia científica.
      </Text>

      {/* MISIÓN */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: colors.primary },
          ]}
        >
          🌱 Nuestra misión
        </Text>

        <Text
          style={[
            styles.cardText,
            { color: colors.secondaryText },
          ]}
        >
          Facilitar el acceso a información clara, responsable y
          actualizada sobre el cannabis medicinal, promoviendo su uso
          consciente y legal como alternativa terapéutica.
        </Text>
      </View>

      {/* VISIÓN */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: colors.primary },
          ]}
        >
          👁️ Nuestra visión
        </Text>

        <Text
          style={[
            styles.cardText,
            { color: colors.secondaryText },
          ]}
        >
          Ser la comunidad digital líder en Latinoamérica sobre cannabis
          medicinal, conectando personas, conocimiento y bienestar.
        </Text>
      </View>

      {/* VALORES */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: colors.primary },
          ]}
        >
          💚 Nuestros valores
        </Text>

        <Text
          style={[
            styles.cardText,
            { color: colors.secondaryText },
          ]}
        >
          • Educación basada en ciencia
        </Text>

        <Text
          style={[
            styles.cardText,
            { color: colors.secondaryText },
          ]}
        >
          • Respeto y confidencialidad
        </Text>

        <Text
          style={[
            styles.cardText,
            { color: colors.secondaryText },
          ]}
        >
          • Uso responsable y legal
        </Text>

        <Text
          style={[
            styles.cardText,
            { color: colors.secondaryText },
          ]}
        >
          • Comunidad y apoyo mutuo
        </Text>
      </View>

      {/* DISCLAIMER */}
      <View
        style={[
          styles.disclaimer,
          {
            backgroundColor: colors.warning,
          },
        ]}
      >
        <Text
          style={[
            styles.disclaimerText,
            { color: colors.warningText },
          ]}
        >
          ⚠️ Esta plataforma no reemplaza la consulta médica profesional.
          Recomendamos siempre acudir a un especialista de la salud antes
          de iniciar cualquier tratamiento.
        </Text>
      </View>

      {/* BOTÓN */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: colors.buttonText,
            },
          ]}
        >
          Volver
        </Text>
      </TouchableOpacity>

      {/* FOOTER LOGO */}
      <View
        style={[
          styles.footerIcon,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Image
          source={require("../../../../assets/logo.png")}
          style={{
            width: 140,
            height: 42,
            resizeMode: "contain",
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: "justify",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 22,
  },

  disclaimer: {
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },

  disclaimerText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  button: {
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  footerIcon: {
    marginTop: 40,
    alignSelf: "center",
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

    header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginTop: 30,
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