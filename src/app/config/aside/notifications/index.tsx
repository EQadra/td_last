// src/app/config/aside/notifications/index.tsx - COMPLETO
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../../../context/NotificationContext';
import { useDarkMode } from '../../../../context/app/DarkModeContext';
import DetailModal from '../../../components/DetailModal';

// MAPA DE COLORES POR TIPO DE NOTIFICACIÓN
const typeColors: Record<string, { bg: string; icon: string; label: string }> = {
  feedback: { bg: '#22C55E', icon: 'star-circle', label: 'Reseña' },
  comment: { bg: '#3B82F6', icon: 'comment-text', label: 'Comentario' },
  post: { bg: '#F59E0B', icon: 'post', label: 'Publicación' },
  service: { bg: '#8B5CF6', icon: 'handshake', label: 'Servicio' },
  default: { bg: '#6B7280', icon: 'bell', label: 'Notificación' },
};

export default function NotificacionesScreen() {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    unreadCount 
  } = useNotifications();

  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Colores según dark mode
  const colors = {
    background: darkMode ? "#020617" : "#FFFFFF",
    card: darkMode ? "#1E293B" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#94A3B8" : "#6B7280",
    border: darkMode ? "#334155" : "#E5E7EB",
    primary: darkMode ? "#4ADE80" : "#1C7C54",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
  };

  const getTypeInfo = (type: string) => {
    return typeColors[type] || typeColors.default;
  };

  // ✅ ABRIR MODAL CON TODOS LOS DATOS (comentarios y feedbacks con imágenes)
  const openDetail = (item: any) => {
    // Extraer comentarios y feedbacks de la notificación
    const comments = item.comments || item.data?.comments || [];
    const feedbacks = item.feedbacks || item.data?.feedbacks || [];
    
    // Transformar la notificación para DetailModal
    const transformedItem = {
      ...item,
      comments: comments,
      feedbacks: feedbacks,
      favoritable: {
        name: item.title || item.titulo || 'Notificación',
        description: item.message || item.descripcion || 'Sin contenido',
        image: item.image || item.data?.image || null,
        comments: comments,
        feedbacks: feedbacks,
        user: item.user || item.data?.user || null,
      },
      favoritable_type: `App\\Models\\${item.type || 'Notification'}`,
      created_at: item.created_at || new Date().toISOString(),
      user: item.user || item.data?.user || null,
    };
    
    setSelectedNotification(transformedItem);
    setModalVisible(true);
    
    if (!item.read) {
      markAsRead(item.id);
    }
  };

  const closeDetail = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  // Renderizar cada notificación
  const renderItem = ({ item }: { item: any }) => {
    const typeInfo = getTypeInfo(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
          !item.read && styles.unreadCard
        ]}
        onPress={() => openDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={[styles.cardIconContainer, { backgroundColor: typeInfo.bg + '20' }]}>
            <MaterialCommunityIcons 
              name={typeInfo.icon} 
              size={24} 
              color={typeInfo.bg}
            />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={[
                styles.cardTitle, 
                { color: colors.text },
                !item.read && styles.unreadText
              ]} numberOfLines={1}>
                {item.title || 'Notificación'}
              </Text>
              <Text style={[styles.cardTime, { color: colors.secondaryText }]}>
                {item.time || 'Fecha desconocida'}
              </Text>
            </View>

            <Text style={[styles.cardMessage, { color: colors.secondaryText }]} numberOfLines={2}>
              {item.message || 'Sin contenido'}
            </Text>
            
            <View style={styles.cardFooter}>
              <View style={[styles.cardTypeBadge, { backgroundColor: typeInfo.bg + '20' }]}>
                <Text style={[styles.cardTypeText, { color: typeInfo.bg }]}>
                  {typeInfo.label}
                </Text>
              </View>
              {!item.read && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.unreadBadgeText}>Nuevo</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notificaciones
          {unreadCount > 0 && (
            <Text style={[styles.badge, { color: colors.primary }]}> ({unreadCount})</Text>
          )}
        </Text>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              Marcar todas
            </Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </View>

      {/* LISTA */}
      {loading && notificationsArray.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Cargando notificaciones...
          </Text>
        </View>
      ) : notificationsArray.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off" size={64} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No hay notificaciones
          </Text>
          <Text style={[styles.emptySubText, { color: colors.secondaryText }]}>
            Cuando alguien te deje una reseña o comentario, aparecerá aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificationsArray}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* MODAL DE DETALLE */}
      <DetailModal
        visible={modalVisible}
        item={selectedNotification}
        onClose={closeDetail}
        colors={colors}
        showViews={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginTop: 30,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    fontSize: 14,
    fontWeight: '700',
  },
  markAllButton: {
    padding: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#1C7C54',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
  },
  cardTime: {
    fontSize: 11,
  },
  cardMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  unreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});