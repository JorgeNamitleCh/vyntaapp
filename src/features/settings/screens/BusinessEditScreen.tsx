import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { AppButton } from '../../../components/AppButton';
import { BackButton } from '../../../components/BackButton';
import { Card } from '../../../components/Card';
import { Divider } from '../../../components/Divider';
import { SectionLabel } from '../../../components/SectionLabel';
import { ChevronDown, Camera } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useAuthStore } from '../../../store/authStore';
import { firebaseTenantRepository } from '../../../repositories/firebase/tenant.repository';
import { storageService } from '../../../services/storage.service';
import { launchImageLibrary } from 'react-native-image-picker';
import { toast } from '../../../store/toastStore';
import { Radius } from '../../../theme';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'BusinessEdit'>;

const BUSINESS_TYPES = [
  'Café / Restaurante', 'Tienda de ropa', 'Salud y belleza',
  'Abarrotes', 'Servicios', 'Otro',
];

export const BusinessEditScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const { tenant, setTenant } = useAuthStore();

  const [name,      setName]      = useState(tenant?.name ?? '');
  const [type,      setType]      = useState(tenant?.businessType ?? BUSINESS_TYPES[0]);
  const [showTypes, setShowTypes] = useState(false);

  const [logoUri,      setLogoUri]      = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState(tenant?.logoUrl ?? null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving,       setSaving]       = useState(false);

  const displayLogo = logoUri ?? existingLogo;
  const isValid = name.trim().length >= 2;

  const pickLogo = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets?.[0]?.uri) setLogoUri(result.assets[0].uri);
  };

  const removeLogo = () => { setLogoUri(null); setExistingLogo(null); };

  const handleSave = async () => {
    if (!isValid || saving || !tenant) return;
    setSaving(true);
    try {
      let logoUrl = existingLogo ?? undefined;

      if (logoUri) {
        setUploadingLogo(true);
        try {
          logoUrl = await storageService.uploadLogoImage(tenant.id, logoUri);
        } catch (e) {
          console.warn('Logo upload failed', e);
        } finally {
          setUploadingLogo(false);
        }
      }

      if (!logoUri && !existingLogo && tenant.logoUrl) {
        storageService.deleteFile(tenant.logoUrl).catch(() => {});
        logoUrl = undefined;
      }

      await firebaseTenantRepository.updateTenant(tenant.id, {
        name: name.trim(),
        businessType: type,
        ...(logoUrl !== undefined ? { logoUrl } : { logoUrl: undefined }),
      });

      setTenant({ ...tenant, name: name.trim(), businessType: type, logoUrl });
      toast.success('Cambios guardados');
      navigation.goBack();
    } catch (e) {
      toast.error('Error', 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={s.title}>Mi negocio</Text>
        <TouchableOpacity
          style={[s.saveTopBtn, (!isValid || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!isValid || saving}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.saveTopText}>Guardar</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoSection}>
          <TouchableOpacity style={s.logoWrap} onPress={pickLogo} activeOpacity={0.8}>
            {displayLogo ? (
              <Image source={{ uri: displayLogo }} style={s.logoImg} />
            ) : (
              <View style={s.logoPlaceholder}>
                <Text style={s.logoInitial}>{name.charAt(0).toUpperCase() || '?'}</Text>
              </View>
            )}
            <View style={s.cameraBadge}>
              {uploadingLogo
                ? <ActivityIndicator size="small" color="#fff" />
                : <Camera size={14} color="#fff" strokeWidth={2} />}
            </View>
          </TouchableOpacity>

          <View style={s.logoActions}>
            <TouchableOpacity onPress={pickLogo} activeOpacity={0.75}>
              <Text style={s.changeLogoText}>{displayLogo ? 'Cambiar logo' : 'Agregar logo'}</Text>
            </TouchableOpacity>
            {displayLogo && (
              <TouchableOpacity onPress={removeLogo} activeOpacity={0.75}>
                <Text style={s.removeLogoText}>Quitar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <SectionLabel>INFORMACIÓN BÁSICA</SectionLabel>
        <Card>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Nombre del negocio</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej. Café Nami"
              placeholderTextColor={colors.muted}
            />
          </View>
          <Divider />
          <View style={s.field}>
            <Text style={s.fieldLabel}>Tipo de negocio</Text>
            <TouchableOpacity
              style={s.selector}
              onPress={() => setShowTypes(v => !v)}
              activeOpacity={0.75}>
              <Text style={s.selectorValue}>{type}</Text>
              <ChevronDown size={16} color={colors.muted} strokeWidth={2} />
            </TouchableOpacity>
            {showTypes && (
              <View style={s.dropdown}>
                {BUSINESS_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[s.dropItem, t === type && s.dropItemActive]}
                    onPress={() => { setType(t); setShowTypes(false); }}
                    activeOpacity={0.75}>
                    <Text style={[s.dropItemText, t === type && s.dropItemTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Card>

        <SectionLabel>LOCALIZACIÓN</SectionLabel>
        <Card>
          {[
            { label: 'País',         value: 'México' },
            { label: 'Moneda',       value: `${tenant?.currency ?? 'MXN'} · Peso mexicano` },
            { label: 'Zona horaria', value: 'América/Mexico_City' },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>{row.label}</Text>
                <Text style={s.infoValue}>{row.value}</Text>
              </View>
              {i < arr.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        <AppButton
          label="Guardar cambios"
          onPress={handleSave}
          loading={saving}
          disabled={!isValid}
          style={s.saveBtn}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },
  title:       { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  saveTopBtn:  { backgroundColor: colors.accent, borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 9, minWidth: 72, alignItems: 'center' },
  saveTopText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },

  logoSection:     { alignItems: 'center', gap: 12, paddingVertical: 16 },
  logoWrap:        { position: 'relative' },
  logoImg:         { width: 90, height: 90, borderRadius: 45 },
  logoPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  logoInitial:     { color: '#fff', fontSize: 36, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.canvas,
    alignItems: 'center', justifyContent: 'center',
  },
  logoActions:    { flexDirection: 'row', gap: 16 },
  changeLogoText: { fontSize: 14, fontWeight: '700', color: colors.accent },
  removeLogoText: { fontSize: 14, fontWeight: '600', color: colors.muted },

  field:         { paddingVertical: 14, gap: 8 },
  fieldLabel:    { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  input:         { fontSize: 15, color: colors.ink, padding: 0 },
  selector:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorValue: { fontSize: 15, color: colors.ink, fontWeight: '500' },
  dropdown:      { marginTop: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  dropItem:      { paddingHorizontal: 12, paddingVertical: 11 },
  dropItemActive:     { backgroundColor: colors.accent },
  dropItemText:       { fontSize: 14, color: colors.ink, fontWeight: '500' },
  dropItemTextActive: { color: '#fff', fontWeight: '700' },

  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  infoLabel: { fontSize: 15, fontWeight: '500', color: colors.ink },
  infoValue: { fontSize: 14, color: colors.muted, fontWeight: '500' },

  saveBtn: { marginTop: 8 },
});
