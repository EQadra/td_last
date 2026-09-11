// components/Header.tsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useImageUpload } from "../../context/app/ImageUploadContext";
import { useAvatar } from "../../context/AvatarContext";
import { useDoctors } from "../../context/DoctorContext";

import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useAuth } from "../../context/AuthContext";
import { getImageWithTimestamp } from "../../utils/axios";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* =========================
   MENU DATA (COMPLETO)
========================= */

const sections = [
  {
    title: "General",
    items: [
      { title: "Inicio", route: "/aplication/home-app", icon: "home-outline" },
      { title: "Noticias", route: "/config/all/new", icon: "newspaper-outline" },
      { title: "Posts", route: "/config/all/post", icon: "document-text-outline" },
      { title: "Servicios", route: "/config/all/service", icon: "construct-outline" },
    ],
  },
  {
    title: "Perfil",
    items: [
      { title: "Perfil Asociación", route: "/config/all/association", icon: "business-outline" },
      { title: "Perfil Doctor", route: "/config/all/doctor", icon: "medkit-outline" },
      { title: "Perfil Abogado", route: "/config/all/lawyer", icon: "briefcase-outline" },
      { title: "Perfil Tienda", route: "/config/all/store", icon: "storefront-outline" },
      { title: "Perfil Usuario", route: "/config/all/user", icon: "person-outline" },
    ],
  },
  {
    title: "Configuración",
    items: [
      { title: "Configuración", route: "/config/aside/configuration", icon: "settings-outline" },
      { title: "Nosotros", route: "/config/aside/about_us", icon: "information-circle-outline" },
      { title: "Ayuda", route: "/config/aside/help", icon: "help-circle-outline" },
      { title: "Favoritos", route: "/config/aside/favorites", icon: "heart-outline" },
      { title: "Historial", route: "/config/aside/history", icon: "time-outline" },
      { title: "Soporte", route: "/config/aside/support", icon: "lock-closed-outline" },
      { title: "Dark Mode", route: "/config/aside/dark_mode", icon: "moon-outline" },
      { title: "Cerrar Sesión", route: "logout", icon: "log-out-outline", isLogout: true },
    ],
  },
];

export default function Header() {
  const { darkMode } = useDarkMode();
  const { user, updateAvatar, deleteAvatar, logout } = useAuth();
  const { avatarImage, refreshAvatar } = useAvatar();
  const { doctor, fetchMyDoctor } = useDoctors();
  const { pickImage, uploadImageByRole } = useImageUpload();

  const { top } = useSafeAreaInsets();

  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<any>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const slideAnim = useState(new Animated.Value(-280))[0];

  const role = user?.profileType;

  /* =========================
     OBTENER IMAGEN DEL PERFIL
  ========================= */
  const getProfileImage = () => {
    if (role === 'doctor' && doctor?.image) {
      return doctor.image;
    }
    if (role === 'doctor' && doctor?.image_url) {
      return doctor.image_url;
    }
    if (avatarImage) {
      return avatarImage;
    }
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    if (user?.avatar) {
      return user.avatar;
    }
    return "https://i.pravatar.cc/150?img=1";
  };

  useEffect(() => {
    const image = getProfileImage();
    if (image) {
      setProfileImage(getImageWithTimestamp(image));
    } else {
      setProfileImage(null);
    }
  }, [user, avatarImage, doctor]);

  /* =========================
     FILTER MENU
  ========================= */
  const getFilteredSections = () => {
    return sections.map((section) => {
      if (section.title === "General") {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (item.title === "Servicios") {
              return role === "doctor" || role === "lawyer";
            }
            return true;
          }),
        };
      }

      if (section.title === "Perfil") {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (item.title === "Perfil Doctor") return role === "doctor";
            if (item.title === "Perfil Abogado") return role === "lawyer";
            if (item.title === "Perfil Asociación") return role === "association";
            if (item.title === "Perfil Tienda") return role === "shop";
            if (item.title === "Perfil Usuario") return role === "user";
            return false;
          }),
        };
      }

      return section;
    });
  };

  /* =========================
     CAMBIAR IMAGEN
  ========================= */
  const changeImage = async () => {
    try {
      Alert.alert(
        "Foto de perfil",
        "¿Qué deseas hacer?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cambiar foto",
            onPress: async () => {
              const image = await pickImage();
              if (!image) return;

              setIsLoading(true);

              try {
                if (role === 'doctor') {
                  const res = await uploadImageByRole({ role: 'doctor', image });
                  if (res?.image) {
                    const newImageUrl = getImageWithTimestamp(res.image);
                    setProfileImage(newImageUrl);
                    const avatarResult = await updateAvatar(image);
                    if (avatarResult) {
                      refreshAvatar();
                    }
                    await fetchMyDoctor();
                    Alert.alert("✅ Correcto", "Imagen de doctor actualizada");
                  } else {
                    Alert.alert("Error", "No se recibió la nueva imagen");
                  }
                } else {
                  const newAvatar = await updateAvatar(image);
                  if (newAvatar) {
                    setProfileImage(getImageWithTimestamp(newAvatar));
                    refreshAvatar();
                    Alert.alert("✅ Correcto", "Avatar actualizado");
                  }
                }
              } catch (error: any) {
                Alert.alert("Error", error.message || "No se pudo actualizar la imagen");
              } finally {
                setIsLoading(false);
              }
            }
          },
          ...(profileImage ? [{
            text: "Eliminar foto",
            style: "destructive" as const,
            onPress: async () => {
              Alert.alert(
                "Confirmar",
                "¿Estás seguro de eliminar tu foto de perfil?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive" as const,
                    onPress: async () => {
                      setIsLoading(true);
                      try {
                        await deleteAvatar();
                        setProfileImage(null);
                        refreshAvatar();
                        Alert.alert("✅ Correcto", "Foto eliminada");
                      } catch (error) {
                        Alert.alert("Error", "No se pudo eliminar la imagen");
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }
                ]
              );
            }
          }] : [])
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo procesar la imagen");
    }
  };

  /* =========================
     CERRAR SESIÓN - FUNCIÓN ROBUSTA CON REDIRECCIÓN
  ========================= */
  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🔴 [handleLogout] Iniciando proceso...");
              
              // ✅ PASO 1: Cerrar menú inmediatamente
              setMenuOpen(false);
              slideAnim.setValue(-280);
              console.log("🔴 [handleLogout] Menú cerrado");
              
              // ✅ PASO 2: Esperar un momento y ejecutar logout
              setTimeout(async () => {
                try {
                  console.log("🔴 [handleLogout] Ejecutando logout...");
                  
                  // ✅ Ejecutar logout del contexto
                  await logout();
                  console.log("🔴 [handleLogout] Logout completado");
                  
                  // ✅ FORZAR NAVEGACIÓN A LOGIN
                  console.log("🔴 [handleLogout] Navegando a login...");
                  router.replace("/auth/login");
                  
                } catch (error) {
                  console.error("❌ [handleLogout] Error en logout:", error);
                  Alert.alert("Error", "No se pudo cerrar sesión");
                }
              }, 300);
              
            } catch (error) {
              console.error("❌ [handleLogout] Error general:", error);
              Alert.alert("Error", "No se pudo cerrar sesión");
            }
          }
        }
      ]
    );
  };

  /* =========================
     NAVIGATION
  ========================= */
  const navigate = (route: string) => {
    if (!route) return;
    
    if (route === "logout") {
      handleLogout();
      return;
    }
    
    setMenuOpen(false);
    
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.push(route as any);
    });
  };

  /* =========================
     MENU
  ========================= */
  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuOpen(false);
    });
  };

  /* =========================
     COLORS
  ========================= */
  const colors = {
    bg: darkMode ? "#0f172a" : "#ffffff",
    card: darkMode ? "#1e293b" : "#f9fafb",
    text: darkMode ? "#e5e7eb" : "#111827",
    subText: darkMode ? "#9ca3af" : "#6b7280",
    primary: darkMode ? "#22c55e" : "#065f46",
    border: darkMode ? "#334155" : "#e5e7eb",
    activeBg: darkMode ? "#064e3b" : "#ecfdf5",
    danger: darkMode ? "#ef4444" : "#dc2626",
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: top, zIndex: 999 }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          height: 60,
          backgroundColor: colors.primary,
        }}
      >
        <TouchableOpacity onPress={menuOpen ? closeMenu : openMenu}>
          <Ionicons name={menuOpen ? "close" : "menu"} size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, alignItems: "center" }}
          onPress={() => {
            router.push("/aplication/home-app");
            closeMenu();
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../assets/logo.png")}
            resizeMode="contain"
            style={{ width: 140, height: 42 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/config/aside/notifications")}
          style={{ position: "relative" }}
        >
          <Ionicons name="notifications-outline" size={26} color="#fff" />
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#ef4444",
            }}
          />
        </TouchableOpacity>
      </View>

      {/* OVERLAY */}
      {menuOpen && (
        <Pressable
          onPress={closeMenu}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* SIDEBAR */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          position: "absolute",
          top: top + 60,
          left: 0,
          width: 280,
          height: SCREEN_HEIGHT - top - 10 - 10,
          backgroundColor: colors.bg,
          borderTopRightRadius: 40,
          borderBottomRightRadius: 40,
          zIndex: 1000,
          elevation: 1000,
          overflow: 'hidden',
        }}
        pointerEvents={menuOpen ? "auto" : "none"}
      >
        {/* PERFIL */}
        <View
          style={{
            padding: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            backgroundColor: colors.card,
          }}
        >
          <TouchableOpacity onPress={changeImage} disabled={isLoading}>
            <View style={{ position: 'relative' }}>
              <Image
                key={profileImage || "default"}
                source={{
                  uri: profileImage || "https://tudealer.app/avatar_store.jpg",
                }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 3,
                  borderColor: colors.primary,
                }}
              />
              {isLoading && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 45,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={changeImage} disabled={isLoading}>
            <Text
              style={{
                color: colors.primary,
                marginTop: 6,
                fontSize: 12,
              }}
            >
              {profileImage ? "Cambiar foto" : "Agregar foto"}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.text,
              marginTop: 10,
              fontWeight: "700",
            }}
          >
            {user?.name}
          </Text>

          <Text style={{ color: colors.subText }}>{user?.email}</Text>
        </View>

        {/* MENÚ ITEMS */}
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: 40,
            }}
            style={{ flex: 1 }}
          >
            {getFilteredSections().map((section) => {
              const isOpen = expanded[section.title];

              return (
                <View key={section.title} style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() =>
                      setExpanded((prev: any) => ({
                        ...prev,
                        [section.title]: !prev[section.title],
                      }))
                    }
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.subText,
                        fontSize: 12,
                      }}
                    >
                      {section.title.toUpperCase()}
                    </Text>

                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.subText}
                    />
                  </TouchableOpacity>

                  {isOpen &&
                    section.items.map((item) => {
                      const active = pathname === item.route;

                      return (
                        <TouchableOpacity
                          key={item.title}
                          onPress={() => navigate(item.route)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 10,
                            borderRadius: 10,
                            backgroundColor: active ? colors.activeBg : "transparent",
                            marginTop: 4,
                          }}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={20}
                            color={active ? colors.primary : colors.subText}
                            style={{ marginRight: 10 }}
                          />

                          <Text
                            style={{
                              color: active ? colors.primary : colors.text,
                            }}
                          >
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              );
            })}

            {/* ✅ LÍNEA SEPARADORA */}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 8,
                marginHorizontal: 4,
              }}
            />

            {/* ✅ BOTÓN CERRAR SESIÓN INDEPENDIENTE (FUERA DE CONFIGURACIÓN) */}
            <TouchableOpacity
              onPress={() => {
                console.log("🔴 Click en Cerrar Sesión (exterior)");
                handleLogout();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderRadius: 10,
                marginTop: 4,
                backgroundColor: colors.danger + "15",
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color={colors.danger}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  color: colors.danger,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Cerrar Sesión
              </Text>
            </TouchableOpacity>

            {/* INDICADOR DE FINAL */}
            <View style={{ 
              paddingVertical: 20, 
              alignItems: 'center',
              marginTop: 5,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <View style={{
                  width: 25,
                  height: 1,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                }} />
                <Ionicons 
                  name="chevron-down" 
                  size={14} 
                  color={colors.primary} 
                  style={{ opacity: 0.3 }}
                />
                <View style={{
                  width: 25,
                  height: 1,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                }} />
              </View>
              <Text style={{ 
                color: colors.subText, 
                fontSize: 9,
                marginTop: 6,
                opacity: 0.25,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}>
                Final
              </Text>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}