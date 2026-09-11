import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Logo circular con fondo verde oscuro */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      {/* Mensaje de bienvenida */}
      <Text style={styles.welcomeText}>Bienvenido a tudealer</Text>
      <Text style={styles.subText}>Tu red social de confianza</Text>

      {/* Botones con navegación */}
      <Link href="auth/login" asChild>
        <TouchableOpacity style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Ingresar</Text>
        </TouchableOpacity>
      </Link>

      <Link href="auth/signup" asChild>
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Registrarse</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    backgroundColor: '#004d32',
    borderRadius: 100,
    padding: 20,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#004d32',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  buttonPrimary: {
    backgroundColor: '#004d32',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderColor: '#004d32',
    borderWidth: 2,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#004d32',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
