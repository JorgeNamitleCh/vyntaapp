import React, { useState } from 'react';
import {
  View, TouchableOpacity, Switch, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Preferences'>;

const C = {
  canvas: '#F4F2EC', ink: '#0E1614', accent: '#0E5C3F',
  muted: '#6B7280', border: '#E5E3DC', white: '#FFFFFF',
};

const InfoRow = ({ label, sub, value, onPress }: { label: string; sub?: string; value: string; onPress?: () => void }) => (
  <TouchableOpacity style={info.row} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
    <View style={info.text}>
      <Text style={info.label}>{label}</Text>
      {sub && <Text style={info.sub}>{sub}</Text>}
    </View>
    <View style={info.valueRow}>
      <Text style={info.value}>{value}</Text>
      {onPress && <ChevronDown size={14} color={C.muted} strokeWidth={2} />}
    </View>
  </TouchableOpacity>
);

const info = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  text:     { flex: 1, gap: 2 },
  label:    { fontSize: 15, fontWeight: '500', color: C.ink },
  sub:      { fontSize: 12, color: C.muted },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value:    { fontSize: 14, fontWeight: '600', color: C.muted },
});

export const PreferencesScreen = ({ navigation }: Props) => {
  const [soundEnabled,    setSoundEnabled]    = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [confirmOnClose,  setConfirmOnClose]  = useState(false);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Preferencias</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>REGIONAL</Text>
        <View style={s.card}>
          <InfoRow label="Moneda" sub="Formato de precios" value="MXN · Peso mexicano" onPress={() => {}} />
          <View style={s.separator} />
          <InfoRow label="Idioma" value="Español" onPress={() => {}} />
          <View style={s.separator} />
          <InfoRow label="Formato de fecha" value="DD/MM/AAAA" onPress={() => {}} />
          <View style={s.separator} />
          <InfoRow label="Primer día de semana" value="Lunes" onPress={() => {}} />
        </View>

        <Text style={s.sectionLabel}>EXPERIENCIA</Text>
        <View style={s.card}>
          {[
            { label: 'Sonido al completar venta', value: soundEnabled,     onChange: () => setSoundEnabled(!soundEnabled) },
            { label: 'Vibración al cobrar',        value: vibrationEnabled, onChange: () => setVibrationEnabled(!vibrationEnabled) },
            { label: 'Confirmar al cerrar venta',  value: confirmOnClose,   onChange: () => setConfirmOnClose(!confirmOnClose) },
          ].map((item, index) => (
            <View key={item.label}>
              {index > 0 && <View style={s.separator} />}
              <View style={s.switchRow}>
                <Text style={s.switchLabel}>{item.label}</Text>
                <Switch value={item.value} onValueChange={item.onChange} trackColor={{ false: C.border, true: C.accent }} thumbColor="#fff" />
              </View>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>SOBRE LA APP</Text>
        <View style={s.card}>
          <InfoRow label="Versión" value="1.0.0 (build 42)" />
          <View style={s.separator} />
          <InfoRow label="Términos y condiciones" value="Ver →" onPress={() => {}} />
          <View style={s.separator} />
          <InfoRow label="Política de privacidad" value="Ver →" onPress={() => {}} />
        </View>
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
  scroll:       { paddingHorizontal: 20, paddingTop: 16, gap: 10, paddingBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  card:         { backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16 },
  separator:    { height: 1, backgroundColor: C.border },
  switchRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  switchLabel:  { fontSize: 15, fontWeight: '500', color: C.ink, flex: 1 },
});
