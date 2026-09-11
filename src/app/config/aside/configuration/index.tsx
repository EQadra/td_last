import Icon from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../../context/AuthContext";

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLogout = async () => {
    await logout();
    // ✅ logout() ya hace router.replace("/auth/login")
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Configuración</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* CUENTA */}
      <Text style={styles.sectionTitle}>Cuenta</Text>

      <TouchableOpacity style={styles.item} onPress={() => setShowProfile(true)}>
        <Text style={styles.itemText}>Perfil</Text>
        <Icon name="person-outline" size={20} color="#999" />
      </TouchableOpacity>

      {/* GENERAL */}
      <Text style={styles.sectionTitle}>General</Text>

      <TouchableOpacity style={styles.item} onPress={() => setShowTerms(true)}>
        <Text style={styles.itemText}>Términos de uso</Text>
        <Icon name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => setShowPrivacy(true)}>
        <Text style={styles.itemText}>Política de privacidad</Text>
        <Icon name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#E53935" />
        <Text style={styles.dangerText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* ================= PERFIL MODAL ================= */}
      <Modal visible={showProfile} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Mi Perfil</Text>

            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>

              <Text style={styles.userName}>{user?.name || "Usuario"}</Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {user?.profileType || "Usuario"}
                </Text>
              </View>
            </View>

            {/* Información */}
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Icon name="person-outline" size={22} color="#16A34A" />
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Nombre</Text>
                  <Text style={styles.value}>
                    {user?.name || "No disponible"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Icon name="mail-outline" size={22} color="#16A34A" />
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <Text style={styles.value}>
                    {user?.email || "No disponible"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Icon name="people-outline" size={22} color="#16A34A" />
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Tipo de cuenta</Text>
                  <Text style={styles.value}>
                    {user?.profileType || "Usuario"}
                  </Text>
                </View>
              </View>

              {user?.phone && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Icon name="call-outline" size={22} color="#16A34A" />
                    <View style={styles.infoContent}>
                      <Text style={styles.label}>Teléfono</Text>
                      <Text style={styles.value}>{user.phone}</Text>
                    </View>
                  </View>
                </>
              )}

              {user?.city && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Icon name="location-outline" size={22} color="#16A34A" />
                    <View style={styles.infoContent}>
                      <Text style={styles.label}>Ciudad</Text>
                      <Text style={styles.value}>{user.city}</Text>
                    </View>
                  </View>
                </>
              )}

              {user?.createdAt && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Icon name="calendar-outline" size={22} color="#16A34A" />
                    <View style={styles.infoContent}>
                      <Text style={styles.label}>Miembro desde</Text>
                      <Text style={styles.value}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowProfile(false)}
            >
              <Text style={styles.profileButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= TÉRMINOS ================= */}
      <Modal visible={showTerms} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTerms(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Términos de uso</Text>

            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.mainTitle}>TÉRMINOS Y CONDICIONES DE USO</Text>

            <Text style={styles.subtitle}>
              TUDEALER APP – Aplicativo de Comunidad Cannábica en Perú
            </Text>

            <Text style={styles.date}>19/03/2026</Text>

            <Text style={styles.sectionTitle}>1. INFORMACIÓN GENERAL</Text>
            <Text style={styles.paragraph}>
              Bienvenido a TUDEALER APP, una comunidad en línea dedicada a la
              información, discusión, salud y cultura del cannabis en América
              Latina. Estos Términos y Condiciones regulan el acceso y uso de
              nuestro sitio web, servicios y contenido.
            </Text>
            <Text style={styles.paragraph}>
              Al acceder a nuestra plataforma, usted acepta cumplir con los
              presentes Términos y Condiciones. Si no está de acuerdo con ellos,
              le solicitamos que no utilice nuestros servicios ni nuestro
              contenido.
            </Text>

            <Text style={styles.sectionTitle}>2. RESTRICCIONES DE EDAD</Text>
            <Text style={styles.paragraph}>
              El acceso y uso de TUDEALER APP está restringido a personas
              mayores de 18 años...
            </Text>

            <Text style={styles.sectionTitle}>3. FINALIDAD DEL SITIO</Text>
            <Text style={styles.paragraph}>
              TUDEALER APP es una plataforma destinada exclusivamente a la
              divulgación de información sobre la cultura cannábica...
            </Text>
            <Text style={styles.bullet}>
              • No promovemos ni facilitamos actividades ilegales relacionadas
              con el cultivo, distribución o consumo de marihuana.
            </Text>

            <Text style={styles.sectionTitle}>
              4. POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS
            </Text>
            <Text style={styles.subSection}>4.1. Datos Recopilados</Text>
            <Text style={styles.paragraph}>
              Podemos recopilar datos personales como nombre, correo
              electrónico y ubicación...
            </Text>
            <Text style={styles.subSection}>4.2. Uso de la Información</Text>
            <Text style={styles.bullet}>• Enviar boletines informativos.</Text>
            <Text style={styles.bullet}>
              • Gestionar la participación en foros y comentarios.
            </Text>
            <Text style={styles.bullet}>
              • Mejorar nuestros servicios y la navegación.
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTerms(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= PRIVACIDAD ================= */}
      <Modal visible={showPrivacy} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPrivacy(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Política de privacidad</Text>

            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.mainTitle}>POLÍTICA DE PRIVACIDAD</Text>
            <Text style={styles.subtitle}>TUDEALER APP</Text>
            <Text style={styles.date}>23/03/2026</Text>

            <Text style={styles.sectionTitle}>1. INTRODUCCIÓN</Text>
            <Text style={styles.paragraph}>
              La presente Política de Privacidad describe cómo TUDEALER APP
              recopila, utiliza, almacena y protege los datos personales de los
              usuarios, en cumplimiento de la Ley N.º 29733 – Ley de Protección
              de Datos Personales y su normativa complementaria en Perú.
            </Text>
            <Text style={styles.paragraph}>
              Al utilizar nuestra aplicación, usted acepta las prácticas
              descritas en este documento.
            </Text>

            <Text style={styles.sectionTitle}>
              2. INFORMACIÓN QUE RECOPILAMOS
            </Text>
            <Text style={styles.subSection}>a) Datos de identificación</Text>
            <Text style={styles.bullet}>• Nombre y apellidos</Text>
            <Text style={styles.bullet}>
              • Documento de identidad (DNI u otro)
            </Text>
            <Text style={styles.bullet}>• Correo electrónico</Text>
            <Text style={styles.bullet}>• Número de teléfono</Text>

            <Text style={styles.subSection}>
              b) Datos de uso y navegación
            </Text>
            <Text style={styles.bullet}>• Dirección IP</Text>
            <Text style={styles.bullet}>• Tipo de dispositivo</Text>
            <Text style={styles.bullet}>• Sistema operativo</Text>
            <Text style={styles.bullet}>
              • Interacciones dentro de la aplicación
            </Text>
            <Text style={styles.bullet}>
              • Cookies y tecnologías similares
            </Text>

            <Text style={styles.subSection}>c) Datos adicionales</Text>
            <Text style={styles.bullet}>• Ubicación aproximada</Text>
            <Text style={styles.bullet}>• Preferencias del usuario</Text>

            <Text style={styles.sectionTitle}>
              3. FINALIDAD DEL TRATAMIENTO DE DATOS
            </Text>
            <Text style={styles.paragraph}>
              Los datos personales recopilados serán utilizados para:
            </Text>
            <Text style={styles.bullet}>
              • Proveer y mejorar nuestros servicios
            </Text>
            <Text style={styles.bullet}>• Gestionar cuentas de usuario</Text>
            <Text style={styles.bullet}>• Brindar soporte técnico</Text>
            <Text style={styles.bullet}>
              • Personalizar la experiencia del usuario
            </Text>
            <Text style={styles.bullet}>• Cumplir obligaciones legales</Text>

            <Text style={styles.sectionTitle}>4. CONSENTIMIENTO</Text>
            <Text style={styles.paragraph}>
              El usuario otorga su consentimiento libre, previo, informado y
              expreso para el tratamiento de sus datos personales al aceptar
              esta Política de Privacidad.
            </Text>

            <Text style={styles.sectionTitle}>
              5. ALMACENAMIENTO Y SEGURIDAD
            </Text>
            <Text style={styles.paragraph}>
              Adoptamos medidas técnicas, organizativas y legales necesarias
              para proteger los datos personales contra pérdida, acceso no
              autorizado, alteración o divulgación.
            </Text>
            <Text style={styles.paragraph}>
              Los datos serán almacenados durante el tiempo necesario para
              cumplir con las finalidades descritas.
            </Text>

            <Text style={styles.sectionTitle}>6. COMPARTICIÓN DE DATOS</Text>
            <Text style={styles.paragraph}>
              No compartimos datos personales con terceros, salvo en los
              siguientes casos:
            </Text>
            <Text style={styles.bullet}>
              • Cuando sea necesario para la prestación del servicio
            </Text>
            <Text style={styles.bullet}>• Por obligación legal</Text>
            <Text style={styles.bullet}>
              • Con proveedores tecnológicos bajo acuerdos de confidencialidad
            </Text>

            <Text style={styles.sectionTitle}>7. DERECHOS DEL USUARIO (ARCO)</Text>
            <Text style={styles.paragraph}>
              El usuario podrá ejercer los siguientes derechos:
            </Text>
            <Text style={styles.bullet}>• Acceder a sus datos personales</Text>
            <Text style={styles.bullet}>
              • Solicitar la rectificación de datos incorrectos
            </Text>
            <Text style={styles.bullet}>
              • Solicitar la cancelación de sus datos
            </Text>
            <Text style={styles.bullet}>
              • Oponerse al tratamiento de sus datos
            </Text>
            <Text style={styles.paragraph}>
              Para ejercer estos derechos puede contactarnos en:
            </Text>
            <Text style={styles.email}>tudealerapp@gmail.com</Text>

            <Text style={styles.sectionTitle}>8. USO DE COOKIES</Text>
            <Text style={styles.paragraph}>
              La aplicación puede utilizar cookies y tecnologías similares para
              mejorar la experiencia del usuario y analizar el uso de la
              plataforma.
            </Text>

            <Text style={styles.sectionTitle}>9. MENORES DE EDAD</Text>
            <Text style={styles.paragraph}>
              Nuestros servicios no están dirigidos a menores de edad. No
              recopilamos datos intencionalmente de menores sin consentimiento
              de sus padres o tutores.
            </Text>

            <Text style={styles.sectionTitle}>10. CAMBIOS A ESTA POLÍTICA</Text>
            <Text style={styles.paragraph}>
              Nos reservamos el derecho de modificar esta Política de
              Privacidad en cualquier momento. Los cambios serán comunicados a
              través de la aplicación o mediante otros medios adecuados.
            </Text>

            <Text style={styles.sectionTitle}>11. CONTACTO</Text>
            <Text style={styles.paragraph}>
              Si tiene dudas sobre esta Política de Privacidad o sobre el
              tratamiento de sus datos personales, puede contactarnos en:
            </Text>
            <Text style={styles.contact}>
              Correo electrónico: tudealerapp@gmail.com
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPrivacy(false)}
            >
              <Text style={styles.closeButtonText}>Aceptar y cerrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginTop: 40,
    marginBottom: 20,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  itemText: {
    fontSize: 15,
    color: "#000",
  },

  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  dangerText: {
    fontSize: 15,
    color: "#E53935",
    marginLeft: 8,
  },

  closeButton: {
    backgroundColor: "#1B5E20",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  footerIcon: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#fff",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  /* MODAL GENERAL */
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  modalHeader: {
    backgroundColor: "#16A34A",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  content: {
    padding: 16,
  },

  text: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: "justify",
  },

  /* PERFIL */
  avatarContainer: {
    alignItems: "center",
    marginTop: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  userType: {
    color: "#16A34A",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },

  label: {
    color: "#666",
    fontSize: 13,
  },

  value: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: "500",
  },

  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 4,
  },

  date: {
    textAlign: "center",
    color: "#888",
    marginBottom: 24,
    fontSize: 13,
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
    textAlign: "justify",
    marginBottom: 12,
  },

  bullet: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
    marginLeft: 8,
    marginBottom: 6,
  },

  subSection: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 12,
    marginBottom: 8,
  },

  email: {
    fontSize: 15,
    color: "#1B5E20",
    fontWeight: "600",
    marginBottom: 15,
  },

  contact: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    marginBottom: 30,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },

  badge: {
    marginTop: 10,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#15803D",
    fontWeight: "600",
    fontSize: 13,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoContent: {
    marginLeft: 12,
    flex: 1,
  },

  profileButton: {
    backgroundColor: "#16A34A",
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  profileButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});