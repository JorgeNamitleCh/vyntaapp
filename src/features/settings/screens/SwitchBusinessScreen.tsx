import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, FlatList, Modal,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Check, Plus, Crown, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import { usePlan } from '../../../hooks/usePlan';

type Props = NativeStackScreenProps<AppStackParamList, 'SwitchBusiness'>;

type Business = { id: string; name: string; type: string; color: string };

// TODO: replace with real Firestore businesses for this user
const MOCK_BUSINESSES: Business[] = [
  { id: '1', name: 'Café Nami',   type: 'Café / Restaurante', color: '#0E5C3F' },
];

const UpgradeModal = ({
  visible, onClose, onUpgrade, isPro,
}: {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isPro: boolean;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={m.overlay}>
      <View style={m.sheet}>
        <TouchableOpacity style={m.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <X size={16} color="#888" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={m.iconWrap}>
          <Crown size={28} color="#D97706" strokeWidth={1.75} />
        </View>

        <Text style={m.title}>Múltiples negocios</Text>
        <Text style={m.body}>
          {isPro
            ? 'Con Vynta Premium puedes gestionar hasta 3 negocios desde una sola cuenta.'
            : 'Agrega un negocio con Vynta Pro o hasta 3 con Vynta Premium.'}
        </Text>

        <TouchableOpacity style={m.cta} onPress={onUpgrade} activeOpacity={0.88}>
          <Crown size={14} color="#fff" strokeWidth={2} />
          <Text style={m.ctaText}>
            {isPro ? 'Ver Vynta Premium' : 'Ver planes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={m.later} onPress={onClose} activeOpacity={0.7}>
          <Text style={m.laterText}>Más tarde</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const SwitchBusinessScreen = ({ navigation }: Props) => {
  const colors  = useThemeColors();
  const s       = useMemo(() => make_s(colors), [colors]);
  const tenant  = useAuthStore(st => st.tenant);
  const { plan, limits } = usePlan();

  const [activeId,      setActiveId]      = useState(tenant?.id ?? '1');
  const [showUpgrade,   setShowUpgrade]   = useState(false);

  const businesses = MOCK_BUSINESSES;
  const canAddMore = businesses.length < limits.businesses;

  const handleAdd = () => {
    if (canAddMore) {
      // TODO: navigate to create new business onboarding
      // navigation.navigate('Onboarding')
    } else {
      setShowUpgrade(true);
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
          <Text style={s.title}>Cambiar negocio</Text>
          <Text style={s.subtitle}>{businesses.length} negocio{businesses.length !== 1 ? 's' : ''} disponible{businesses.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <FlatList
        data={businesses}
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
          <TouchableOpacity style={s.addRow} onPress={handleAdd} activeOpacity={0.8}>
            <View style={[s.addIcon, !canAddMore && s.addIconLocked]}>
              {canAddMore
                ? <Plus size={18} color={colors.accent} strokeWidth={2.5} />
                : <Crown size={18} color="#D97706" strokeWidth={1.75} />}
            </View>
            <View style={s.addInfo}>
              <Text style={[s.addText, !canAddMore && s.addTextLocked]}>
                Agregar nuevo negocio
              </Text>
              {!canAddMore && (
                <Text style={s.addSub}>
                  {plan === 'pro' ? 'Disponible en Premium' : 'Disponible en Pro o Premium'}
                </Text>
              )}
            </View>
            {!canAddMore && <Crown size={14} color="#D97706" strokeWidth={1.75} />}
          </TouchableOpacity>
        }
      />

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => { setShowUpgrade(false); navigation.navigate('Paywall'); }}
        isPro={plan === 'pro'}
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
  addRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, marginTop: 4 },
  addIcon:      { width: 46, height: 46, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  addIconLocked:{ backgroundColor: 'rgba(217,119,6,0.12)' },
  addInfo:      { flex: 1, gap: 2 },
  addText:      { fontSize: 15, fontWeight: '700', color: colors.accent },
  addTextLocked:{ color: '#D97706' },
  addSub:       { fontSize: 11, color: '#D97706', opacity: 0.8 },
});

const m = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%', backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 28, paddingTop: 28, paddingBottom: 44,
    alignItems: 'center', gap: 10,
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 20,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center',
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(217,119,6,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title:   { fontSize: 20, fontWeight: '800', color: '#0F0F0F', textAlign: 'center' },
  body:    { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0E5C3F', borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 32,
    marginTop: 8, width: '100%', justifyContent: 'center',
  },
  ctaText:   { fontSize: 15, fontWeight: '700', color: '#fff' },
  later:     { paddingVertical: 8 },
  laterText: { fontSize: 14, color: '#999', fontWeight: '500' },
});
