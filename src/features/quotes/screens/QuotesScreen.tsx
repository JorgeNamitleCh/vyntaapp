import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, Plus, Search, X, ChevronRight, Settings2, FileText } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { QuotesScreenProps } from '../../../navigation/types';
import { useQuotes } from '../hooks/useQuotes';
import { useQuoteStore } from '../../../store/quoteStore';
import { Quote } from '../../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const STATUS_COLORS: Record<Quote['status'], { bg: string; text: string; label: string }> = {
  pending:  { bg: '#FEF3C7', text: '#D97706', label: 'Pendiente' },
  accepted: { bg: '#DCFCE7', text: '#15803D', label: 'Aceptada' },
  rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Rechazada' },
  expired:  { bg: '#F3F4F6', text: '#6B7280', label: 'Expirada' },
};

const EXPIRATION_LABELS: Record<string, string> = {
  week:    '1 semana',
  '15days':'15 días',
  month:   '1 mes',
  never:   'No expira',
};

// ─── New Quote Modal ──────────────────────────────────────────────────────────
const NewQuoteModal = ({ visible, onClose, onSelect }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'products' | 'free') => void;
}) => {
  const colors = useThemeColors();
  const m = useMemo(() => make_m(colors), [colors]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <SafeAreaView style={m.sheetSafe}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <View style={m.header}>
              <Text style={m.title}>Nueva cotización</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={m.subtitle}>Selecciona el tipo de cotización que quieres hacer.</Text>

            <TouchableOpacity style={m.option} onPress={() => onSelect('products')} activeOpacity={0.75}>
              <View style={[m.optionIcon, { backgroundColor: '#FFFBEB' }]}>
                <FileText size={28} color="#D97706" strokeWidth={1.5} />
              </View>
              <View style={m.optionText}>
                <Text style={m.optionTitle}>Cotización con productos</Text>
                <Text style={m.optionSub}>Crea una cotización seleccionando los productos de tu inventario.</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={m.divider} />

            <TouchableOpacity style={m.option} onPress={() => onSelect('free')} activeOpacity={0.75}>
              <View style={[m.optionIcon, { backgroundColor: '#F3F4F6' }]}>
                <FileText size={28} color={colors.muted} strokeWidth={1.5} />
              </View>
              <View style={m.optionText}>
                <Text style={m.optionTitle}>Cotización libre</Text>
                <Text style={m.optionSub}>Crea una cotización <Text style={{ fontWeight: '700' }}>sin seleccionar productos</Text> de tu inventario.</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const make_m = (c: ThemeColors) => StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:   { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:       { paddingHorizontal: 24, paddingBottom: 32 },
  handle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title:       { fontSize: 20, fontWeight: '800', color: c.ink },
  subtitle:    { fontSize: 13, color: c.muted, marginBottom: 20 },
  option:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  optionIcon:  { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionText:  { flex: 1, gap: 4 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: c.ink },
  optionSub:   { fontSize: 12, color: c.muted, lineHeight: 17 },
  divider:     { height: 1, backgroundColor: c.border, marginVertical: 4 },
});

// ─── Settings Modal ───────────────────────────────────────────────────────────
const SettingsModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const colors = useThemeColors();
  const m = useMemo(() => make_cfg(colors), [colors]);
  const [expiration, setExpiration] = useState<'week' | '15days' | 'month' | 'never'>('never');
  const [footer, setFooter] = useState('');

  const EXPS = [
    { key: 'week', label: '1 semana' },
    { key: '15days', label: '15 días' },
    { key: 'month', label: '1 mes' },
    { key: 'never', label: 'No expira' },
  ] as const;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <SafeAreaView style={m.sheetSafe}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <View style={m.header}>
              <Text style={m.title}>Configuraciones</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={m.sectionLabel}>Tiempo de expiración de cotización</Text>
            <View style={m.expirations}>
              {EXPS.map(e => (
                <TouchableOpacity
                  key={e.key}
                  style={[m.expChip, expiration === e.key && m.expChipActive]}
                  onPress={() => setExpiration(e.key)}
                  activeOpacity={0.75}>
                  <Text style={[m.expChipText, expiration === e.key && m.expChipTextActive]}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[m.sectionLabel, { marginTop: 20 }]}>Pie de página de la cotización</Text>
            <TextInput
              style={m.footerInput}
              value={footer}
              onChangeText={setFooter}
              multiline
              numberOfLines={4}
              placeholder="Texto que aparecerá al final de la cotización..."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />

            <TouchableOpacity style={m.applyBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={m.applyText}>Aplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.clearBtn} onPress={() => { setExpiration('never'); setFooter(''); }} activeOpacity={0.7}>
              <Text style={m.clearText}>Limpiar configuraciones</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const make_cfg = (c: ThemeColors) => StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:        { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:            { paddingHorizontal: 24, paddingBottom: 32 },
  handle:           { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:            { fontSize: 18, fontWeight: '800', color: c.ink },
  sectionLabel:     { fontSize: 13, fontWeight: '700', color: c.ink, marginBottom: 12 },
  expirations:      { flexDirection: 'row', gap: 8 },
  expChip:          { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: c.border, alignItems: 'center' },
  expChipActive:    { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  expChipText:      { fontSize: 12, fontWeight: '600', color: c.muted },
  expChipTextActive:{ color: '#fff' },
  footerInput:      { backgroundColor: c.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: c.ink, minHeight: 100 },
  applyBtn:         { backgroundColor: c.ink, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  applyText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  clearBtn:         { borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: c.border, marginTop: 10 },
  clearText:        { fontSize: 16, fontWeight: '600', color: c.ink },
});

// ─── Quote Detail Item ────────────────────────────────────────────────────────

const QuoteDetailRow = ({ quote }: { quote: Quote }) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_detail(colors), [colors]);
  const st = STATUS_COLORS[quote.status];
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={s.date}>{format(quote.createdAt, 'dd MMM yyyy', { locale: es })}</Text>
        <View style={[s.badge, { backgroundColor: st.bg }]}>
          <Text style={[s.badgeText, { color: st.text }]}>{st.label}</Text>
        </View>
      </View>
      <View style={s.row}>
        <Text style={s.total}>{fmt(quote.total)}</Text>
        <Text style={s.exp}>{EXPIRATION_LABELS[quote.expiration]}</Text>
      </View>
      <Text style={s.concept} numberOfLines={1}>{quote.concept}</Text>
    </View>
  );
};

const make_detail = (c: ThemeColors) => StyleSheet.create({
  wrap:      { paddingVertical: 12, gap: 4 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date:      { fontSize: 12, color: c.muted },
  badge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  total:     { fontSize: 16, fontWeight: '800', color: c.ink },
  exp:       { fontSize: 12, color: c.muted },
  concept:   { fontSize: 12, color: c.muted, fontStyle: 'italic' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const QuotesScreen = ({ navigation }: QuotesScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const { quotes, isLoading } = useQuotes();
  const clearQuote = useQuoteStore(st => st.clear);
  const setType = useQuoteStore(st => st.setType);

  const [search, setSearch] = useState('');
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const grouped = useMemo(() => {
    const filtered = quotes.filter(q =>
      q.customerName.toLowerCase().includes(search.toLowerCase()),
    );
    const map = new Map<string, Quote[]>();
    for (const q of filtered) {
      const arr = map.get(q.customerName) ?? [];
      arr.push(q);
      map.set(q.customerName, arr);
    }
    return Array.from(map.entries()).map(([customer, data]) => ({ customer, data }));
  }, [quotes, search]);

  const handleSelectType = (type: 'products' | 'free') => {
    clearQuote();
    setType(type);
    setNewModalVisible(false);
    if (type === 'products') {
      navigation.navigate('QuoteSelectProducts');
    } else {
      navigation.navigate('QuoteDetails');
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Cotizaciones</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => setSettingsVisible(true)} activeOpacity={0.7}>
          <Settings2 size={18} color={colors.ink} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <Search size={16} color={colors.muted} strokeWidth={1.75} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por cliente..."
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : grouped.length === 0 ? (
        <View style={s.empty}>
          <FileText size={48} color={colors.muted} strokeWidth={1} />
          <Text style={s.emptyTitle}>{search ? 'Sin resultados' : 'Sin cotizaciones aún'}</Text>
          <Text style={s.emptySub}>Toca + para crear una cotización</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={item => item.customer}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.customerCard}>
              <View style={s.customerHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{initials(item.customer)}</Text>
                </View>
                <View style={s.customerInfo}>
                  <Text style={s.customerName}>{item.customer}</Text>
                  <Text style={s.quoteCount}>{item.data.length} Cotización{item.data.length !== 1 ? 'es' : ''}</Text>
                </View>
                <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
              </View>
              {item.data.map((q, i) => (
                <View key={q.id}>
                  {i > 0 && <View style={s.sep} />}
                  <QuoteDetailRow quote={q} />
                </View>
              ))}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setNewModalVisible(true)} activeOpacity={0.85}>
        <Plus size={22} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <NewQuoteModal
        visible={newModalVisible}
        onClose={() => setNewModalVisible(false)}
        onSelect={handleSelectType}
      />
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: c.canvas },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  title:        { flex: 1, fontSize: 20, fontWeight: '800', color: c.ink, letterSpacing: -0.5 },
  iconBtn:      { width: 36, height: 36, borderRadius: 12, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  searchRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  searchWrap:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput:  { flex: 1, fontSize: 14, color: c.ink, padding: 0 },
  list:         { paddingHorizontal: 20, paddingBottom: 100 },
  customerCard: { backgroundColor: c.white, borderRadius: 16, borderWidth: 1.5, borderColor: c.border, overflow: 'hidden', paddingHorizontal: 16 },
  customerHeader:{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  avatar:       { width: 38, height: 38, borderRadius: 19, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 13, fontWeight: '800' },
  customerInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 15, fontWeight: '700', color: c.ink },
  quoteCount:   { fontSize: 12, color: c.muted },
  sep:          { height: 1, backgroundColor: c.border },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: c.ink },
  emptySub:     { fontSize: 13, color: c.muted },
  fab:          { position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
});
