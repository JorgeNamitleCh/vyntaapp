import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { X, Crown, Check } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Paywall'>;

const C = {
  bg:      '#0E1614',
  card:    '#162118',
  accent:  '#0E5C3F',
  border:  'rgba(255,255,255,0.1)',
  white:   '#FFFFFF',
  muted:   'rgba(255,255,255,0.45)',
  amber:   '#D97706',
  amberBg: 'rgba(217,119,6,0.18)',
};

type Tier = 'pro' | 'premium';

const TIERS: Record<Tier, {
  label: string;
  headline: string;
  subhead: string;
  features: string[];
  monthly: number;
  annual: number;
  savePct: number;
}> = {
  pro: {
    label:    'VYNTA PRO',
    headline: 'Crece sin límites.',
    subhead:  'Desbloquea todo Vynta. Cancela cuando\nquieras, sin contratos.',
    features: [
      'Ventas ilimitadas',
      'Hasta 3 empleados con permisos',
      'Reportes avanzados y exportación',
      'Descuentos en ventas',
      'Logo y recibo personalizado',
    ],
    monthly:  99,
    annual:   1100,
    savePct:  7,
  },
  premium: {
    label:    'VYNTA PREMIUM',
    headline: 'Todo Pro, más poder.',
    subhead:  'Para negocios que crecen rápido.\nSin límites, sin excusas.',
    features: [
      'Todo lo incluido en Pro',
      'Hasta 3 negocios en una cuenta',
      'Hasta 10 empleados con permisos',
      'Inventario por sucursal',
      'Soporte prioritario por WhatsApp',
    ],
    monthly:  119,
    annual:   1400,
    savePct:  2,
  },
};

export const PaywallScreen = ({ navigation }: Props) => {
  const [tier,   setTier]   = useState<Tier>('pro');
  const [period, setPeriod] = useState<'monthly' | 'annual'>('annual');

  const t = TIERS[tier];
  const annualSaving = t.monthly * 12 - t.annual;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.closeRow}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <X size={16} color={C.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} bounces={false}>

        {/* Tier toggle */}
        <View style={s.tierToggle}>
          {(['pro', 'premium'] as Tier[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.tierBtn, tier === t && s.tierBtnActive]}
              onPress={() => setTier(t)}
              activeOpacity={0.85}>
              <Text style={[s.tierBtnText, tier === t && s.tierBtnTextActive]}>
                {t === 'pro' ? 'Pro' : 'Premium'}
              </Text>
              {t === 'premium' && (
                <View style={s.popularBadge}>
                  <Text style={s.popularText}>Popular</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Badge */}
        <View style={s.badge}>
          <Crown size={11} color={C.amber} strokeWidth={2} />
          <Text style={s.badgeText}>{t.label}</Text>
        </View>

        {/* Headline */}
        <Text style={s.headline}>{t.headline}</Text>
        <Text style={s.subhead}>{t.subhead}</Text>

        {/* Features */}
        <View style={s.features}>
          {t.features.map(feat => (
            <View key={feat} style={s.featureRow}>
              <View style={s.checkCircle}>
                <Check size={11} color={C.white} strokeWidth={3} />
              </View>
              <Text style={s.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        <View style={s.divider} />

        {/* Mensual */}
        <TouchableOpacity
          style={[s.planCard, period === 'monthly' && s.planCardActive]}
          onPress={() => setPeriod('monthly')}
          activeOpacity={0.85}>
          <View style={[s.radio, period === 'monthly' && s.radioActive]}>
            {period === 'monthly' && <View style={s.radioDot} />}
          </View>
          <View style={s.planInfo}>
            <Text style={s.planName}>Mensual</Text>
            <Text style={s.planSub}>Cancela cuando quieras</Text>
          </View>
          <View style={s.priceCol}>
            <Text style={s.priceAmt}>${t.monthly.toLocaleString('es-MX')}</Text>
            <Text style={s.pricePeriod}>/mes</Text>
          </View>
        </TouchableOpacity>

        {/* Anual */}
        <TouchableOpacity
          style={[s.planCard, period === 'annual' && s.planCardActive]}
          onPress={() => setPeriod('annual')}
          activeOpacity={0.85}>
          <View style={[s.radio, period === 'annual' && s.radioActive]}>
            {period === 'annual' && <View style={s.radioDot} />}
          </View>
          <View style={s.planInfo}>
            <View style={s.planNameRow}>
              <Text style={s.planName}>Anual</Text>
              <View style={s.discountBadge}>
                <Text style={s.discountText}>Ahorra ${annualSaving}</Text>
              </View>
            </View>
            <Text style={s.planSub}>${Math.round(t.annual / 12).toLocaleString('es-MX')}/mes · facturado anual</Text>
          </View>
          <View style={s.priceCol}>
            <Text style={s.priceAmt}>${t.annual.toLocaleString('es-MX')}</Text>
            <Text style={s.pricePeriod}>/año</Text>
          </View>
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity style={s.ctaBtn} activeOpacity={0.88}>
          <Text style={s.ctaText}>Empezar 14 días gratis</Text>
        </TouchableOpacity>

        <Text style={s.footnote}>
          {period === 'annual'
            ? `Luego $${t.annual.toLocaleString('es-MX')}/año · Renovación automática`
            : `Luego $${t.monthly}/mes · Renovación automática`}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  closeRow: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 0 },

  tierToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, padding: 4, marginBottom: 24,
  },
  tierBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 9,
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  tierBtnActive:     { backgroundColor: C.accent },
  tierBtnText:       { fontSize: 14, fontWeight: '600', color: C.muted },
  tierBtnTextActive: { color: C.white },
  popularBadge: {
    backgroundColor: C.amberBg, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  popularText: { fontSize: 9, fontWeight: '700', color: C.amber, letterSpacing: 0.5 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.amberBg, alignSelf: 'flex-start',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: C.amber, letterSpacing: 1 },

  headline: { fontSize: 40, fontWeight: '800', color: C.white, letterSpacing: -1.2, lineHeight: 46, marginBottom: 10 },
  subhead:  { fontSize: 14, color: C.muted, lineHeight: 20, marginBottom: 24 },

  features:    { gap: 14, marginBottom: 24 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, color: C.white, fontWeight: '500', flex: 1 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },

  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10,
  },
  planCardActive: { borderColor: C.accent },
  radio:          { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:    { borderColor: C.accent },
  radioDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent },
  planInfo:       { flex: 1, gap: 3 },
  planNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName:       { fontSize: 15, fontWeight: '700', color: C.white },
  planSub:        { fontSize: 12, color: C.muted },
  discountBadge:  { backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  discountText:   { fontSize: 11, fontWeight: '700', color: '#4ADE80' },
  priceCol:       { alignItems: 'flex-end' },
  priceAmt:       { fontSize: 22, fontWeight: '800', color: C.white, letterSpacing: -0.5 },
  pricePeriod:    { fontSize: 12, color: C.muted, fontWeight: '500' },

  ctaBtn:  { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, marginBottom: 14 },
  ctaText: { fontSize: 17, fontWeight: '700', color: C.white },
  footnote:{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontWeight: '500' },
});
