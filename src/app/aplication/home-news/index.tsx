import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNews } from "../../../context/NewsContext";
import { useDarkMode } from "../../../context/app/DarkModeContext";

const HomeNewsScreen = () => {

  /* =========================================================
     DARK MODE
  ========================================================= */

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#f9f9f9",

    card: darkMode ? "#0F172A" : "#ffffff",

    text: darkMode ? "#F8FAFC" : "#333333",

    secondaryText: darkMode ? "#94A3B8" : "#555555",

    border: darkMode ? "#1E293B" : "#eeeeee",

    input: darkMode ? "#1E293B" : "#ffffff",

    icon: darkMode ? "#4ADE80" : "#00B272",
  };

  /* =========================================================
     CONTEXT
  ========================================================= */

  const {
    news,
    loading,
    fetchHomeNews,
    addComment,
  } = useNews();

  /* =========================================================
     STATES
  ========================================================= */

  const [commentsInput, setCommentsInput] = useState({});

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    fetchHomeNews();
  }, []);

  /* =========================================================
     COMMENT
  ========================================================= */

  const handleComment = async (newsId) => {

    const text = commentsInput[newsId];

    if (!text) return;

    await addComment(newsId, text);

    setCommentsInput((prev) => ({
      ...prev,
      [newsId]: "",
    }));
  };

  /* =========================================================
     SHARE
  ========================================================= */

  const compartirNoticia = async (
    titulo,
    url
  ) => {
    try {
      await Share.share({
        message: `${titulo}${url ? `\n${url}` : ""}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Noticias
        </Text>
      </View>

      {/* =========================================================
          LOADING
      ========================================================= */}

      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.icon}
        />
      )}

      {/* =========================================================
          LIST
      ========================================================= */}

      {news.map((item) => (
        <View
          key={item.id}
          style={[
            styles.newsCard,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >
          {/* HEADER */}

          <View style={styles.newsHeader}>
            <Image
              source={{
                uri:
                  item.user?.avatar ||
                  "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />

            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                },
              ]}
            >
              {item.user?.name ||
                "Usuario"}
            </Text>
          </View>

          {/* IMAGE */}

          <Image
            source={{
              uri: item.url,
            }}
            style={styles.newsImage}
          />

          {/* CONTENT */}

          <View style={styles.newsContent}>
            <Text
              style={[
                styles.newsTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {item.titulo}
            </Text>

            <Text
              style={[
                styles.newsDescription,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {item.descripcion}
            </Text>

            {/* COMMENTS */}

            {item.comments?.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.commentBubble,
                  {
                    backgroundColor:
                      darkMode
                        ? "#1E293B"
                        : "#f1f1f1",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.commentText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  • {c.content}
                </Text>
              </View>
            ))}

            {/* INPUT */}

            <TextInput
              placeholder="Escribe un comentario..."
              placeholderTextColor={
                darkMode
                  ? "#94A3B8"
                  : "#999"
              }
              value={
                commentsInput[item.id] ||
                ""
              }
              onChangeText={(text) =>
                setCommentsInput(
                  (prev) => ({
                    ...prev,
                    [item.id]: text,
                  })
                )
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>

          {/* ACTIONS */}

          <View
            style={[
              styles.actions,
              {
                borderTopColor:
                  colors.border,
              },
            ]}
          >
            {/* SHARE */}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                compartirNoticia(
                  item.titulo,
                  item.url
                )
              }
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.icon}
              />

              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      colors.icon,
                  },
                ]}
              >
                Compartir
              </Text>
            </TouchableOpacity>

            {/* COMMENT */}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                handleComment(item.id)
              }
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.icon}
              />

              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      colors.icon,
                  },
                ]}
              >
                Comentar
              </Text>
            </TouchableOpacity>

            {/* LIKE */}

            <TouchableOpacity
              style={styles.actionButton}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={colors.icon}
              />

              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      colors.icon,
                  },
                ]}
              >
                Me gusta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  newsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",

    elevation: 2,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.1,

    shadowRadius: 2,
  },

  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  newsImage: {
    width: "100%",
    height: 200,
  },

  newsContent: {
    padding: 12,
  },

  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  newsDescription: {
    fontSize: 14,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },

  commentBubble: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },

  commentText: {
    fontSize: 13,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingVertical: 10,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default HomeNewsScreen;