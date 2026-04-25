import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Avatar, BrandMark } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice } from '@/types/database';
import type { Business, Appointment } from '@/types/database';

interface ApptDetail extends Appointment {
  service: { name: string };
  client_profile: { full_name: string } | null;
}

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0, count: 0 });
  const [upcoming, setUpcoming] = useState<ApptDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) load();
  }, [profile]);

  async function load() {
    setLoading(true);
    // Get the business
    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', profile!.id)
      .maybeSingle();

    if (!biz) {
      setLoading(false);
      return;
    }
    setBusiness(biz);

    // Revenue
    const { data: dayRev } = await supabase.rpc('get_revenue', {
      p_business_id: biz.id,
      p_period: 'day',
    });
    const { data: weekRev } = await supabase.rpc('get_revenue', {
      p_business_id: biz.id,
      p_period: 'week',
    });
    const { data: monthRev } = await supabase.rpc('get_revenue', {
      p_business_id: biz.id,
      p_period: 'month',
    });

    setRevenue({
      today: (dayRev?.[0]?.total_cents as number) ?? 0,
      week: (weekRev?.[0]?.total_cents as number) ?? 0,
      month: (monthRev?.[0]?.total_cents as number) ?? 0,
      count: (dayRev?.[0]?.appointments_count as number) ?? 0,
    });

    // Upcoming
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, service:services(name), client_profile:profiles(full_name)')
      .eq('business_id', biz.id)
      .gte('starts_at', new Date().toISOString())
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: true })
      .limit(5);
    setUpcoming((appts as any) ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.yellow} />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {profile?.full_name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Avatar name={profile?.full_name} size={42} />
          </TouchableOpacity>
        </View>
        <View style={[styles.center, { padding: Spacing.xxl }]}>
          <Ionicons name="storefront-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Creá tu local</Text>
          <Text style={styles.emptyDesc}>
            Completá los datos de tu barbería o salón para empezar a recibir reservas
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push('/(owner)/business')}
          >
            <Text style={styles.ctaText}>Configurar mi local</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
          </TouchableOpacity>
        </View>
      </View>
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
          <Text style={styles.greetingSub}>Buen día,</Text>
          <Text style={styles.greeting}>
            {profile?.full_name?.split(' ')[0]} 👋
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(owner)/business')}>
            <Avatar name={profile?.full_name} size={42} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Caja del día — la métrica principal */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>CAJA DE HOY</Text>
        <Text style={styles.heroValue}>{formatPrice(revenue.today)}</Text>
        <View style={styles.heroFooter}>
          <View style={styles.heroBadge}>
            <Ionicons name="trending-up" size={12} color={Colors.bg} />
            <Text style={styles.heroBadgeText}>+15% vs ayer</Text>
          </View>
          <Text style={styles.heroSub}>· {revenue.count} turnos</Text>
        </View>
      </View>

      {/* Stats secundarias */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Esta semana</Text>
          <Text style={styles.statValue}>{formatPrice(revenue.week)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Este mes</Text>
          <Text style={styles.statValue}>{formatPrice(revenue.month)}</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.quickGrid}>
        <QuickAction
          icon="link"
          label="Mi link"
          onPress={() => router.push('/(owner)/business')}
        />
        <QuickAction
          icon="calendar-outline"
          label="Agenda"
          onPress={() => router.push('/(owner)/agenda')}
        />
        <QuickAction
          icon="cash-outline"
          label="Caja"
          onPress={() => router.push('/(owner)/cash')}
        />
        <QuickAction
          icon="people-outline"
          label="Equipo"
          onPress={() => router.push('/(owner)/business')}
        />
      </View>

      {/* Próximos turnos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos turnos</Text>
          <TouchableOpacity onPress={() => router.push('/(owner)/agenda')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {upcoming.length === 0 ? (
          <View style={styles.emptyAppts}>
            <Text style={styles.emptyApptsText}>
              No hay turnos próximos. Compartí tu link para recibir reservas.
            </Text>
          </View>
        ) : (
          upcoming.map((a) => (
            <View key={a.id} style={styles.apptCard}>
              <View style={styles.apptTime}>
                <Text style={styles.apptTimeText}>
                  {format(parseISO(a.starts_at), 'HH:mm')}
                </Text>
                <Text style={styles.apptDate}>
                  {format(parseISO(a.starts_at), 'd MMM', { locale: es })}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.apptClient}>
                  {a.client_profile?.full_name ?? a.client_name ?? 'Cliente'}
                </Text>
                <Text style={styles.apptService}>
                  {a.service?.name} · {formatPrice(a.price_cents)}
                </Text>
              </View>
              {a.payment_status === 'paid' ? (
                <View style={styles.paidTag}>
                  <Ionicons name="checkmark" size={12} color={Colors.success} />
                  <Text style={styles.paidText}>Pago</Text>
                </View>
              ) : (
                <View style={styles.pendingTag}>
                  <Text style={styles.pendingText}>Pendiente</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={22} color={Colors.yellow} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  greetingSub: { color: Colors.textSecondary, fontSize: FontSize.sm },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: Colors.yellow,
    marginHorizontal: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  heroLabel: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  heroValue: {
    color: Colors.bg,
    fontSize: 38,
    fontWeight: '900',
    marginVertical: 6,
  },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  heroBadgeText: { color: Colors.bg, fontSize: 11, fontWeight: '700' },
  heroSub: { color: Colors.bg, fontSize: 12, fontWeight: '500', opacity: 0.7 },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  statValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', marginTop: 4 },
  quickGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  quickItem: { flex: 1, alignItems: 'center' },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '500' },
  section: { marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  seeAll: { color: Colors.yellow, fontSize: FontSize.sm, fontWeight: '500' },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  apptTime: { alignItems: 'center', minWidth: 50 },
  apptTimeText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  apptDate: { color: Colors.textSecondary, fontSize: 10, marginTop: 1 },
  apptClient: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  apptService: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  paidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,211,153,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  paidText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },
  pendingTag: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  pendingText: { color: Colors.warning, fontSize: FontSize.xs, fontWeight: '600' },
  emptyAppts: {
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyApptsText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.lg,
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.yellow,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xl,
    gap: 6,
  },
  ctaText: { color: Colors.bg, fontSize: FontSize.md, fontWeight: '700' },
});
