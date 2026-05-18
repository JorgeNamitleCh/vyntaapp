import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, Download, FileText, Table } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'ExportData'>;

const TIME_PERIODS   = ['Esta semana', 'Este mes', 'Últimos 3 meses', 'Este año', 'Personalizado'];
const CONTENT_TYPES  = ['Ventas', 'Gastos', 'Inventario', 'Clientes'];
const FILE_FORMATS   = [
  { id: 'csv', label: 'CSV', description: 'Excel / Sheets', Icon: Table },
  { id: 'pdf', label: 'PDF', description: 'Reporte visual', Icon: FileText },
];

export const ExportDataScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [selectedPeriod,  setSelectedPeriod]  = useState('Este mes');
  const [selectedContent, setSelectedContent] = useState<string[]>(['Ventas']);
  const [fileFormat,      setFileFormat]      = useState('csv');

  const toggleContentItem = (item: string) =>
    setSelectedContent((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Exportar datos</Text>
          <Text style={s.subtitle}>Descarga tu información</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>PERÍODO</Text>
        <View style={s.card}>
          {TIME_PERIODS.map((period, index) => (
            <View key={period}>
              {index > 0 && <View style={s.separator} />}
              <TouchableOpacity style={s.optionRow} onPress={() => setSelectedPeriod(period)} activeOpacity={0.75}>
                <Text style={[s.optionLabel, selectedPeriod === period && s.optionLabelActive]}>{period}</Text>
                <View style={[s.radio, selectedPeriod === period && s.radioActive]}>
                  {selectedPeriod === period && <View style={s.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>CONTENIDO</Text>
        <View style={s.chipRow}>
          {CONTENT_TYPES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[s.chip, selectedContent.includes(item) && s.chipActive]}
              onPress={() => toggleContentItem(item)}
              activeOpacity={0.75}>
              <Text style={[s.chipText, selectedContent.includes(item) && s.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>FORMATO</Text>
        <View style={s.formatRow}>
          {FILE_FORMATS.map((fmt) => (
            <TouchableOpacity
              key={fmt.id}
              style={[s.formatCard, fileFormat === fmt.id && s.formatCardActive]}
              onPress={() => setFileFormat(fmt.id)}
              activeOpacity={0.8}>
              <fmt.Icon size={22} color={fileFormat === fmt.id ? '#fff' : colors.muted} strokeWidth={1.75} />
              <Text style={[s.formatLabel, fileFormat === fmt.id && s.formatLabelActive]}>{fmt.label}</Text>
              <Text style={[s.formatDesc, fileFormat === fmt.id && { color: 'rgba(255,255,255,0.6)' }]}>{fmt.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.exportBtn} activeOpacity={0.85}>
          <Download size={18} color="#fff" strokeWidth={2} />
          <Text style={s.exportBtnText}>Exportar ahora</Text>
        </TouchableOpacity>
        <Text style={s.hint}>El archivo se descargará y podrás compartirlo desde tu dispositivo.</Text>
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
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  card:         { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16 },
  separator:    { height: 1, backgroundColor: colors.border },
  optionRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  optionLabel:       { fontSize: 15, fontWeight: '500', color: colors.muted },
  optionLabelActive: { color: colors.ink, fontWeight: '700' },
  radio:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:         { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  chipActive:   { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText:     { fontSize: 14, fontWeight: '600', color: colors.muted },
  chipTextActive: { color: '#fff' },
  formatRow:    { flexDirection: 'row', gap: 12 },
  formatCard:       { flex: 1, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, padding: 16, alignItems: 'center', gap: 6 },
  formatCardActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  formatLabel:      { fontSize: 16, fontWeight: '800', color: colors.ink },
  formatLabelActive:{ color: '#fff' },
  formatDesc:       { fontSize: 11, color: colors.muted },
  exportBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  exportBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },
  hint:         { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
