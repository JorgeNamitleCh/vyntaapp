import React, { useRef, useState, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
  Share,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Banknote, CreditCard, ArrowLeftRight, QrCode, Tag, Share2 } from 'lucide-react-native';
import { SaleDetailScreenProps } from '../../../navigation/types';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { salesService } from '../services/sales.service';
import { Sale } from '../../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { captureRef } from 'react-native-view-shot';
import { ReceiptCard, ReceiptData } from '../components/ReceiptCard';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

const PM_LABEL: Record<Sale['paymentMethod'], string> = {
  cash:     'Efectivo',
  card:     'Tarjeta',
  transfer: 'Transferencia',
  qr:       'QR',
  other:    'Otro',
};

const PM_ICON: Record<Sale['paymentMethod'], any> = {
  cash:     Banknote,
  card:     CreditCard,
  transfer: ArrowLeftRight,
  qr:       QrCode,
  other:    Tag,
};

export const SaleDetailScreen = ({ route, navigation }: SaleDetailScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const { saleId } = route.params;
  const tenant = useAuthStore(s => s.tenant);

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', tenant?.id, saleId],
    enabled: !!tenant?.id,
    queryFn: () => salesService.getSaleById(tenant!.id, saleId),
  });

  const PayIcon = sale ? (PM_ICON[sale.paymentMethod] ?? Banknote) : Banknote;
  const receiptRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const receiptData: ReceiptData | null = sale ? {
    businessName: tenant?.name ?? 'Mi negocio',
    ticketId:     sale.id.slice(-8).toUpperCase(),
    dateStr:      format(sale.createdAt, "d 'de' MMMM yyyy, HH:mm", { locale: es }),
    items:        sale.items.map(it => ({
      name:      it.productName,
      qty:       it.quantity,
      unitPrice: it.unitPrice,
      subtotal:  it.subtotal,
    })),
    discountAmount: sale.discountAmount,
    total:       sale.total,
    paymentLabel: PM_LABEL[sale.paymentMethod],
    note:        sale.note,
  } : null;

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
      {receiptData && (
        <View style={s.offscreen} pointerEvents="none">
          <ReceiptCard ref={receiptRef} data={receiptData} />
        </View>
      )}

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Venta</Text>
        <TouchableOpacity style={s.backBtn} onPress={shareReceipt} activeOpacity={0.7} disabled={sharing}>
          {sharing
            ? <ActivityIndicator size="small" color={colors.ink} />
            : <Share2 size={18} color={colors.ink} strokeWidth={1.75} />}
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {!isLoading && sale && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Meta card ── */}
          <View style={s.metaCard}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>ID</Text>
              <Text style={s.metaValue}>#{sale.id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Fecha</Text>
              <Text style={s.metaValue}>
                {format(sale.createdAt, "d 'de' MMMM, HH:mm", { locale: es })}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Pago</Text>
              <View style={s.pmRow}>
                <PayIcon size={15} color={colors.muted} strokeWidth={1.75} />
                <Text style={s.metaValue}>{PM_LABEL[sale.paymentMethod]}</Text>
              </View>
            </View>
            {sale.channel && (
              <>
                <View style={s.divider} />
                <View style={s.metaRow}>
                  <Text style={s.metaLabel}>Canal</Text>
                  <Text style={s.metaValue}>{sale.channel}</Text>
                </View>
              </>
            )}
            {sale.note && (
              <>
                <View style={s.divider} />
                <View style={s.metaRow}>
                  <Text style={s.metaLabel}>Nota</Text>
                  <Text style={[s.metaValue, { flex: 1, textAlign: 'right' }]}>{sale.note}</Text>
                </View>
              </>
            )}
          </View>

          {/* ── Items ── */}
          <Text style={s.sectionLabel}>PRODUCTOS</Text>
          <View style={s.itemsCard}>
            {sale.items.map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.itemRow}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={s.itemImg} />
                  ) : (
                    <View style={s.itemAvatar}>
                      <Text style={s.itemInitial}>{item.productName[0]?.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={s.itemInfo}>
                    <Text style={s.itemName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={s.itemQty}>{item.quantity} × ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <Text style={s.itemSubtotal}>${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Totals ── */}
          <View style={s.totalsCard}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>${sale.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            {sale.discountAmount != null && sale.discountAmount > 0 && (
              <>
                <View style={s.divider} />
                <View style={s.totalRow}>
                  <Text style={[s.totalLabel, { color: colors.accent }]}>Descuento</Text>
                  <Text style={[s.totalValue, { color: colors.accent }]}>−${sale.discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
              </>
            )}
            <View style={s.divider} />
            <View style={s.totalRow}>
              <Text style={s.grandLabel}>TOTAL</Text>
              <Text style={s.grandValue}>${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>

          {/* ── Share button ── */}
          <TouchableOpacity style={s.shareBtn} onPress={shareReceipt} activeOpacity={0.82} disabled={sharing}>
            {sharing
              ? <ActivityIndicator size="small" color={colors.ink} />
              : <>
                  <Share2 size={18} color={colors.ink} strokeWidth={1.75} />
                  <Text style={s.shareBtnText}>Compartir recibo</Text>
                </>}
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {!isLoading && !sale && (
        <View style={s.loadingWrap}>
          <Text style={{ color: colors.muted }}>Venta no encontrada</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },

  scroll: { paddingHorizontal: 20, gap: 12, paddingTop: 4 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, marginTop: 4 },

  metaCard: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  metaLabel: { width: 70, fontSize: 14, color: colors.muted, fontWeight: '500' },
  metaValue: { fontSize: 14, fontWeight: '600', color: colors.ink },
  pmRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  itemsCard: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 2,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemImg: { width: 40, height: 40, borderRadius: 8 },
  itemAvatar: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center',
  },
  itemInitial: { fontSize: 16, fontWeight: '700', color: colors.muted },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  itemQty: { fontSize: 12, color: colors.muted },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: colors.ink },

  totalsCard: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 2,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  totalLabel: { fontSize: 14, color: colors.muted, fontWeight: '500' },
  totalValue: { fontSize: 14, fontWeight: '600', color: colors.ink },
  grandLabel: { fontSize: 15, fontWeight: '700', color: colors.ink, letterSpacing: 0.3 },
  grandValue: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },

  divider: { height: 1, backgroundColor: colors.border },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offscreen: { position: 'absolute', top: -9999, left: 0 },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 15, marginTop: 4,
  },
  shareBtnText: { fontSize: 15, fontWeight: '600', color: colors.ink },
});
