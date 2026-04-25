import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Avatar, BrandMark, Tag } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { CATEGORIES, formatPrice } from '@/types/database';
import type { Business, BusinessCategory, Service } from '@/types/database';

interface BusinessWithMin extends Business {
  min_price?: number;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<BusinessCategory | 'all'>('all');
  const [businesses, setBusinesses] = useState<BusinessWithMin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, [category]);

  async function loadBusinesses() {
    setLoading(true);
    let query = supabase
      .from('businesses')
      .select('*, services(price_cents)')
      .order('rating', { ascending: false })
      .limit(20);
    if (category !== 'all') query = query.eq('category', category);

    const { data, error } = await query;
    if (!error && data) {
      const enriched = (data as any[]).map((b) => ({
        ...b,
        min_price: b.services?.length
          ? Math.min(...b.services.map((s: Service) => s.price_cents))
          : undefined,
      }));
      setBusinesses(enriched);
    }
    setLoading(false);
    setRefreshing(false);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadBusinesses();
            }}
            tintColor={Colors.yellow}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar name={profile?.full_name} size={42} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.locationLabel}>Ubicación</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.yellow} />
              <Text style={styles.locationText}>Merlo, Bs. As.</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.text} />
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginTop: Spacing.lg }}>
          <BrandMark size={30} />
          <Text style={styles.greeting}>
            Hola, {profile?.full_name?.split(' ')[0] ?? 'amigo'} 👋
          </Text>
          <Text style={styles.greetingSub}>¿Qué te toca hoy?</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            placeholder="Buscar barberías, salones..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() =>
              router.push({ pathname: '/(tabs)/search', params: { q: search } })
            }
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options" size={18} color={Colors.bg} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Spacing.xxl,
              gap: Spacing.md,
            }}
          >
            <Tag
              label="Todas"
              active={category === 'all'}
              onPress={() => setCategory('all')}
            />
            {CATEGORIES.map((c) => (
              <Tag
                key={c.id}
                label={`${c.icon}  ${c.label}`}
                active={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Special offer */}
        <View style={styles.specialOffer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.offerLabel}>OFERTA EXCLUSIVA</Text>
            <Text style={styles.offerTitle}>20% OFF en tu{'\n'}primer corte</Text>
            <TouchableOpacity style={styles.offerBtn}>
              <Text style={styles.offerBtnText}>Reservar ahora</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.bg} />
            </TouchableOpacity>
          </View>
          <Text style={styles.offerEmoji}>✂️</Text>
        </View>

        {/* Nearby */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cerca tuyo</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.yellow} />
            </View>
          ) : businesses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay locales cerca todavía</Text>
              <Text style={styles.emptySubtext}>
                Pronto vas a ver barberías y salones de tu zona
              </Text>
            </View>
          ) : (
            businesses.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => router.push(`/business/${b.id}`)}
                activeOpacity={0.8}
                style={styles.businessCard}
              >
                <View style={styles.businessImg}>
                  <Text style={{ fontSize: 32 }}>
                    {CATEGORIES.find((c) => c.id === b.category)?.icon ?? '✂️'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.businessHeader}>
                    <Text style={styles.businessName}>{b.name}</Text>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={12} color={Colors.yellow} />
                      <Text style={styles.ratingText}>{b.rating || '—'}</Text>
                    </View>
                  </View>
                  <Text style={styles.businessAddress} numberOfLines={1}>
                    {b.address ?? 'Sin dirección'}
                  </Text>
                  <View style={styles.businessFooter}>
                    {b.min_price !== undefined && (
                      <Text style={styles.businessPrice}>
                        Desde {formatPrice(b.min_price)}
                      </Text>
                    )}
                    <View style={styles.openTag}>
                      <View style={styles.openDot} />
                      <Text style={styles.openText}>Abierto</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  locationLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
    borderWidth: 1,
    borderColor: Colors.bgCard,
  },
  greeting: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 2,
  },
  greetingSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  seeAll: {
    color: Colors.yellow,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  specialOffer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.yellow,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    overflow: 'hidden',
  },
  offerLabel: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.7,
    marginBottom: 4,
  },
  offerTitle: {
    color: Colors.bg,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: Spacing.md,
  },
  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 6,
  },
  offerBtnText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  offerEmoji: {
    fontSize: 80,
    opacity: 0.6,
  },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  businessImg: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  businessName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  businessAddress: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginBottom: 6,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessPrice: {
    color: Colors.yellow,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  openTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  openText: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
