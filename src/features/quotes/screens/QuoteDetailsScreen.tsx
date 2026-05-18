import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, ScrollView, TextInput, Modal,
  StyleSheet, SafeAreaView, StatusBar, FlatList, ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, ChevronRight, ChevronDown, X, Check, Package } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { QuoteDetailsScreenProps } from '../../../navigation/types';
import { useQuoteStore } from '../../../store/quoteStore';
import { useAuthStore } from '../../../store/authStore';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { quoteService } from '../services/quote.service';
import { QuoteExpiration } from '../../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EXPIRATIONS: { key: QuoteExpiration; label: string }[] = [
  { key: 'week',    label: '1 semana' },
  { key: '15days',  label: '15 días' },
  { key: 'month',   label: '1 mes' },
  { key: 'never',   label: 'No expira' },
];

// ─── Customer Picker ──────────────────────────────────────────────────────────

const CustomerPicker = ({
  visible, onClose, onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string, name: string) => void;
}) => {
  const colors = useThemeColors();
  const m = useMemo(() => make_picker(colors), [colors]);
  const { customers, isLoading } = useCustomers();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [customers, search]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <SafeAreaView style={m.sheetSafe}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <View style={m.header}>
              <Text style={m.title}>Seleccionar cliente</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={m.searchWrap}>
              <TextInput
                style={m.search}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar cliente..."
                placeholderTextColor={colors.muted}
              />
            </View>
            {isLoading ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={c => c.id}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={m.item}
                    onPress={() => { onSelect(item.id, item.name); onClose(); }}
                    activeOpacity={0.7}>
                    <Text style={m.itemName}>{item.name}</Text>
                    {item.phone ? <Text style={m.itemSub}>{item.phone}</Text> : null}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
                ListEmptyComponent={
                  <Text style={m.empty}>Sin clientes. Agrégalos en la sección Clientes.</Text>
                }
              />
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const make_picker = (c: ThemeColors) => StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe: { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:     { paddingHorizontal: 24, paddingBottom: 32 },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '800', color: c.ink },
  searchWrap:{ borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  search:    { fontSize: 14, color: c.ink },
  item:      { paddingVertical: 14, gap: 2 },
  itemName:  { fontSize: 15, fontWeight: '600', color: c.ink },
  itemSub:   { fontSize: 12, color: c.muted },
  empty:     { fontSize: 13, color: c.muted, textAlign: 'center', paddingVertical: 20 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const QuoteDetailsScreen = ({ navigation }: QuoteDetailsScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const {
    type, items, customerId, customerName, discountPct,
    concept, expiration,
    setCustomer, setDiscountPct, setConcept, setExpiration, clear,
  } = useQuoteStore();

  const tenantId = useAuthStore(st => st.tenant?.id);
  const user = useAuthStore(st => st.user);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [discountInput, setDiscountInput] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const discountPctNum = parseFloat(discountInput) || 0;
  const discountAmount = Math.round(subtotal * discountPctNum / 100 * 100) / 100;
  const total = subtotal - discountAmount;
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const canCreate = !!customerName.trim();

  const handleCreate = async () => {
    if (!tenantId || !canCreate || isSaving) return;
    setIsSaving(true);
    try {
      await quoteService.createQuote({
        tenantId,
        type: type ?? 'free',
        items,
        discountPct: discountPctNum,
        customerId: customerId ?? undefined,
        customerName: customerName.trim(),
        concept: concept.trim(),
        expiration,
        createdBy: user?.uid ?? '',
      });
      clear();
      navigation.navigate('Quotes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Nueva cotización</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Date */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Fecha de la cotización</Text>
          <Text style={s.dateText}>{format(new Date(), "d 'de' MMMM yyyy", { locale: es })}</Text>
        </View>

        {/* Expiration */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Tiempo de expiración de cotización</Text>
          <View style={s.expRow}>
            {EXPIRATIONS.map(e => (
              <TouchableOpacity
                key={e.key}
                style={[s.expChip, expiration === e.key && s.expChipActive]}
                onPress={() => setExpiration(e.key)}
                activeOpacity={0.75}>
                <Text style={[s.expChipText, expiration === e.key && s.expChipTextActive]}>{e.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products link (only if type = products) */}
        {type === 'products' && (
          <TouchableOpacity
            style={s.productsCard}
            onPress={() => navigation.navigate('QuoteSelectProducts')}
            activeOpacity={0.75}>
            <View style={s.productsIcon}>
              <Package size={24} color="#D97706" strokeWidth={1.75} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.productsRow}>
                <Text style={s.productsTitle}>Seleccionar más productos</Text>
                {itemCount > 0 && (
                  <View style={s.productsBadge}><Text style={s.productsBadgeText}>{itemCount}</Text></View>
                )}
              </View>
              <Text style={s.productsSub}>Al agregar productos se actualizará la cotización automáticamente</Text>
            </View>
            <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* Client */}
        <View style={s.section}>
          <Text style={[s.sectionLabel, s.required]}>Cliente</Text>
          <TouchableOpacity style={s.dropdown} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
            <Text style={[s.dropdownText, !customerName && s.dropdownPlaceholder]}>
              {customerName || 'Selecciona un cliente'}
            </Text>
            <ChevronDown size={18} color={colors.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Discount */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Descuento</Text>
          <View style={s.discountRow}>
            <View style={s.discountField}>
              <TextInput
                style={s.discountInput}
                value={discountInput}
                onChangeText={setDiscountInput}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.muted}
              />
              <Text style={s.discountSuffix}>%</Text>
            </View>
            <Text style={s.discountEq}>=</Text>
            <View style={[s.discountField, { flex: 1.5 }]}>
              <Text style={s.discountPrefix}>$</Text>
              <Text style={s.discountAmountText}>{discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* Concept */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Concepto</Text>
          <TextInput
            style={s.conceptInput}
            value={concept}
            onChangeText={setConcept}
            multiline
            placeholder="Descripción de la cotización..."
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        style={[s.createBtn, (!canCreate || isSaving) && s.createBtnDisabled]}
        onPress={handleCreate}
        disabled={!canCreate || isSaving}
        activeOpacity={0.85}>
        <View style={s.createBadge}><Text style={s.createBadgeText}>{itemCount}</Text></View>
        <Text style={s.createText}>{isSaving ? 'Creando...' : 'Crear cotización'}</Text>
        <Text style={s.createTotal}>{fmt(total)} {'>'}</Text>
      </TouchableOpacity>

      <CustomerPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(id, name) => setCustomer(id, name)}
      />
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:               { flex: 1, backgroundColor: c.canvas },
  header:             { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:            { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  title:              { flex: 1, fontSize: 18, fontWeight: '800', color: c.ink, letterSpacing: -0.3 },
  scroll:             { paddingHorizontal: 20, paddingTop: 8 },
  section:            { marginBottom: 20 },
  sectionLabel:       { fontSize: 14, fontWeight: '700', color: c.ink, marginBottom: 10 },
  required:           {},
  dateText:           { fontSize: 22, fontWeight: '700', color: c.muted },
  expRow:             { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  expChip:            { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: c.border },
  expChipActive:      { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  expChipText:        { fontSize: 13, fontWeight: '600', color: c.muted },
  expChipTextActive:  { color: '#fff', fontWeight: '700' },
  productsCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.white, borderRadius: 14, borderWidth: 1.5, borderColor: c.border, padding: 14, marginBottom: 20 },
  productsIcon:       { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  productsRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productsTitle:      { fontSize: 14, fontWeight: '700', color: c.ink },
  productsBadge:      { width: 20, height: 20, borderRadius: 10, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  productsBadgeText:  { fontSize: 11, fontWeight: '800', color: '#fff' },
  productsSub:        { fontSize: 12, color: c.muted, marginTop: 2 },
  dropdown:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 14 },
  dropdownText:       { fontSize: 15, fontWeight: '600', color: c.ink },
  dropdownPlaceholder:{ color: c.muted, fontWeight: '400' },
  discountRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  discountField:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 14 },
  discountInput:      { flex: 1, fontSize: 15, fontWeight: '600', color: c.ink, padding: 0 },
  discountSuffix:     { fontSize: 15, fontWeight: '600', color: c.muted },
  discountEq:         { fontSize: 18, fontWeight: '700', color: c.muted },
  discountPrefix:     { fontSize: 15, fontWeight: '600', color: c.muted },
  discountAmountText: { fontSize: 15, fontWeight: '600', color: c.ink },
  conceptInput:       { backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.ink, minHeight: 60 },
  createBtn:          { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.accent, paddingHorizontal: 20, paddingVertical: 18, paddingBottom: 36, gap: 10 },
  createBtnDisabled:  { opacity: 0.45 },
  createBadge:        { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  createBadgeText:    { fontSize: 13, fontWeight: '800', color: '#fff' },
  createText:         { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' },
  createTotal:        { fontSize: 17, fontWeight: '700', color: '#fff' },
});
