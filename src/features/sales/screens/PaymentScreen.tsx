import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import {
  ChevronLeft, Banknote, CreditCard, ArrowLeftRight, QrCode,
  Store, Globe, Smartphone, ShoppingCart, MessageCircle, Package,
} from 'lucide-react-native';
import { PaymentScreenProps } from '../../../navigation/types';
import { useCartStore } from '../../../store/cartStore';
import { useSale } from '../hooks/useSale';
import { Sale } from '../../../types';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  white: '#FFFFFF',
  cardBg: '#F0EEE7',
};

type PayMethod = { id: string; label: string; Icon: any };
type Channel   = { id: string; label: string; Icon: any; color: string; dark?: boolean };

const PAY_METHODS: PayMethod[] = [
  { id: 'cash',     label: 'Efectivo',      Icon: Banknote       },
  { id: 'card',     label: 'Tarjeta',       Icon: CreditCard     },
  { id: 'transfer', label: 'Transferencia', Icon: ArrowLeftRight  },
  { id: 'qr',       label: 'QR / CoDi',     Icon: QrCode         },
];

const CHANNELS: Channel[] = [
  { id: 'local',    label: 'Venta local',   Icon: Store,         color: '#0E5C3F' },
  { id: 'whatsapp', label: 'WhatsApp',      Icon: MessageCircle, color: '#22C55E' },
  { id: 'facebook', label: 'Facebook / IG', Icon: Smartphone,    color: '#3B82F6' },
  { id: 'shopify',  label: 'Shopify',       Icon: Globe,         color: '#7C3AED' },
  { id: 'ml',       label: 'Mercado Libre', Icon: ShoppingCart,  color: '#FFD200', dark: true },
  { id: 'amazon',   label: 'Amazon',        Icon: Package,       color: '#FF9900', dark: true },
];

const QUICK_AMOUNTS = [50, 100, 200, 500];

export const PaymentScreen = ({ navigation }: PaymentScreenProps) => {
  const { items, discount, clear } = useCartStore();
  const sale = useSale();

  const [method,   setMethod]   = useState('cash');
  const [channel,  setChannel]  = useState('local');
  const [received, setReceived] = useState('');

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = (() => {
    if (!discount) return 0;
    if (discount.type === 'percent') return Math.round(subtotal * discount.value / 100 * 100) / 100;
    return Math.min(discount.value, subtotal);
  })();
  const afterDiscount = subtotal - discountAmt;
  const iva           = Math.round(afterDiscount * 0.16 * 100) / 100;
  const total         = afterDiscount + iva;
  const totalQty      = items.reduce((s, i) => s + i.qty, 0);
  const receivedNum   = parseFloat(received) || 0;
  const change        = method === 'cash' ? Math.max(0, receivedNum - total) : 0;
  const lacking       = method === 'cash' && receivedNum > 0 && receivedNum < total ? total - receivedNum : 0;
  const canConfirm    = !sale.isPending && (method !== 'cash' || receivedNum >= total);

  const handleConfirm = () => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    sale.mutate(
      { paymentMethod: method as Sale['paymentMethod'], channel },
      {
        onSuccess: () => {
          clear();
          navigation.navigate('SaleSuccess', {
            total,
            change,
            received: method === 'cash' ? receivedNum : total,
            itemCount: count,
            paymentMethod: method,
            channel,
          });
        },
        onError: () => {
          Alert.alert('Error', 'No se pudo registrar la venta. Intenta de nuevo.');
        },
      },
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* ── Header ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Cobrar</Text>
          <Text style={s.subtitle}>{totalQty} producto{totalQty !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled">

        {/* ── Total ── */}
        <View style={s.totalCard}>
          <View>
            <Text style={s.totalLabel}>TOTAL A COBRAR</Text>
            <Text style={s.totalAmount}>
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={s.totalBadge}>
            <Text style={s.totalBadgeText}>IVA{'\n'}incl.</Text>
          </View>
        </View>

        {/* ── Método de pago ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>MÉTODO DE PAGO</Text>
          <View style={s.methodList}>
            {PAY_METHODS.map((m, i) => {
              const active = method === m.id;
              return (
                <React.Fragment key={m.id}>
                  {i > 0 && <View style={s.methodDivider} />}
                  <TouchableOpacity
                    style={s.methodRow}
                    onPress={() => setMethod(m.id)}
                    activeOpacity={0.7}>
                    <View style={[s.methodIcon, active && s.methodIconActive]}>
                      <m.Icon size={18} color={active ? '#fff' : C.muted} strokeWidth={1.75} />
                    </View>
                    <Text style={[s.methodLabel, active && s.methodLabelActive]}>
                      {m.label}
                    </Text>
                    <View style={[s.radio, active && s.radioActive]}>
                      {active && <View style={s.radioDot} />}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* ── Efectivo recibido ── */}
        {method === 'cash' && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>EFECTIVO RECIBIDO</Text>
            <View style={s.cashCard}>
              <TextInput
                style={s.cashInput}
                value={received}
                onChangeText={setReceived}
                placeholder="$0.00"
                placeholderTextColor="rgba(14,22,20,0.2)"
                keyboardType="number-pad"
                textAlign="center"
              />
              {receivedNum > 0 && (
                <View style={[
                  s.changeRow,
                  { backgroundColor: change > 0 ? '#F0FDF4' : lacking > 0 ? '#FEF2F2' : '#F0FDF4' },
                ]}>
                  <Text style={[s.changeLabel, { color: change > 0 || receivedNum === total ? '#15803D' : '#DC2626' }]}>
                    {change > 0 ? 'Cambio' : lacking > 0 ? 'Falta' : '✓ Exacto'}
                  </Text>
                  {(change > 0 || lacking > 0) && (
                    <Text style={[s.changeAmt, { color: change > 0 ? '#15803D' : '#DC2626' }]}>
                      ${(change > 0 ? change : lacking).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <View style={s.quickRow}>
              {QUICK_AMOUNTS.map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[s.quickChip, receivedNum === amt && s.quickChipActive]}
                  onPress={() => setReceived(String(amt))}
                  activeOpacity={0.75}>
                  <Text style={[s.quickText, receivedNum === amt && s.quickTextActive]}>
                    ${amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Canal de venta ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>CANAL DE VENTA</Text>
          <View style={s.channelGrid}>
            {CHANNELS.map(ch => {
              const active = channel === ch.id;
              const iconColor = active ? (ch.dark ? C.ink : '#fff') : C.muted;
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[
                    s.channelCard,
                    active && { borderColor: ch.color, backgroundColor: `${ch.color}18` },
                  ]}
                  onPress={() => setChannel(ch.id)}
                  activeOpacity={0.75}>
                  <View style={[
                    s.channelIcon,
                    { backgroundColor: active ? ch.color : C.cardBg },
                  ]}>
                    <ch.Icon size={15} color={iconColor} strokeWidth={1.75} />
                  </View>
                  <Text
                    style={[s.channelLabel, active && { color: ch.dark ? '#78600A' : ch.color, fontWeight: '700' }]}
                    numberOfLines={1}>
                    {ch.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.confirmBtn, !canConfirm && s.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
          activeOpacity={0.85}>
          {sale.isPending ? (
            <ActivityIndicator color="#fff" style={{ flex: 1 }} />
          ) : (
            <>
              <Text style={s.confirmText}>Confirmar pago</Text>
              <View style={s.confirmAmt}>
                <Text style={s.confirmAmtText}>
                  ${total.toLocaleString('es-MX')}
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },

  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { gap: 1 },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.8 },
  subtitle: { fontSize: 13, color: C.muted },

  scroll: { paddingHorizontal: 20, paddingTop: 14, gap: 20 },

  totalCard: {
    backgroundColor: C.ink, borderRadius: 20,
    paddingVertical: 20, paddingHorizontal: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  totalLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 1, marginBottom: 4 },
  totalAmount: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1.5 },
  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center',
  },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 15 },

  section: { gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1 },

  methodList: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, overflow: 'hidden',
  },
  methodDivider: { height: 1, backgroundColor: C.border },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  methodIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.cardBg, alignItems: 'center', justifyContent: 'center',
  },
  methodIconActive: { backgroundColor: C.ink },
  methodLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: C.muted },
  methodLabelActive: { color: C.ink, fontWeight: '700' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: C.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink },

  cashCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    overflow: 'hidden', alignItems: 'center',
  },
  cashInput: {
    fontSize: 40, fontWeight: '800', color: C.ink,
    letterSpacing: -1.5, width: '100%', textAlign: 'center',
    paddingTop: 18, paddingBottom: 18, padding: 0,
  },
  changeRow: {
    width: '100%', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 11,
  },
  changeLabel: { fontSize: 14, fontWeight: '600' },
  changeAmt: { fontSize: 17, fontWeight: '800' },

  quickRow: { flexDirection: 'row', gap: 8 },
  quickChip: {
    flex: 1, backgroundColor: C.white,
    borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
    paddingVertical: 10, alignItems: 'center',
  },
  quickChipActive: { backgroundColor: C.ink, borderColor: C.ink },
  quickText: { fontSize: 14, fontWeight: '700', color: C.ink },
  quickTextActive: { color: '#fff' },

  channelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  channelCard: {
    width: '30%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 11,
  },
  channelIcon: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  channelLabel: { fontSize: 11, fontWeight: '600', color: C.muted, flex: 1 },

  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  confirmBtn: {
    backgroundColor: C.accent, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#fff' },
  confirmAmt: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  confirmAmtText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
