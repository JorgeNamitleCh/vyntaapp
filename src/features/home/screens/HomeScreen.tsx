import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, ScrollView, RefreshControl, Image,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text } from '../../../components/Text';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import Svg, { Circle } from 'react-native-svg';
import {
  ChevronDown, Bell, Settings, TrendingUp, TrendingDown,
  Plus, Package, ReceiptText, BarChart2,
  Banknote, CreditCard, ArrowLeftRight, QrCode, ChevronRight, Target,
  Users, Truck, FileText, Wallet, LayoutGrid, X,
} from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { useGoalsStore } from '../../../store/goalsStore';
import { HomeScreenProps } from '../../../navigation/types';
import { useNotificationStore } from '../../../store/notificationStore';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { Sale } from '../../../types';
import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

// ── Progress ring ────────────────────────────────────────────
const ProgressRing = ({ pct, label = 'HOY' }: { pct: number; label?: string }) => {
  const colors = useThemeColors();
  const ring = useMemo(() => make_ring(colors), [colors]);
  const size = 62;
  const sw   = 3.5;
  const r    = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, pct) / 100) * circ;
  return (
    <View style={ring.wrap}>
      <Svg width={size} height={size} style={ring.svg}>
        <Circle cx={size/2} cy={size/2} r={r}
          stroke="rgba(255,255,255,0.12)" strokeWidth={sw} fill="transparent" />
        <Circle cx={size/2} cy={size/2} r={r}
          stroke="#4ADE80" strokeWidth={sw} fill="transparent"
          strokeDasharray={`${circ}`} strokeDashoffset={`${offset}`}
          strokeLinecap="round" rotation="-90" origin={`${size/2},${size/2}`} />
      </Svg>
      <Text style={ring.pct}>{pct}%</Text>
      <Text style={ring.label}>{label}</Text>
    </View>
  );
};
const make_ring = (colors: ThemeColors) => StyleSheet.create({
  wrap:  { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  svg:   { position: 'absolute' },
  pct:   { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 18 },
  label: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
});

// ── Bar chart ────────────────────────────────────────────────
const BAR_MAX_H    = 44;
const TIME_LABELS  = ['6 AM', '12 PM', '6 PM', '11 PM'];
const LABEL_IDXS   = [0, 6, 12, 17];

interface BarChartProps {
  bars: number[];
  currentHourIdx: number;
}

const BarChart = ({ bars, currentHourIdx }: BarChartProps) => {
  const colors = useThemeColors();
  const chart = useMemo(() => make_chart(colors), [colors]);
  const max = Math.max(...bars, 1);
  return (
    <View style={chart.wrap}>
      <View style={chart.bars}>
        {bars.map((v, i) => {
          const isFuture  = i > currentHourIdx;
          const isCurrent = i === currentHourIdx;
          const h = Math.max(3, (v / max) * BAR_MAX_H);
          const bg = isFuture
            ? 'rgba(255,255,255,0.1)'
            : isCurrent && v > 0
              ? colors.amber
              : v > 0
                ? '#22C55E'
                : 'rgba(255,255,255,0.18)';
          return (
            <View key={i} style={chart.barCol}>
              <View style={[chart.bar, { height: h, backgroundColor: bg }]} />
            </View>
          );
        })}
      </View>
      <View style={chart.labels}>
        {TIME_LABELS.map((l, li) => (
          <Text key={l} style={[chart.labelText, LABEL_IDXS[li] <= currentHourIdx && { color: 'rgba(255,255,255,0.65)' }]}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
};
const make_chart = (colors: ThemeColors) => StyleSheet.create({
  wrap:      { marginTop: 10 },
  bars:      { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 4 },
  barCol:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar:       { width: '70%', borderRadius: 2 },
  labels:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  labelText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
});

// ── Payment icon map ─────────────────────────────────────────
const PAYMENT_ICON: Record<string, { Icon: any; bg: string }> = {
  cash:     { Icon: Banknote,       bg: '#0E5C3F' },
  card:     { Icon: CreditCard,     bg: '#1D4ED8' },
  transfer: { Icon: ArrowLeftRight, bg: '#7C3AED' },
  qr:       { Icon: QrCode,         bg: '#0369A1' },
};

const agoLabel = (date: Date) =>
  formatDistanceToNowStrict(date, { locale: es, addSuffix: false });

const SaleItem = ({ sale, onPress }: { sale: Sale; onPress?: () => void }) => {
  const colors = useThemeColors();
  const recent = useMemo(() => make_recent(colors), [colors]);
  const pm       = PAYMENT_ICON[sale.paymentMethod] ?? PAYMENT_ICON.cash;
  const count    = sale.items.reduce((s, i) => s + i.quantity, 0);
  const shortId  = sale.id.slice(-5).toUpperCase();
  const firstImg = sale.items[0]?.imageUrl;
  return (
    <TouchableOpacity style={recent.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[recent.iconWrap, { backgroundColor: pm.bg }]}>
        {firstImg
          ? <Image source={{ uri: firstImg }} style={recent.productImg} />
          : <pm.Icon size={15} color="#fff" strokeWidth={1.75} />
        }
      </View>
      <View style={recent.info}>
        <Text style={recent.saleId}>
          <Text style={recent.bold}>#{shortId}</Text>
          {'  ·  '}{count} producto{count !== 1 ? 's' : ''}
        </Text>
        <Text style={recent.ago}>hace {agoLabel(sale.createdAt)}</Text>
      </View>
      <Text style={recent.amount}>${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
    </TouchableOpacity>
  );
};
const make_recent = (colors: ThemeColors) => StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconWrap:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  productImg: { width: 36, height: 36, borderRadius: 10 },
  info:     { flex: 1, gap: 2 },
  saleId:   { fontSize: 13, color: colors.ink },
  bold:     { fontWeight: '700' },
  ago:      { fontSize: 12, color: colors.muted },
  amount:   { fontSize: 15, fontWeight: '700', color: colors.ink },
});

// ── Helpers ──────────────────────────────────────────────────
const DAY_NAMES   = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
const MONTH_NAMES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

const getTodayLabel = () => {
  const d = new Date();
  return `HOY · ${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};
const getShiftLabel = () => {
  const h = new Date().getHours();
  if (h < 12) return 'turno mañana';
  if (h < 18) return 'turno tarde';
  return 'turno noche';
};
const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Screen ───────────────────────────────────────────────────
export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const colors = useThemeColors();
  const ring = useMemo(() => make_ring(colors), [colors]);
  const chart = useMemo(() => make_chart(colors), [colors]);
  const recent = useMemo(() => make_recent(colors), [colors]);
  const s = useMemo(() => make_s(colors), [colors]);
  const gm = useMemo(() => make_gm(colors), [colors]);
  const fm = useMemo(() => make_fm(colors), [colors]);

  const { tenant } = useAuthStore();
  const unreadCount = useNotificationStore(s => s.notifications.filter(n => !n.read).length);
  const dash = useHomeDashboard();
  const { dailyGoal, monthlyGoal, setDailyGoal, setMonthlyGoal } = useGoalsStore();

  const businessName = tenant?.name ?? 'Mi negocio';
  const initial = businessName.charAt(0).toUpperCase();

  const stackNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();

  const [totalInt, totalDec] = fmt(dash.todayTotal).split('.');

  // Goal modal state
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible]   = useState(false);
  const [dailyInput,   setDailyInput]   = useState('');
  const [monthlyInput, setMonthlyInput] = useState('');

  const openGoalModal = () => {
    setDailyInput(dailyGoal != null ? String(dailyGoal) : '');
    setMonthlyInput(monthlyGoal != null ? String(monthlyGoal) : '');
    setGoalModalVisible(true);
  };

  const saveGoals = () => {
    const d = parseFloat(dailyInput);
    const m = parseFloat(monthlyInput);
    setDailyGoal(d > 0 ? d : null);
    setMonthlyGoal(m > 0 ? m : null);
    setGoalModalVisible(false);
  };

  // Ring = daily goal progress if set, else vs yesterday
  const ringPct = dailyGoal && dailyGoal > 0
    ? Math.min(100, Math.round((dash.todayTotal / dailyGoal) * 100))
    : dash.yesterdayTotal > 0
      ? Math.min(100, Math.round((dash.todayTotal / dash.yesterdayTotal) * 100))
      : dash.todayTotal > 0 ? 100 : 0;

  const ringLabel = dailyGoal && dailyGoal > 0 ? 'META' : 'HOY';

  // Monthly progress bar (0–1)
  const monthPct = monthlyGoal && monthlyGoal > 0
    ? Math.min(1, dash.monthTotal / monthlyGoal)
    : null;

  const quickActions = [
    { label: 'Nueva venta', Icon: Plus,        primary: true,  onPress: () => stackNav.navigate('POS') },
    { label: 'Inventario',  Icon: Package,      primary: false, onPress: () => navigation.navigate('Inventory') },
    { label: 'Gasto',       Icon: ReceiptText,  primary: false, onPress: () => navigation.navigate('Expenses') },
    { label: 'Reporte',     Icon: BarChart2,    primary: false, onPress: () => navigation.navigate('Reports') },
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.bizRow}
          onPress={() => stackNav.navigate('BusinessEdit')}
          activeOpacity={0.7}>
          <View style={[s.avatar, tenant?.logoUrl ? s.avatarImg : null]}>
            {tenant?.logoUrl
              ? <Image source={{ uri: tenant.logoUrl }} style={s.logoImg} />
              : <Text style={s.avatarText}>{initial}</Text>}
          </View>
          <View>
            <View style={s.bizNameRow}>
              <Text style={s.bizName}>{businessName}</Text>
              <ChevronDown size={14} color={colors.muted} strokeWidth={2} />
            </View>
            <Text style={s.shiftLabel}>Abierto · {getShiftLabel()}</Text>
          </View>
        </TouchableOpacity>
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => stackNav.navigate('Notifications')}>
            <Bell size={18} color={colors.ink} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <View style={s.notifBadge}>
                <Text style={s.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => stackNav.navigate('Settings')}>
            <Settings size={18} color={colors.ink} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dash.isLoading}
            onRefresh={dash.refresh}
            tintColor={colors.accent}
          />
        }>

        {/* ── Greeting ── */}
        <View style={s.greeting}>
          <Text style={s.dateLabel}>{getTodayLabel()}</Text>
          <Text style={s.hello}>Hola, {businessName.split(' ')[0]}.</Text>
        </View>

        {/* ── Sales card ── */}
        <View style={s.salesCard}>
          <View style={s.cardTopRow}>
            <View>
              <Text style={s.cardLabel}>VENTAS HOY</Text>
              <View style={s.amountRow}>
                <Text style={s.amount}>${totalInt}</Text>
                <Text style={s.amountCents}>.{totalDec}</Text>
              </View>
              {dash.trendPct !== null ? (
                <View style={s.trendRow}>
                  {dash.trendPct >= 0
                    ? <TrendingUp  size={13} color="#86EFAC" strokeWidth={2} />
                    : <TrendingDown size={13} color="#FCA5A5" strokeWidth={2} />}
                  <Text style={[s.trendText, dash.trendPct < 0 && { color: '#FCA5A5' }]}>
                    {dash.trendPct >= 0 ? '+' : ''}{dash.trendPct}% vs ayer
                  </Text>
                </View>
              ) : (
                <View style={s.trendRow}>
                  <Text style={s.trendText}>Sin datos de ayer</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={openGoalModal} activeOpacity={0.75}>
              <ProgressRing pct={ringPct} label={ringLabel} />
              <View style={s.ringEdit}>
                <Target size={9} color="rgba(255,255,255,0.5)" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          <BarChart
            bars={dash.hourlyBars.map(b => b.total)}
            currentHourIdx={dash.currentHourIdx}
          />

          <View style={s.divider} />

          <View style={s.statsRow}>
            {[
              { label: 'TICKETS',  value: String(dash.ticketCount) },
              { label: 'PROMEDIO', value: dash.avgTicket > 0 ? `$${dash.avgTicket.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--' },
              { label: 'EFECTIVO', value: dash.cashTotal > 0 ? `$${dash.cashTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--' },
            ].map(({ label, value }, i) => (
              <View key={label} style={[s.statItem, i > 0 && s.statBorder]}>
                <Text style={s.statLabel}>{label}</Text>
                <Text style={s.statValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* ── Monthly goal progress bar ── */}
          {monthPct !== null && (
            <>
              <View style={s.divider} />
              <TouchableOpacity style={s.monthGoalRow} onPress={openGoalModal} activeOpacity={0.75}>
                <View style={s.monthGoalTop}>
                  <Text style={s.monthGoalLabel}>META MES</Text>
                  <Text style={s.monthGoalValue}>
                    ${dash.monthTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${monthlyGoal!.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={s.monthGoalBg}>
                  <View style={[s.monthGoalFill, { width: `${Math.round(monthPct * 100)}%` }]} />
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* ── No goal set hint ── */}
          {!dailyGoal && !monthlyGoal && (
            <>
              <View style={s.divider} />
              <TouchableOpacity style={s.setGoalHint} onPress={openGoalModal} activeOpacity={0.75}>
                <Target size={12} color="rgba(255,255,255,0.45)" strokeWidth={2} />
                <Text style={s.setGoalHintText}>Toca para definir una meta de ventas</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Quick actions ── */}
        <View style={s.actionsRow}>
          {quickActions.map(({ label, Icon, primary, onPress }) => (
            <TouchableOpacity
              key={label}
              style={[s.actionBtn, primary && s.actionBtnPrimary]}
              onPress={onPress}
              activeOpacity={0.75}>
              <Icon size={20} color={primary ? '#fff' : colors.ink} strokeWidth={1.75} />
              <Text style={[s.actionLabel, primary && s.actionLabelPrimary]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── More features button ── */}
        <TouchableOpacity style={s.moreBtn} onPress={() => setFeaturesVisible(true)} activeOpacity={0.8}>
          <LayoutGrid size={17} color={colors.ink} strokeWidth={1.75} />
          <Text style={s.moreBtnText}>Más funciones</Text>
          <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
        </TouchableOpacity>

        {/* ── Low stock alert ── */}
        {dash.lowStockProducts.length > 0 && (
          <TouchableOpacity
            style={s.alertCard}
            onPress={() => navigation.navigate('Inventory')}
            activeOpacity={0.75}>
            <View style={s.alertIcon}>
              <Package size={18} color={colors.amber} strokeWidth={1.75} />
            </View>
            <View style={s.alertText}>
              <Text style={s.alertTitle}>
                {dash.lowStockProducts.length} producto{dash.lowStockProducts.length !== 1 ? 's' : ''} por agotarse
              </Text>
              <Text style={s.alertSub} numberOfLines={1}>
                {dash.lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* ── Recent sales ── */}
        <View style={s.recentSection}>
          <View style={s.recentHeader}>
            <Text style={s.recentTitle}>VENTAS RECIENTES</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={s.verTodo}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {dash.isLoading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
          ) : dash.recentSales.length === 0 ? (
            <Text style={s.emptyText}>Sin ventas hoy — ¡a vender!</Text>
          ) : (
            dash.recentSales.map((sale, i) => (
              <View key={sale.id}>
                {i > 0 && <View style={s.saleDiv} />}
                <SaleItem sale={sale} onPress={() => stackNav.navigate('SaleDetail', { saleId: sale.id })} />
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* ── Features modal ── */}
      <Modal
        visible={featuresVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFeaturesVisible(false)}>
        <TouchableOpacity
          style={gm.overlay}
          activeOpacity={1}
          onPress={() => setFeaturesVisible(false)}
        />
        <View style={fm.sheet}>
          <View style={fm.handle} />
          <View style={fm.header}>
            <Text style={fm.title}>Más funciones</Text>
            <TouchableOpacity onPress={() => setFeaturesVisible(false)} hitSlop={12}>
              <X size={20} color={colors.ink} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {[
            { label: 'Cotizaciones', Icon: FileText, desc: 'Crea y envía cotizaciones',        onPress: () => { setFeaturesVisible(false); stackNav.navigate('Quotes'); } },
            { label: 'Deudas',       Icon: Wallet,   desc: 'Por cobrar y por pagar',           onPress: () => { setFeaturesVisible(false); stackNav.navigate('Debts'); } },
            { label: 'Clientes',     Icon: Users,    desc: 'Gestiona tu cartera de clientes',  onPress: () => { setFeaturesVisible(false); stackNav.navigate('Customers'); } },
            { label: 'Proveedores',  Icon: Truck,    desc: 'Registra a tus proveedores',       onPress: () => { setFeaturesVisible(false); stackNav.navigate('Suppliers'); } },
            { label: 'Empleados',    Icon: Users,    desc: 'Acceso del equipo',                onPress: () => { setFeaturesVisible(false); stackNav.navigate('Employees'); } },
          ].map(({ label, Icon, desc, onPress }) => (
            <TouchableOpacity key={label} style={fm.item} onPress={onPress} activeOpacity={0.75}>
              <View style={[fm.icon, { backgroundColor: colors.cardBg }]}>
                <Icon size={22} color={colors.accent} strokeWidth={1.75} />
              </View>
              <View style={fm.itemText}>
                <Text style={fm.itemLabel}>{label}</Text>
                <Text style={fm.itemDesc}>{desc}</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ── Goal modal ── */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGoalModalVisible(false)}>
        <TouchableOpacity
          style={gm.overlay}
          activeOpacity={1}
          onPress={() => setGoalModalVisible(false)}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={gm.sheet}>
            <View style={gm.handle} />
            <Text style={gm.title}>Metas de venta</Text>
            <Text style={gm.subtitle}>Define cuánto quieres vender por día y por mes</Text>

            <View style={gm.field}>
              <Text style={gm.fieldLabel}>META DEL DÍA</Text>
              <View style={gm.inputRow}>
                <Text style={gm.prefix}>$</Text>
                <TextInput
                  style={gm.input}
                  value={dailyInput}
                  onChangeText={setDailyInput}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                />
                {dailyInput.length > 0 && (
                  <TouchableOpacity onPress={() => setDailyInput('')}>
                    <Text style={gm.clear}>Quitar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={gm.field}>
              <Text style={gm.fieldLabel}>META DEL MES</Text>
              <View style={gm.inputRow}>
                <Text style={gm.prefix}>$</Text>
                <TextInput
                  style={gm.input}
                  value={monthlyInput}
                  onChangeText={setMonthlyInput}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                />
                {monthlyInput.length > 0 && (
                  <TouchableOpacity onPress={() => setMonthlyInput('')}>
                    <Text style={gm.clear}>Quitar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity style={gm.saveBtn} onPress={saveGoals} activeOpacity={0.85}>
              <Text style={gm.saveBtnText}>Guardar metas</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },

  topBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  bizRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.hero, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg:  { backgroundColor: 'transparent' },
  logoImg:    { width: 36, height: 36, borderRadius: 18 },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  bizNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bizName:    { fontSize: 14, fontWeight: '700', color: colors.ink },
  shiftLabel: { fontSize: 11, color: colors.muted, marginTop: 1 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn:    { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: colors.canvas },
  notifBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', lineHeight: 11 },

  greeting:  { gap: 4, marginTop: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  hello:     { fontSize: 36, fontWeight: '800', color: colors.ink, letterSpacing: -1.2, lineHeight: 42 },

  salesCard:   { backgroundColor: colors.hero, borderRadius: 20, padding: 20 },
  cardTopRow:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardLabel:   { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 },
  amountRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  amount:      { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -2, lineHeight: 46 },
  amountCents: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 6 },
  trendRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  trendText:   { fontSize: 12, color: '#86EFAC', fontWeight: '600' },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 },
  statsRow:    { flexDirection: 'row' },
  statItem:    { flex: 1, gap: 4, paddingHorizontal: 4 },
  statBorder:  { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 14 },
  statLabel:   { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8 },
  statValue:   { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

  actionsRow:        { flexDirection: 'row', gap: 10 },
  actionBtn:         { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.cardBg, borderWidth: 1.5, borderColor: colors.border },
  actionBtnPrimary:  { backgroundColor: colors.accent, borderColor: colors.accent },
  actionLabel:       { fontSize: 11, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  actionLabelPrimary:{ color: '#fff' },

  moreBtn:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14 },
  moreBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.ink },

  alertCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.amberBg, borderRadius: 14, borderWidth: 1.5, borderColor: colors.amber, borderStyle: 'dashed', paddingHorizontal: 14, paddingVertical: 14 },
  alertIcon:  { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.amberBg, alignItems: 'center', justifyContent: 'center' },
  alertText:  { flex: 1, gap: 2 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: colors.amberText },
  alertSub:   { fontSize: 12, color: colors.amberText },

  recentSection: { backgroundColor: colors.cardBg, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, padding: 16 },
  recentHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  recentTitle:   { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  verTodo:       { fontSize: 13, fontWeight: '600', color: colors.accent },
  saleDiv:       { height: 1, backgroundColor: colors.border },
  emptyText:     { fontSize: 14, color: colors.muted, textAlign: 'center', paddingVertical: 24 },

  ringEdit: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  monthGoalRow:   { gap: 6 },
  monthGoalTop:   { flexDirection: 'row', justifyContent: 'space-between' },
  monthGoalLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8 },
  monthGoalValue: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  monthGoalBg:    { height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' },
  monthGoalFill:  { height: 4, backgroundColor: '#4ADE80', borderRadius: 2 },

  setGoalHint:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  setGoalHintText: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' },
});

const make_gm = (colors: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 16,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E5E3DC', alignSelf: 'center', marginBottom: 4,
  },
  title:    { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: -8 },

  field:      { gap: 8 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  inputRow:   {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  prefix: { fontSize: 20, fontWeight: '700', color: colors.ink },
  input:  { flex: 1, fontSize: 20, fontWeight: '700', color: colors.ink, padding: 0 },
  clear:  { fontSize: 13, fontWeight: '600', color: colors.muted },

  saveBtn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

const make_fm = (colors: ThemeColors) => StyleSheet.create({
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '800', color: colors.ink },
  item:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon:      { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemText:  { flex: 1, gap: 2 },
  itemLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
  itemDesc:  { fontSize: 12, color: colors.muted },
});
