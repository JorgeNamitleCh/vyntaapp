import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, Switch, ScrollView,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { BackButton } from '../../../components/BackButton';
import { Card } from '../../../components/Card';
import { Divider } from '../../../components/Divider';
import { SectionLabel } from '../../../components/SectionLabel';
import { ChevronDown, Moon } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useTheme, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'Preferences'>;

const InfoRow = ({
  label, sub, value, onPress,
}: { label: string; sub?: string; value: string; onPress?: () => void }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={s_info.row} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <View style={s_info.text}>
        <Text style={[s_info.label, { color: colors.ink }]}>{label}</Text>
        {sub && <Text style={[s_info.sub, { color: colors.muted }]}>{sub}</Text>}
      </View>
      <View style={s_info.valueRow}>
        <Text style={[s_info.value, { color: colors.muted }]}>{value}</Text>
        {onPress && <ChevronDown size={14} color={colors.muted} strokeWidth={2} />}
      </View>
    </TouchableOpacity>
  );
};

const s_info = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  text:     { flex: 1, gap: 2 },
  label:    { fontSize: 15, fontWeight: '500' },
  sub:      { fontSize: 12 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value:    { fontSize: 14, fontWeight: '600' },
});

export const PreferencesScreen = ({ navigation }: Props) => {
  const { colors, isDark, toggle } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [soundEnabled,     setSoundEnabled]     = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [confirmOnClose,   setConfirmOnClose]   = useState(false);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.canvas} />
      <View style={s.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={s.title}>Preferencias</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <SectionLabel>APARIENCIA</SectionLabel>
        <Card>
          <View style={s.switchRow}>
            <View style={s.switchLeft}>
              <Moon size={18} color={colors.muted} strokeWidth={1.75} />
              <Text style={s.switchLabel}>Modo oscuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        <SectionLabel>REGIONAL</SectionLabel>
        <Card>
          <InfoRow label="Moneda" sub="Formato de precios" value="MXN · Peso mexicano" onPress={() => {}} />
          <Divider />
          <InfoRow label="Idioma" value="Español" onPress={() => {}} />
          <Divider />
          <InfoRow label="Formato de fecha" value="DD/MM/AAAA" onPress={() => {}} />
          <Divider />
          <InfoRow label="Primer día de semana" value="Lunes" onPress={() => {}} />
        </Card>

        <SectionLabel>EXPERIENCIA</SectionLabel>
        <Card>
          {[
            { label: 'Sonido al completar venta', value: soundEnabled,     onChange: () => setSoundEnabled(v => !v) },
            { label: 'Vibración al cobrar',        value: vibrationEnabled, onChange: () => setVibrationEnabled(v => !v) },
            { label: 'Confirmar al cerrar venta',  value: confirmOnClose,   onChange: () => setConfirmOnClose(v => !v) },
          ].map((item, index) => (
            <View key={item.label}>
              {index > 0 && <Divider />}
              <View style={s.switchRow}>
                <Text style={s.switchLabel}>{item.label}</Text>
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          ))}
        </Card>

        <SectionLabel>SOBRE LA APP</SectionLabel>
        <Card>
          <InfoRow label="Versión" value="1.0.0 (build 42)" />
          <Divider />
          <InfoRow label="Términos y condiciones" value="Ver →" onPress={() => {}} />
          <Divider />
          <InfoRow label="Política de privacidad" value="Ver →" onPress={() => {}} />
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.canvas },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title:      { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  scroll:     { paddingHorizontal: 20, paddingTop: 8, gap: 10, paddingBottom: 32 },
  switchRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  switchLabel:{ fontSize: 15, fontWeight: '500', color: colors.ink },
});
