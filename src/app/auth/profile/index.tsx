import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, me, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // ✅ CARGAR DATOS AL INICIAR
  useEffect(() => {
    if (user) {
      console.log('📱 Datos del usuario:', JSON.stringify(user, null, 2));
    }
  }, [user]);

  // ✅ REFRESCAR PERFIL
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await me();
    } catch (error) {
      console.error('Error refrescando perfil:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ OBTENER INFORMACIÓN DEL PERFIL
  const getProfileInfo = () => {
    if (!user) return null;

    const profile = user.profile || {};
    const profileType = user.profileType || 'user';

    // ✅ NOMBRE COMPLETO
    let displayName = user.name || '';
    if (profileType === 'doctor' || profileType === 'lawyer') {
      displayName = profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`
        : user.name;
    } else if (profileType === 'association' || profileType === 'shop') {
      displayName = profile.name || user.name;
    }

    // ✅ SEXO
    const sexoLabels: Record<string, string> = {
      masculino: '👨 Hombre',
      femenino: '👩 Mujer',
      lgbt: '🏳️‍🌈 LGBT+',
      otro: '🔘 Otro',
      no_especificado: '⚪ No especificado',
    };
    const sexoLabel = sexoLabels[user.sexo || 'no_especificado'] || '⚪ No especificado';

    // ✅ AVATAR
    const avatarUrl = user.avatar_url || user.avatar || profile.image || null;

    // ✅ TELÉFONO
    const phone = user.phone || profile.phone || 'No disponible';

    // ✅ CIUDAD
    const city = user.city || profile.city || 'No disponible';

    // ✅ DIRECCIÓN
    const address = user.address || profile.address || 'No disponible';

    // ✅ DNI
    const dni = user.dni || 'No disponible';

    // ✅ ESPECIALIDAD (para doctores y abogados)
    let specialty = '';
    if (profileType === 'doctor') {
      specialty = profile.specialty || 'No especificada';
    } else if (profileType === 'lawyer') {
      specialty = profile.specialty || 'No especificada';
    }

    return {
      displayName,
      sexoLabel,
      avatarUrl,
      phone,
      city,
      address,
      dni,
      specialty,
      profileType,
      profile,
    };
  };

  const profileInfo = getProfileInfo();

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004d32" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profileInfo) {
    return null;
  }

  const {
    displayName,
    sexoLabel,
    avatarUrl,
    phone,
    city,
    address,
    dni,
    specialty,
    profileType,
    profile,
  } = profileInfo;

  // ✅ ICONO SEGÚN TIPO DE PERFIL
  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'doctor': return 'medical-outline';
      case 'lawyer': return 'scale-outline';
      case 'association': return 'people-outline';
      case 'shop': return 'storefront-outline';
      default: return 'person-outline';
    }
  };

  // ✅ NOMBRE DEL TIPO DE PERFIL
  const getProfileTypeName = (type: string) => {
    switch (type) {
      case 'doctor': return 'Doctor';
      case 'lawyer': return 'Abogado';
      case 'association': return 'Asociación';
      case 'shop': return 'Tienda';
      default: return 'Usuario';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="create-outline" size={22} color="#004d32" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AVATAR */}
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name={getProfileIcon(profileType)} size={50} color="#fff" />
          </View>
        )}
        <View style={styles.profileTypeBadge}>
          <Ionicons name={getProfileIcon(profileType)} size={14} color="#fff" />
          <Text style={styles.profileTypeText}>
            {getProfileTypeName(profileType)}
          </Text>
        </View>
      </View>

      {/* NOMBRE */}
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {/* SEXO - DESTACADO */}
      <View style={styles.sexoCard}>
        <Ionicons name="people-outline" size={20} color="#004d32" />
        <Text style={styles.sexoCardText}>{sexoLabel}</Text>
      </View>

      {/* INFORMACIÓN DETALLADA */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        {/* DNI */}
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color="#5c7a70" />
          <Text style={styles.infoLabel}>DNI:</Text>
          <Text style={styles.infoValue}>{dni}</Text>
        </View>

        {/* TELÉFONO */}
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#5c7a70" />
          <Text style={styles.infoLabel}>Teléfono:</Text>
          <Text style={styles.infoValue}>{phone}</Text>
        </View>

        {/* CIUDAD */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#5c7a70" />
          <Text style={styles.infoLabel}>Ciudad:</Text>
          <Text style={styles.infoValue}>{city}</Text>
        </View>

        {/* DIRECCIÓN */}
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={20} color="#5c7a70" />
          <Text style={styles.infoLabel}>Dirección:</Text>
          <Text style={styles.infoValue}>{address}</Text>
        </View>

        {/* ESPECIALIDAD (si aplica) */}
        {(profileType === 'doctor' || profileType === 'lawyer') && specialty && (
          <View style={styles.infoRow}>
            <Ionicons name="ribbon-outline" size={20} color="#5c7a70" />
            <Text style={styles.infoLabel}>Especialidad:</Text>
            <Text style={styles.infoValue}>{specialty}</Text>
          </View>
        )}

        {/* DESCRIPCIÓN (si existe) */}
        {profile?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>📝 Descripción:</Text>
            <Text style={styles.descriptionText}>{profile.description}</Text>
          </View>
        )}
      </View>

      {/* ACCIONES */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editProfileButton]}
          onPress={() => router.push('/profile/edit')}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={async () => {
            Alert.alert(
              'Cerrar Sesión',
              '¿Estás seguro de que deseas cerrar sesión?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Cerrar Sesión',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                    router.replace('/auth/login');
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#cc3d3d" />
          <Text style={[styles.actionButtonText, styles.logoutText]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f7',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9f7',
  },

  loadingText: {
    marginTop: 12,
    color: '#5c7a70',
    fontSize: 16,
  },

  errorText: {
    color: '#cc3d3d',
    fontSize: 18,
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#004d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f0ec',
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004d32',
  },

  editButton: {
    padding: 8,
  },

  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 12,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#004d32',
  },

  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004d32',
  },

  profileTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004d32',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    gap: 6,
  },

  profileTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#004d32',
    textAlign: 'center',
    marginTop: 4,
  },

  email: {
    fontSize: 14,
    color: '#5c7a70',
    textAlign: 'center',
    marginBottom: 12,
  },

  // ✅ SEXO CARD - DESTACADO
  sexoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5f0',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b4dccf',
    gap: 10,
    marginBottom: 16,
  },

  sexoCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004d32',
  },

  infoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004d32',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f2',
  },

  infoLabel: {
    fontSize: 14,
    color: '#5c7a70',
    fontWeight: '500',
    marginLeft: 8,
    width: 80,
  },

  infoValue: {
    fontSize: 14,
    color: '#004d32',
    flex: 1,
  },

  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f4f2',
  },

  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d32',
    marginBottom: 4,
  },

  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },

  editProfileButton: {
    backgroundColor: '#004d32',
  },

  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cc3d3d',
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  logoutText: {
    color: '#cc3d3d',
  },

  bottomSpacer: {
    height: 40,
  },
});