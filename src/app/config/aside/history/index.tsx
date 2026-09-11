// screens/HistoryScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDarkMode } from "../../../../context/app/DarkModeContext";
import { useHistory } from "../../../../context/HistoryContext";
import DetailModal from "../../../components/DetailModal";

type FilterType = 'all' | 'product' | 'news' | 'post' | 'doctor' | 'lawyer' | 'shop' | 'association';

export default function HistorialScreen() {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { history, loading, fetchMyHistory, fetchHistoryByType, clearHistory } = useHistory();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const colors = {
    background: darkMode ? "#020617" : "#f5f5f5",
    card: darkMode ? "#1E293B" : "#E8F5E9",
    text: darkMode ? "#F8FAFC" : "#1B5E20",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    primary: darkMode ? "#4ADE80" : "#4CAF50",
    headerBackground: darkMode ? "#0F172A" : "#ffffff",
    border: darkMode ? "#334155" : "#eeeeee",
    red: "#EF4444",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
  };

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      if (filter === 'all') {
        await fetchMyHistory();
      } else {
        await fetchHistoryByType(filter);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Limpiar historial",
      "¿Estás seguro de que quieres eliminar todo tu historial?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            try {
              await clearHistory();
              Alert.alert("✅ Historial limpiado", "Tu historial ha sido eliminado correctamente.");
            } catch (error: any) {
              Alert.alert("Error", error?.message || "No se pudo limpiar el historial");
            }
          }
        }
      ]
    );
  };

  const getIconForType = (modelType: string): string => {
    const map: Record<string, string> = {
      'App\\Models\\Product': '🛍️',
      'App\\Models\\News': '📰',
      'App\\Models\\Post': '📝',
      'App\\Models\\Doctor': '👨‍⚕️',
      'App\\Models\\Lawyer': '⚖️',
      'App\\Models\\Shop': '🏪',
      'App\\Models\\Association': '🤝',
    };
    return map[modelType] || '📌';
  };

  const getLabelForType = (modelType: string): string => {
    const map: Record<string, string> = {
      'App\\Models\\Product': 'Producto',
      'App\\Models\\News': 'Noticia',
      'App\\Models\\Post': 'Post',
      'App\\Models\\Doctor': 'Doctor',
      'App\\Models\\Lawyer': 'Abogado',
      'App\\Models\\Shop': 'Tienda',
      'App\\Models\\Association': 'Asociación',
    };
    return map[modelType] || 'Item';
  };

  const openDetailModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Renderizar cada tarjeta
  const renderItem = ({ item }: { item: any }) => {
    if (!item || !item.historyable) {
      return null;
    }

    const data = item.historyable;
    const isProduct = item.historyable_type === 'App\\Models\\Product';
    const isNews = item.historyable_type === 'App\\Models\\News';
    
    const title = data.name || data.titulo || data.title || 'Sin título';
    if (data.first_name) {
      title = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.first_name;
    }
    
    const description = data.description || data.descripcion || data.content || 'Sin descripción';
    const imageUrl = data.image || data.url || null;
    const price = data.price || null;
    const extraInfo = data.stock !== undefined ? `Stock: ${data.stock}` : '';

    const lastViewed = item.last_viewed_at 
      ? new Date(item.last_viewed_at).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Fecha desconocida';

    const icon = getIconForType(item.historyable_type);
    const label = getLabelForType(item.historyable_type);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        onPress={() => openDetailModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.typeBadge, { 
              backgroundColor: isProduct ? '#22C55E' : isNews ? '#3B82F6' : '#8B5CF6' 
            }]}>
              <Text style={styles.typeBadgeText}>
                {icon} {label}
              </Text>
            </View>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye-outline" size={14} color={colors.secondaryText} />
              <Text style={[styles.viewsText, { color: colors.secondaryText }]}>
                {item.views || 0} vistas
              </Text>
            </View>
          </View>
          <Text style={[styles.date, { color: colors.secondaryText }]}>{lastViewed}</Text>
        </View>

        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => {}}
          />
        )}

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>

        <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
          {description}
        </Text>

        {isProduct && price !== null && (
          <Text style={[styles.price, { color: colors.primary }]}>
            S/ {price}
          </Text>
        )}

        {isProduct && extraInfo && (
          <Text style={[styles.extraInfo, { color: colors.secondaryText }]}>
            {extraInfo}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={80} color={colors.secondaryText} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No hay historial
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        {filter === 'all' 
          ? 'Los items que visites aparecerán aquí'
          : `No hay historial de ${filter}`}
      </Text>
    </View>
  );

  const historyData = Array.isArray(history) ? history : [];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando historial...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={darkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />

      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.headerBackground,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mi historial</Text>
        {historyData.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={22} color={colors.red} />
          </TouchableOpacity>
        )}
        {historyData.length === 0 && <View style={{ width: 28 }} />}
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'product', 'news', 'post', 'doctor', 'lawyer', 'shop', 'association'] as FilterType[]).map((type) => {
          const labels: Record<FilterType, string> = {
            all: 'Todos',
            product: '🛍️ Productos',
            news: '📰 Noticias',
            post: '📝 Posts',
            doctor: '👨‍⚕️ Doctores',
            lawyer: '⚖️ Abogados',
            shop: '🏪 Tiendas',
            association: '🤝 Asociaciones',
          };
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filter === type && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleFilterChange(type)}
            >
              <Text style={[
                styles.filterText,
                { color: filter === type ? '#FFFFFF' : colors.secondaryText }
              ]}>
                {labels[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista de historial */}
      <FlatList
        data={historyData}
        keyExtractor={(item) => `${item.id}-${item.historyable_id}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* 🔥 MODAL UNIVERSAL DE DETALLE */}
      <DetailModal
        visible={modalVisible}
        item={selectedItem}
        onClose={closeDetailModal}
        colors={colors}
        showViews={true}
        views={selectedItem?.views || 0}
        lastViewed={selectedItem?.last_viewed_at 
          ? new Date(selectedItem.last_viewed_at).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Fecha desconocida'
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical:20,
    borderBottomWidth: 1,
    marginTop : 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    maxHeight: 50,
    paddingVertical: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewsText: {
    fontSize: 11,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  extraInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});