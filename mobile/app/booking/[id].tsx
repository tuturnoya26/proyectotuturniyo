import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Avatar, Button } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice } from '@/types/database';
import type { Business, Service, Employee } from '@/types/database';

export default function Booking() {
  const params = useLocalSearchParams<{ id: string; serviceId?: string }>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [biz, setBiz] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [slots, setSlots] = useState<{ slot_start: string; slot_end: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Próximos 14 días
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    load();
  }, [params.id]);

  useEffect(() => {
    if (selectedService) loadSlots();
  }, [selectedService, selectedDate]);

  async function load() {
    setLoading(true);
    const [b, s, e] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', params.id).single(),
      supabase.from('services').select('*').eq('business_id', params.id).eq('active', true),
      supabase.from('employees').select('*').eq('business_id', params.id).eq('active', true),
    ]);
    setBiz(b.data);
    setServices(s.data ?? []);
    setEmployees(e.data ?? []);

    // Si vino con serviceId, preseleccionar
    if (params.serviceId && s.data) {
      const found = s.data.find((x) => x.id === params.serviceId);
      if (found) setSelectedService(found);
    }
    setLoading(false);
  }

  async function loadSlots() {
    if (!selectedService || !biz) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data } = await supabase.rpc('get_available_slots', {
      p_business_id: biz.id,
      p_service_id: selectedService.id,
      p_date: dateStr,
    });
    setSlots((data as any) ?? []);
    setLoadingSlots(false);
  }

  async function confirmBooking() {
    if (!selectedService || !selectedSlot || !biz) return;
    if (!session) {
      Alert.alert('Iniciá sesión', 'Necesitás iniciar sesión para reservar');
      return;
    }

    setConfirming(true);
    const slot = slots.find((s) => s.slot_start === selectedSlot);
    if (!slot) return;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        business_id: biz.id,
        service_id: selectedService.id,
        employee_id: selectedEmployee?.id,
        client_id: session.user.id,
        starts_at: slot.slot_start,
        ends_at: slot.slot_end,
        status: 'pending',
        payment_status: 'pending',
        price_cents: selectedService.price_cents,
      })
      .select()
      .single();

    setConfirming(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      '¡Turno reservado!',
      'Recibirás la confirmación apenas el local apruebe la reserva.',
      [
        {
          text: 'Ver mis turnos',
          onPress: () => router.replace('/(tabs)/bookings'),
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.yellow} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Reservar turno</Text>
          <Text style={styles.headerSubtitle}>{biz?.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Step 1: Service */}
        <View style={styles.step}>
          <Text style={styles.stepLabel}>1. Elegí el servicio</Text>
          {services.map((s) => {
            const isActive = selectedService?.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.optionCard, isActive && styles.optionCardActive]}
                onPress={() => setSelectedService(s)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.optionTitle, isActive && { color: Colors.bg }]}
                  >
                    {s.name}
                  </Text>
                  <Text
                    style={[
                      styles.optionSub,
                      isActive && { color: Colors.bg, opacity: 0.7 },
                    ]}
                  >
                    {s.duration_minutes} min
                  </Text>
                </View>
                <Text
                  style={[styles.optionPrice, isActive && { color: Colors.bg }]}
                >
                  {formatPrice(s.price_cents)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step 2: Employee */}
        {selectedService && employees.length > 0 && (
          <View style={styles.step}>
            <Text style={styles.stepLabel}>2. Elegí profesional (opcional)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.xxl, gap: Spacing.md }}
            >
              <TouchableOpacity
                style={[
                  styles.empCard,
                  !selectedEmployee && styles.empCardActive,
                ]}
                onPress={() => setSelectedEmployee(null)}
              >
                <View style={styles.anyAvatar}>
                  <Ionicons name="people" size={26} color={Colors.text} />
                </View>
                <Text style={styles.empCardName}>Cualquiera</Text>
              </TouchableOpacity>
              {employees.map((e) => {
                const isActive = selectedEmployee?.id === e.id;
                return (
                  <TouchableOpacity
                    key={e.id}
                    style={[styles.empCard, isActive && styles.empCardActive]}
                    onPress={() => setSelectedEmployee(e)}
                  >
                    <Avatar name={e.full_name} size={56} />
                    <Text style={styles.empCardName}>
                      {e.full_name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Step 3: Date */}
        {selectedService && (
          <View style={styles.step}>
            <Text style={styles.stepLabel}>3. Elegí día</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.xxl, gap: Spacing.sm }}
            >
              {days.map((d) => {
                const isActive = isSameDay(d, selectedDate);
                return (
                  <TouchableOpacity
                    key={d.toISOString()}
                    style={[styles.dayCard, isActive && styles.dayCardActive]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text
                      style={[styles.dayName, isActive && { color: Colors.bg }]}
                    >
                      {format(d, 'EEE', { locale: es }).toUpperCase()}
                    </Text>
                    <Text
                      style={[styles.dayNum, isActive && { color: Colors.bg }]}
                    >
                      {format(d, 'd')}
                    </Text>
                    <Text
                      style={[styles.dayMonth, isActive && { color: Colors.bg }]}
                    >
                      {format(d, 'MMM', { locale: es })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Step 4: Time slot */}
        {selectedService && (
          <View style={styles.step}>
            <Text style={styles.stepLabel}>4. Elegí horario</Text>
            <View style={styles.slotsContainer}>
              {loadingSlots ? (
                <ActivityIndicator color={Colors.yellow} />
              ) : slots.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay horarios disponibles para este día. Probá con otra fecha.
                </Text>
              ) : (
                <View style={styles.slotsGrid}>
                  {slots.map((s) => {
                    const time = format(parseISO(s.slot_start), 'HH:mm');
                    const isActive = selectedSlot === s.slot_start;
                    return (
                      <TouchableOpacity
                        key={s.slot_start}
                        style={[styles.slot, isActive && styles.slotActive]}
                        onPress={() => setSelectedSlot(s.slot_start)}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            isActive && { color: Colors.bg },
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        {selectedSlot && selectedService && (
          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryPrice}>
                {formatPrice(selectedService.price_cents)}
              </Text>
            </View>
            <Text style={styles.summaryTime}>
              {format(parseISO(selectedSlot), "EEE d 'a las' HH:mm", { locale: es })}
            </Text>
          </View>
        )}
        <Button
          title="Confirmar reserva"
          onPress={confirmBooking}
          loading={confirming}
          disabled={!selectedService || !selectedSlot}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  headerSubtitle: { color: Colors.textSecondary, fontSize: FontSize.xs },
  step: { marginTop: Spacing.xl },
  stepLabel: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  optionCardActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
  },
  optionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  optionSub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  optionPrice: { color: Colors.yellow, fontSize: FontSize.lg, fontWeight: '800' },
  empCard: {
    alignItems: 'center',
    width: 80,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  empCardActive: {
    borderColor: Colors.yellow,
    backgroundColor: 'rgba(255,214,10,0.1)',
  },
  anyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empCardName: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  dayCard: {
    width: 64,
    paddingVertical: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  dayCardActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
  },
  dayName: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
  dayNum: { color: Colors.text, fontSize: 22, fontWeight: '800', marginVertical: 2 },
  dayMonth: { color: Colors.textSecondary, fontSize: 10 },
  slotsContainer: { paddingHorizontal: Spacing.xxl },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    minWidth: 76,
    alignItems: 'center',
  },
  slotActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  slotText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: 30,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  summaryPrice: { color: Colors.yellow, fontSize: FontSize.xl, fontWeight: '800' },
  summaryTime: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
});
