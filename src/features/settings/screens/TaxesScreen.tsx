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
import { ChevronLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'Taxes'>;

const TAX_OPTIONS = ['0%', '8%', '16%'];

export const TaxesScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [taxIncluded, setTaxIncluded]       = useState(true);
  const [taxRate, setTaxRate]               = useState('16%');
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Impuestos</Text>
          <Text style={s.subtitle}>Configuración de IVA y facturación</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>IVA</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={s.switchInfo}>
              <Text style={s.switchLabel}>IVA incluido en el precio</Text>
              <Text style={s.switchDesc}>Los precios ya incluyen IVA al cobrar</Text>
            </View>
            <Switch value={taxIncluded} onValueChange={setTaxIncluded} trackColor={{ false: colors.border, true: colors.accent }} thumbColor="#fff" />
          </View>
          <View style={s.separator} />
          <View style={s.rateSection}>
            <Text style={s.switchLabel}>Tasa de IVA</Text>
            <View style={s.rateRow}>
              {TAX_OPTIONS.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[s.rateChip, taxRate === rate && s.rateChipActive]}
                  onPress={() => setTaxRate(rate)}
                  activeOpacity={0.75}>
                  <Text style={[s.rateChipText, taxRate === rate && s.rateChipTextActive]}>{rate}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={s.sectionLabel}>FACTURACIÓN</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={s.switchInfo}>
              <Text style={s.switchLabel}>Ofrecer factura al cliente</Text>
              <Text style={s.switchDesc}>Solicitar datos para CFDI después de la venta</Text>
            </View>
            <Switch value={invoiceEnabled} onValueChange={setInvoiceEnabled} trackColor={{ false: colors.border, true: colors.accent }} thumbColor="#fff" />
          </View>
        </View>

        <View style={s.warningCard}>
          <Text style={s.warningText}>
            ⚠️ La tasa estándar en México es del <Text style={{ fontWeight: '700' }}>16%</Text>. Zona fronteriza aplica el <Text style={{ fontWeight: '700' }}>8%</Text>. Consulta a tu contador ante cualquier duda.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.canvas },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle:     { fontSize: 12, color: colors.muted },
  scroll:       { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  card:         { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16 },
  separator:    { height: 1, backgroundColor: colors.border },
  switchRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  switchInfo:   { flex: 1, gap: 2 },
  switchLabel:  { fontSize: 15, fontWeight: '600', color: colors.ink },
  switchDesc:   { fontSize: 12, color: colors.muted },
  rateSection:  { paddingVertical: 16, gap: 12 },
  rateRow:      { flexDirection: 'row', gap: 10 },
  rateChip:         { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.canvas },
  rateChipActive:   { backgroundColor: colors.ink, borderColor: colors.ink },
  rateChipText:     { fontSize: 15, fontWeight: '700', color: colors.muted },
  rateChipTextActive: { color: '#fff' },
  warningCard:  { backgroundColor: '#FFFBEB', borderRadius: 14, borderWidth: 1.5, borderColor: '#FCD34D', padding: 14 },
  warningText:  { fontSize: 13, color: '#92400E', lineHeight: 20 },
});
