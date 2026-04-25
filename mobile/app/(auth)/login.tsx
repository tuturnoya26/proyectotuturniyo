import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import type { UserRole } from '@/types/database';
import { APP_LOGO_URL, APP_NAME } from '@/constants/brand';

export default function Login() {
  const { signInWithGoogle, updateRole, session } = useAuth();
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await signInWithGoogle();
      await updateRole(role);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Image source={{ uri: APP_LOGO_URL }} style={styles.logoImage} resizeMode="contain" />

      <Text style={styles.brandName}>{APP_NAME}</Text>
      <Text style={styles.title}>Bienvenido a {APP_NAME}</Text>
      <Text style={styles.subtitle}>Elegí tu perfil para empezar</Text>

      <View style={styles.roleGrid}>
        <TouchableOpacity
          style={[styles.roleCard, role === 'client' && styles.roleCardActive]}
          onPress={() => setRole('client')}
          activeOpacity={0.7}
        >
          <View style={styles.roleIcon}>
            <Ionicons
              name="person"
              size={28}
              color={role === 'client' ? Colors.bg : Colors.yellow}
            />
          </View>
          <Text style={[styles.roleTitle, role === 'client' && styles.roleTitleActive]}>
            Soy cliente
          </Text>
          <Text
            style={[styles.roleDesc, role === 'client' && styles.roleDescActive]}
          >
            Quiero reservar turnos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, role === 'owner' && styles.roleCardActive]}
          onPress={() => setRole('owner')}
          activeOpacity={0.7}
        >
          <View style={styles.roleIcon}>
            <Ionicons
              name="cut"
              size={28}
              color={role === 'owner' ? Colors.bg : Colors.yellow}
            />
          </View>
          <Text style={[styles.roleTitle, role === 'owner' && styles.roleTitleActive]}>
            Tengo un local
          </Text>
          <Text
            style={[styles.roleDesc, role === 'owner' && styles.roleDescActive]}
          >
            Quiero recibir reservas
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: Spacing.xxxl, gap: Spacing.md }}>
        <Button
          title="Continuar con Google"
          onPress={handleGoogleLogin}
          loading={loading}
          icon={<Ionicons name="logo-google" size={20} color={Colors.bg} />}
        />
        <Button
          title="Continuar con Apple"
          variant="secondary"
          icon={<Ionicons name="logo-apple" size={20} color={Colors.text} />}
        />
      </View>

      <Text style={styles.legal}>
        Al continuar aceptás nuestros Términos y Condiciones y la Política de
        Privacidad.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 76,
    height: 76,
    marginBottom: Spacing.xl,
  },
  brandName: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.xxl,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleCardActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  roleTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleTitleActive: {
    color: Colors.bg,
  },
  roleDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  roleDescActive: {
    color: Colors.bg,
    opacity: 0.7,
  },
  legal: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    lineHeight: 16,
  },
});
