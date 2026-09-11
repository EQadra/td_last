import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { AuthProvider, useAuth } from "../context/AuthContext";

import { NewsRoleProvider } from "../context/NewsRoleContext";
import { ImageUploadProvider } from "../context/app/ImageUploadContext";

import { AssociationProvider } from "../context/AssociationContext";
import { AvatarProvider } from "../context/AvatarContext";
import { DoctorProvider } from "../context/DoctorContext";
import { FavoriteProvider } from "../context/FavoriteContext";
import { HistoryProvider } from "../context/HistoryContext";
import { LawyerProvider } from "../context/LawyerContext";
import { PostProvider } from "../context/PostContext";
import { ProductProvider } from "../context/ProductContext";

import { ServiceProvider } from "../context/ServiceContext";

import { ShopProvider } from "../context/ShopContext";

import { CommentProvider } from "../context/CommentContext";
import { DarkModeProvider, useDarkMode } from "../context/app/DarkModeContext";

import { NotificationsProvider } from "../context/NotificationContext";
import Header from "./components/Header";

function AppContent() {
  const { darkMode } = useDarkMode();
  const segments = useSegments();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup =
      segments[0] === "auth" ||
      segments[0] === "intro" ||
      (segments[0] === "aplication" && segments[1] === "countrys");

    if (!user && !inAuthGroup) {
      router.replace("/");
    } else if (user && inAuthGroup) {
      router.replace("/aplication/home-app");
    }
  }, [user, segments, loading]);

  const hideLayout =
    segments.length === 0 ||
    segments[0] === "auth" ||
    segments[0] === "intro" ||
    (segments[0] === "aplication" && segments[1] === "countrys");

  const colors = {
    background: darkMode ? "#020617" : "#ffffff",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {!hideLayout && (
        <View style={styles.header}>
          <Header />
        </View>
      )}

      <Stack screenOptions={{ headerShown: false }}>

        <Stack.Screen name="lists/doctor" />
        <Stack.Screen name="lists/lawyer" />
        <Stack.Screen name="lists/association" />
        <Stack.Screen name="lists/store" />

        <Stack.Screen name="intro/v1/index" />
        <Stack.Screen name="intro/v2/index" />
        <Stack.Screen name="intro/v3/index" />

        <Stack.Screen name="aplication/home-app" />
        <Stack.Screen name="aplication/home-news" />
        <Stack.Screen name="aplication/countrys" />

        <Stack.Screen name="auth/options" />
        <Stack.Screen name="auth/profile" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/reset-password-form" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/auth-intro" />

        <Stack.Screen name="config/all/association" />
        <Stack.Screen name="config/all/doctor" />
        <Stack.Screen name="config/all/lawyer" />
        <Stack.Screen name="config/all/store" />
        <Stack.Screen name="config/all/user" />
        <Stack.Screen name="config/all/post" />
        <Stack.Screen name="config/all/new" />
        <Stack.Screen name="config/all/service" />

        <Stack.Screen name="config/aside/about_us" />
        <Stack.Screen name="config/aside/configuration" />
        <Stack.Screen name="config/aside/dark_mode" />
        <Stack.Screen name="config/aside/favorites" />
        <Stack.Screen name="config/aside/help" />
        <Stack.Screen name="config/aside/history" />
        <Stack.Screen name="config/aside/log_out" />
        <Stack.Screen name="config/aside/notifications" />
        <Stack.Screen name="config/aside/support" />
      </Stack>
    </View>
  );
}

export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AvatarProvider>
        <AuthProvider>
          <DarkModeProvider>
            <AssociationProvider>
              <NotificationsProvider>
                <NewsRoleProvider>
                  <ImageUploadProvider>
                    <PostProvider>
                      <LawyerProvider>
                        <ShopProvider>
                          <ServiceProvider>
                            <ProductProvider>
                              <DoctorProvider>
                                <FavoriteProvider>
                                  <HistoryProvider>
                                    <CommentProvider>
                                      <AppContent />
                                    </CommentProvider>
                                  </HistoryProvider>
                                </FavoriteProvider>
                              </DoctorProvider>
                            </ProductProvider>
                          </ServiceProvider>
                        </ShopProvider>
                      </LawyerProvider>
                    </PostProvider>
                  </ImageUploadProvider>
                </NewsRoleProvider>
              </NotificationsProvider>
            </AssociationProvider>
          </DarkModeProvider>
        </AuthProvider>
      </AvatarProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
});