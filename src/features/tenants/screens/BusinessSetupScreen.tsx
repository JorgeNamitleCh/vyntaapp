import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/Text';
import {
  ChevronLeft,
  Percent,
  PlusCircle,
  MinusCircle,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  QrCode,
} from 'lucide-react-native';
import { authService } from '../../auth/services/auth.service';
import { useCreateBusiness } from '../hooks/useCreateBusiness';
import { BusinessSetupScreenProps } from '../../../navigation/types';
import { VatMode } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type VatOption = {
  id: VatMode;
  Icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  description: string;
};

const VAT_OPTIONS: VatOption[] = [
  {
    id: 'included',
    Icon: Percent,
    label: 'Incluido en el precio',
    description: 'El precio ya incluye IVA (lo más común)',
  },
  {
    id: 'added',
    Icon: PlusCircle,
    label: 'Se suma al total',
    description: 'Se agrega IVA al momento de cobrar',
  },
  {
    id: 'none',
    Icon: MinusCircle,
    label: 'No manejo IVA',
    description: 'Régimen simplificado o sin obligación',
  },
];

type PaymentMethod = {
  id: string;
  Icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  label: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', Icon: Banknote, label: 'Efectivo' },
  { id: 'card', Icon: CreditCard, label: 'Tarjeta' },
  { id: 'transfer', Icon: ArrowLeftRight, label: 'Transferencia' },
  { id: 'qr', Icon: QrCode, label: 'QR / CoDi' },
];

export const BusinessSetupScreen = ({ navigation, route }: BusinessSetupScreenProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => make_styles(colors), [colors]);

  const [vatMode, setVatMode] = useState<VatMode>('included');
  const [paymentMethods, setPaymentMethods] = useState<Set<string>>(new Set(['cash']));
  const { createBusiness, isLoading, error } = useCreateBusiness();

  const togglePayment = (id: string) => {
    setPaymentMethods(prev => {
      const next = new Set(prev);
      if (next.has(id) && next.size > 1) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = async () => {
    const { name, businessType, channels, currency } = route.params;
    await createBusiness({
      businessName: name,
      businessType,
      channels,
      vatMode,
      paymentMethods: Array.from(paymentMethods),
      currency,
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.progressDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
        <TouchableOpacity onPress={() => authService.signOut()}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.stepLabel}>PASO 3 DE 3</Text>
        <Text style={styles.title}>Configura tu caja</Text>
        <Text style={styles.subtitle}>
          Puedes cambiar esto después en los ajustes de tu negocio.
        </Text>

        {/* IVA */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>IVA</Text>
          <View style={styles.optionList}>
            {VAT_OPTIONS.map(({ id, Icon, label, description }) => {
              const active = vatMode === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.optionCard, active && styles.optionCardActive]}
                  onPress={() => setVatMode(id)}
                  activeOpacity={0.75}>
                  <View style={[styles.optionIcon, active && styles.optionIconActive]}>
                    <Icon size={18} color={active ? '#fff' : colors.ink} strokeWidth={1.75} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {label}
                    </Text>
                    <Text style={styles.optionDescription}>{description}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MÉTODOS DE PAGO</Text>
          <Text style={styles.sectionHint}>Selecciona todos los que aceptas</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map(({ id, Icon, label }) => {
              const active = paymentMethods.has(id);
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.paymentChip, active && styles.paymentChipActive]}
                  onPress={() => togglePayment(id)}
                  activeOpacity={0.75}>
                  <Icon size={18} color={active ? '#fff' : colors.ink} strokeWidth={1.75} />
                  <Text style={[styles.paymentLabel, active && styles.paymentLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreate}
          disabled={isLoading}
          activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Crear negocio  →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const make_styles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 24, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.ink },
  skipText: { fontSize: 15, color: colors.muted, fontWeight: '500', width: 38, textAlign: 'right' },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 24 },
  stepLabel: { fontSize: 11, fontWeight: '700', color: colors.accent, letterSpacing: 0.8, marginBottom: -12 },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1, marginBottom: -12 },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20 },

  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  sectionHint: { fontSize: 12, color: colors.muted, marginTop: -6 },

  // IVA options
  optionList: { gap: 8 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  optionCardActive: { borderColor: colors.ink },
  optionIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  optionIconActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  optionLabelActive: { color: colors.ink },
  optionDescription: { fontSize: 12, color: colors.muted, lineHeight: 16 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink },

  // Payment chips
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paymentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  paymentChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  paymentLabelActive: { color: '#fff' },

  error: { fontSize: 13, color: '#DC2626' },

  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  createBtn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
