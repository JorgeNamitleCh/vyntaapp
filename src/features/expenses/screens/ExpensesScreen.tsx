import React, { useState } from 'react';
import {
  View, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import {
  ChevronLeft, ChevronRight, Plus, TrendingUp,
  Coffee, Zap, ShoppingBag, Home, Wifi, Users, Tag,
} from 'lucide-react-native';
import { ExpensesListScreenProps } from '../../../navigation/types';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  inputBg: '#FFFFFF',
  cardBg: '#F0EEE7',
};

// ── Categories ───────────────────────────────────────────────
const CATS: Record<string, { color: string; dot: string }> = {
  Insumos:   { color: '#0E5C3F', dot: '#0E5C3F' },
  Servicios: { color: '#D97706', dot: '#D97706' },
  Renta:     { color: '#0E1614', dot: '#0E1614' },
  Nómina:    { color: '#B45309', dot: '#B45309' },
  Otros:     { color: '#9CA3AF', dot: '#9CA3AF' },
};

// ── Mock data ────────────────────────────────────────────────
const TOTALS: Record<string, number> = {
  Insumos: 4250, Servicios: 1820, Renta: 3500, Nómina: 1120, Otros: 540,
};
const GRAND_TOTAL = Object.values(TOTALS).reduce((a, b) => a + b, 0);

type Expense = {
  id: string; name: string; category: string;
  amount: number; dateLabel: string; Icon: any;
};

const EXPENSES: Expense[] = [
  { id: '1', name: 'Café en grano · La Esperanza', category: 'Insumos',   amount: 1240, dateLabel: 'Hoy',    Icon: Coffee     },
  { id: '2', name: 'CFE bimestral',                 category: 'Servicios', amount: 820,  dateLabel: 'Ayer',   Icon: Zap        },
  { id: '3', name: 'Leche y crema · Lala',          category: 'Insumos',   amount: 410,  dateLabel: '10 may', Icon: ShoppingBag},
  { id: '4', name: 'Renta del local',               category: 'Renta',     amount: 3500, dateLabel: '5 may',  Icon: Home       },
  { id: '5', name: 'Internet · Totalplay',          category: 'Servicios', amount: 820,  dateLabel: '3 may',  Icon: Wifi       },
  { id: '6', name: 'Nómina semanal',                category: 'Nómina',    amount: 1120, dateLabel: '1 may',  Icon: Users      },
  { id: '7', name: 'Bolsas y empaques',             category: 'Otros',     amount: 540,  dateLabel: '28 abr', Icon: Tag        },
];

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ── Stacked bar ──────────────────────────────────────────────
const StackedBar = () => (
  <View style={bar.wrap}>
    {Object.entries(TOTALS).map(([cat, val], i) => (
      <View
        key={cat}
        style={[
          bar.seg,
          { flex: val / GRAND_TOTAL, backgroundColor: CATS[cat].color },
          i === 0 && bar.first,
          i === Object.keys(TOTALS).length - 1 && bar.last,
        ]}
      />
    ))}
  </View>
);
const bar = StyleSheet.create({
  wrap: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginVertical: 14 },
  seg: { height: 8 },
  first: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  last: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
});

// ── Category legend ──────────────────────────────────────────
const Legend = () => {
  const entries = Object.entries(TOTALS);
  const pairs: [string, number][][] = [];
  for (let i = 0; i < entries.length; i += 2) pairs.push(entries.slice(i, i + 2) as [string, number][]);

  return (
    <View style={legend.wrap}>
      {pairs.map((pair, i) => (
        <View key={i} style={legend.row}>
          {pair.map(([cat, val]) => (
            <View key={cat} style={legend.item}>
              <View style={[legend.dot, { backgroundColor: CATS[cat].color }]} />
              <Text style={legend.cat}>{cat}</Text>
              <Text style={legend.val}>${val.toLocaleString('es-MX')}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
const legend = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', gap: 0 },
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cat: { fontSize: 13, color: C.ink, fontWeight: '500', flex: 1 },
  val: { fontSize: 13, color: C.ink, fontWeight: '600' },
});

// ── Expense row ──────────────────────────────────────────────
const ExpenseRow = ({ item }: { item: Expense }) => {
  const cat = CATS[item.category];
  return (
    <TouchableOpacity style={row.wrap} activeOpacity={0.7}>
      <View style={row.iconWrap}>
        <item.Icon size={18} color={C.muted} strokeWidth={1.75} />
      </View>
      <View style={row.info}>
        <Text style={row.name} numberOfLines={1}>{item.name}</Text>
        <View style={row.meta}>
          <View style={[row.chip, { backgroundColor: `${cat.color}18` }]}>
            <Text style={[row.chipText, { color: cat.color }]}>{item.category}</Text>
          </View>
          <Text style={row.date}>· {item.dateLabel}</Text>
        </View>
      </View>
      <Text style={row.amount}>−${item.amount.toLocaleString('es-MX')}</Text>
    </TouchableOpacity>
  );
};
const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 14, fontWeight: '600', color: C.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  chipText: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 12, color: C.muted },
  amount: { fontSize: 14, fontWeight: '700', color: C.ink },
});

// ── Screen ───────────────────────────────────────────────────
export const ExpensesScreen = ({ navigation }: ExpensesListScreenProps) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const displayMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = `${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`;
  const monthShort = MONTHS[displayMonth.getMonth()];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Gastos</Text>
          <Text style={s.subtitle}>{monthShort} · ${GRAND_TOTAL.toLocaleString('es-MX')} total</Text>
        </View>
        <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddExpense')}>
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={EXPENSES}
        keyExtractor={e => e.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        ListHeaderComponent={
          <>
            {/* ── Month nav ── */}
            <View style={s.monthNav}>
              <TouchableOpacity style={s.monthArrow} onPress={() => setMonthOffset(o => o - 1)}>
                <ChevronLeft size={18} color={C.ink} strokeWidth={2} />
              </TouchableOpacity>
              <View style={s.monthPill}>
                <Text style={s.monthText}>{monthLabel}</Text>
              </View>
              <TouchableOpacity
                style={s.monthArrow}
                onPress={() => setMonthOffset(o => Math.min(0, o + 1))}>
                <ChevronRight size={18} color={monthOffset === 0 ? C.border : C.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* ── Summary card ── */}
            <View style={s.summaryCard}>
              <View style={s.summaryTop}>
                <Text style={s.summaryLabel}>TOTAL GASTADO</Text>
                <View style={s.trendBadge}>
                  <TrendingUp size={11} color="#DC2626" strokeWidth={2.5} />
                  <Text style={s.trendText}>+12%</Text>
                </View>
              </View>
              <Text style={s.summaryAmount}>
                ${Math.floor(GRAND_TOTAL / 1000).toLocaleString('es-MX')},
                <Text style={s.summaryAmountCents}>
                  {String(GRAND_TOTAL % 1000).padStart(3, '0')}
                </Text>
              </Text>
              <StackedBar />
              <Legend />
            </View>

            {/* ── Recientes header ── */}
            <View style={s.recentHeader}>
              <Text style={s.recentLabel}>RECIENTES</Text>
              <TouchableOpacity>
                <Text style={s.verTodo}>Ver todo</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => <ExpenseRow item={item} />}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: C.ink, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  fab: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },

  // Month nav
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  monthArrow: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.inputBg, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  monthPill: {
    flex: 1, backgroundColor: C.inputBg, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.border,
    paddingVertical: 9, alignItems: 'center',
  },
  monthText: { fontSize: 14, fontWeight: '600', color: C.ink },

  // Summary card
  summaryCard: {
    backgroundColor: C.inputBg, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    padding: 18, marginBottom: 24,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEE2E2', borderRadius: 20,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  trendText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  summaryAmount: { fontSize: 38, fontWeight: '800', color: C.ink, letterSpacing: -1.5, marginTop: 4 },
  summaryAmountCents: { fontSize: 24, fontWeight: '600', color: C.ink },

  // Recent section
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  recentLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  verTodo: { fontSize: 13, fontWeight: '600', color: C.accent },
  sep: { height: 1, backgroundColor: C.border },
});
