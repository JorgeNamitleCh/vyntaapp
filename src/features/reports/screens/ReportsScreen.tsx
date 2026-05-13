import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { Text } from '../../../components/Text';
import { Download, TrendingUp, TrendingDown } from 'lucide-react-native';
import Svg, {
  Path, Circle, Defs, LinearGradient as SvgGradient, Stop,
} from 'react-native-svg';

const C = {
  canvas: '#F4F2EC',
  ink:    '#0E1614',
  accent: '#0E5C3F',
  muted:  '#6B7280',
  border: '#E5E3DC',
  white:  '#FFFFFF',
  red:    '#DC2626',
  cardBg: '#F7F5EE',
};

const SCREEN_W = Dimensions.get('window').width;
const H_PAD    = 20;
const CARD_PAD = 16;
const CHART_W  = SCREEN_W - H_PAD * 2 - CARD_PAD * 2;
const CHART_H  = 130;
const V_PAD    = 12;

// ── Chart data ────────────────────────────────────────────────
const DAYS   = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const VALUES = [3200, 4100, 4000, 5200, 6100, 8100, 5420];
const ACTIVE_DAY = 5; // S (Sábado)

const toPoints = () => {
  const max = Math.max(...VALUES);
  const min = Math.min(...VALUES);
  const range = max - min || 1;
  return VALUES.map((v, i) => ({
    x: i * (CHART_W / (VALUES.length - 1)),
    y: V_PAD + (1 - (v - min) / range) * (CHART_H - V_PAD * 2),
  }));
};

const smoothPath = (pts: { x: number; y: number }[]) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const cp1x = p.x + (c.x - p.x) * 0.4;
    const cp2x = c.x - (c.x - p.x) * 0.4;
    d += ` C ${cp1x} ${p.y} ${cp2x} ${c.y} ${c.x} ${c.y}`;
  }
  return d;
};

const LineChart = () => {
  const pts   = toPoints();
  const line  = smoothPath(pts);
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const area  = `${line} L ${last.x} ${CHART_H} L ${first.x} ${CHART_H} Z`;

  return (
    <View>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor={C.accent} stopOpacity="0.18" />
            <Stop offset="1"   stopColor={C.accent} stopOpacity="0"    />
          </SvgGradient>
        </Defs>
        {/* Area fill */}
        <Path d={area} fill="url(#fill)" />
        {/* Line */}
        <Path d={line} fill="none" stroke={C.accent} strokeWidth={2} strokeLinecap="round" />
        {/* Data point circles */}
        {pts.map((p, i) => (
          <Circle
            key={i}
            cx={p.x} cy={p.y} r={4}
            fill={C.white}
            stroke={C.accent}
            strokeWidth={2}
          />
        ))}
      </Svg>

      {/* X-axis labels */}
      <View style={ch.xAxis}>
        {DAYS.map((d, i) => (
          <Text
            key={i}
            style={[ch.dayLabel, i === ACTIVE_DAY && ch.dayLabelActive]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
};

const ch = StyleSheet.create({
  xAxis:          { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  dayLabel:       { fontSize: 12, color: C.muted, fontWeight: '500', textAlign: 'center', flex: 1 },
  dayLabelActive: { color: C.ink, fontWeight: '800' },
});

// ── Stat mini-card ────────────────────────────────────────────
type StatCard = {
  label: string;
  value: string;
  trend: string;
  up: boolean | null;
};

const STATS: StatCard[] = [
  { label: 'GANANCIA', value: '$19,830', trend: '↑  54% margen',    up: true  },
  { label: 'TICKETS',  value: '284',     trend: '↑  $128 promedio', up: true  },
  { label: 'CLIENTES', value: '206',     trend: '↑  +34 nuevos',    up: true  },
  { label: 'GASTOS',   value: '$11,230', trend: '↓  -12% vs mes',   up: false },
];

const MiniCard = ({ s }: { s: StatCard }) => (
  <View style={mc.card}>
    <Text style={mc.label}>{s.label}</Text>
    <Text style={mc.value}>{s.value}</Text>
    <Text style={[mc.trend, s.up === false && mc.trendRed]}>{s.trend}</Text>
  </View>
);

const mc = StyleSheet.create({
  card:     { flex: 1, backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, padding: 14, gap: 4 },
  label:    { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  value:    { fontSize: 24, fontWeight: '800', color: C.ink, letterSpacing: -0.8 },
  trend:    { fontSize: 12, fontWeight: '500', color: C.accent },
  trendRed: { color: C.red },
});

// ── Top products ──────────────────────────────────────────────
type Product = { rank: string; name: string; revenue: string; units: string; barPct: number };

const TOP_PRODUCTS: Product[] = [
  { rank: '01', name: 'Cappuccino', revenue: '$7,810', units: '142 ud.', barPct: 1.00 },
  { rank: '02', name: 'Latte',      revenue: '$6,076', units: '98 ud.',  barPct: 0.69 },
  { rank: '03', name: 'Americano',  revenue: '$3,420', units: '76 ud.',  barPct: 0.54 },
  { rank: '04', name: 'Espresso',   revenue: '$2,432', units: '64 ud.',  barPct: 0.45 },
  { rank: '05', name: 'Cheesecake', revenue: '$2,492', units: '28 ud.',  barPct: 0.20 },
];

const ProductRow = ({ p }: { p: Product }) => (
  <View style={pr.row}>
    <Text style={pr.rank}>{p.rank}</Text>
    <View style={pr.info}>
      <View style={pr.top}>
        <Text style={pr.name}>{p.name}</Text>
        <Text style={pr.revenue}>{p.revenue}</Text>
      </View>
      <View style={pr.barBg}>
        <View style={[pr.barFill, { width: `${p.barPct * 100}%` }]} />
      </View>
      <Text style={pr.units}>{p.units}</Text>
    </View>
  </View>
);

const pr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  rank:    { fontSize: 12, fontWeight: '600', color: C.muted, width: 20, marginTop: 2 },
  info:    { flex: 1, gap: 4 },
  top:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name:    { fontSize: 15, fontWeight: '600', color: C.ink },
  revenue: { fontSize: 14, fontWeight: '700', color: C.ink },
  barBg:   { height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: C.ink, borderRadius: 2 },
  units:   { fontSize: 12, color: C.muted, textAlign: 'right' },
});

// ── Main screen ───────────────────────────────────────────────
const PERIODS = ['Día', 'Semana', 'Mes', 'Año'];

export const ReportsScreen = () => {
  const [period, setPeriod] = useState('Semana');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Reportes</Text>
            <Text style={s.subtitle}>Cómo va tu negocio</Text>
          </View>
          <TouchableOpacity style={s.exportBtn} activeOpacity={0.7}>
            <Download size={18} color={C.ink} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        {/* ── Period selector ── */}
        <View style={s.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, period === p && s.periodBtnActive]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.75}>
              <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Revenue card ── */}
        <View style={s.revenueCard}>
          <Text style={s.revenueLabel}>INGRESOS · ESTA SEMANA</Text>
          <Text style={s.revenueAmount}>$36,420</Text>
          <View style={s.trendBadge}>
            <TrendingUp size={12} color={C.accent} strokeWidth={2.5} />
            <Text style={s.trendText}>+23% vs semana pasada</Text>
          </View>
          <View style={s.chartWrap}>
            <LineChart />
          </View>
        </View>

        {/* ── Stats 2×2 grid ── */}
        <View style={s.statsGrid}>
          <View style={s.statsRow}>
            <MiniCard s={STATS[0]} />
            <MiniCard s={STATS[1]} />
          </View>
          <View style={s.statsRow}>
            <MiniCard s={STATS[2]} />
            <MiniCard s={STATS[3]} />
          </View>
        </View>

        {/* ── Top products ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>PRODUCTOS TOP</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.verTodo}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={s.productsCard}>
            {TOP_PRODUCTS.map((p, i) => (
              <View key={p.rank}>
                {i > 0 && <View style={s.prodDivider} />}
                <ProductRow p={p} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.canvas },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 12 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  title:     { fontSize: 32, fontWeight: '800', color: C.ink, letterSpacing: -1 },
  subtitle:  { fontSize: 13, color: C.muted, marginTop: 2 },
  exportBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  periodRow: {
    flexDirection: 'row',
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    padding: 4, gap: 4, marginBottom: 16,
  },
  periodBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 9,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: C.ink },
  periodText:      { fontSize: 14, fontWeight: '600', color: C.muted },
  periodTextActive:{ color: C.white, fontWeight: '700' },

  revenueCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    padding: CARD_PAD, marginBottom: 12,
  },
  revenueLabel:  { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  revenueAmount: { fontSize: 38, fontWeight: '800', color: C.ink, letterSpacing: -1.5, marginTop: 4 },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${C.accent}14`, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', marginTop: 8,
  },
  trendText:   { fontSize: 12, fontWeight: '600', color: C.accent },
  chartWrap:   { marginTop: 16 },

  statsGrid: { gap: 10, marginBottom: 16 },
  statsRow:  { flexDirection: 'row', gap: 10 },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  verTodo:      { fontSize: 13, fontWeight: '600', color: C.accent },

  productsCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16,
  },
  prodDivider: { height: 1, backgroundColor: C.border },
});
