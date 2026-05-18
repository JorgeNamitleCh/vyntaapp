import React, { useState, useMemo, useRef } from 'react';
import {
  View, TouchableOpacity, FlatList, Image,
  StyleSheet, SafeAreaView, StatusBar,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Search, ScanLine, ChevronRight, X } from 'lucide-react-native';
import { POSScreenProps } from '../../../navigation/types';
import { useCartStore } from '../../../store/cartStore';
import { useProducts } from '../../inventory/hooks/useProducts';
import { Product } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

// POS uses a slightly lighter background than the rest of the app

const CATEGORY_COLORS: Record<string, string> = {
  Café:      '#3B1A0A',
  Bebidas:   '#7C5E3A',
  Postres:   '#D4A96A',
  Insumos:   '#A8956A',
  Pan:       '#C4955A',
  Servicios: '#4A6741',
};
const DEFAULT_COLOR = '#3A3A3A';

const colorForProduct = (p: Product): string =>
  CATEGORY_COLORS[p.category ?? ''] ?? DEFAULT_COLOR;

export const POSScreen = ({ navigation }: POSScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [activeCat,   setActiveCat]   = useState('Todo');
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [search,      setSearch]      = useState('');
  const searchRef = useRef<TextInput>(null);

  const { items, addItem } = useCartStore();
  const { products, isLoading } = useProducts();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])).sort();
    return ['Todo', ...cats];
  }, [products]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };
  const closeSearch = () => { setSearchOpen(false); setSearch(''); };

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalAmt = items.reduce((s, i) => s + i.price * i.qty, 0);

  const filtered = useMemo(() => {
    let list = activeCat === 'Todo' ? products : products.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCat, search]);

  const getQty = (id: string) => items.find(i => i.id === id)?.qty ?? 0;

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const qty   = getQty(item.id);
    const color = colorForProduct(item);
    return (
      <View style={[s.productCard, index % 2 === 0 ? s.cardLeft : s.cardRight]}>
        <View style={[s.productImage, { backgroundColor: color }]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={s.productPhoto} />
          ) : (
            <Text style={s.productInitial}>{item.name.charAt(0).toUpperCase()}</Text>
          )}
          {qty > 0 && (
            <View style={s.qtyBadge}>
              <Text style={s.qtyBadgeText}>{qty}</Text>
            </View>
          )}
        </View>
        <View style={s.productInfo}>
          <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
          <View style={s.productFooter}>
            <Text style={s.productPrice}>${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => addItem({ id: item.id, name: item.name, price: item.price, color, imageUrl: item.imageUrl })}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {searchOpen ? (
        <View style={s.searchHeader}>
          <View style={s.searchBox}>
            <Search size={16} color={colors.muted} strokeWidth={1.75} />
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar producto..."
              placeholderTextColor={colors.muted}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={s.headerBtn} onPress={closeSearch} activeOpacity={0.7}>
            <X size={18} color={colors.ink} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.header}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
          </TouchableOpacity>
          <View style={s.headerTitle}>
            <Text style={s.headerSub}>NUEVA VENTA</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.headerBtn} activeOpacity={0.7}>
              <ScanLine size={20} color={colors.ink} strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity style={s.headerBtn} onPress={openSearch} activeOpacity={0.7}>
              <Search size={20} color={colors.ink} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Category chips */}
      <View style={s.catRow}>
        {categories.map(cat => {
          const active = activeCat === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, active && s.catChipActive]}
              onPress={() => setActiveCat(cat)}
              activeOpacity={0.75}>
              <Text style={[s.catChipText, active && s.catChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.loadingWrap}>
          <Text style={s.emptyText}>
            {products.length === 0
              ? 'Sin productos en inventario.\nAgrega productos primero.'
              : `Sin resultados para "${search}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          numColumns={2}
          contentContainerStyle={[s.grid, totalQty > 0 && { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
          renderItem={renderProduct}
        />
      )}

      {totalQty > 0 && (
        <TouchableOpacity
          style={s.cartBar}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.92}>
          <View style={s.cartBadge}>
            <Text style={s.cartBadgeText}>{totalQty}</Text>
          </View>
          <View style={s.cartMid}>
            <Text style={s.cartTitle}>VER CARRITO</Text>
            <Text style={s.cartSub}>{totalQty} producto{totalQty !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={s.cartTotal}>${totalAmt.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <ChevronRight size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const CARD_GAP  = 10;
const CARD_H_PAD = 14;

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 6, paddingBottom: 10, gap: 8,
  },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 6, paddingBottom: 10, gap: 8,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 12, height: 40,
  },
  searchInput:  { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle:   { flex: 1, paddingLeft: 4 },
  headerSub:     { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 6 },

  catRow: {
    flexDirection: 'row', paddingHorizontal: 12,
    marginTop: 10, marginBottom: 14, gap: 7, flexWrap: 'wrap',
  },
  catChip: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: colors.inputBg,
    borderWidth: 1.5, borderColor: colors.border,
  },
  catChipActive:    { backgroundColor: colors.hero, borderColor: colors.hero },
  catChipText:      { fontSize: 13, fontWeight: '600', color: colors.muted },
  catChipTextActive:{ color: '#fff' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:   { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },

  grid: { paddingHorizontal: CARD_H_PAD, paddingBottom: 24 },

  productCard: {
    flex: 1, backgroundColor: colors.inputBg, borderRadius: 14,
    overflow: 'hidden', marginBottom: CARD_GAP,
    borderWidth: 1, borderColor: colors.border,
  },
  cardLeft:  { marginRight: CARD_GAP / 2 },
  cardRight: { marginLeft: CARD_GAP / 2 },

  productImage: { height: 110, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  productPhoto: { width: '100%', height: 110, resizeMode: 'cover' },
  productInitial: {
    fontSize: 44, fontWeight: '800',
    color: 'rgba(255,255,255,0.35)', letterSpacing: -1,
  },
  qtyBadge: {
    position: 'absolute', top: 8, right: 8,
    minWidth: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  qtyBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  productInfo:   { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10, gap: 4 },
  productName:   { fontSize: 13, fontWeight: '600', color: colors.ink },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice:  { fontSize: 14, fontWeight: '700', color: colors.ink },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 20, color: '#fff', lineHeight: 26, fontWeight: '400' },

  cartBar: {
    position: 'absolute', bottom: 16, left: 14, right: 14,
    backgroundColor: colors.accent, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 10,
  },
  cartBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  cartMid:       { flex: 1, gap: 1 },
  cartTitle:     { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  cartSub:       { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  cartTotal:     { fontSize: 17, fontWeight: '800', color: '#fff' },
});
