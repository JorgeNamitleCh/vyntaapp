import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import {
  ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown,
  Coffee, Zap, ShoppingBag, Home, Wifi, Users, Tag, Truck,
} from 'lucide-react-native';
import { ExpensesListScreenProps } from '../../../navigation/types';
import { useExpenses } from '../hooks/useExpenses';
import { Expense } from '../../../types';
import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

// ── Category config ──────────────────────────────────────────
const CATS: Record<string, { label: string; color: string; Icon: any }> = {
  insumos:   { label: 'Insumos',   color: '#0E5C3F', Icon: ShoppingBag },
  servicios: { label: 'Servicios', color: '#D97706', Icon: Zap          },
  renta:     { label: 'Renta',     color: '#0E1614', Icon: Home         },
  nomina:    { label: 'Nómina',    color: '#B45309', Icon: Users        },
  delivery:  { label: 'Delivery',  color: '#7C3AED', Icon: Truck        },
  otros:     { label: 'Otros',     color: '#9CA3AF', Icon: Tag          },
};

const catLabel  = (id: string) => CATS[id]?.label  ?? id;
const catColor  = (id: string) => CATS[id]?.color  ?? '#9CA3AF';
const CatIcon   = ({ id, ...props }: { id: string; size: number; color: string; strokeWidth: number }) => {
  const Ic = CATS[id]?.Icon ?? Tag;
  return <Ic {...props} />;
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ── Stacked bar ──────────────────────────────────────────────
const StackedBar = ({ totals, grand }: { totals: Record<string, number>; grand: number }) => {
  const colors = useThemeColors();
  const bar = useMemo(() => make_bar(colors), [colors]);
  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  if (!entries.length || grand === 0) return <View style={bar.wrap} />;
  return (
    <View style={bar.wrap}>
      {entries.map(([cat, val], i) => (
        <View
          key={cat}
          style={[
            bar.seg,
            { flex: val / grand, backgroundColor: catColor(cat) },
            i === 0 && bar.first,
            i === entries.length - 1 && bar.last,
          ]}
        />
      ))}
    </View>
  );
};
const make_bar = (colors: ThemeColors) => StyleSheet.create({
  wrap: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginVertical: 14, backgroundColor: '#E5E3DC' },
  seg: { height: 8 },
  first: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  last: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
});

// ── Category legend ──────────────────────────────────────────
const Legend = ({ totals }: { totals: Record<string, number> }) => {
  const colors = useThemeColors();
  const legend = useMemo(() => make_legend(colors), [colors]);
  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  const pairs: [string, number][][] = [];
  for (let i = 0; i < entries.length; i += 2) pairs.push(entries.slice(i, i + 2) as [string, number][]);
  return (
    <View style={legend.wrap}>
      {pairs.map((pair, i) => (
        <View key={i} style={legend.row}>
          {pair.map(([cat, val]) => (
            <View key={cat} style={legend.item}>
              <View style={[legend.dot, { backgroundColor: catColor(cat) }]} />
              <Text style={legend.cat}>{catLabel(cat)}</Text>
              <Text style={legend.val}>${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
const make_legend = (colors: ThemeColors) => StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', gap: 0 },
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cat: { fontSize: 13, color: '#0E1614', fontWeight: '500', flex: 1 },
  val: { fontSize: 13, color: '#0E1614', fontWeight: '600' },
});

// ── Expense row ──────────────────────────────────────────────
const relativeDate = (d: Date) => {
  try { return formatDistanceToNowStrict(d, { locale: es, addSuffix: false }); }
  catch { return ''; }
};

const ExpenseRow = ({ item }: { item: Expense }) => {
  const colors = useThemeColors();
  const row = useMemo(() => make_row(colors), [colors]);
  return (
    <TouchableOpacity style={row.wrap} activeOpacity={0.7}>
      <View style={row.iconWrap}>
        <CatIcon id={item.category} size={18} color={colors.muted} strokeWidth={1.75} />
      </View>
      <View style={row.info}>
        <Text style={row.name} numberOfLines={1}>{item.description}</Text>
        <View style={row.meta}>
          <View style={[row.chip, { backgroundColor: `${catColor(item.category)}18` }]}>
            <Text style={[row.chipText, { color: catColor(item.category) }]}>{catLabel(item.category)}</Text>
          </View>
          <Text style={row.date}>· hace {relativeDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={row.amount}>−${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
    </TouchableOpacity>
  );
};
const make_row = (colors: ThemeColors) => StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 14, fontWeight: '600', color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  chipText: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 12, color: colors.muted },
  amount: { fontSize: 14, fontWeight: '700', color: colors.ink },
});

// ── Screen ───────────────────────────────────────────────────
export const ExpensesScreen = ({ navigation }: ExpensesListScreenProps) => {
  const colors = useThemeColors();
  const bar = useMemo(() => make_bar(colors), [colors]);
  const legend = useMemo(() => make_legend(colors), [colors]);
  const row = useMemo(() => make_row(colors), [colors]);
  const s = useMemo(() => make_s(colors), [colors]);

  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const displayMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = `${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`;
  const monthShort = MONTHS[displayMonth.getMonth()];

  const { expenses, isLoading } = useExpenses(displayMonth);

  const { grandTotal, totals } = useMemo(() => {
    const t: Record<string, number> = {};
    let grand = 0;
    for (const e of expenses) {
      t[e.category] = (t[e.category] ?? 0) + e.amount;
      grand += e.amount;
    }
    return { grandTotal: grand, totals: t };
  }, [expenses]);

  const recent = expenses.slice(0, 10);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Gastos</Text>
          <Text style={s.subtitle}>{monthShort} · ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total</Text>
        </View>
        <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddExpense')}>
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recent}
        keyExtractor={e => e.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} colors={[colors.accent]} tintColor={colors.accent} onRefresh={() => {}} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>Sin gastos este mes</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            {/* ── Month nav ── */}
            <View style={s.monthNav}>
              <TouchableOpacity style={s.monthArrow} onPress={() => setMonthOffset(o => o - 1)}>
                <ChevronLeft size={18} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
              <View style={s.monthPill}>
                <Text style={s.monthText}>{monthLabel}</Text>
              </View>
              <TouchableOpacity
                style={s.monthArrow}
                onPress={() => setMonthOffset(o => Math.min(0, o + 1))}>
                <ChevronRight size={18} color={monthOffset === 0 ? colors.border : colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* ── Summary card ── */}
            <View style={s.summaryCard}>
              <View style={s.summaryTop}>
                <Text style={s.summaryLabel}>TOTAL GASTADO</Text>
              </View>
              <Text style={s.summaryAmount}>
                ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </Text>
              <StackedBar totals={totals} grand={grandTotal} />
              <Legend totals={totals} />
            </View>

            {/* ── Recientes header ── */}
            {recent.length > 0 && (
              <View style={s.recentHeader}>
                <Text style={s.recentLabel}>RECIENTES</Text>
              </View>
            )}
          </>
        }
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => <ExpenseRow item={item} />}
      />
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  fab: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },

  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  monthArrow: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.inputBg, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  monthPill: {
    flex: 1, backgroundColor: colors.inputBg, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 9, alignItems: 'center',
  },
  monthText: { fontSize: 14, fontWeight: '600', color: colors.ink },

  summaryCard: {
    backgroundColor: colors.inputBg, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    padding: 18, marginBottom: 24,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  summaryAmount: { fontSize: 38, fontWeight: '800', color: colors.ink, letterSpacing: -1.5, marginTop: 4 },

  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  recentLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },

  sep: { height: 1, backgroundColor: colors.border },
  emptyWrap: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.muted },
});
