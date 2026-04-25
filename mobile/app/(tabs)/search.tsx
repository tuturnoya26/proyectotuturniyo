import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { CATEGORIES, formatPrice } from '@/types/database';
import type { Business } from '@/types/database';

export default function Search() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [search, setSearch] = useState(params.q ?? '');
  const [results, setResults] = useState<Business[]>([]);

  useEffect(() => {
    if (search.length < 2) return;
    const timer = setTimeout(() => doSearch(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function doSearch() {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .ilike('name', `%${search}%`)
      .limit(20);
    setResults(data ?? []);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={48} color={Colors.textTertiary} />
        <Text style={styles.mapText}>Mapa interactivo</Text>
        <Text style={styles.mapSubtext}>
          (Próximamente: integración con Google Maps)
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xxl }}>
        <Text style={styles.resultsTitle}>
          {results.length} resultado{results.length !== 1 ? 's' : ''}
        </Text>
        {results.map((b) => (
          <TouchableOpacity
            key={b.id}
            onPress={() => router.push(`/business/${b.id}`)}
            style={styles.resultCard}
            activeOpacity={0.7}
          >
            <View style={styles.resultIcon}>
              <Text style={{ fontSize: 24 }}>
                {CATEGORIES.find((c) => c.id === b.category)?.icon ?? '✂️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{b.name}</Text>
              <Text style={styles.resultAddress}>{b.address}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="star" size={12} color={Colors.yellow} />
                <Text style={styles.resultRating}>
                  {b.rating || '—'} · {b.reviews_count} reseñas
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  mapPlaceholder: {
    height: 200,
    margin: Spacing.xxl,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  mapText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  mapSubtext: { color: Colors.textSecondary, fontSize: FontSize.xs },
  resultsTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  resultAddress: { color: Colors.textSecondary, fontSize: FontSize.xs, marginVertical: 2 },
  resultRating: { color: Colors.textSecondary, fontSize: FontSize.xs },
});
