import React, { useState } from 'react';
import {
  View, TouchableOpacity, Switch, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Banknote, CreditCard, ArrowLeftRight, QrCode } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentMethods'>;

const C = {
  canvas: '#F4F2EC', ink: '#0E1614', accent: '#0E5C3F',
  muted: '#6B7280', border: '#E5E3DC', white: '#FFFFFF',
};

type PaymentMethod = { id: string; label: string; description: string; Icon: any; enabled: boolean };

const INITIAL_METHODS: PaymentMethod[] = [
  { id: 'cash',     label: 'Efectivo',      description: 'Pago directo en mostrador',      Icon: Banknote,       enabled: true  },
  { id: 'card',     label: 'Tarjeta',       description: 'Débito y crédito con terminal',  Icon: CreditCard,     enabled: true  },
  { id: 'transfer', label: 'Transferencia', description: 'SPEI / depósito bancario',        Icon: ArrowLeftRight, enabled: true  },
  { id: 'qr',       label: 'QR / CoDi',     description: 'Cobro por código QR o CoDi',     Icon: QrCode,         enabled: false },
];

export const PaymentMethodsScreen = ({ navigation }: Props) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);

  const toggleMethod = (id: string) =>
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
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
                  <method.Icon size={18} color={method.enabled ? '#fff' : C.muted} strokeWidth={1.75} />
                </View>
                <View style={s.info}>
                  <Text style={s.label}>{method.label}</Text>
                  <Text style={s.description}>{method.description}</Text>
                </View>
                <Switch
                  value={method.enabled}
                  onValueChange={() => toggleMethod(method.id)}
                  trackColor={{ false: C.border, true: C.accent }}
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

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.canvas },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  subtitle:    { fontSize: 12, color: C.muted },
  scroll:      { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  card:        { backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16 },
  separator:   { height: 1, backgroundColor: C.border },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  iconWrap:    { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0EEE7', alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: C.ink },
  info:        { flex: 1, gap: 2 },
  label:       { fontSize: 15, fontWeight: '700', color: C.ink },
  description: { fontSize: 12, color: C.muted },
  hint:        { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
});
