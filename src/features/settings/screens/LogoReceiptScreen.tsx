import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, ImageIcon, Camera, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import { tenantService } from '../../tenants/services/tenant.service';
import { storageService } from '../../../services/storage.service';
import { toast } from '../../../store/toastStore';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = NativeStackScreenProps<AppStackParamList, 'LogoReceipt'>;

const DEFAULT_FOOTER = '¡Gracias por tu visita! Vuelve pronto.';

export const LogoReceiptScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const tenant   = useAuthStore(st => st.tenant);
  const tenantId = tenant?.id;

  const [footerText,   setFooterText]   = useState(tenant?.receiptFooter ?? DEFAULT_FOOTER);
  const [showPhone,    setShowPhone]     = useState(tenant?.showPhone ?? true);
  const [showAddress,  setShowAddress]   = useState(tenant?.showAddress ?? false);
  const [logoUri,      setLogoUri]       = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(tenant?.logoUrl ?? null);
  const [saving,       setSaving]        = useState(false);

  const displayLogo = logoUri ?? existingLogo;
  const bizName     = tenant?.name ?? 'Tu negocio';
  const initials    = bizName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const pickLogo = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    setLogoUri(result.assets[0].uri);
  }, []);

  const removeLogo = useCallback(() => {
    setLogoUri(null);
    setExistingLogo(null);
  }, []);

  const handleSave = async () => {
    if (!tenantId || saving) return;
    setSaving(true);
    try {
      let logoUrl = existingLogo ?? undefined;

      if (logoUri) {
        logoUrl = await storageService.uploadLogoImage(tenantId, logoUri);
      }

      await tenantService.updateTenant(tenantId, {
        logoUrl,
        showPhone,
        showAddress,
        receiptFooter: footerText.trim() || DEFAULT_FOOTER,
      });

      if (logoUri) setExistingLogo(logoUrl ?? null);
      setLogoUri(null);

      toast.success('Cambios guardados', 'Tu recibo fue actualizado');
      navigation.goBack();
    } catch (e: any) {
      toast.error('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

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

        {displayLogo ? (
          <View style={s.logoPreviewWrap}>
            <Image source={{ uri: displayLogo }} style={s.logoImage} />
            <TouchableOpacity style={s.logoRemoveBtn} onPress={removeLogo} activeOpacity={0.8}>
              <X size={12} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
            <TouchableOpacity style={s.changeLogoBtn} onPress={pickLogo} activeOpacity={0.75}>
              <Camera size={14} color={colors.accent} strokeWidth={2} />
              <Text style={s.uploadActionText}>Cambiar logo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.uploadArea} onPress={pickLogo} activeOpacity={0.75}>
            <ImageIcon size={32} color={colors.muted} strokeWidth={1.5} />
            <Text style={s.uploadHint}>Sin logo cargado</Text>
            <View style={s.uploadAction}>
              <Camera size={14} color={colors.accent} strokeWidth={2} />
              <Text style={s.uploadActionText}>Subir logo</Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={s.hint}>PNG o JPG, máx. 2 MB. Recomendado: 400×400 px sobre fondo blanco.</Text>

        <Text style={s.sectionLabel}>INFORMACIÓN EN EL RECIBO</Text>
        <View style={s.card}>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Mostrar teléfono</Text>
            <Switch
              value={showPhone}
              onValueChange={setShowPhone}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
              ios_backgroundColor={colors.border}
            />
          </View>
          <View style={s.separator} />
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Mostrar dirección</Text>
            <Switch
              value={showAddress}
              onValueChange={setShowAddress}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        <Text style={s.sectionLabel}>MENSAJE DE PIE DE PÁGINA</Text>
        <View style={s.card}>
          <TextInput
            style={s.footerInput}
            value={footerText}
            onChangeText={t => t.length <= 120 && setFooterText(t)}
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.muted}
            placeholder="Escribe un mensaje de agradecimiento..."
          />
          <Text style={s.charCount}>{footerText.length} / 120 caracteres</Text>
        </View>

        <Text style={s.sectionLabel}>VISTA PREVIA</Text>
        <View style={s.preview}>
          {displayLogo ? (
            <Image source={{ uri: displayLogo }} style={s.previewLogo} />
          ) : (
            <View style={s.previewAvatar}>
              <Text style={s.previewAvatarText}>{initials}</Text>
            </View>
          )}
          <Text style={s.previewBiz}>{bizName}</Text>
          <Text style={s.previewDivider}>─────────────────</Text>
          <Text style={s.previewItem}>Cappuccino           $55</Text>
          <Text style={s.previewItem}>Latte                $62</Text>
          <Text style={s.previewDivider}>─────────────────</Text>
          <Text style={s.previewTotal}>TOTAL             $117</Text>
          <Text style={s.previewDivider}>─────────────────</Text>
          {footerText.trim() ? <Text style={s.previewFooter}>{footerText}</Text> : null}
        </View>

        <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.saveBtnText}>Guardar cambios</Text>}
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

  logoPreviewWrap: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', paddingVertical: 20, gap: 12 },
  logoImage:       { width: 100, height: 100, borderRadius: 12 },
  logoRemoveBtn:   { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  changeLogoBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6 },

  card:         { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16 },
  separator:    { height: 1, backgroundColor: colors.border },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  toggleLabel:  { fontSize: 15, fontWeight: '500', color: colors.ink },

  footerInput:  { fontSize: 14, color: colors.ink, paddingVertical: 14, lineHeight: 20, minHeight: 80 },
  charCount:    { fontSize: 11, color: colors.muted, textAlign: 'right', paddingBottom: 10 },

  preview:          { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, padding: 20, alignItems: 'center', gap: 4 },
  previewLogo:      { width: 52, height: 52, borderRadius: 10, marginBottom: 4 },
  previewAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  previewAvatarText:{ color: '#fff', fontSize: 14, fontWeight: '800' },
  previewBiz:       { fontSize: 16, fontWeight: '800', color: colors.ink },
  previewDivider:   { fontSize: 11, color: colors.muted, letterSpacing: 1 },
  previewItem:      { fontSize: 12, color: colors.ink, alignSelf: 'stretch' },
  previewTotal:     { fontSize: 13, fontWeight: '700', color: colors.ink, alignSelf: 'stretch' },
  previewFooter:    { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4 },

  saveBtn:         { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
});
