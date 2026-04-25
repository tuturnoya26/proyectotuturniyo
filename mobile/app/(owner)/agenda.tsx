import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice } from '@/types/database';

export default function Agenda() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    load();
  }, [selectedDate]);

  async function load() {
    if (!profile) return;
    const { data: biz } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', profile.id)
      .maybeSingle();
    if (!biz) return;

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('appointments')
      .select('*, service:services(name, duration_minutes), client_profile:profiles(full_name)')
      .eq('business_id', biz.id)
      .gte('starts_at', start.toISOString())
      .lte('starts_at', end.toISOString())
      .order('starts_at');
    setAppointments(data ?? []);
  }

  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM a 8 PM

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <TouchableOpacity style={styles.blockBtn}>
          <Ionicons name="add" size={20} color={Colors.bg} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysRow}
      >
        {days.map((d) => {
          const isSelected = isSameDay(d, selectedDate);
          return (
            <TouchableOpacity
              key={d.toISOString()}
              onPress={() => setSelectedDate(d)}
              style={[styles.dayCell, isSelected && styles.dayCellActive]}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                {format(d, 'EEE', { locale: es }).toUpperCase()}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>
                {format(d, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xxl }}>
        {hours.map((h) => {
          const slotAppts = appointments.filter(
            (a) => parseISO(a.starts_at).getHours() === h
          );
          return (
            <View key={h} style={styles.hourRow}>
              <Text style={styles.hourLabel}>
                {h.toString().padStart(2, '0')}:00
              </Text>
              <View style={styles.hourContent}>
                {slotAppts.length === 0 ? (
                  <View style={styles.emptySlot} />
                ) : (
                  slotAppts.map((a) => (
                    <View key={a.id} style={styles.apptBlock}>
                      <Text style={styles.apptTitle}>
                        {a.client_profile?.full_name ?? a.client_name}
                      </Text>
                      <Text style={styles.apptDetail}>
                        {format(parseISO(a.starts_at), 'HH:mm')} ·{' '}
                        {a.service?.name} · {formatPrice(a.price_cents)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  blockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dayCell: {
    width: 56,
    paddingVertical: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  dayCellActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  dayName: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
  dayNameActive: { color: Colors.bg },
  dayNum: { color: Colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  dayNumActive: { color: Colors.bg },
  hourRow: { flexDirection: 'row', minHeight: 60, gap: Spacing.md },
  hourLabel: {
    width: 44,
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    paddingTop: 6,
  },
  hourContent: { flex: 1, gap: 4 },
  emptySlot: { flex: 1, borderTopWidth: 1, borderTopColor: Colors.border, opacity: 0.3 },
  apptBlock: {
    backgroundColor: Colors.bgCard,
    borderLeftWidth: 3,
    borderLeftColor: Colors.yellow,
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  apptTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  apptDetail: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
});
