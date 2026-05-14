import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, FlatList, TextInput, Image,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Search, Plus, Minus, ChevronRight, Info } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { QuoteSelectProductsScreenProps } from '../../../navigation/types';
import { useProducts } from '../../inventory/hooks/useProducts';
import { useQuoteStore } from '../../../store/quoteStore';
import { Product, QuoteItem } from '../../../types';

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductCard = ({
  product,
  qty,
  onIncrement,
  onDecrement,
}: {
  product: Product;
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_card(colors), [colors]);
  return (
    <View style={s.wrap}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={s.img} />
      ) : (
        <View style={s.imgPlaceholder}>
          <Text style={s.imgPlaceholderText}>{product.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={s.info}>
        <Text style={s.name} numberOfLines={2}>{product.name}</Text>
        {product.controlStock && (
          <View style={s.stockBadge}>
            <Text style={s.stockText}>{product.stock} disponibles</Text>
          </View>
        )}
        <Text style={s.price}>{fmt(product.price)}</Text>
      </View>
      <View style={s.controls}>
        {qty === 0 ? (
          <TouchableOpacity style={s.addBtn} onPress={onIncrement} activeOpacity={0.75}>
            <Plus size={18} color={colors.ink} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={s.counter}>
            <TouchableOpacity onPress={onDecrement} activeOpacity={0.7} hitSlop={8}>
              <Minus size={16} color={colors.ink} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={s.qty}>{qty}</Text>
            <TouchableOpacity onPress={onIncrement} activeOpacity={0.7} hitSlop={8}>
              <Plus size={16} color={colors.ink} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const make_card = (c: ThemeColors) => StyleSheet.create({
  wrap:               { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 20 },
  img:                { width: 70, height: 70, borderRadius: 10, backgroundColor: c.border },
  imgPlaceholder:     { width: 70, height: 70, borderRadius: 10, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  imgPlaceholderText: { fontSize: 24, fontWeight: '800', color: c.muted },
  info:               { flex: 1, gap: 4 },
  name:               { fontSize: 14, fontWeight: '600', color: c.ink },
  stockBadge:         { alignSelf: 'flex-start', backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  stockText:          { fontSize: 11, fontWeight: '700', color: '#15803D' },
  price:              { fontSize: 15, fontWeight: '700', color: c.ink },
  controls:           { alignItems: 'center' },
  addBtn:             { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  counter:            { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: c.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  qty:                { fontSize: 16, fontWeight: '700', color: c.ink, minWidth: 20, textAlign: 'center' },
});

export const QuoteSelectProductsScreen = ({ navigation }: QuoteSelectProductsScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const { products, isLoading } = useProducts();
  const { items, setItems } = useQuoteStore();

  const [search, setSearch] = useState('');

  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      if (item.productId) map[item.productId] = item.quantity;
    }
    return map;
  }, [items]);

  const filtered = useMemo(() =>
    products.filter(p => p.active && p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]);

  const selectedCount = items.length;
  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const increment = (product: Product) => {
    const current = quantities[product.id] ?? 0;
    const newQty = current + 1;
    const updated = items.filter(i => i.productId !== product.id);
    updated.push({
      productId:   product.id,
      productName: product.name,
      quantity:    newQty,
      unitPrice:   product.price,
      subtotal:    newQty * product.price,
      imageUrl:    product.imageUrl,
    });
    setItems(updated);
  };

  const decrement = (productId: string) => {
    const current = quantities[productId] ?? 0;
    if (current <= 1) {
      setItems(items.filter(i => i.productId !== productId));
    } else {
      const updated = items.map(i => {
        if (i.productId !== productId) return i;
        const newQty = i.quantity - 1;
        return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice };
      });
      setItems(updated);
    }
  };

  const handleNext = () => {
    if (selectedCount === 0) return;
    navigation.navigate('QuoteConfirmProducts');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Seleccionar productos</Text>
        <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
          <Search size={20} color={colors.ink} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <View style={s.infoBanner}>
        <Info size={16} color="#1D4ED8" strokeWidth={1.75} />
        <Text style={s.infoText}>
          Al crear la cotización <Text style={s.infoBold}>No se descontarán las unidades seleccionadas del inventario</Text>
        </Text>
      </View>

      <View style={s.searchWrap}>
        <Search size={16} color={colors.muted} strokeWidth={1.75} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar producto..."
          placeholderTextColor={colors.muted}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              qty={quantities[item.id] ?? 0}
              onIncrement={() => increment(item)}
              onDecrement={() => decrement(item.id)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={[s.nextBtn, selectedCount === 0 && s.nextBtnDisabled]}
        onPress={handleNext}
        disabled={selectedCount === 0}
        activeOpacity={0.85}>
        <Text style={s.nextText}>Añadir productos</Text>
        <View style={s.nextBadge}><Text style={s.nextBadgeText}>{selectedCount}</Text></View>
        <Text style={s.nextAmount}>{fmt(total)} {'>'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: c.canvas },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  title:        { flex: 1, fontSize: 18, fontWeight: '800', color: c.ink, letterSpacing: -0.3 },
  infoBanner:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, marginHorizontal: 20, marginBottom: 12, padding: 14 },
  infoText:     { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  infoBold:     { fontWeight: '800' },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 4, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput:  { flex: 1, fontSize: 14, color: c.ink, padding: 0 },
  list:         { paddingBottom: 100 },
  sep:          { height: 1, backgroundColor: c.border, marginHorizontal: 20 },
  nextBtn:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, paddingBottom: 32 },
  nextBtnDisabled: { opacity: 0.4 },
  nextText:     { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  nextBadge:    { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  nextBadgeText:{ fontSize: 12, fontWeight: '800', color: '#fff' },
  nextAmount:   { fontSize: 16, fontWeight: '700', color: '#fff' },
});
