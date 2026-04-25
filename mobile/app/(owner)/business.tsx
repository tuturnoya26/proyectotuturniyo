import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Tag, Button } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice, DAYS_OF_WEEK_LONG } from '@/types/database';
import type { Business, Service, Employee, BusinessHours } from '@/types/database';

type Section = 'services' | 'team' | 'hours' | 'link';

export default function BusinessManage() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [section, setSection] = useState<Section>('services');
  const [biz, setBiz] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hours, setHours] = useState<BusinessHours[]>([]);

  useEffect(() => {
    load();
  }, [profile]);

  async function load() {
    if (!profile) return;
    const { data: b } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', profile.id)
      .maybeSingle();
    if (!b) return;
    setBiz(b);
    const [s, e, h] = await Promise.all([
      supabase.from('services').select('*').eq('business_id', b.id),
      supabase.from('employees').select('*').eq('business_id', b.id),
      supabase.from('business_hours').select('*').eq('business_id', b.id),
    ]);
    setServices(s.data ?? []);
    setEmployees(e.data ?? []);
    setHours(h.data ?? []);
  }

  async function shareLink() {
    if (!biz) return;
    const url = `https://tuturnoya.app/r/${biz.slug}`;
    await Share.share({
      message: `Reservá tu turno en ${biz.name}: ${url}`,
      url,
    });
  }

  if (!biz) {
    return (
      <View style={[styles.container, styles.emptyContainer, { paddingTop: insets.top }]}>
        <Ionicons name="storefront-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>Configurá tu local</Text>
        <Text style={styles.emptyDesc}>
          Cargá los datos de tu barbería para empezar a recibir reservas
        </Text>
        <CreateBusinessForm onCreated={load} />
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
          <Text style={styles.subtitle}>Mi local</Text>
          <Text style={styles.title}>{biz.name}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        <Tag label="Servicios" active={section === 'services'} onPress={() => setSection('services')} />
        <Tag label="Equipo" active={section === 'team'} onPress={() => setSection('team')} />
        <Tag label="Horarios" active={section === 'hours'} onPress={() => setSection('hours')} />
        <Tag label="Mi link" active={section === 'link'} onPress={() => setSection('link')} />
      </ScrollView>

      {section === 'services' && (
        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{services.length} servicios</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={16} color={Colors.bg} />
              <Text style={styles.addBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>
          {services.length === 0 ? (
            <Text style={styles.emptyText}>
              Aún no cargaste servicios. Tocá "Agregar" para crear el primero.
            </Text>
          ) : (
            services.map((s) => (
              <View key={s.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{s.name}</Text>
                  <Text style={styles.itemSub}>{s.duration_minutes} min</Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(s.price_cents)}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </View>
            ))
          )}
        </View>
      )}

      {section === 'team' && (
        <View style={styles.body}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{employees.length} en el equipo</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={16} color={Colors.bg} />
              <Text style={styles.addBtnText}>Agregar</Text>
            </TouchableOpacity>
          </View>
          {employees.length === 0 ? (
            <Text style={styles.emptyText}>
              Cargá tu equipo para asignar turnos a cada profesional.
            </Text>
          ) : (
            employees.map((e) => (
              <View key={e.id} style={styles.itemCard}>
                <View style={styles.empAvatar}>
                  <Text style={styles.empAvatarText}>
                    {e.full_name?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{e.full_name}</Text>
                  <Text style={styles.itemSub}>{e.role ?? 'Profesional'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {section === 'hours' && (
        <View style={styles.body}>
          <Text style={[styles.sectionTitle, { marginBottom: Spacing.md }]}>
            Horarios de atención
          </Text>
          {DAYS_OF_WEEK_LONG.map((dayName, i) => {
            const h = hours.find((x) => x.day_of_week === i);
            return (
              <View key={i} style={styles.hourRow}>
                <Text style={styles.hourDay}>{dayName}</Text>
                {h && !h.closed && h.open_time ? (
                  <Text style={styles.hourTime}>
                    {h.open_time.slice(0, 5)} — {h.close_time?.slice(0, 5)}
                  </Text>
                ) : (
                  <Text style={[styles.hourTime, { color: Colors.danger }]}>Cerrado</Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {section === 'link' && (
        <View style={styles.body}>
          <View style={styles.linkCard}>
            <Text style={styles.linkLabel}>TU LINK PÚBLICO</Text>
            <Text style={styles.linkUrl}>tuturnoya.app/r/{biz.slug}</Text>
            <Button title="Compartir link" onPress={shareLink} />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Compartir en</Text>
          <View style={styles.shareGrid}>
            <ShareButton icon="logo-whatsapp" label="WhatsApp" onPress={shareLink} />
            <ShareButton icon="logo-instagram" label="Instagram" onPress={shareLink} />
            <ShareButton icon="logo-tiktok" label="TikTok" onPress={shareLink} />
            <ShareButton icon="mail-outline" label="Email" onPress={shareLink} />
          </View>

          <View style={styles.mpCard}>
            <View style={styles.mpHeader}>
              <View style={styles.mpLogo}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>MP</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mpTitle}>Mercado Pago</Text>
                <Text style={styles.mpSub}>
                  {biz.mp_access_token ? 'Conectado ✓' : 'No conectado'}
                </Text>
              </View>
            </View>
            <Button
              title={biz.mp_access_token ? 'Reconectar' : 'Conectar mi cuenta'}
              variant="secondary"
              onPress={() => Alert.alert('Mercado Pago', 'Configurá MP en docs/MERCADO_PAGO.md')}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function ShareButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.shareBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={Colors.yellow} />
      <Text style={styles.shareBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function CreateBusinessForm({ onCreated }: { onCreated: () => void }) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!profile || !name) return;
    setLoading(true);
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const { error } = await supabase.from('businesses').insert({
      owner_id: profile.id,
      name,
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
      address,
      city,
      category: 'barberia',
    });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else onCreated();
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formLabel}>Nombre del local</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="El Bigote Rojo"
        placeholderTextColor={Colors.textTertiary}
      />
      <Text style={styles.formLabel}>Dirección</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Av. Rivadavia 2340"
        placeholderTextColor={Colors.textTertiary}
      />
      <Text style={styles.formLabel}>Ciudad</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Buenos Aires"
        placeholderTextColor={Colors.textTertiary}
      />
      <Button title="Crear mi local" onPress={create} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  body: { paddingHorizontal: Spacing.xxl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.yellow,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addBtnText: { color: Colors.bg, fontSize: FontSize.xs, fontWeight: '700' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  itemTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  itemSub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  itemPrice: { color: Colors.yellow, fontSize: FontSize.md, fontWeight: '700' },
  empAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarText: { color: Colors.bg, fontSize: FontSize.md, fontWeight: '800' },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  hourDay: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  hourTime: { color: Colors.textSecondary, fontSize: FontSize.sm },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: 30,
  },
  linkCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.yellow,
    gap: Spacing.md,
  },
  linkLabel: { color: Colors.yellow, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  linkUrl: { color: Colors.text, fontSize: FontSize.lg, fontFamily: 'Courier', fontWeight: '700' },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexBasis: '47%',
    gap: Spacing.sm,
  },
  shareBtnText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  mpCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  mpHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  mpLogo: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#00B1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mpTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  mpSub: { color: Colors.textSecondary, fontSize: FontSize.xs },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', marginTop: Spacing.lg },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.xl,
  },
  form: { width: '100%', maxWidth: 400, gap: Spacing.sm },
  formLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
});
