import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Dimensions, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import Svg, {
  Path, Circle, Defs, LinearGradient as SvgGradient, Stop,
} from 'react-native-svg';
import { useReports, Period } from '../hooks/useReports';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

const SCREEN_W = Dimensions.get('window').width;
const H_PAD    = 20;
const CARD_PAD = 16;
const CHART_W  = SCREEN_W - H_PAD * 2 - CARD_PAD * 2;
const CHART_H  = 130;
const V_PAD    = 12;

// ── Line chart ────────────────────────────────────────────────
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

const LineChart = ({ values, labels, activeIdx }: { values: number[]; labels: string[]; activeIdx: number }) => {
  const colors = useThemeColors();
  const ch = useMemo(() => make_ch(colors), [colors]);
  if (!values.length) return null;
  const max   = Math.max(...values, 1);
  const min   = Math.min(...values);
  const range = max - min || 1;
  const step  = values.length > 1 ? CHART_W / (values.length - 1) : CHART_W;

  const pts = values.map((v, i) => ({
    x: i * step,
    y: V_PAD + (1 - (v - min) / range) * (CHART_H - V_PAD * 2),
  }));

  const line  = smoothPath(pts);
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const area  = `${line} L ${last.x} ${CHART_H} L ${first.x} ${CHART_H} Z`;

  // Only show every Nth label if many points
  const labelStep = values.length > 12 ? 3 : values.length > 7 ? 2 : 1;

  return (
    <View>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor={colors.accent} stopOpacity="0.18" />
            <Stop offset="1"   stopColor={colors.accent} stopOpacity="0"    />
          </SvgGradient>
        </Defs>
        <Path d={area} fill="url(#fill)" />
        <Path d={line} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" />
        {pts.map((p, i) => (
          <Circle
            key={i}
            cx={p.x} cy={p.y} r={i === activeIdx ? 5 : 3}
            fill={i === activeIdx ? colors.accent : colors.white}
            stroke={colors.accent}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={ch.xAxis}>
        {labels.map((d, i) => (
          <Text
            key={i}
            style={[
              ch.dayLabel,
              i === activeIdx && ch.dayLabelActive,
              i % labelStep !== 0 && { opacity: 0 },
            ]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
};

const make_ch = (colors: ThemeColors) => StyleSheet.create({
  xAxis:          { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  dayLabel:       { fontSize: 11, color: colors.muted, fontWeight: '500', textAlign: 'center', flex: 1 },
  dayLabelActive: { color: colors.ink, fontWeight: '800' },
});

// ── Top products ──────────────────────────────────────────────
const ProductRow = ({ p, rank }: { p: { name: string; revenue: number; units: number; barPct: number }; rank: number }) => {
  const colors = useThemeColors();
  const pr = useMemo(() => make_pr(colors), [colors]);
  return (
    <View style={pr.row}>
      <Text style={pr.rank}>{String(rank).padStart(2, '0')}</Text>
      <View style={pr.info}>
        <View style={pr.top}>
          <Text style={pr.name} numberOfLines={1}>{p.name}</Text>
          <Text style={pr.revenue}>${p.revenue.toLocaleString('es-MX')}</Text>
        </View>
        <View style={pr.barBg}>
          <View style={[pr.barFill, { width: `${p.barPct * 100}%` }]} />
        </View>
        <Text style={pr.units}>{p.units} ud.</Text>
      </View>
    </View>
  );
};

const make_pr = (colors: ThemeColors) => StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  rank:    { fontSize: 12, fontWeight: '600', color: colors.muted, width: 20, marginTop: 2 },
  info:    { flex: 1, gap: 4 },
  top:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name:    { fontSize: 15, fontWeight: '600', color: colors.ink, flex: 1, marginRight: 8 },
  revenue: { fontSize: 14, fontWeight: '700', color: colors.ink },
  barBg:   { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: colors.ink, borderRadius: 2 },
  units:   { fontSize: 12, color: colors.muted, textAlign: 'right' },
});

// ── Main screen ───────────────────────────────────────────────
const PERIODS: Period[] = ['Día', 'Semana', 'Mes', 'Año'];

const periodLabelMap: Record<Period, string> = {
  'Día':    'HOY',
  'Semana': 'ESTA SEMANA',
  'Mes':    'ESTE MES',
  'Año':    'ESTE AÑO',
};

export const ReportsScreen = () => {
  const colors = useThemeColors();
  const ch = useMemo(() => make_ch(colors), [colors]);
  const pr = useMemo(() => make_pr(colors), [colors]);
  const mc = useMemo(() => make_mc(colors), [colors]);
  const s = useMemo(() => make_s(colors), [colors]);

  const [period, setPeriod] = useState<Period>('Semana');
  const { data, isLoading, refresh } = useReports(period);

  const fmtMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.accent} colors={[colors.accent]} />
        }>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Reportes</Text>
            <Text style={s.subtitle}>Cómo va tu negocio</Text>
          </View>
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

        {isLoading && !data ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            {/* ── Revenue card ── */}
            <View style={s.revenueCard}>
              <Text style={s.revenueLabel}>INGRESOS · {periodLabelMap[period]}</Text>
              <Text style={s.revenueAmount}>{fmtMoney(data?.revenue ?? 0)}</Text>
              {(data?.trendPct ?? 0) !== 0 && (
                <View style={[s.trendBadge, (data?.trendPct ?? 0) < 0 && s.trendBadgeRed]}>
                  {(data?.trendPct ?? 0) >= 0
                    ? <TrendingUp size={12} color={colors.accent} strokeWidth={2.5} />
                    : <TrendingDown size={12} color={colors.red} strokeWidth={2.5} />}
                  <Text style={[(data?.trendPct ?? 0) >= 0 ? s.trendText : s.trendTextRed]}>
                    {(data?.trendPct ?? 0) >= 0 ? '+' : ''}{data?.trendPct}% vs periodo anterior
                  </Text>
                </View>
              )}
              {data && data.chartValues.length > 1 && (
                <View style={s.chartWrap}>
                  <LineChart
                    values={data.chartValues}
                    labels={data.chartLabels}
                    activeIdx={data.activeDayIdx}
                  />
                </View>
              )}
            </View>

            {/* ── Stats 2×2 grid ── */}
            <View style={s.statsGrid}>
              <View style={s.statsRow}>
                <View style={mc.card}>
                  <Text style={mc.label}>GANANCIA</Text>
                  <Text style={mc.value}>{fmtMoney(data?.profit ?? 0)}</Text>
                  <Text style={mc.trend}>ventas − gastos</Text>
                </View>
                <View style={mc.card}>
                  <Text style={mc.label}>TICKETS</Text>
                  <Text style={mc.value}>{(data?.ticketCount ?? 0).toString()}</Text>
                  <Text style={mc.trend}>{fmtMoney(data?.avgTicket ?? 0)} promedio</Text>
                </View>
              </View>
              <View style={s.statsRow}>
                <View style={mc.card}>
                  <Text style={mc.label}>GASTOS</Text>
                  <Text style={mc.value}>{fmtMoney(data?.expenseTotal ?? 0)}</Text>
                  <Text style={[mc.trend, mc.trendRed]}>costos del período</Text>
                </View>
                <View style={mc.card}>
                  <Text style={mc.label}>MARGEN</Text>
                  <Text style={mc.value}>
                    {(data?.revenue ?? 0) > 0
                      ? `${Math.round(((data?.profit ?? 0) / (data?.revenue ?? 1)) * 100)}%`
                      : '—'}
                  </Text>
                  <Text style={mc.trend}>sobre ingresos</Text>
                </View>
              </View>
            </View>

            {/* ── Top products ── */}
            {(data?.topProducts?.length ?? 0) > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionLabel}>PRODUCTOS TOP</Text>
                </View>
                <View style={s.productsCard}>
                  {data!.topProducts.map((p, i) => (
                    <View key={p.name}>
                      {i > 0 && <View style={s.prodDivider} />}
                      <ProductRow p={p} rank={i + 1} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(data?.topProducts?.length ?? 0) === 0 && !isLoading && (
              <View style={s.emptyWrap}>
                <Text style={s.emptyText}>Sin ventas en este período</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const make_mc = (colors: ThemeColors) => StyleSheet.create({
  card:     { flex: 1, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, padding: 14, gap: 4 },
  label:    { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  value:    { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  trend:    { fontSize: 12, fontWeight: '500', color: colors.accent },
  trendRed: { color: colors.red },
});

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 12 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  title:     { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle:  { fontSize: 13, color: colors.muted, marginTop: 2 },

  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border,
    padding: 4, gap: 4, marginBottom: 16,
  },
  periodBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: colors.ink },
  periodText:      { fontSize: 14, fontWeight: '600', color: colors.muted },
  periodTextActive:{ color: colors.white, fontWeight: '700' },

  revenueCard: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    padding: CARD_PAD, marginBottom: 12,
  },
  revenueLabel:  { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  revenueAmount: { fontSize: 38, fontWeight: '800', color: colors.ink, letterSpacing: -1.5, marginTop: 4 },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${colors.accent}14`, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', marginTop: 8,
  },
  trendBadgeRed: { backgroundColor: '#FEE2E2' },
  trendText:    { fontSize: 12, fontWeight: '600', color: colors.accent },
  trendTextRed: { fontSize: 12, fontWeight: '600', color: colors.red },
  chartWrap:   { marginTop: 16 },

  statsGrid: { gap: 10, marginBottom: 16 },
  statsRow:  { flexDirection: 'row', gap: 10 },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },

  productsCard: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 16,
  },
  prodDivider: { height: 1, backgroundColor: colors.border },

  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  emptyWrap:   { paddingVertical: 40, alignItems: 'center' },
  emptyText:   { fontSize: 14, color: colors.muted },
});
