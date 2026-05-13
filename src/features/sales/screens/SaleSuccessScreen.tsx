import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { Text } from '../../../components/Text';
import { X, ReceiptText } from 'lucide-react-native';
import { SaleSuccessScreenProps } from '../../../navigation/types';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  white: '#FFFFFF',
};

const METHOD_LABELS: Record<string, string> = {
  cash:     'efectivo',
  card:     'tarjeta',
  transfer: 'transferencia',
  qr:       'QR / CoDi',
};

const CHANNEL_LABELS: Record<string, string> = {
  local:    'Venta local',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook / IG',
  shopify:  'Shopify',
  ml:       'Mercado Libre',
  amazon:   'Amazon',
};

const genTicket = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return `#${chars[Math.floor(Math.random() * chars.length)]}${Math.floor(1000 + Math.random() * 9000)}`;
};

export const SaleSuccessScreen = ({ navigation, route }: SaleSuccessScreenProps) => {
  const { total, change, received, itemCount, paymentMethod, channel } = route.params;
  const ticket = useMemo(genTicket, []);

  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, damping: 12, stiffness: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const [whole, cents] = total.toFixed(2).split('.');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* X top-right */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          activeOpacity={0.7}>
          <X size={18} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── All content centered ── */}
      <View style={s.content}>
        {/* Checkmark */}
        <Animated.View style={[s.checkCircle, { transform: [{ scale }] }]}>
          <Text style={s.checkMark}>✓</Text>
        </Animated.View>

        <Animated.View style={[s.heroBlock, { opacity }]}>
          <Text style={s.ventaLabel}>VENTA COMPLETA</Text>

          <View style={s.amountRow}>
            <Text style={s.amountWhole}>${whole}</Text>
            <Text style={s.amountDot}> . </Text>
            <Text style={s.amountCents}>{cents}</Text>
          </View>

          <Text style={s.amountSub}>
            Pagado con {METHOD_LABELS[paymentMethod] ?? paymentMethod} · {itemCount} producto{itemCount !== 1 ? 's' : ''}
          </Text>
        </Animated.View>

        {/* Summary card */}
        <Animated.View style={[s.summaryCard, { opacity }]}>
          {paymentMethod === 'cash' && (
            <>
              <View style={s.row}>
                <Text style={s.rowLabel}>Recibido</Text>
                <Text style={s.rowVal}>
                  ${received.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={s.row}>
                <Text style={s.rowLabel}>Cambio</Text>
                <Text style={[s.rowVal, { color: C.accent }]}>
                  ${change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={s.divider} />
            </>
          )}
          <View style={s.row}>
            <Text style={s.rowLabel}>Canal de venta</Text>
            <Text style={s.rowVal}>{CHANNEL_LABELS[channel] ?? channel}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.rowLabel}>Ticket</Text>
            <Text style={s.rowVal}>{ticket}</Text>
          </View>
        </Animated.View>

        {/* ── Buttons (inside centered block) ── */}
        <Animated.View style={[s.buttons, { opacity }]}>
          <TouchableOpacity style={s.whatsappBtn} activeOpacity={0.82}>
            <ReceiptText size={18} color={C.ink} strokeWidth={1.75} />
            <Text style={s.whatsappText}>Enviar recibo por WhatsApp</Text>
          </TouchableOpacity>

          <View style={s.footerRow}>
            <TouchableOpacity
              style={s.cerrarBtn}
              onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
              activeOpacity={0.75}>
              <Text style={s.cerrarText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.newSaleBtn}
              onPress={() => navigation.navigate('POS')}
              activeOpacity={0.85}>
              <Text style={s.newSaleText}>Nueva venta</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },

  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 20,
  },

  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  checkMark: { fontSize: 36, color: '#fff', fontWeight: '800', lineHeight: 44 },

  heroBlock: { alignItems: 'center', gap: 6 },
  ventaLabel: {
    fontSize: 11, fontWeight: '800', color: C.accent,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end' },
  amountWhole: { fontSize: 52, fontWeight: '800', color: C.ink, letterSpacing: -2, lineHeight: 58 },
  amountDot:   { fontSize: 32, fontWeight: '700', color: C.ink, lineHeight: 52, paddingBottom: 2 },
  amountCents: { fontSize: 32, fontWeight: '700', color: C.ink, lineHeight: 52, paddingBottom: 2 },
  amountSub:   { fontSize: 13, color: C.muted },

  summaryCard: {
    width: '100%',
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 18, paddingVertical: 2,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13,
  },
  divider: { height: 1, backgroundColor: C.border },
  rowLabel: { fontSize: 14, color: C.muted },
  rowVal:   { fontSize: 14, fontWeight: '700', color: C.ink },

  buttons: { width: '100%', gap: 10 },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingVertical: 14,
  },
  whatsappText: { fontSize: 15, fontWeight: '600', color: C.ink },

  footerRow: { flexDirection: 'row', gap: 10 },
  cerrarBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', backgroundColor: C.canvas,
  },
  cerrarText: { fontSize: 15, fontWeight: '600', color: C.ink },
  newSaleBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    backgroundColor: C.accent, alignItems: 'center',
  },
  newSaleText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
