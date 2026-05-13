import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useAuthStore } from '../../../store/authStore';

type Props = NativeStackScreenProps<AppStackParamList, 'BusinessEdit'>;

const C = {
  canvas: '#F4F2EC', ink: '#0E1614', accent: '#0E5C3F',
  muted: '#6B7280', border: '#E5E3DC', white: '#FFFFFF',
};

const BUSINESS_TYPES = ['Café / Restaurante', 'Tienda de ropa', 'Salud y belleza', 'Abarrotes', 'Servicios', 'Otro'];

export const BusinessEditScreen = ({ navigation }: Props) => {
  const { tenant } = useAuthStore();
  const [name, setName]         = useState(tenant?.name ?? '');
  const [type, setType]         = useState('Café / Restaurante');
  const [showTypes, setShowTypes] = useState(false);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Mi negocio</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{name.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.75}>
            <Text style={s.changePhoto}>Cambiar logo</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>INFORMACIÓN BÁSICA</Text>
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Nombre del negocio</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej. Café Nami"
              placeholderTextColor={C.muted}
            />
          </View>
          <View style={s.sep} />
          <View style={s.field}>
            <Text style={s.fieldLabel}>Tipo de negocio</Text>
            <TouchableOpacity style={s.selector} onPress={() => setShowTypes(!showTypes)} activeOpacity={0.75}>
              <Text style={s.selectorValue}>{type}</Text>
              <ChevronDown size={16} color={C.muted} strokeWidth={2} />
            </TouchableOpacity>
            {showTypes && (
              <View style={s.dropdown}>
                {BUSINESS_TYPES.map((t) => (
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
        </View>

        <Text style={s.sectionLabel}>LOCALIZACIÓN</Text>
        <View style={s.card}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>País</Text>
            <Text style={s.infoValue}>México</Text>
          </View>
          <View style={s.sep} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Moneda</Text>
            <Text style={s.infoValue}>MXN · Peso mexicano</Text>
          </View>
          <View style={s.sep} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Zona horaria</Text>
            <Text style={s.infoValue}>América/Mexico_City</Text>
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Guardar cambios</Text>
        </TouchableOpacity>
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
  scroll:       { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  avatarSection:{ alignItems: 'center', gap: 10, paddingVertical: 12 },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontSize: 32, fontWeight: '800' },
  changePhoto:  { fontSize: 14, fontWeight: '700', color: C.accent },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  card:         { backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16 },
  sep:          { height: 1, backgroundColor: C.border },
  field:        { paddingVertical: 14, gap: 8 },
  fieldLabel:   { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  input:        { fontSize: 15, color: C.ink, fontFamily: 'PlusJakartaSans-Medium', padding: 0 },
  selector:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorValue:{ fontSize: 15, color: C.ink, fontWeight: '500' },
  dropdown:     { marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  dropItem:     { paddingHorizontal: 12, paddingVertical: 11 },
  dropItemActive:    { backgroundColor: C.accent },
  dropItemText:      { fontSize: 14, color: C.ink, fontWeight: '500' },
  dropItemTextActive:{ color: '#fff', fontWeight: '700' },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  infoLabel:    { fontSize: 15, fontWeight: '500', color: C.ink },
  infoValue:    { fontSize: 14, color: C.muted, fontWeight: '500' },
  saveBtn:      { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
});
