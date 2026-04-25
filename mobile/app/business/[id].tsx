import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { Avatar, Tag, Button } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { CATEGORIES, formatPrice } from '@/types/database';
import type { Business, Service, Employee, Review } from '@/types/database';

export default function BusinessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [biz, setBiz] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<(Review & { client: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'services' | 'team' | 'reviews'>('services');

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    setLoading(true);
    const [b, s, e, r] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', id).single(),
      supabase.from('services').select('*').eq('business_id', id).eq('active', true),
      supabase.from('employees').select('*').eq('business_id', id).eq('active', true),
      supabase
        .from('reviews')
        .select('*, client:profiles(full_name, avatar_url)')
        .eq('business_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);
    setBiz(b.data);
    setServices(s.data ?? []);
    setEmployees(e.data ?? []);
    setReviews((r.data as any) ?? []);
    setLoading(false);
  }

  if (loading || !biz) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Colors.yellow} />
      </View>
    );
  }

  const categoryIcon = CATEGORIES.find((c) => c.id === biz.category)?.icon ?? '✂️';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Cover */}
        <View style={styles.cover}>
          <LinearGradient
            colors={['#1A1A1A', '#2A2A2A']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.coverEmoji}>{categoryIcon}</Text>
          <View style={[styles.coverNav, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TouchableOpacity style={styles.navBtn}>
                <Ionicons name="heart-outline" size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Ionicons name="share-outline" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.infoTop}>
            <Text style={styles.name}>{biz.name}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color={Colors.yellow} />
              <Text style={styles.ratingValue}>{biz.rating || '—'}</Text>
              <Text style={styles.ratingCount}>({biz.reviews_count})</Text>
            </View>
          </View>

          {biz.description && <Text style={styles.description}>{biz.description}</Text>}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={Colors.yellow} />
              <Text style={styles.metaText}>{biz.address ?? 'Sin dirección'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.success} />
              <Text style={[styles.metaText, { color: Colors.success }]}>
                Abierto hasta las 20:00
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="call" size={18} color={Colors.text} />
              <Text style={styles.actionText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.text} />
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="navigate-outline" size={18} color={Colors.text} />
              <Text style={styles.actionText}>Cómo llegar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Tag label="Servicios" active={tab === 'services'} onPress={() => setTab('services')} />
          <Tag label="Equipo" active={tab === 'team'} onPress={() => setTab('team')} />
          <Tag label="Reseñas" active={tab === 'reviews'} onPress={() => setTab('reviews')} />
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: Spacing.xxl }}>
          {tab === 'services' &&
            services.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.serviceCard}
                onPress={() =>
                  router.push({
                    pathname: '/booking/[id]',
                    params: { id: biz.id, serviceId: s.id },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  {s.description && (
                    <Text style={styles.serviceDesc}>{s.description}</Text>
                  )}
                  <View style={styles.serviceMeta}>
                    <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.serviceMetaText}>{s.duration_minutes} min</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.servicePrice}>{formatPrice(s.price_cents)}</Text>
                  <View style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Reservar</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

          {tab === 'team' && (
            <View style={styles.teamGrid}>
              {employees.map((e) => (
                <View key={e.id} style={styles.empCard}>
                  <Avatar name={e.full_name} size={70} />
                  <Text style={styles.empName}>{e.full_name}</Text>
                  <Text style={styles.empRole}>{e.role ?? 'Profesional'}</Text>
                  <View style={styles.empRating}>
                    <Ionicons name="star" size={11} color={Colors.yellow} />
                    <Text style={styles.empRatingText}>4.9</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {tab === 'reviews' && (
            <View>
              {reviews.length === 0 ? (
                <Text style={styles.emptyText}>Aún no hay reseñas para este local</Text>
              ) : (
                reviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Avatar name={r.client?.full_name} size={36} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>
                          {r.client?.full_name ?? 'Anónimo'}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {format(parseISO(r.created_at), "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Ionicons
                            key={i}
                            name={i < r.rating ? 'star' : 'star-outline'}
                            size={12}
                            color={Colors.yellow}
                          />
                        ))}
                      </View>
                    </View>
                    {r.comment && <Text style={styles.reviewText}>{r.comment}</Text>}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          title="Reservar turno"
          onPress={() =>
            router.push({ pathname: '/booking/[id]', params: { id: biz.id } })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  cover: {
    height: 220,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: { fontSize: 100, opacity: 0.4 },
  coverNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  name: { color: Colors.text, fontSize: 24, fontWeight: '800', flex: 1 },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  ratingValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  ratingCount: { color: Colors.textSecondary, fontSize: FontSize.xs },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  metaRow: { gap: Spacing.sm, marginVertical: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metaText: { color: Colors.text, fontSize: FontSize.sm },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  actionText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  serviceName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  serviceDesc: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  serviceMetaText: { color: Colors.textSecondary, fontSize: FontSize.xs },
  servicePrice: { color: Colors.yellow, fontSize: FontSize.lg, fontWeight: '800' },
  bookBtn: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: 6,
  },
  bookBtnText: { color: Colors.bg, fontSize: FontSize.xs, fontWeight: '700' },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  empCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },
  empName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  empRole: { color: Colors.textSecondary, fontSize: FontSize.xs },
  empRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  empRatingText: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '600' },
  reviewCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reviewName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  reviewDate: { color: Colors.textSecondary, fontSize: FontSize.xs },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 20 },
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
});
