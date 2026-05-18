import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, Trash2, Minus, Plus } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { QuoteConfirmProductsScreenProps } from '../../../navigation/types';
import { useQuoteStore } from '../../../store/quoteStore';

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const QuoteConfirmProductsScreen = ({ navigation }: QuoteConfirmProductsScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const { items, updateItem, removeItem } = useQuoteStore();

  const total = items.reduce((acc, i) => acc + i.subtotal, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleQtyChange = (idx: number, newQty: number) => {
    const item = items[idx];
    if (newQty <= 0) { removeItem(idx); return; }
    updateItem(item.productId, idx, newQty, item.unitPrice);
  };

  const handlePriceChange = (idx: number, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    const item = items[idx];
    updateItem(item.productId, idx, item.quantity, price);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Confirma precios y cantidades</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item, index }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={s.img} />
              ) : null}
              <Text style={s.name} numberOfLines={2}>{item.productName}</Text>
              <TouchableOpacity onPress={() => removeItem(index)} hitSlop={8} activeOpacity={0.7}>
                <View style={s.deleteBtn}>
                  <Trash2 size={16} color="#DC2626" strokeWidth={1.75} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={s.fields}>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Cantidad *</Text>
                <View style={s.counter}>
                  <TouchableOpacity onPress={() => handleQtyChange(index, item.quantity - 1)} hitSlop={8} activeOpacity={0.7}>
                    <Minus size={18} color={colors.ink} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={s.qty}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleQtyChange(index, item.quantity + 1)} hitSlop={8} activeOpacity={0.7}>
                    <Plus size={18} color={colors.ink} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Precio unitario *</Text>
                <View style={s.priceInput}>
                  <Text style={s.prefix}>$</Text>
                  <TextInput
                    style={s.priceField}
                    value={item.unitPrice.toString()}
                    onChangeText={val => handlePriceChange(index, val)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>
            </View>
            <Text style={s.subtotal}>Precio por {item.quantity} unidad{item.quantity !== 1 ? 'es' : ''}: {fmt(item.subtotal)}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={[s.confirmBtn, items.length === 0 && { opacity: 0.4 }]}
        onPress={() => items.length > 0 && navigation.navigate('QuoteDetails')}
        disabled={items.length === 0}
        activeOpacity={0.85}>
        <View style={s.confirmBadge}><Text style={s.confirmBadgeText}>{count}</Text></View>
        <Text style={s.confirmText}>Confirmar</Text>
        <Text style={s.confirmTotal}>{fmt(total)} {'>'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:              { flex: 1, backgroundColor: c.canvas },
  header:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  title:             { flex: 1, fontSize: 18, fontWeight: '800', color: c.ink, letterSpacing: -0.3 },
  list:              { paddingHorizontal: 20, paddingBottom: 120 },
  sep:               { height: 16 },
  card:              { backgroundColor: c.white, borderRadius: 16, borderWidth: 1.5, borderColor: c.border, padding: 16, gap: 12 },
  cardTop:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  img:               { width: 44, height: 44, borderRadius: 8 },
  name:              { flex: 1, fontSize: 15, fontWeight: '700', color: c.ink },
  deleteBtn:         { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  fields:            { flexDirection: 'row', gap: 12 },
  field:             { flex: 1, gap: 6 },
  fieldLabel:        { fontSize: 12, fontWeight: '700', color: c.ink },
  counter:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  qty:               { fontSize: 17, fontWeight: '700', color: c.ink },
  priceInput:        { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  prefix:            { fontSize: 15, fontWeight: '700', color: c.ink },
  priceField:        { flex: 1, fontSize: 15, fontWeight: '700', color: c.ink, padding: 0 },
  subtotal:          { fontSize: 13, color: c.muted },
  confirmBtn:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, paddingBottom: 32, gap: 10 },
  confirmBadge:      { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  confirmBadgeText:  { fontSize: 13, fontWeight: '800', color: '#fff' },
  confirmText:       { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' },
  confirmTotal:      { fontSize: 17, fontWeight: '700', color: '#fff' },
});
