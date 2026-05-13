import React from 'react';
import {
  View, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import {
  X, ChevronRight, Store, ArrowLeftRight,
  FileText, Users, CreditCard, Tag, Image,
  Download, Bell, Settings, Phone, Crown,
} from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/auth.service';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

const C = {
  canvas: '#F4F2EC',
  ink:    '#0E1614',
  accent: '#0E5C3F',
  muted:  '#6B7280',
  border: '#E5E3DC',
  white:  '#FFFFFF',
  red:    '#DC2626',
};

type RowItem = {
  label: string;
  sub?: string;
  Icon: any;
  onPress?: () => void;
};

const SectionRow = ({ item }: { item: RowItem }) => (
  <TouchableOpacity
    style={row.wrap}
    onPress={item.onPress}
    activeOpacity={0.7}>
    <View style={row.iconWrap}>
      <item.Icon size={18} color={C.ink} strokeWidth={1.75} />
    </View>
    <View style={row.info}>
      <Text style={row.label}>{item.label}</Text>
      {item.sub && <Text style={row.sub}>{item.sub}</Text>}
    </View>
    <ChevronRight size={16} color={C.muted} strokeWidth={2} />
  </TouchableOpacity>
);

const Divider = () => <View style={row.divider} />;

const row = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center' },
  info:     { flex: 1, gap: 2 },
  label:    { fontSize: 15, fontWeight: '500', color: C.ink },
  sub:      { fontSize: 12, color: C.muted },
  divider:  { height: 1, backgroundColor: C.border },
});

export const SettingsScreen = ({ navigation }: Props) => {
  const { user, tenant } = useAuthStore();

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
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Ajustes</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <X size={16} color={C.ink} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Profile card */}
        <View style={s.profileCard}>
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
        </View>

        {/* Plan card */}
        <View style={s.planCard}>
          <View style={s.planLeft}>
            <View style={s.planIconWrap}>
              <Crown size={18} color="#D97706" strokeWidth={1.75} />
            </View>
            <View style={s.planInfo}>
              <Text style={s.planLabel}>PLAN GRATUITO</Text>
              <Text style={s.planSub}>23 de 50 ventas este mes</Text>
              <View style={s.planBarBg}>
                <View style={[s.planBarFill, { width: `${(23 / 50) * 100}%` }]} />
              </View>
            </View>
          </View>
          <TouchableOpacity style={s.mejorarBtn} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.85}>
            <Text style={s.mejorarText}>Mejorar</Text>
          </TouchableOpacity>
        </View>

        {/* NEGOCIO */}
        <Text style={s.sectionLabel}>NEGOCIO</Text>
        <View style={s.card}>
          {BUSINESS_SECTION.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <Divider />}
              <SectionRow item={item} />
            </View>
          ))}
        </View>

        {/* OPERACIÓN */}
        <Text style={s.sectionLabel}>OPERACIÓN</Text>
        <View style={s.card}>
          {OPERATIONS_SECTION.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <Divider />}
              <SectionRow item={item} />
            </View>
          ))}
        </View>

        {/* CUENTA */}
        <Text style={s.sectionLabel}>CUENTA</Text>
        <View style={s.card}>
          {ACCOUNT_SECTION.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <Divider />}
              <SectionRow item={item} />
            </View>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={s.signOutBtn} onPress={() => authService.signOut()} activeOpacity={0.7}>
          <Text style={s.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.canvas },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6,
  },
  title:    { fontSize: 32, fontWeight: '800', color: C.ink, letterSpacing: -1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
  },
  avatarText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  profileInfo:   { flex: 1, gap: 2 },
  profileName:   { fontSize: 15, fontWeight: '700', color: C.ink },
  profileEmail:  { fontSize: 12, color: C.muted },
  editBtn: {
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: C.ink },

  planCard: {
    backgroundColor: C.ink, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  planLeft:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  planIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(217,119,6,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  planInfo:    { flex: 1, gap: 3 },
  planLabel:   { fontSize: 10, fontWeight: '800', color: '#D97706', letterSpacing: 1 },
  planSub:     { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
  planBarBg:   { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 2 },
  planBarFill: { height: 3, backgroundColor: '#D97706', borderRadius: 2 },
  mejorarBtn: {
    backgroundColor: C.accent, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  mejorarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8, marginTop: 4, marginBottom: -4,
  },
  card: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16,
  },

  signOutBtn: { alignItems: 'center', paddingVertical: 16 },
  signOutText: { fontSize: 15, fontWeight: '600', color: C.red },
});
