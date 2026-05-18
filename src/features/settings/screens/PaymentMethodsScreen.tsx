import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, Banknote, CreditCard, ArrowLeftRight, QrCode } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentMethods'>;

type PaymentMethod = { id: string; label: string; description: string; Icon: any; enabled: boolean };

const INITIAL_METHODS: PaymentMethod[] = [
  { id: 'cash',     label: 'Efectivo',      description: 'Pago directo en mostrador',      Icon: Banknote,       enabled: true  },
  { id: 'card',     label: 'Tarjeta',       description: 'Débito y crédito con terminal',  Icon: CreditCard,     enabled: true  },
  { id: 'transfer', label: 'Transferencia', description: 'SPEI / depósito bancario',        Icon: ArrowLeftRight, enabled: true  },
  { id: 'qr',       label: 'QR / CoDi',     description: 'Cobro por código QR o CoDi',     Icon: QrCode,         enabled: false },
];

export const PaymentMethodsScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);

  const toggleMethod = (id: string) =>
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Métodos de pago</Text>
          <Text style={s.subtitle}>Activa los que aceptas en tu negocio</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          {methods.map((method, index) => (
            <View key={method.id}>
              {index > 0 && <View style={s.separator} />}
              <View style={s.row}>
                <View style={[s.iconWrap, method.enabled && s.iconWrapActive]}>
                  <method.Icon size={18} color={method.enabled ? '#fff' : colors.muted} strokeWidth={1.75} />
                </View>
                <View style={s.info}>
                  <Text style={s.label}>{method.label}</Text>
                  <Text style={s.description}>{method.description}</Text>
                </View>
                <Switch
                  value={method.enabled}
                  onValueChange={() => toggleMethod(method.id)}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          ))}
        </View>
        <Text style={s.hint}>Los métodos activos aparecen como opciones al cobrar una venta.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.canvas },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle:    { fontSize: 12, color: colors.muted },
  scroll:      { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  card:        { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16 },
  separator:   { height: 1, backgroundColor: colors.border },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  iconWrap:    { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0EEE7', alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.ink },
  info:        { flex: 1, gap: 2 },
  label:       { fontSize: 15, fontWeight: '700', color: colors.ink },
  description: { fontSize: 12, color: colors.muted },
  hint:        { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
});
