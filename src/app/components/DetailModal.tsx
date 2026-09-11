// components/DetailModal.tsx - COMPLETO SIN IMAGEN (solo texto)
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DetailModalProps {
  visible: boolean;
  item: any;
  onClose: () => void;
  colors: any;
  showViews?: boolean;
  loading?: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  item,
  onClose,
  colors,
  showViews = true,
  loading = false,
}) => {
  if (!item) return null;

  const getName = () => {
    if (item.favoritable?.name) return item.favoritable.name;
    if (item.name) return item.name;
    if (item.title) return item.title;
    if (item.titulo) return item.titulo;
    return 'Sin título';
  };

  const getDescription = () => {
    if (item.favoritable?.description) return item.favoritable.description;
    if (item.message) return item.message;
    if (item.content) return item.content;
    if (item.descripcion) return item.descripcion;
    return 'Sin descripción';
  };

  const getDate = () => {
    if (item.created_at) return item.created_at;
    if (item.favoritable?.created_at) return item.favoritable.created_at;
    return new Date().toISOString();
  };

  const getComments = () => {
    if (item.comments) return item.comments;
    if (item.favoritable?.comments) return item.favoritable.comments;
    if (item.data?.comments) return item.data.comments;
    return [];
  };

  const getFeedbacks = () => {
    if (item.feedbacks) return item.feedbacks;
    if (item.favoritable?.feedbacks) return item.favoritable.feedbacks;
    if (item.data?.feedbacks) return item.data.feedbacks;
    return [];
  };

  const comments = getComments();
  const feedbacks = getFeedbacks();
  const hasComments = comments && comments.length > 0;
  const hasFeedbacks = feedbacks && feedbacks.length > 0;

  // Obtener avatar de usuario
  const getUserAvatar = (user: any) => {
    if (!user) return null;
    if (user.avatar) return user.avatar;
    if (user.avatar_url) return user.avatar_url;
    if (user.image) return user.image;
    return null;
  };

  // Obtener nombre de usuario
  const getUserName = (user: any) => {
    if (!user) return 'Usuario';
    if (user.name) return user.name;
    if (user.username) return user.username;
    return 'Usuario';
  };

  // Renderizar comentario CON IMAGEN DE USUARIO
  const renderComment = (comment: any) => {
    const user = comment.user || comment.author || {};
    const avatarUrl = getUserAvatar(user);
    const userName = getUserName(user);
    const commentDate = comment.created_at || comment.createdAt || new Date().toISOString();

    return (
      <View key={comment.id} style={[styles.commentItem, { borderBottomColor: colors.border || '#E5E7EB' }]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.commentAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.commentAvatar, styles.commentAvatarFallback]}>
                <Text style={styles.commentAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={[styles.commentAuthor, { color: colors.text || '#1A1A2E' }]}>
                {userName}
              </Text>
              <Text style={[styles.commentDate, { color: colors.secondaryText || '#666' }]}>
                {new Date(commentDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.commentContent, { color: colors.text || '#333' }]}>
          {comment.content || comment.text || 'Sin contenido'}
        </Text>
      </View>
    );
  };

  // Renderizar feedback CON IMAGEN DE USUARIO
  const renderFeedback = (feedback: any) => {
    const user = feedback.user || feedback.author || {};
    const avatarUrl = getUserAvatar(user);
    const userName = getUserName(user);
    const feedbackDate = feedback.created_at || feedback.createdAt || new Date().toISOString();
    const rating = feedback.rating || feedback.stars || 5;

    return (
      <View key={feedback.id} style={[styles.feedbackItem, { borderBottomColor: colors.border || '#E5E7EB' }]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.commentAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.commentAvatar, styles.commentAvatarFallback]}>
                <Text style={styles.commentAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={[styles.commentAuthor, { color: colors.text || '#1A1A2E' }]}>
                {userName}
              </Text>
              <Text style={[styles.commentDate, { color: colors.secondaryText || '#666' }]}>
                {new Date(feedbackDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <View style={[styles.feedbackRating, { backgroundColor: (colors.primary || '#00B272') + '20' }]}>
            <Text style={[styles.feedbackRatingText, { color: colors.primary || '#00B272' }]}>
              ⭐ {rating}
            </Text>
          </View>
        </View>
        <Text style={[styles.commentContent, { color: colors.text || '#333' }]}>
          {feedback.comment || feedback.content || 'Sin contenido'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card || '#FFFFFF' }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary || '#00B272'} />
              <Text style={[styles.loadingText, { color: colors.secondaryText || '#666' }]}>
                Cargando...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card || '#FFFFFF' }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border || '#E5E7EB' }]}>
            <Text style={[styles.modalTitle, { color: colors.text || '#1A1A2E' }]} numberOfLines={2}>
              {getName()}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text || '#333'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            {/* Descripción */}
            <Text style={[styles.modalDescription, { color: colors.text || '#333' }]}>
              {getDescription()}
            </Text>

            {/* Fecha */}
            <Text style={[styles.modalDate, { color: colors.secondaryText || '#666' }]}>
              📅 {new Date(getDate()).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>

            {/* SECCIÓN: COMENTARIOS CON AVATARES */}
            {hasComments && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="chatbubbles-outline" size={20} color={colors.primary || '#00B272'} />
                  <Text style={[styles.sectionTitle, { color: colors.text || '#1A1A2E' }]}>
                    💬 Comentarios ({comments.length})
                  </Text>
                </View>
                {comments.map(renderComment)}
              </View>
            )}

            {/* SECCIÓN: FEEDBACKS CON AVATARES */}
            {hasFeedbacks && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star-outline" size={20} color={colors.primary || '#00B272'} />
                  <Text style={[styles.sectionTitle, { color: colors.text || '#1A1A2E' }]}>
                    ⭐ Reseñas ({feedbacks.length})
                  </Text>
                </View>
                {feedbacks.map(renderFeedback)}
              </View>
            )}

            {/* Sin actividad */}
            {!hasComments && !hasFeedbacks && (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color={colors.secondaryText || '#999'} />
                <Text style={[styles.emptyText, { color: colors.secondaryText || '#999' }]}>
                  Sin comentarios ni reseñas
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxHeight: '85%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    marginTop: 12,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 12,
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#00B272',
    backgroundColor: '#e0e0e0',
  },
  commentAvatarFallback: {
    backgroundColor: '#00B272',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
  },
  commentDate: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 46,
  },
  feedbackItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  feedbackRating: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  feedbackRatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
});

export default DetailModal;