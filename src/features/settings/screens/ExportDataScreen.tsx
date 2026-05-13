import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Download, FileText, Table } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'ExportData'>;

const C = {
  canvas: '#F4F2EC', ink: '#0E1614', accent: '#0E5C3F',
  muted: '#6B7280', border: '#E5E3DC', white: '#FFFFFF',
};

const TIME_PERIODS   = ['Esta semana', 'Este mes', 'Últimos 3 meses', 'Este año', 'Personalizado'];
const CONTENT_TYPES  = ['Ventas', 'Gastos', 'Inventario', 'Clientes'];
const FILE_FORMATS   = [
  { id: 'csv', label: 'CSV', description: 'Excel / Sheets', Icon: Table },
  { id: 'pdf', label: 'PDF', description: 'Reporte visual', Icon: FileText },
];

export const ExportDataScreen = ({ navigation }: Props) => {
  const [selectedPeriod,  setSelectedPeriod]  = useState('Este mes');
  const [selectedContent, setSelectedContent] = useState<string[]>(['Ventas']);
  const [fileFormat,      setFileFormat]      = useState('csv');

  const toggleContentItem = (item: string) =>
    setSelectedContent((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
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
              <fmt.Icon size={22} color={fileFormat === fmt.id ? '#fff' : C.muted} strokeWidth={1.75} />
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

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.canvas },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  subtitle:     { fontSize: 12, color: C.muted },
  scroll:       { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  card:         { backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16 },
  separator:    { height: 1, backgroundColor: C.border },
  optionRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  optionLabel:       { fontSize: 15, fontWeight: '500', color: C.muted },
  optionLabelActive: { color: C.ink, fontWeight: '700' },
  radio:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:         { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  chipActive:   { backgroundColor: C.ink, borderColor: C.ink },
  chipText:     { fontSize: 14, fontWeight: '600', color: C.muted },
  chipTextActive: { color: '#fff' },
  formatRow:    { flexDirection: 'row', gap: 12 },
  formatCard:       { flex: 1, backgroundColor: C.white, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, padding: 16, alignItems: 'center', gap: 6 },
  formatCardActive: { backgroundColor: C.ink, borderColor: C.ink },
  formatLabel:      { fontSize: 16, fontWeight: '800', color: C.ink },
  formatLabelActive:{ color: '#fff' },
  formatDesc:       { fontSize: 11, color: C.muted },
  exportBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  exportBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },
  hint:         { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },
});
