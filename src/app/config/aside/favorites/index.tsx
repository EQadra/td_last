// app/favorites/index.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../../../context/app/DarkModeContext";
import { useFavorites } from "../../../../context/FavoriteContext";
import DetailModal from "../../../components/DetailModal";

type FilterType = 'all' | 'product' | 'news' | 'post' | 'doctor' | 'lawyer' | 'shop' | 'association';

const FavoritesScreen = () => {
  const { darkMode } = useDarkMode();
  const { favorites, loading, fetchMyFavorites, fetchFavoritesByType, toggleFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const colors = {
    background: darkMode ? "#020617" : "#f5f5f5",
    card: darkMode ? "#1E293B" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    primary: darkMode ? "#4ADE80" : "#00B272",
    border: darkMode ? "#334155" : "#E5E5E5",
    red: "#EF4444",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
  };

  useEffect(() => {
    loadFavorites();
  }, [filter]);

  const loadFavorites = async () => {
    if (filter === 'all') {
      await fetchMyFavorites();
    } else {
      await fetchFavoritesByType(filter);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleToggleFavorite = async (item: any) => {
    try {
      const type = getTypeFromModel(item.favoritable_type);
      await toggleFavorite(type, item.favoritable_id);
      await loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getTypeFromModel = (modelType: string): string => {
    const map: Record<string, string> = {
      'App\\Models\\Product': 'product',
      'App\\Models\\News': 'news',
      'App\\Models\\Post': 'post',
      'App\\Models\\Doctor': 'doctor',
      'App\\Models\\Lawyer': 'lawyer',
      'App\\Models\\Shop': 'shop',
      'App\\Models\\Association': 'association',
    };
    return map[modelType] || 'product';
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
    const data = item.favoritable;
    if (!data) return null;

    const isProduct = item.favoritable_type === 'App\\Models\\Product';
    const isNews = item.favoritable_type === 'App\\Models\\News';
    
    const title = data.name || data.titulo || data.title || 'Sin título';
    if (data.first_name) {
      title = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.first_name;
    }
    
    const description = data.description || data.descripcion || data.content || 'Sin descripción';
    const imageUrl = data.image || data.url || null;
    const price = data.price || null;
    const extraInfo = data.stock !== undefined ? `Stock: ${data.stock}` : '';

    const date = new Date(item.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const icon = getIconForType(item.favoritable_type);
    const label = getLabelForType(item.favoritable_type);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        onPress={() => openDetailModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.typeBadge, { 
              backgroundColor: isProduct ? '#22C55E' : '#3B82F6' 
            }]}>
              <Text style={styles.typeBadgeText}>
                {icon} {label}
              </Text>
            </View>
            <Text style={[styles.date, { color: colors.secondaryText }]}>{date}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <Ionicons name="heart" size={24} color={colors.red} />
          </TouchableOpacity>
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
      <Ionicons name="heart-outline" size={80} color={colors.secondaryText} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No tienes favoritos
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        {filter === 'all' 
          ? 'Comienza a guardar productos, noticias y más que te gusten'
          : `No tienes ${filter} en favoritos`}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando favoritos...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          ❤️ Mis favoritos
        </Text>
        <Text style={[styles.headerCount, { color: colors.secondaryText }]}>
          {favorites.length} items
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        {(['all', 'product', 'news', 'post', 'doctor', 'lawyer', 'shop', 'association'] as FilterType[]).map((type) => {
          const labels: Record<FilterType, string> = {
            all: 'Todos',
            product: '🛍️',
            news: '📰',
            post: '📝',
            doctor: '👨‍⚕️',
            lawyer: '⚖️',
            shop: '🏪',
            association: '🤝',
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
                {labels[type] || type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => `${item.id}-${item.favoritable_id}`}
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
        showViews={false}
      />
    </View>
  );
};

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
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
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  extraInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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

export default FavoritesScreen;