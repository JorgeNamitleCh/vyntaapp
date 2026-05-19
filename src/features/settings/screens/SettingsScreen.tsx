import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { Card } from '../../../components/Card';
import { Divider } from '../../../components/Divider';
import { SectionLabel } from '../../../components/SectionLabel';
import {
  X, ChevronRight, Store, ArrowLeftRight,
  FileText, Users, CreditCard, Tag, Image,
  Download, Bell, Settings, Phone, Trash2,
} from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/auth.service';
import { Radius } from '../../../theme';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
// import { usePlan } from '../../../hooks/usePlan'; // re-habilitar con monetización

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

type RowItem = {
  label: string;
  sub?: string;
  Icon: any;
  onPress?: () => void;
  danger?: boolean;
};

const SectionRow = ({ item }: { item: RowItem }) => {
  const colors = useThemeColors();
  const row = useMemo(() => makeRowStyles(colors), [colors]);
  const tint = item.danger ? colors.error : colors.ink;
  return (
    <TouchableOpacity style={row.wrap} onPress={item.onPress} activeOpacity={0.7}>
      <View style={[row.iconWrap, item.danger && { backgroundColor: `${colors.error}12` }]}>
        <item.Icon size={18} color={tint} strokeWidth={1.75} />
      </View>
      <View style={row.info}>
        <Text style={[row.label, item.danger && { color: colors.error }]}>{item.label}</Text>
        {item.sub && <Text style={row.sub}>{item.sub}</Text>}
      </View>
      <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
    </TouchableOpacity>
  );
};

const makeRowStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  info:     { flex: 1, gap: 2 },
  label:    { fontSize: 15, fontWeight: '500', color: colors.ink },
  sub:      { fontSize: 12, color: colors.muted },
});

export const SettingsScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const { user, tenant } = useAuthStore();
  // TODO: re-habilitar cuando se active monetización
  // const { plan, isFree, isPremium, label, limits } = usePlan();

  const businessName = tenant?.name ?? 'Mi negocio';
  const displayName  = user?.displayName ?? 'Usuario';
  const email        = user?.email ?? '';
  const initials     = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  const BUSINESS_SECTION: RowItem[] = [
    { label: businessName, sub: 'México · MXN', Icon: Store, onPress: () => navigation.navigate('BusinessEdit') },
    { label: 'Cambiar de negocio', sub: '2 negocios disponibles', Icon: ArrowLeftRight, onPress: () => navigation.navigate('SwitchBusiness') },
    { label: 'Datos de facturación', sub: 'RFC, dirección', Icon: FileText, onPress: () => navigation.navigate('BillingInfo') },
    { label: 'Empleados', sub: '2 personas con acceso', Icon: Users, onPress: () => navigation.navigate('Employees') },
  ];

  const OPERATIONS_SECTION: RowItem[] = [
    { label: 'Métodos de pago', sub: 'Efectivo, tarjeta, transferencia', Icon: CreditCard, onPress: () => navigation.navigate('PaymentMethods') },
    { label: 'Impuestos', sub: 'IVA 16% incluido', Icon: Tag, onPress: () => navigation.navigate('Taxes') },
    { label: 'Logo y recibo', Icon: Image, onPress: () => navigation.navigate('LogoReceipt') },
    { label: 'Exportar datos', Icon: Download, onPress: () => navigation.navigate('ExportData') },
  ];

  const ACCOUNT_SECTION: RowItem[] = [
    { label: 'Notificaciones', Icon: Bell, onPress: () => navigation.navigate('Notifications') },
    { label: 'Preferencias', Icon: Settings, onPress: () => navigation.navigate('Preferences') },
    { label: 'Ayuda y soporte', Icon: Phone, onPress: () => navigation.navigate('HelpSupport') },
    { label: 'Eliminar cuenta', Icon: Trash2, onPress: () => navigation.navigate('DeleteAccount'), danger: true },
  ];

  const renderSection = (items: RowItem[]) => (
    <Card>
      {items.map((item, i) => (
        <View key={item.label}>
          {i > 0 && <Divider />}
          <SectionRow item={item} />
        </View>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <Text style={s.title}>Ajustes</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <X size={16} color={colors.ink} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Profile card */}
        <Card style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{displayName}</Text>
            <Text style={s.profileEmail}>{email}</Text>
          </View>
          <TouchableOpacity style={s.editBtn} activeOpacity={0.75}>
            <Text style={s.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </Card>

        {/* Plan card — oculto hasta activar monetización */}
        {false && <View style={s.planCard}>
          <View style={s.planLeft}>
            <View style={s.planIconWrap}>
              <Crown size={18} color={colors.amber} strokeWidth={1.75} />
            </View>
            <View style={s.planInfo}>
              <Text style={s.planLabel}>{label}</Text>
              {isFree ? (
                <>
                  <Text style={s.planSub}>0 de {limits.salesPerMonth} ventas este mes</Text>
                  <View style={s.planBarBg}>
                    <View style={[s.planBarFill, { width: '0%' }]} />
                  </View>
                </>
              ) : (
                <Text style={s.planSub}>
                  {isPremium ? 'Hasta 3 negocios · 10 empleados' : 'Ventas ilimitadas · 3 empleados'}
                </Text>
              )}
            </View>
          </View>
          {!isPremium && (
            <TouchableOpacity style={s.mejorarBtn} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.85}>
              <Text style={s.mejorarText}>{isFree ? 'Mejorar' : 'Premium'}</Text>
            </TouchableOpacity>
          )}
        </View>}

        <SectionLabel>NEGOCIO</SectionLabel>
        {renderSection(BUSINESS_SECTION)}

        <SectionLabel>OPERACIÓN</SectionLabel>
        {renderSection(OPERATIONS_SECTION)}

        <SectionLabel>CUENTA</SectionLabel>
        {renderSection(ACCOUNT_SECTION)}

        <TouchableOpacity style={s.signOutBtn} onPress={() => authService.signOut()} activeOpacity={0.7}>
          <Text style={s.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6,
  },
  title:    { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  profileCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar:       { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  profileInfo:  { flex: 1, gap: 2 },
  profileName:  { fontSize: 15, fontWeight: '700', color: colors.ink },
  profileEmail: { fontSize: 12, color: colors.muted },
  editBtn:      { borderWidth: 1.5, borderColor: colors.border, borderRadius: Radius.xs, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText:  { fontSize: 13, fontWeight: '600', color: colors.ink },

  planCard: {
    backgroundColor: colors.ink, borderRadius: Radius.card,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  planLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  planIconWrap:{ width: 38, height: 38, borderRadius: Radius.md, backgroundColor: 'rgba(217,119,6,0.2)', alignItems: 'center', justifyContent: 'center' },
  planInfo:    { flex: 1, gap: 3 },
  planLabel:   { fontSize: 10, fontWeight: '800', color: colors.amber, letterSpacing: 1 },
  planSub:     { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
  planBarBg:   { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 2 },
  planBarFill: { height: 3, backgroundColor: colors.amber, borderRadius: 2 },
  mejorarBtn:  { backgroundColor: colors.accent, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 9 },
  mejorarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  signOutBtn:  { alignItems: 'center', paddingVertical: 16 },
  signOutText: { fontSize: 15, fontWeight: '600', color: colors.error },
});
