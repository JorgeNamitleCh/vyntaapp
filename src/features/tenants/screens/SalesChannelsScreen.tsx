import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import {
  ChevronLeft,
  Store,
  Globe,
  Smartphone,
  ShoppingCart,
  MessageCircle,
  Truck,
} from 'lucide-react-native';
import { authService } from '../../auth/services/auth.service';
import { SalesChannelsScreenProps } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Channel = {
  id: string;
  Icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  description: string;
};

const CHANNELS: Channel[] = [
  {
    id: 'physical',
    Icon: Store,
    label: 'Tienda física',
    description: 'Local, puesto o mostrador',
  },
  {
    id: 'online',
    Icon: Globe,
    label: 'Tienda en línea',
    description: 'Sitio web propio o Shopify',
  },
  {
    id: 'social',
    Icon: Smartphone,
    label: 'Redes sociales',
    description: 'Instagram, TikTok, Facebook',
  },
  {
    id: 'marketplace',
    Icon: ShoppingCart,
    label: 'Marketplace',
    description: 'Mercado Libre, Amazon',
  },
  {
    id: 'whatsapp',
    Icon: MessageCircle,
    label: 'WhatsApp / Chat',
    description: 'Pedidos por mensaje directo',
  },
  {
    id: 'delivery',
    Icon: Truck,
    label: 'A domicilio',
    description: 'Reparto o delivery propio',
  },
];

export const SalesChannelsScreen = ({ navigation, route }: SalesChannelsScreenProps) => {
  const colors = useThemeColors();
  const styles = useMemo(() => make_styles(colors), [colors]);

  const [selected, setSelected] = useState<Set<string>>(new Set(['physical']));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    navigation.navigate('BusinessSetup', {
      ...route.params,
      channels: Array.from(selected),
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.progressDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity onPress={() => authService.signOut()}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.stepLabel}>PASO 2 DE 3</Text>
        <Text style={styles.title}>¿Dónde vendes?</Text>
        <Text style={styles.subtitle}>
          Selecciona todos los canales donde recibes pedidos o vendes tus productos.
        </Text>

        <View style={styles.channelList}>
          {CHANNELS.map(({ id, Icon, label, description }) => {
            const active = selected.has(id);
            return (
              <TouchableOpacity
                key={id}
                style={[styles.channelCard, active && styles.channelCardActive]}
                onPress={() => toggle(id)}
                activeOpacity={0.75}>
                <View style={[styles.channelIcon, active && styles.channelIconActive]}>
                  <Icon size={20} color={active ? '#fff' : colors.ink} strokeWidth={1.75} />
                </View>
                <View style={styles.channelText}>
                  <Text style={[styles.channelLabel, active && styles.channelLabelActive]}>
                    {label}
                  </Text>
                  <Text style={styles.channelDescription}>{description}</Text>
                </View>
                <View style={[styles.check, active && styles.checkActive]}>
                  {active && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.size === 0 && (
          <Text style={styles.hint}>Selecciona al menos un canal para continuar.</Text>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, selected.size === 0 && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={selected.size === 0}
          activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>Siguiente  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const make_styles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 24, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.ink },
  skipText: { fontSize: 15, color: colors.muted, fontWeight: '500', width: 38, textAlign: 'right' },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 20 },
  stepLabel: { fontSize: 11, fontWeight: '700', color: colors.accent, letterSpacing: 0.8, marginBottom: -8 },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1, marginBottom: -8 },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20 },

  channelList: { gap: 10 },
  channelCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  channelCardActive: { borderColor: colors.ink, backgroundColor: '#F7F5EE' },
  channelIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  channelIconActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  channelText: { flex: 1, gap: 2 },
  channelLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  channelLabelActive: { color: colors.ink },
  channelDescription: { fontSize: 12, color: colors.muted },
  check: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  checkMark: { fontSize: 11, color: '#fff', fontWeight: '700' },

  hint: { fontSize: 13, color: colors.muted, textAlign: 'center' },

  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  nextBtn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
