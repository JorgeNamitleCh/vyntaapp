import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Check, Plus } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'SwitchBusiness'>;

type Business = { id: string; name: string; type: string; color: string };

const MOCK_BUSINESSES: Business[] = [
  { id: '1', name: 'Café Nami', type: 'Café / Restaurante', color: '#0E5C3F' },
  { id: '2', name: 'Nami Merch', type: 'Tienda de ropa', color: '#1D4ED8' },
];

export const SwitchBusinessScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [activeId, setActiveId] = useState('1');

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Cambiar negocio</Text>
          <Text style={s.subtitle}>{MOCK_BUSINESSES.length} negocios disponibles</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_BUSINESSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => {
          const isActive = item.id === activeId;
          const initials = item.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
          return (
            <TouchableOpacity
              style={s.row}
              onPress={() => { setActiveId(item.id); setTimeout(() => navigation.goBack(), 300); }}
              activeOpacity={0.75}>
              <View style={[s.avatar, { backgroundColor: item.color }]}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              <View style={s.info}>
                <Text style={[s.name, isActive && { color: colors.accent }]}>{item.name}</Text>
                <Text style={s.type}>{item.type}</Text>
              </View>
              {isActive && (
                <View style={s.checkWrap}>
                  <Check size={14} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity style={s.addRow} activeOpacity={0.8}>
            <View style={s.addIcon}><Plus size={18} color={colors.accent} strokeWidth={2.5} /></View>
            <Text style={s.addText}>Agregar nuevo negocio</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:     { flex: 1, backgroundColor: colors.canvas },
  header:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: colors.muted },
  list:     { paddingHorizontal: 20, paddingTop: 8 },
  sep:      { height: 1, backgroundColor: colors.border },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  avatar:   { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  info:     { flex: 1, gap: 2 },
  name:     { fontSize: 15, fontWeight: '700', color: colors.ink },
  type:     { fontSize: 12, color: colors.muted },
  checkWrap:{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  addRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, marginTop: 4 },
  addIcon:  { width: 46, height: 46, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  addText:  { fontSize: 15, fontWeight: '700', color: colors.accent },
});
