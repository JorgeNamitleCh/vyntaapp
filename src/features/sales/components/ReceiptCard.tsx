import React, { forwardRef, useMemo } from 'react';
import { View, StyleSheet, Text as RNText, Image } from 'react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

const LOGO = require('../../../../assets/images/logo.png');

export type ReceiptData = {
  businessName: string;
  ticketId: string;
  dateStr: string;
  items: { name: string; qty: number; unitPrice: number; subtotal: number }[];
  discountAmount?: number;
  total: number;
  paymentLabel: string;
  note?: string;
};

export const ReceiptCard = forwardRef<View, { data: ReceiptData }>(({ data }, ref) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const ivaAmt  = Math.round((data.total * 16 / 116) * 100) / 100;
  const baseAmt = data.total - ivaAmt;

  return (
    <View ref={ref} collapsable={false} style={s.card}>
      {/* Logo */}
      <Image source={LOGO} style={s.logo} resizeMode="contain" />

      {/* Header */}
      <RNText style={s.bizName}>{data.businessName}</RNText>
      <RNText style={s.sub}>{data.dateStr}</RNText>
      <RNText style={s.ticket}>#{data.ticketId}</RNText>

      <View style={s.divider} />

      {/* Items */}
      {data.items.map((it, i) => (
        <View key={i} style={s.itemRow}>
          <RNText style={s.itemQty}>{it.qty}x</RNText>
          <RNText style={s.itemName} numberOfLines={2}>{it.name}</RNText>
          <RNText style={s.itemAmt}>${it.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</RNText>
        </View>
      ))}

      <View style={s.divider} />

      {/* Totals */}
      <View style={s.totalRow}>
        <RNText style={s.totalLabel}>Base</RNText>
        <RNText style={s.totalVal}>${baseAmt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</RNText>
      </View>
      <View style={s.totalRow}>
        <RNText style={s.totalLabel}>IVA 16%</RNText>
        <RNText style={s.totalVal}>${ivaAmt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</RNText>
      </View>
      {data.discountAmount != null && data.discountAmount > 0 && (
        <View style={s.totalRow}>
          <RNText style={[s.totalLabel, { color: colors.accent }]}>Descuento</RNText>
          <RNText style={[s.totalVal, { color: colors.accent }]}>−${data.discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</RNText>
        </View>
      )}

      <View style={s.dividerThick} />

      <View style={s.totalRow}>
        <RNText style={s.grandLabel}>TOTAL</RNText>
        <RNText style={s.grandVal}>${data.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</RNText>
      </View>

      <View style={s.divider} />

      <View style={s.totalRow}>
        <RNText style={s.totalLabel}>Pago</RNText>
        <RNText style={s.totalVal}>{data.paymentLabel}</RNText>
      </View>

      {data.note ? (
        <>
          <View style={s.divider} />
          <RNText style={s.note}>{data.note}</RNText>
        </>
      ) : null}

      {/* Footer */}
      <View style={s.divider} />
      <Image source={LOGO} style={s.footerLogo} resizeMode="contain" />
    </View>
  );
});

const make_s = (colors: ThemeColors) => StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#FFFFFF',
    padding: 24,
    gap: 4,
  },
  logo: {
    width: 100,
    height: 32,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bizName: { fontSize: 20, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 2 },
  sub:     { fontSize: 12, color: colors.muted, textAlign: 'center' },
  ticket:  { fontSize: 12, color: colors.muted, textAlign: 'center', marginBottom: 4 },

  divider:      { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  dividerThick: { height: 1.5, backgroundColor: colors.ink, marginVertical: 10 },

  itemRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingVertical: 3 },
  itemQty:   { fontSize: 13, color: colors.muted, width: 22 },
  itemName:  { fontSize: 13, color: colors.ink, flex: 1 },
  itemAmt:   { fontSize: 13, fontWeight: '600', color: colors.ink },

  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalLabel: { fontSize: 13, color: colors.muted },
  totalVal:   { fontSize: 13, fontWeight: '600', color: colors.ink },
  grandLabel: { fontSize: 15, fontWeight: '800', color: colors.ink },
  grandVal:   { fontSize: 17, fontWeight: '800', color: colors.ink },

  note:      { fontSize: 12, color: colors.muted, fontStyle: 'italic' },
  footerLogo: { width: 60, height: 20, alignSelf: 'center', marginTop: 4, opacity: 0.35 },
});
