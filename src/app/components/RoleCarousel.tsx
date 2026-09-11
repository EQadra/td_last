// components/RoleCarousel.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";

const { width: screenWidth } = Dimensions.get("window");

const RoleCarousel = () => {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const colors = {
    text: darkMode ? "#F8FAFC" : "#1F2937",
    secondaryText: darkMode ? "#94A3B8" : "#6B7280",
    cardBg: darkMode ? "#0F172A" : "#FFFFFF",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.07)",
    border: darkMode ? "#1E293B" : "#F1F5F9",
    controlBg: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
  };

  const roles = [
    {
      id: "1",
      title: "Doctores",
      image: require("../../assets/home/doctor.png"),
      route: "lists/doctor",
      icon: "medical-outline",
      color: "#4ADE80",
      gradient: ["#DCFCE7", "#BBF7D0"],
      badgeColor: "#22C55E",
    },
    {
      id: "2",
      title: "Tiendas",
      image: require("../../assets/home/store.png"),
      route: "lists/store",
      icon: "storefront-outline",
      color: "#60A5FA",
      gradient: ["#DBEAFE", "#BFDBFE"],
      badgeColor: "#3B82F6",
    },
    {
      id: "3",
      title: "Asociaciones",
      image: require("../../assets/home/asociation.png"),
      route: "lists/association",
      icon: "people-outline",
      color: "#FBBF24",
      gradient: ["#FEF3C7", "#FDE68A"],
      badgeColor: "#F59E0B",
    },
    {
      id: "4",
      title: "Abogados",
      image: require("../../assets/home/lawyer.png"),
      route: "lists/lawyer",
      icon: "briefcase-outline",
      color: "#F87171",
      gradient: ["#FEE2E2", "#FECACA"],
      badgeColor: "#EF4444",
    },
  ];

  const CARD_WIDTH = screenWidth * 0.48;
  const CARD_MARGIN = 14;

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(index);
  };

  const scrollToNext = () => {
    const nextIndex = Math.min(activeIndex + 1, roles.length - 1);
    scrollViewRef.current?.scrollTo({
      x: nextIndex * (CARD_WIDTH + CARD_MARGIN),
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  const scrollToPrev = () => {
    const prevIndex = Math.max(activeIndex - 1, 0);
    scrollViewRef.current?.scrollTo({
      x: prevIndex * (CARD_WIDTH + CARD_MARGIN),
      animated: true,
    });
    setActiveIndex(prevIndex);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ¿A quién deseas visitar? 👋
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: colors.controlBg },
              activeIndex === 0 && { opacity: 0.35 },
            ]}
            onPress={scrollToPrev}
            disabled={activeIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: colors.controlBg },
              activeIndex === roles.length - 1 && { opacity: 0.35 },
            ]}
            onPress={scrollToNext}
            disabled={activeIndex === roles.length - 1}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {roles.map((role, index) => (
          <TouchableOpacity
            key={role.id}
            activeOpacity={0.9}
            onPress={() => handlePress(role.route)}
            style={[
              styles.card,
              {
                width: CARD_WIDTH,
                marginRight: index === roles.length - 1 ? 0 : CARD_MARGIN,
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            {/* Fondo suave superior */}
            <LinearGradient
              colors={role.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />

            {/* Contador 1/4 */}
            <View style={styles.positionBadge}>
              <Text style={[styles.positionText, { color: colors.secondaryText }]}>
                {index + 1} / {roles.length}
              </Text>
            </View>

            {/* Icono pequeño */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: role.color + "25" },
              ]}
            >
              <Ionicons name={role.icon as any} size={18} color={role.color} />
            </View>

            {/* Ilustración principal */}
            <Image
              source={role.image}
              style={styles.cardImage}
              resizeMode="contain"
            />

            {/* Título */}
            <Text
              style={[styles.roleTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {role.title}
            </Text>

            {/* Botón Ver más */}
            <View style={[styles.badge, { backgroundColor: role.badgeColor }]}>
              <Text style={styles.badgeText}>Ver más</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {roles.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  activeIndex === index ? colors.text : colors.border,
                width: activeIndex === index ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    marginBottom: 6,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
    flex: 1,
  },

  controls: {
    flexDirection: "row",
    gap: 6,
  },

  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 2,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    height: 205,
  },

  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 95,
    opacity: 0.95,
  },

  positionBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 2,
  },

  positionText: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.65,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    zIndex: 1,
  },

  cardImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },

  roleTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.2,
  },

  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 5,
  },

  dot: {
    height: 6,
    borderRadius: 3,
  },
});

export default RoleCarousel;