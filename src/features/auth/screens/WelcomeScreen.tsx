import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { Zap } from 'lucide-react-native';
import { WelcomeScreenProps } from '../../../navigation/types';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  cardLight: '#F0EEE7',
};

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => (
  <SafeAreaView style={styles.root}>
    <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

    <View style={styles.container}>
      {/* VyntaMark */}
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoV}>V</Text>
        </View>
        <Text style={styles.logoText}>vynta</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.headline}>Tu negocio,</Text>
        <Text style={styles.headlineItalic}>en el bolsillo.</Text>
        <Text style={styles.body}>
          Registra ventas, controla tu inventario y mira tus reportes — todo desde tu celular.
        </Text>
      </View>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statDark]}>
          <Zap size={18} color="#fff" strokeWidth={2} />
          <Text style={styles.statDarkMain}>Venta{'\n'}en 5 seg</Text>
        </View>
        <View style={[styles.statCard, styles.statLight]}>
          <Text style={styles.statBig}>$0</Text>
          <Text style={styles.statSub}>para empezar</Text>
        </View>
        <View style={[styles.statCard, styles.statLight]}>
          <Text style={styles.statBig}>∞</Text>
          <Text style={styles.statSub}>productos</Text>
        </View>
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Comenzar gratis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}>
          <Text style={styles.ghostBtnText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Al continuar aceptas nuestros{' '}
        <Text style={styles.footerLink}>Términos de servicio</Text>
        {' '}y{' '}
        <Text style={styles.footerLink}>Política de privacidad</Text>.
      </Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoV: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.5,
  },

  // Hero
  hero: {
    marginTop: 8,
  },
  headline: {
    fontSize: 44,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -1.5,
    lineHeight: 50,
  },
  headlineItalic: {
    fontSize: 44,
    fontWeight: '700',
    fontStyle: 'italic',
    color: C.accent,
    letterSpacing: -1.5,
    lineHeight: 52,
    marginBottom: 18,
  },
  body: {
    fontSize: 15,
    color: C.muted,
    lineHeight: 22,
    maxWidth: 300,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  statDark: {
    backgroundColor: C.ink,
  },
  statLight: {
    backgroundColor: C.cardLight,
  },
  statDarkMain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 16,
  },
  statBig: {
    fontSize: 24,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.5,
  },
  statSub: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },

  // CTAs
  ctas: {
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: C.ink,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  ghostBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  ghostBtnText: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  // Footer
  footer: {
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: C.accent,
    fontWeight: '600',
  },
});
