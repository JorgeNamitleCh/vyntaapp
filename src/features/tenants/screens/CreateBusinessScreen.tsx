import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { Coffee, ShoppingBag, Flame, Sparkles, Tag, Package, ChevronLeft, ChevronDown } from 'lucide-react-native';
import { authService } from '../../auth/services/auth.service';
import { CreateBusinessScreenProps } from '../../../navigation/types';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  inputBg: '#FFFFFF',
  cardBg: '#F7F5EE',
};

type BusinessType = {
  Icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  label: string;
};

const BUSINESS_TYPES: BusinessType[] = [
  { Icon: Coffee, label: 'Café' },
  { Icon: ShoppingBag, label: 'Tienda' },
  { Icon: Flame, label: 'Restaurante' },
  { Icon: Sparkles, label: 'Peluquería' },
  { Icon: Tag, label: 'Servicios' },
  { Icon: Package, label: 'Otro' },
];

const ROWS = [BUSINESS_TYPES.slice(0, 3), BUSINESS_TYPES.slice(3, 6)];

export const CreateBusinessScreen = ({ navigation }: CreateBusinessScreenProps) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const isValid = name.trim().length >= 2;

  const handleNext = () => {
    if (!isValid) return;
    navigation.navigate('SalesChannels', {
      name: name.trim(),
      businessType: selectedType,
      currency: 'MXN',
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => authService.signOut()}>
            <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <TouchableOpacity onPress={() => authService.signOut()}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Text style={styles.stepLabel}>PASO 1 DE 3</Text>
          <Text style={styles.title}>Crea tu negocio</Text>
          <Text style={styles.subtitle}>
            Esto se quedará en tu cuenta. Puedes agregar más después.
          </Text>

          {/* Business name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>NOMBRE DEL NEGOCIO</Text>
            <TextInput
              style={styles.input}
              placeholder="Café Nami"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>

          {/* Business type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TIPO DE NEGOCIO</Text>
            <View style={styles.grid}>
              {ROWS.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.gridRow}>
                  {row.map(({ Icon, label }) => {
                    const selected = selectedType === label;
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.gridCard, selected && styles.gridCardSelected]}
                        onPress={() => setSelectedType(selected ? null : label)}
                        activeOpacity={0.75}>
                        <Icon size={22} color={selected ? '#fff' : C.ink} strokeWidth={1.75} />
                        <Text style={[styles.gridLabel, selected && styles.gridLabelSelected]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Currency */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>MONEDA</Text>
            <TouchableOpacity style={styles.dropdownRow} activeOpacity={0.7}>
              <Text style={styles.dropdownText}>🇲🇽  Peso mexicano · MXN</Text>
              <ChevronDown size={16} color={C.muted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, !isValid && styles.createBtnDisabled]}
            onPress={handleNext}
            disabled={!isValid}
            activeOpacity={0.85}>
            <Text style={styles.createBtnText}>Siguiente  →</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  flex: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 24, height: 4, borderRadius: 2, backgroundColor: C.border },
  dotActive: { backgroundColor: C.ink },
  skipText: { fontSize: 15, color: C.muted, fontWeight: '500', width: 38, textAlign: 'right' },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 20 },
  stepLabel: { fontSize: 11, fontWeight: '700', color: C.accent, letterSpacing: 0.8, marginBottom: -8 },
  title: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -1, marginBottom: -8 },
  subtitle: { fontSize: 14, color: C.muted, lineHeight: 20 },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  input: {
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: C.ink,
  },

  grid: { gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },
  gridCard: {
    flex: 1, aspectRatio: 1, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.inputBg, padding: 14,
    justifyContent: 'space-between',
  },
  gridCardSelected: { backgroundColor: C.ink, borderColor: C.ink },
  gridLabel: { fontSize: 13, fontWeight: '600', color: C.ink },
  gridLabelSelected: { color: '#fff' },

  dropdownRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { fontSize: 15, color: C.ink, fontWeight: '500' },

  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  createBtn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
