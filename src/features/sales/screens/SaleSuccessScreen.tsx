import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { Card } from '../../../components/Card';
import { Divider } from '../../../components/Divider';
import { X, ReceiptText } from 'lucide-react-native';
import { Radius } from '../../../theme';
import { SaleSuccessScreenProps } from '../../../navigation/types';
import { captureRef } from 'react-native-view-shot';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReceiptCard, ReceiptData } from '../components/ReceiptCard';
import { useAuthStore } from '../../../store/authStore';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';


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
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const { total, change, received, itemCount, paymentMethod, channel } = route.params;
  const ticket   = useMemo(genTicket, []);
  const tenant   = useAuthStore(s => s.tenant);
  const receiptRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, damping: 12, stiffness: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const [whole, cents] = total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.');

  const receiptData: ReceiptData = {
    businessName: tenant?.name ?? 'Mi negocio',
    ticketId:     ticket.replace('#', ''),
    dateStr:      format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es }),
    items:        [{ name: `${itemCount} producto${itemCount !== 1 ? 's' : ''}`, qty: 1, unitPrice: total, subtotal: total }],
    total,
    paymentLabel: METHOD_LABELS[paymentMethod] ?? paymentMethod,
  };

  const shareReceipt = async () => {
    if (!receiptRef.current || sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(receiptRef, { format: 'png', quality: 1 });
      await Share.share({ url: uri });
    } catch (e) {
      console.warn('share error', e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* Off-screen receipt for PNG capture */}
      <View style={s.offscreen} pointerEvents="none">
        <ReceiptCard ref={receiptRef} data={receiptData} />
      </View>

      {/* X top-right */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          activeOpacity={0.7}>
          <X size={18} color={colors.ink} strokeWidth={2} />
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
                <Text style={[s.rowVal, { color: colors.accent }]}>
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
          <TouchableOpacity style={s.whatsappBtn} activeOpacity={0.82} onPress={shareReceipt} disabled={sharing}>
            {sharing
              ? <ActivityIndicator size="small" color={colors.ink} />
              : <>
                  <ReceiptText size={18} color={colors.ink} strokeWidth={1.75} />
                  <Text style={s.whatsappText}>Compartir recibo</Text>
                </>}
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

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  offscreen: { position: 'absolute', top: -9999, left: 0 },

  topBar: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 20,
  },

  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  checkMark: { fontSize: 36, color: '#fff', fontWeight: '800', lineHeight: 44 },

  heroBlock: { alignItems: 'center', gap: 6 },
  ventaLabel: {
    fontSize: 11, fontWeight: '800', color: colors.accent,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end' },
  amountWhole: { fontSize: 52, fontWeight: '800', color: colors.ink, letterSpacing: -2, lineHeight: 58 },
  amountDot:   { fontSize: 32, fontWeight: '700', color: colors.ink, lineHeight: 52, paddingBottom: 2 },
  amountCents: { fontSize: 32, fontWeight: '700', color: colors.ink, lineHeight: 52, paddingBottom: 2 },
  amountSub:   { fontSize: 13, color: colors.muted },

  summaryCard: {
    width: '100%',
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 18, paddingVertical: 2,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13,
  },
  divider: { height: 1, backgroundColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.muted },
  rowVal:   { fontSize: 14, fontWeight: '700', color: colors.ink },

  buttons: { width: '100%', gap: 10 },
  whatsappBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 14,
  },
  whatsappText: { fontSize: 15, fontWeight: '600', color: colors.ink },

  footerRow: { flexDirection: 'row', gap: 10 },
  cerrarBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.canvas,
  },
  cerrarText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  newSaleBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    backgroundColor: colors.accent, alignItems: 'center',
  },
  newSaleText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
