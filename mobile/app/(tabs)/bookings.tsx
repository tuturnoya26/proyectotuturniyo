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
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Tag } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice } from '@/types/database';
import type { Appointment, Business, Service } from '@/types/database';

type Tab = 'upcoming' | 'past' | 'cancelled';
type AppointmentDetail = Appointment & {
  business: Business;
  service: Service;
};

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) load();
  }, [session, tab]);

  async function load() {
    if (!session) return;
    setLoading(true);
    const now = new Date().toISOString();
    let query = supabase
      .from('appointments')
      .select('*, business:businesses(*), service:services(*)')
      .eq('client_id', session.user.id);

    if (tab === 'upcoming') query = query.gte('starts_at', now).neq('status', 'cancelled');
    if (tab === 'past') query = query.lt('starts_at', now).neq('status', 'cancelled');
    if (tab === 'cancelled') query = query.eq('status', 'cancelled');

    const { data } = await query.order('starts_at', { ascending: tab !== 'past' });
    setAppointments((data as any) ?? []);
    setLoading(false);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis turnos</Text>
      </View>

      <View style={styles.tabs}>
        <Tag label="Próximos" active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Tag label="Pasados" active={tab === 'past'} onPress={() => setTab('past')} />
        <Tag label="Cancelados" active={tab === 'cancelled'} onPress={() => setTab('cancelled')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.xxl, paddingBottom: 80 }}>
        {loading ? (
          <ActivityIndicator color={Colors.yellow} style={{ marginTop: 40 }} />
        ) : appointments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={56} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sin turnos por acá</Text>
            <Text style={styles.emptyDesc}>
              {tab === 'upcoming'
                ? 'Reservá tu primer turno desde el inicio'
                : 'Cuando tengas turnos van a aparecer acá'}
            </Text>
          </View>
        ) : (
          appointments.map((a) => (
            <View key={a.id} style={styles.card}>
              <View style={[styles.dateBox, { backgroundColor: getStatusColor(a.status) }]}>
                <Text style={styles.dateMonth}>
                  {format(parseISO(a.starts_at), 'MMM', { locale: es }).toUpperCase()}
                </Text>
                <Text style={styles.dateDay}>{format(parseISO(a.starts_at), 'd')}</Text>
                <Text style={styles.dateTime}>
                  {format(parseISO(a.starts_at), 'HH:mm')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{a.service?.name}</Text>
                <Text style={styles.businessInfo}>
                  {a.business?.name}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(a.status) },
                      ]}
                    />
                    <Text style={styles.statusText}>{getStatusLabel(a.status)}</Text>
                  </View>
                  <Text style={styles.price}>{formatPrice(a.price_cents)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getStatusColor(s: string) {
  if (s === 'confirmed') return Colors.success;
  if (s === 'pending') return Colors.warning;
  if (s === 'cancelled') return Colors.danger;
  if (s === 'completed') return Colors.info;
  return Colors.textTertiary;
}

function getStatusLabel(s: string) {
  return {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
    no_show: 'No asistió',
  }[s] ?? s;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  dateBox: {
    width: 60,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { color: Colors.bg, fontSize: 9, fontWeight: '700' },
  dateDay: { color: Colors.bg, fontSize: 22, fontWeight: '800', lineHeight: 26 },
  dateTime: { color: Colors.bg, fontSize: 11, fontWeight: '600' },
  serviceName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  businessInfo: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '500' },
  price: { color: Colors.yellow, fontSize: FontSize.md, fontWeight: '700' },
});
