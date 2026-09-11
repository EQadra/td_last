import { Link } from "expo-router";
import React from "react";

import {
  Text,
  View,
  StyleSheet,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProductTabs from "./ProductTabs";

export default function Page(): JSX.Element {
  return (
    <View style={styles.container}>
      <Content />
      <Footer />
    </View>
  );
}

function Content(): JSX.Element {
  const tabs = [
    "Servicios",
    "Productos",
    "Promociones",
  ];

  const tabContent = {
    Servicios: [
      {
        id: 1,
        name: "Consulta Médica",
        description:
          "Atención médica personalizada con profesionales certificados.",
        image:
          "https://picsum.photos/300/300?random=1",
      },
      {
        id: 2,
        name: "Exámenes Clínicos",
        description:
          "Amplia gama de estudios y análisis de laboratorio.",
        image:
          "https://picsum.photos/300/300?random=2",
      },
    ],

    Productos: [
      {
        id: 3,
        name: "Kit de Salud",
        description:
          "Incluye tensiómetro, termómetro digital y oxímetro.",
        image:
          "https://picsum.photos/300/300?random=3",
      },
    ],

    Promociones: [
      {
        id: 4,
        name: "Consulta 2x1",
        description:
          "Lleva a un acompañante sin costo adicional.",
        image:
          "https://picsum.photos/300/300?random=4",
      },
    ],
  };

  return (
    <View style={styles.contentContainer}>
      <View style={styles.tabsWrapper}>
        <ProductTabs
          tabs={tabs}
          tabContent={tabContent}
        />
      </View>
    </View>
  );
}

function Header(): JSX.Element {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: top }}>
      <View style={styles.headerContainer}>
        <Link
          href="/"
          style={styles.logo}
        >
          ACME
        </Link>

        <View style={styles.navContainer}>
          <Link
            href="/"
            style={styles.navLink}
          >
            About
          </Link>

          <Link
            href="/"
            style={styles.navLink}
          >
            Product
          </Link>

          <Link
            href="/"
            style={styles.navLink}
          >
            Pricing
          </Link>
        </View>
      </View>
    </View>
  );
}

function Footer(): JSX.Element {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.footerContainer,
        { paddingBottom: bottom },
      ]}
    >
      <View style={styles.footerContent}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Me
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  tabsWrapper: {
    paddingVertical: 48,
  },

  headerContainer: {
    paddingHorizontal: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    color: "#000",
    fontSize: 18,
  },

  navContainer: {
    flexDirection: "row",
    columnGap: 16,
  },

  navLink: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },

  footerContainer: {
    backgroundColor: "#dcfce7",
  },

  footerContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },

  footerText: {
    textAlign: "center",
    color: "#374151",
  },
});