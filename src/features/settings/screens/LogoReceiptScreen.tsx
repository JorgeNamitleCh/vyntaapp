import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, ImageIcon, Camera } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'LogoReceipt'>;

export const LogoReceiptScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [footerText, setFooterText]     = useState('¡Gracias por tu visita! Vuelve pronto.');
  const [showPhone, setShowPhone]       = useState(true);
  const [showAddress, setShowAddress]   = useState(false);

  const toggleOptions = [
    { label: 'Mostrar teléfono',   value: showPhone,   onToggle: () => setShowPhone(!showPhone) },
    { label: 'Mostrar dirección',  value: showAddress, onToggle: () => setShowAddress(!showAddress) },
  ];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Logo y recibo</Text>
          <Text style={s.subtitle}>Personaliza tus comprobantes</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionLabel}>LOGO DEL NEGOCIO</Text>
        <TouchableOpacity style={s.uploadArea} activeOpacity={0.75}>
          <ImageIcon size={32} color={colors.muted} strokeWidth={1.5} />
          <Text style={s.uploadHint}>Sin logo cargado</Text>
          <View style={s.uploadAction}>
            <Camera size={14} color={colors.accent} strokeWidth={2} />
            <Text style={s.uploadActionText}>Subir logo</Text>
          </View>
        </TouchableOpacity>
        <Text style={s.hint}>PNG o JPG, máx. 2 MB. Recomendado: 400×400 px sobre fondo blanco.</Text>

        <Text style={s.sectionLabel}>INFORMACIÓN EN EL RECIBO</Text>
        <View style={s.card}>
          {toggleOptions.map((opt, index) => (
            <View key={opt.label}>
              {index > 0 && <View style={s.separator} />}
              <View style={s.toggleRow}>
                <Text style={s.toggleLabel}>{opt.label}</Text>
                <TouchableOpacity
                  style={[s.toggleTrack, opt.value && s.toggleTrackActive]}
                  onPress={opt.onToggle}
                  activeOpacity={0.8}>
                  <View style={[s.toggleThumb, opt.value && s.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>MENSAJE DE PIE DE PÁGINA</Text>
        <View style={s.card}>
          <TextInput
            style={s.footerInput}
            value={footerText}
            onChangeText={setFooterText}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.muted}
            placeholder="Escribe un mensaje de agradecimiento..."
          />
          <Text style={s.charCount}>{footerText.length} / 120 caracteres</Text>
        </View>

        <Text style={s.sectionLabel}>VISTA PREVIA</Text>
        <View style={s.preview}>
          <View style={s.previewAvatar}><Text style={s.previewAvatarText}>CN</Text></View>
          <Text style={s.previewBiz}>Café Nami</Text>
          <Text style={s.previewDivider}>─────────────────</Text>
          <Text style={s.previewItem}>Cappuccino           $55</Text>
          <Text style={s.previewItem}>Latte                $62</Text>
          <Text style={s.previewDivider}>─────────────────</Text>
          <Text style={s.previewTotal}>TOTAL             $117</Text>
          <Text style={s.previewDivider}>─────────────────</Text>
          <Text style={s.previewFooter}>{footerText}</Text>
        </View>

        <TouchableOpacity style={s.saveBtn} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Guardar cambios</Text>
        </TouchableOpacity>
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
  hint:         { fontSize: 11, color: colors.muted, textAlign: 'center' },

  uploadArea:       { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', paddingVertical: 28, gap: 10 },
  uploadHint:       { fontSize: 13, color: colors.muted },
  uploadAction:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  uploadActionText: { fontSize: 14, fontWeight: '700', color: colors.accent },

  card:         { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16 },
  separator:    { height: 1, backgroundColor: colors.border },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  toggleLabel:  { fontSize: 15, fontWeight: '500', color: colors.ink },
  toggleTrack:  { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleTrackActive: { backgroundColor: colors.accent },
  toggleThumb:  { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbActive: { alignSelf: 'flex-end' },

  footerInput:  { fontSize: 14, color: colors.ink, paddingVertical: 14, lineHeight: 20, fontFamily: 'PlusJakartaSans-Regular', minHeight: 80 },
  charCount:    { fontSize: 11, color: colors.muted, textAlign: 'right', paddingBottom: 10 },

  preview:          { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, padding: 20, alignItems: 'center', gap: 4 },
  previewAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  previewAvatarText:{ color: '#fff', fontSize: 14, fontWeight: '800' },
  previewBiz:       { fontSize: 16, fontWeight: '800', color: colors.ink },
  previewDivider:   { fontSize: 11, color: colors.muted, letterSpacing: 1 },
  previewItem:      { fontSize: 12, color: colors.ink, fontFamily: 'PlusJakartaSans-Regular', alignSelf: 'stretch' },
  previewTotal:     { fontSize: 13, fontWeight: '700', color: colors.ink, alignSelf: 'stretch' },
  previewFooter:    { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4 },

  saveBtn:      { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
});
