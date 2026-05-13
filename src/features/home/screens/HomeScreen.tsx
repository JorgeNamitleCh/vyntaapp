import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import Svg, { Circle } from 'react-native-svg';
import {
  ChevronDown,
  Bell,
  Settings,
  TrendingUp,
  Plus,
  Package,
  ReceiptText,
  BarChart2,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/auth.service';
import { HomeScreenProps } from '../../../navigation/types';
import { useNotificationStore } from '../../../store/notificationStore';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  cardBg: '#F7F5EE',
  amber: '#D97706',
};

// ── Progress ring ────────────────────────────────────────────
const ProgressRing = ({ pct }: { pct: number }) => {
  const size = 62;
  const sw = 3.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <View style={ring.wrap}>
      <Svg width={size} height={size} style={ring.svg}>
        <Circle cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.12)" strokeWidth={sw} fill="transparent" />
        <Circle cx={size / 2} cy={size / 2} r={r}
          stroke="#4ADE80" strokeWidth={sw} fill="transparent"
          strokeDasharray={`${circ}`} strokeDashoffset={`${offset}`}
          strokeLinecap="round" rotation="-90" origin={`${size / 2},${size / 2}`} />
      </Svg>
      <Text style={ring.pct}>{pct}%</Text>
      <Text style={ring.label}>META</Text>
    </View>
  );
};

const ring = StyleSheet.create({
  wrap: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  pct: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 18 },
  label: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
});

// ── Bar chart ────────────────────────────────────────────────
const BARS = [2, 3, 3, 4, 5, 6, 8, 10, 13, 18, 24, 30, 36, 42, 48, 52, 46, 38];
const PEAK_IDX = 15;
const MAX = Math.max(...BARS);
const BAR_MAX_H = 44;
const TIME_LABELS = ['6 AM', '12 PM', '6 PM', '11 PM'];

const getBarColor = (i: number, v: number): string => {
  if (i < 4) return 'rgba(255,255,255,0.14)';
  if (i === PEAK_IDX) return C.amber;
  if (i > PEAK_IDX) return 'rgba(255,255,255,0.14)';
  const ratio = v / MAX;
  if (ratio > 0.75) return '#22C55E';
  if (ratio > 0.45) return '#16A34A';
  return '#0E5C3F';
};

const BarChart = () => (
  <View style={chart.wrap}>
    <View style={chart.bars}>
      {BARS.map((v, i) => (
        <View key={i} style={chart.barCol}>
          <View style={[chart.bar, {
            height: Math.max(3, (v / MAX) * BAR_MAX_H),
            backgroundColor: getBarColor(i, v),
          }]} />
        </View>
      ))}
    </View>
    <View style={chart.labels}>
      {TIME_LABELS.map(l => (
        <Text key={l} style={chart.labelText}>{l}</Text>
      ))}
    </View>
  </View>
);

const chart = StyleSheet.create({
  wrap: { marginTop: 10 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', borderRadius: 2 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  labelText: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
});

// ── Recent sale row ──────────────────────────────────────────
const PAYMENT_ICON: Record<string, { Icon: any; bg: string }> = {
  cash:     { Icon: Banknote,       bg: '#0E5C3F' },
  card:     { Icon: CreditCard,     bg: '#1D4ED8' },
  transfer: { Icon: ArrowLeftRight, bg: '#7C3AED' },
};

type SaleRow = { id: string; count: number; ago: string; total: number; method: string };

const SaleItem = ({ sale }: { sale: SaleRow }) => {
  const pm = PAYMENT_ICON[sale.method] ?? PAYMENT_ICON.cash;
  return (
    <View style={recent.row}>
      <View style={[recent.iconWrap, { backgroundColor: pm.bg }]}>
        <pm.Icon size={15} color="#fff" strokeWidth={1.75} />
      </View>
      <View style={recent.info}>
        <Text style={recent.saleId}>
          <Text style={recent.saleIdBold}>#{sale.id}</Text>
          {'  ·  '}{sale.count} producto{sale.count !== 1 ? 's' : ''}
        </Text>
        <Text style={recent.ago}>hace {sale.ago}</Text>
      </View>
      <Text style={recent.amount}>${sale.total.toLocaleString('es-MX')}</Text>
    </View>
  );
};

const recent = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  saleId: { fontSize: 13, color: C.ink },
  saleIdBold: { fontWeight: '700' },
  ago: { fontSize: 12, color: C.muted },
  amount: { fontSize: 15, fontWeight: '700', color: C.ink },
});

// ── Mock data ────────────────────────────────────────────────
const MOCK_SALES: SaleRow[] = [
  { id: 'A0419', count: 3, ago: '8 min', total: 264, method: 'cash' },
  { id: 'A0418', count: 1, ago: '22 min', total: 75, method: 'card' },
  { id: 'A0417', count: 2, ago: '41 min', total: 180, method: 'transfer' },
  { id: 'A0416', count: 1, ago: '1 hr', total: 55, method: 'cash' },
];

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTH_NAMES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const getShiftLabel = () => {
  const h = new Date().getHours();
  if (h < 12) return 'turno mañana';
  if (h < 18) return 'turno tarde';
  return 'turno noche';
};

const getTodayLabel = () => {
  const d = new Date();
  return `HOY · ${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

// ── Screen ───────────────────────────────────────────────────
type QuickAction = {
  label: string;
  Icon: any;
  primary?: boolean;
  onPress: () => void;
};

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user, tenant } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const businessName = tenant?.name ?? 'Mi negocio';
  const initial = businessName.charAt(0).toUpperCase();

  const stackNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();

  const quickActions: QuickAction[] = [
    { label: 'Nueva venta', Icon: Plus, primary: true, onPress: () => stackNav.navigate('POS') },
    { label: 'Inventario', Icon: Package, onPress: () => navigation.navigate('Inventory') },
    { label: 'Gasto', Icon: ReceiptText, onPress: () => navigation.navigate('Expenses') },
    { label: 'Reporte', Icon: BarChart2, onPress: () => navigation.navigate('Reports') },
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <View style={s.bizRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View>
            <View style={s.bizNameRow}>
              <Text style={s.bizName}>{businessName}</Text>
              <ChevronDown size={14} color={C.muted} strokeWidth={2} />
            </View>
            <Text style={s.shiftLabel}>Abierto · {getShiftLabel()}</Text>
          </View>
        </View>
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={() => stackNav.navigate('Notifications')}>
            <Bell size={18} color={C.ink} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <View style={s.notifBadge}>
                <Text style={s.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => stackNav.navigate('Settings')}>
            <Settings size={18} color={C.ink} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

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
                <Text style={s.amount}>$4,820</Text>
                <Text style={s.amountCents}>.00</Text>
              </View>
              <View style={s.trendRow}>
                <TrendingUp size={13} color={C.amber} strokeWidth={2} />
                <Text style={s.trendText}>+18% vs ayer</Text>
              </View>
            </View>
            <ProgressRing pct={64} />
          </View>

          <BarChart />

          <View style={s.divider} />

          <View style={s.statsRow}>
            {[
              { label: 'TICKETS', value: '37' },
              { label: 'PROMEDIO', value: '$130' },
              { label: 'GANANCIA', value: '$2,604' },
            ].map(({ label, value }, i) => (
              <View key={label} style={[s.statItem, i > 0 && s.statBorder]}>
                <Text style={s.statLabel}>{label}</Text>
                <Text style={s.statValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.actionsRow}>
          {quickActions.map(({ label, Icon, primary, onPress }) => (
            <TouchableOpacity
              key={label}
              style={[s.actionBtn, primary && s.actionBtnPrimary]}
              onPress={onPress}
              activeOpacity={0.75}>
              <Icon size={20} color={primary ? '#fff' : C.ink} strokeWidth={1.75} />
              <Text style={[s.actionLabel, primary && s.actionLabelPrimary]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Low stock alert ── */}
        <TouchableOpacity style={s.alertCard} activeOpacity={0.75}>
          <View style={s.alertIcon}>
            <Package size={18} color={C.amber} strokeWidth={1.75} />
          </View>
          <View style={s.alertText}>
            <Text style={s.alertTitle}>3 productos por agotarse</Text>
            <Text style={s.alertSub}>Café molido, vasos 12oz, leche entera</Text>
          </View>
          <ChevronRight size={16} color={C.muted} strokeWidth={2} />
        </TouchableOpacity>

        {/* ── Recent sales ── */}
        <View style={s.recentSection}>
          <View style={s.recentHeader}>
            <Text style={s.recentTitle}>VENTAS RECIENTES</Text>
            <TouchableOpacity>
              <Text style={s.verTodo}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={s.recentList}>
            {MOCK_SALES.map((sale, i) => (
              <View key={sale.id}>
                {i > 0 && <View style={s.saleDiv} />}
                <SaleItem sale={sale} />
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
  },
  bizRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  bizNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bizName: { fontSize: 14, fontWeight: '700', color: C.ink },
  shiftLabel: { fontSize: 11, color: C.muted, marginTop: 1 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F0EEE7', borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: C.canvas,
  },
  notifBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', lineHeight: 11 },

  // Greeting
  greeting: { gap: 4, marginTop: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  hello: { fontSize: 36, fontWeight: '800', color: C.ink, letterSpacing: -1.2, lineHeight: 42 },

  // Sales card
  salesCard: {
    backgroundColor: C.ink, borderRadius: 20,
    padding: 20,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  amount: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -2, lineHeight: 46 },
  amountCents: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 6 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  trendText: { fontSize: 12, color: '#86EFAC', fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, gap: 4, paddingHorizontal: 4 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 14 },
  statLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8 },
  statValue: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14,
    borderRadius: 14, backgroundColor: '#F0EEE7',
    borderWidth: 1.5, borderColor: C.border,
  },
  actionBtnPrimary: { backgroundColor: C.ink, borderColor: C.ink },
  actionLabel: { fontSize: 11, fontWeight: '600', color: C.ink, textAlign: 'center' },
  actionLabelPrimary: { color: '#fff' },

  // Low stock alert
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 14, borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderStyle: 'dashed',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  alertIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
  },
  alertText: { flex: 1, gap: 2 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  alertSub: { fontSize: 12, color: '#A16207' },

  // Recent sales
  recentSection: {
    backgroundColor: '#F0EEE7', borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    padding: 16,
  },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  recentTitle: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  verTodo: { fontSize: 13, fontWeight: '600', color: C.accent },
  recentList: {},
  saleDiv: { height: 1, backgroundColor: C.border },
});
