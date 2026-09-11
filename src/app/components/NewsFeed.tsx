import React, {
  useEffect,
  useState
} from "react";

import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import { useNews } from "../../context/NewsContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const NewsFeed = () => {

  const router = useRouter();

  const { darkMode } = useDarkMode();

  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    input: darkMode ? "#1E293B" : "#ffffff",
    comment: darkMode ? "#1E293B" : "#f1f1f1",
    modal: darkMode ? "#0F172A" : "#ffffff",
    green: darkMode ? "#4ADE80" : "#00B272",
  };

  const {
    news,
    loading,
    fetchHomeNews,
    addComment,
  } = useNews();

  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeNews, setActiveNews] = useState<any>(null);
  const [activeNewsId, setActiveNewsId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [likedNews, setLikedNews] = useState<Record<number, boolean>>({});

  /* ================================
     FETCH
  ================================= */

  useEffect(() => {
    fetchHomeNews();
  }, []);

  /* ================================
     LIKES STORAGE
  ================================= */

  useEffect(() => {
    (async () => {
      const savedLikes = await AsyncStorage.getItem("likedNews");
      if (savedLikes) {
        setLikedNews(JSON.parse(savedLikes));
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("likedNews", JSON.stringify(likedNews));
  }, [likedNews]);

  /* ================================
     COMMENTS
  ================================= */

  const openComments = (item: any) => {
    setActiveNews(item);
    setActiveNewsId(item.id);
    setModalVisible(true);
  };

  const closeComments = () => {
    setCommentText("");
    setActiveNewsId(null);
    setModalVisible(false);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeNewsId) return;

    const tempComment = commentText;

    setActiveNews((prev: any) => ({
      ...prev,
      comments: [
        {
          id: Date.now(),
          content: tempComment,
          user,
          created_at: new Date().toISOString(),
        },
        ...(prev?.comments || []),
      ],
    }));

    setCommentText("");

    await addComment(activeNewsId, tempComment);
    await fetchHomeNews();
  };

  /* ================================
     SHARE
  ================================= */

  const compartirNoticia = async (titulo: string, url?: string) => {
    try {
      await Share.share({
        message: `${titulo}${url ? `\n${url}` : ""}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  /* ================================
     LIKE
  ================================= */

  const toggleLike = (id: number) => {
    setLikedNews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ================================
     RENDER COMMENTS CON VIEW + MAP
  ================================= */

  const renderComments = () => {
    const comments = activeNews?.comments ?? [];
    
    if (comments.length === 0) {
      return (
        <View style={styles.noCommentsContainer}>
          <Text style={[styles.noCommentsText, { color: colors.secondaryText }]}>
            No hay comentarios aún. Sé el primero en comentar.
          </Text>
        </View>
      );
    }

    return comments.map((item: any) => (
      <View
        key={item.id.toString()}
        style={[
          styles.commentBubble,
          {
            backgroundColor: colors.comment,
          },
        ]}
      >
        <Text
          style={[
            styles.commentUser,
            { color: colors.text },
          ]}
        >
          {item.user?.name || "Usuario"}
        </Text>

        <Text
          style={[
            styles.commentText,
            { color: colors.text },
          ]}
        >
          {item.content}
        </Text>

        <Text
          style={[
            styles.commentDate,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    ));
  };

  /* ================================
     RENDER NEWS CON VIEW + MAP (SIN SCROLLVIEW)
  ================================= */

  const renderNews = () => {
    if (!news || news.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No hay noticias disponibles
          </Text>
        </View>
      );
    }

    return news.map((item: any) => (
      <View
        key={item.id}
        style={[
          styles.newsItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {item.url && (
          <Image
            source={{
              uri: "https://picsum.photos/id/1060/400/250",
            }}
            style={styles.newsImage}
          />
        )}

        <View style={styles.newsHeader}>
          <Image
            source={{
              uri: item.user?.url || "https://i.pravatar.cc/100",
            }}
            style={styles.newsAvatar}
          />

          <Text
            style={[
              styles.newsName,
              { color: colors.text },
            ]}
          >
            {item.user?.name || "Usuario"}
          </Text>
        </View>

        <Text
          style={[
            styles.newsDescription,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          {item.title || item.descripcion}
        </Text>

        {/* ACTIONS */}
        <View
          style={[
            styles.newsActions,
            {
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => compartirNoticia(item.title, item.url)}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={colors.green}
            />
            <Text
              style={[
                styles.actionText,
                { color: colors.green },
              ]}
            >
              Compartir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openComments(item)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={colors.green}
            />
            <Text
              style={[
                styles.actionText,
                { color: colors.green },
              ]}
            >
              Comentar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={likedNews[item.id] ? "heart" : "heart-outline"}
              size={20}
              color={likedNews[item.id] ? "red" : colors.green}
            />
            <Text
              style={[
                styles.actionText,
                { color: colors.green },
              ]}
            >
              Me gusta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  /* ================================
     RENDER COMMENTS EN MODAL CON VIEW + MAP (SIN SCROLLVIEW)
  ================================= */

  const renderCommentsModal = () => {
    const comments = activeNews?.comments ?? [];
    
    if (comments.length === 0) {
      return (
        <View style={styles.noCommentsContainer}>
          <Text style={[styles.noCommentsText, { color: colors.secondaryText }]}>
            No hay comentarios aún. Sé el primero en comentar.
          </Text>
        </View>
      );
    }

    return comments.map((item: any) => (
      <View
        key={item.id.toString()}
        style={[
          styles.commentBubble,
          {
            backgroundColor: colors.comment,
          },
        ]}
      >
        <Text
          style={[
            styles.commentUser,
            { color: colors.text },
          ]}
        >
          {item.user?.name || "Usuario"}
        </Text>

        <Text
          style={[
            styles.commentText,
            { color: colors.text },
          ]}
        >
          {item.content}
        </Text>

        <Text
          style={[
            styles.commentDate,
            {
              color: colors.secondaryText,
            },
          ]}
        >
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    ));
  };

  /* ================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <Text
        style={{
          textAlign: "center",
          marginTop: 20,
          color: colors.text,
        }}
      >
        Cargando noticias...
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Noticias
        </Text>

        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => router.push("/aplication/home-news")}
        >
          <Ionicons name="newspaper-outline" size={16} color="#fff" />
          <Text style={styles.seeMoreText}>Ver más</Text>
        </TouchableOpacity>
      </View>

      {/* NEWS - Solo View + map, sin ScrollView */}
      <View style={styles.newsContainer}>
        {renderNews()}
      </View>

      {/* COMMENTS MODAL - Solo View + map, sin ScrollView */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.modal,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                Comentarios
              </Text>

              <TouchableOpacity onPress={closeComments}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Comentarios - Solo View + map, sin ScrollView */}
            <View style={styles.commentsContainer}>
              {renderCommentsModal()}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={darkMode ? "#94A3B8" : "#999"}
                value={commentText}
                onChangeText={setCommentText}
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAddComment}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default NewsFeed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
  seeMoreButton: {
    flexDirection: "row",
    backgroundColor: "#00B272",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  seeMoreText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "600",
  },
  newsContainer: {
    flex: 1,
  },
  newsItem: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  newsImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  newsAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  newsName: {
    fontWeight: "700",
    fontSize: 16,
  },
  newsDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  newsActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: "80%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  commentsContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#00B272",
    padding: 10,
    borderRadius: 20,
  },
  commentBubble: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 6,
  },
  commentUser: {
    fontWeight: "700",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
  },
  commentDate: {
    fontSize: 10,
    marginTop: 2,
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
});