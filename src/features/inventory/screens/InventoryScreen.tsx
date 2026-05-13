import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, TextInput, FlatList,
  StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import { Search, ScanBarcode, Plus, SlidersHorizontal } from 'lucide-react-native';
import { InventoryListScreenProps } from '../../../navigation/types';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../../types';

const C = {
  canvas:    '#F4F2EC',
  ink:       '#0E1614',
  accent:    '#0E5C3F',
  muted:     '#6B7280',
  border:    '#E5E3DC',
  inputBg:   '#FFFFFF',
  amber:     '#D97706',
  amberBg:   '#FEF3C7',
  amberText: '#92400E',
};

const AVATAR_PALETTES: Record<string, { bg: string; fg: string }> = {
  Café:     { bg: '#1C1917', fg: '#fff' },
  Bebidas:  { bg: '#7C5E3A', fg: '#fff' },
  Postres:  { bg: '#D4B896', fg: '#1C1917' },
  Insumos:  { bg: '#A8956A', fg: '#fff' },
  default:  { bg: '#3A3A3A', fg: '#fff' },
};

const StockBadge = ({ label }: { label: string }) => (
  <View style={badge.wrap}>
    <Text style={badge.text}>{label}</Text>
  </View>
);

const badge = StyleSheet.create({
  wrap: { backgroundColor: C.amberBg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: '700', color: C.amberText, letterSpacing: 0.3 },
});

const ProductRow = ({ item, onPress }: { item: Product; onPress: () => void }) => {
  const palette = AVATAR_PALETTES[item.category ?? ''] ?? AVATAR_PALETTES.default;
  const isLow = (item.controlStock ?? true) && item.stock >= 0 && item.stock <= (item.alertAt ?? 0) && (item.alertAt ?? 0) > 0;
  const isInfinite = !item.controlStock;
  const stockLabel = isInfinite ? '∞ stock' : `${item.stock} en stock`;
  const stockColor = isLow ? C.amber : C.muted;

  return (
    <TouchableOpacity style={row.wrap} onPress={onPress} activeOpacity={0.7}>
      <View style={[row.avatar, { backgroundColor: palette.bg }]}>
        <Text style={[row.avatarText, { color: palette.fg }]}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={row.info}>
        <View style={row.nameRow}>
          <Text style={row.name} numberOfLines={1}>{item.name}</Text>
          {isLow && <StockBadge label="BAJO" />}
        </View>
        <Text style={row.sku}>{item.sku ?? item.category ?? ''}</Text>
      </View>
      <View style={row.right}>
        <Text style={row.price}>${item.price.toLocaleString('es-MX')}</Text>
        <Text style={[row.stock, { color: stockColor }]}>{stockLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};

const row = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar:    { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: 16, fontWeight: '800' },
  info:      { flex: 1, gap: 3 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name:      { fontSize: 14, fontWeight: '600', color: C.ink },
  sku:       { fontSize: 12, color: C.muted },
  right:     { alignItems: 'flex-end', gap: 3 },
  price:     { fontSize: 14, fontWeight: '700', color: C.ink },
  stock:     { fontSize: 12, fontWeight: '500' },
});

export const InventoryScreen = ({ navigation }: InventoryListScreenProps) => {
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const { products, isLoading }           = useProducts();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])).sort();
    return ['Todos', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'Todos') list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, search, activeCategory]);

  const totalValue = products.reduce((s, p) => s + ((p.controlStock ?? true) && p.stock > 0 ? p.price * p.stock : 0), 0);
  const lowCount   = products.filter(p => (p.controlStock ?? true) && p.stock >= 0 && p.stock <= (p.alertAt ?? 0) && (p.alertAt ?? 0) > 0).length;
  const outCount   = products.filter(p => (p.controlStock ?? true) && p.stock === 0).length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: products.length };
    products.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1; });
    return counts;
  }, [products]);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      <View style={s.header}>
        <View>
          <Text style={s.title}>Inventario</Text>
          <Text style={s.subtitle}>{products.length} productos · {categories.length - 1} categorías</Text>
        </View>
        <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddProduct')}>
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Search size={16} color={C.muted} strokeWidth={2} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar producto o SKU..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={s.scanBtn}>
          <ScanBarcode size={18} color={C.ink} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>VALOR</Text>
          <Text style={s.statValue}>
            ${totalValue >= 1000 ? `${(totalValue / 1000).toFixed(0)}k` : totalValue}
          </Text>
          <Text style={s.statSub}>inventario</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>BAJO</Text>
          <Text style={[s.statValue, { color: lowCount > 0 ? C.amber : C.ink }]}>{lowCount}</Text>
          <Text style={s.statSub}>agotándose</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>SIN STOCK</Text>
          <Text style={[s.statValue, { color: outCount > 0 ? '#DC2626' : C.ink }]}>{outCount}</Text>
          <Text style={s.statSub}>faltantes</Text>
        </View>
      </View>

      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={s.chipsScroll} contentContainerStyle={s.chipsContent}>
        {categories.map(cat => {
          const active = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[s.chip, active && s.chipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}>
              {active && <SlidersHorizontal size={12} color="#fff" strokeWidth={2} />}
              <Text style={[s.chipText, active && s.chipTextActive]}>
                {cat}{categoryCounts[cat] != null ? ` · ${categoryCounts[cat]}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={C.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <ProductRow
              item={item}
              onPress={() => navigation.navigate('AddProduct', { productId: item.id })}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>
                {search ? `Sin resultados para "${search}"` : 'Sin productos. Toca + para agregar.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },
  title:    { fontSize: 32, fontWeight: '800', color: C.ink, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  fab: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },

  searchWrap: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.ink, padding: 0 },
  scanBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  statCard: {
    flex: 1, backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 10, gap: 2,
  },
  statLabel: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  statValue: { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  statSub:   { fontSize: 10, color: C.muted },

  chipsScroll:   { flexGrow: 0 },
  chipsContent:  { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.inputBg,
  },
  chipActive:    { backgroundColor: C.ink, borderColor: C.ink },
  chipText:      { fontSize: 13, fontWeight: '600', color: C.ink },
  chipTextActive:{ color: '#fff' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:        { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  sep:         { height: 1, backgroundColor: C.border },
  empty:       { paddingTop: 32, alignItems: 'center' },
  emptyText:   { fontSize: 14, color: C.muted, textAlign: 'center' },
});
