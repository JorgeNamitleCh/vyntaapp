import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'BillingInfo'>;

const FormField = ({
  label, value, onChange, placeholder, keyboardType,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any;
}) => {
  const colors = useThemeColors();
  const field = useMemo(() => make_field(colors), [colors]);
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <TextInput
        style={field.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="characters"
      />
    </View>
  );
};

const make_field = (colors: ThemeColors) => StyleSheet.create({
  wrap:  { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  input: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.ink, fontFamily: 'PlusJakartaSans-Medium' },
});

const SelectorField = ({ label, value }: { label: string; value: string }) => {
  const colors = useThemeColors();
  const selector = useMemo(() => make_selector(colors), [colors]);
  return (
    <View style={selector.wrap}>
      <Text style={selector.label}>{label}</Text>
      <TouchableOpacity style={selector.row} activeOpacity={0.75}>
        <Text style={selector.value}>{value}</Text>
        <ChevronDown size={16} color={colors.muted} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const make_selector = (colors: ThemeColors) => StyleSheet.create({
  wrap:  { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  row:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13 },
  value: { fontSize: 15, color: colors.ink, fontWeight: '500' },
});

export const BillingInfoScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const field = useMemo(() => make_field(colors), [colors]);
  const selector = useMemo(() => make_selector(colors), [colors]);
  const s = useMemo(() => make_s(colors), [colors]);

  const [rfc, setRfc]         = useState('');
  const [legalName, setLegalName] = useState('');
  const [street, setStreet]   = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity]       = useState('');
  const [zipCode, setZipCode] = useState('');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Datos de facturación</Text>
          <Text style={s.subtitle}>RFC y dirección fiscal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionLabel}>INFORMACIÓN FISCAL</Text>
        <View style={s.card}>
          <FormField label="RFC" value={rfc} onChange={setRfc} placeholder="XAXX010101000" />
          <View style={s.divider} />
          <FormField label="Razón social" value={legalName} onChange={setLegalName} placeholder="Café Nami S.A. de colors.V." />
          <View style={s.divider} />
          <SelectorField label="Régimen fiscal" value="Personas Físicas con Act. Emp." />
          <View style={s.divider} />
          <SelectorField label="Uso de CFDI" value="Gastos en general (G03)" />
        </View>

        <Text style={s.sectionLabel}>DIRECCIÓN FISCAL</Text>
        <View style={s.card}>
          <FormField label="Calle y número" value={street} onChange={setStreet} placeholder="Av. Insurgentes Sur 1234" />
          <View style={s.divider} />
          <FormField label="Colonia" value={district} onChange={setDistrict} placeholder="Del Valle" />
          <View style={s.divider} />
          <View style={s.row}>
            <View style={{ flex: 2 }}>
              <FormField label="Ciudad / Municipio" value={city} onChange={setCity} placeholder="Benito Juárez" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="colors.P." value={zipCode} onChange={setZipCode} placeholder="03100" keyboardType="number-pad" />
            </View>
          </View>
          <View style={s.divider} />
          <SelectorField label="Estado" value="Ciudad de México" />
        </View>

        <TouchableOpacity style={s.saveBtn} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Guardar datos</Text>
        </TouchableOpacity>
        <Text style={s.hint}>Estos datos se usan para generar facturas CFDI 4.0.</Text>
        <View style={{ height: 32 }} />
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
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, marginTop: 8, marginBottom: 2 },
  card:         { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  divider:      { height: 1, backgroundColor: colors.border },
  row:          { flexDirection: 'row', gap: 12 },
  saveBtn:      { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  hint:         { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18, marginTop: 4 },
});
