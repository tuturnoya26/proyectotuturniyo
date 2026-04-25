import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Avatar, BrandMark } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { APP_NAME } from '@/constants/brand';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { profile, signOut, updateRole } = useAuth();

  async function switchToOwner() {
    Alert.alert(
      '¿Cambiar a perfil de profesional?',
      'Vas a poder gestionar tu local y recibir reservas',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cambiar',
          onPress: async () => {
            await updateRole('owner');
            router.replace('/(owner)/dashboard');
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.header}>
        <View>
          <BrandMark size={30} />
          <Text style={styles.title}>Mi perfil</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Avatar name={profile?.full_name} size={80} />
        <Text style={styles.name}>{profile?.full_name ?? 'Sin nombre'}</Text>
        <Text style={styles.email}>{profile?.phone ?? ''}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>Turnos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon="card-outline" label="Métodos de pago" badge="Mercado Pago" />
        <MenuItem icon="heart-outline" label="Favoritos" />
        <MenuItem icon="gift-outline" label="Programa de fidelidad" />
        <MenuItem icon="notifications-outline" label="Notificaciones" />
        <MenuItem icon="location-outline" label="Mis direcciones" />
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon="help-circle-outline" label="Ayuda y soporte" />
        <MenuItem icon="document-text-outline" label="Términos y condiciones" />
        <MenuItem icon="shield-checkmark-outline" label="Privacidad" />
      </View>

      {profile?.role === 'client' && (
        <TouchableOpacity style={styles.becomeOwner} onPress={switchToOwner}>
          <Ionicons name="cut" size={20} color={Colors.yellow} />
          <Text style={styles.becomeOwnerText}>Tengo un local — cambiar a profesional</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.yellow} />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={signOut} style={styles.signOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>{APP_NAME} v0.1.0</Text>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={Colors.text} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge && <Text style={styles.menuBadge}>{badge}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  email: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  stat: { alignItems: 'center', minWidth: 50 },
  statValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  menuSection: {
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { color: Colors.text, fontSize: FontSize.md, flex: 1 },
  menuBadge: { color: Colors.textSecondary, fontSize: FontSize.xs, marginRight: 6 },
  becomeOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.yellow,
    gap: Spacing.md,
  },
  becomeOwnerText: {
    color: Colors.yellow,
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  signOutText: { color: Colors.danger, fontSize: FontSize.md, fontWeight: '600' },
  version: {
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    marginTop: Spacing.xl,
  },
});
