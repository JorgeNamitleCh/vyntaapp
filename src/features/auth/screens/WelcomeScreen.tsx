import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Text } from '../../../components/Text';
import { AppButton } from '../../../components/AppButton';
import { Zap } from 'lucide-react-native';
import { WelcomeScreenProps } from '../../../navigation/types';
import { Radius } from '../../../theme';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
  <SafeAreaView style={s.root}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

    <View style={s.container}>
      {/* VyntaMark */}
      <View style={s.logoRow}>
        <View style={s.logoMark}>
          <Text style={s.logoV}>V</Text>
        </View>
        <Text style={s.logoText}>vynta</Text>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.headline}>Tu negocio,</Text>
        <Text style={s.headlineItalic}>en el bolsillo.</Text>
        <Text style={s.body}>
          Registra ventas, controla tu inventario y mira tus reportes — todo desde tu celular.
        </Text>
      </View>

      {/* Stat cards */}
      <View style={s.statsRow}>
        <View style={[s.statCard, s.statDark]}>
          <Zap size={18} color="#fff" strokeWidth={2} />
          <Text style={s.statDarkMain}>Venta{'\n'}en 5 seg</Text>
        </View>
        <View style={[s.statCard, s.statLight]}>
          <Text style={s.statBig}>$0</Text>
          <Text style={s.statSub}>para empezar</Text>
        </View>
        <View style={[s.statCard, s.statLight]}>
          <Text style={s.statBig}>∞</Text>
          <Text style={s.statSub}>productos</Text>
        </View>
      </View>

      {/* CTAs */}
      <View style={s.ctas}>
        <AppButton
          label="Comenzar gratis"
          variant="dark"
          onPress={() => navigation.navigate('Login')}
        />
        <AppButton
          label="Ya tengo cuenta"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
      </View>

      {/* Footer */}
      <Text style={s.footer}>
        Al continuar aceptas nuestros{' '}
        <Text style={s.footerLink}>Términos de servicio</Text>
        {' '}y{' '}
        <Text style={s.footerLink}>Política de privacidad</Text>.
      </Text>
    </View>
  </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 34, height: 34, borderRadius: Radius.sm,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  logoV:    { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  logoText: { fontSize: 18, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },

  hero:          { marginTop: 8 },
  headline:      { fontSize: 44, fontWeight: '800', color: colors.ink, letterSpacing: -1.5, lineHeight: 50 },
  headlineItalic:{ fontSize: 44, fontWeight: '700', fontStyle: 'italic', color: colors.accent, letterSpacing: -1.5, lineHeight: 52, marginBottom: 18 },
  body:          { fontSize: 15, color: colors.muted, lineHeight: 22, maxWidth: 300 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: Radius.xxl, padding: 14, minHeight: 90, justifyContent: 'space-between' },
  statDark: { backgroundColor: colors.ink },
  statLight:{ backgroundColor: colors.cardBg },
  statDarkMain: { fontSize: 12, fontWeight: '600', color: '#fff', lineHeight: 16 },
  statBig:  { fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  statSub:  { fontSize: 11, color: colors.muted, fontWeight: '500' },

  ctas: { gap: 10 },

  footer:     { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  footerLink: { color: colors.accent, fontWeight: '600' },
});
