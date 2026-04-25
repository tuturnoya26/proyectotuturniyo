import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Tag } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice } from '@/types/database';

type Period = 'day' | 'week' | 'month' | 'year';

export default function Cash() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [revenue, setRevenue] = useState({ total_cents: 0, appointments_count: 0 });

  useEffect(() => {
    load();
  }, [period, profile]);

  async function load() {
    if (!profile) return;
    const { data: biz } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', profile.id)
      .maybeSingle();
    if (!biz) return;
    const { data } = await supabase.rpc('get_revenue', {
      p_business_id: biz.id,
      p_period: period,
    });
    if (data?.[0]) {
      setRevenue({
        total_cents: Number(data[0].total_cents),
        appointments_count: Number(data[0].appointments_count),
      });
    }
  }

  const ticketProm =
    revenue.appointments_count > 0
      ? Math.round(revenue.total_cents / revenue.appointments_count)
      : 0;
  const commission = Math.round(revenue.total_cents * 0.05);
  const net = revenue.total_cents - commission;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Caja</Text>
      </View>

      <View style={styles.tabs}>
        <Tag label="Hoy" active={period === 'day'} onPress={() => setPeriod('day')} />
        <Tag label="Semana" active={period === 'week'} onPress={() => setPeriod('week')} />
        <Tag label="Mes" active={period === 'month'} onPress={() => setPeriod('month')} />
        <Tag label="Año" active={period === 'year'} onPress={() => setPeriod('year')} />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>INGRESOS</Text>
        <Text style={styles.heroValue}>{formatPrice(revenue.total_cents)}</Text>
        <View style={styles.trend}>
          <Ionicons name="trending-up" size={14} color={Colors.success} />
          <Text style={styles.trendText}>+12% vs período anterior</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="calendar-outline" size={20} color={Colors.yellow} />
          <Text style={styles.statValue}>{revenue.appointments_count}</Text>
          <Text style={styles.statLabel}>Turnos</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="receipt-outline" size={20} color={Colors.yellow} />
          <Text style={styles.statValue}>{formatPrice(ticketProm)}</Text>
          <Text style={styles.statLabel}>Ticket prom.</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="cash-outline" size={20} color={Colors.yellow} />
          <Text style={styles.statValue}>{formatPrice(commission)}</Text>
          <Text style={styles.statLabel}>Comisiones</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="wallet-outline" size={20} color={Colors.success} />
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {formatPrice(net)}
          </Text>
          <Text style={styles.statLabel}>Tu neto</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={18} color={Colors.yellow} />
        <Text style={styles.infoText}>
          Los pagos confirmados van directo a tu cuenta de Mercado Pago. Acá solo
          se registran los turnos pagos.
        </Text>
      </View>
    </ScrollView>
  );
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
  heroCard: {
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heroValue: {
    color: Colors.yellow,
    fontSize: 38,
    fontWeight: '900',
    marginVertical: 6,
  },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  statBox: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  statValue: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,214,10,0.1)',
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
