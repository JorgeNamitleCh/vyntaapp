import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { LoginScreenProps } from '../../../navigation/types';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  inputBg: '#FFFFFF',
  cardBg: '#F7F5EE',
};

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [phone, setPhone] = useState('');
  const { sendOtp, isSending, error } = useAuth();

  const handleContinue = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;
    const fullNumber = `+52${digits}`;
    const verificationId = await sendOtp(fullNumber);
    if (verificationId) {
      navigation.navigate('Otp', { phoneNumber: fullNumber, verificationId });
    }
  };

  const isValid = phone.replace(/\D/g, '').length >= 10;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Inicia sesión</Text>
            <Text style={styles.subtitle}>Te enviaremos un código por SMS.</Text>
          </View>

          {/* Phone field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TELÉFONO</Text>
            <View style={styles.phoneRow}>
              {/* Country chip */}
              <TouchableOpacity style={styles.countryChip} activeOpacity={0.7}>
                <Text style={styles.flag}>🇲🇽</Text>
                <Text style={styles.countryCode}>+52</Text>
                <ChevronDown size={14} color={C.muted} strokeWidth={2} />
              </TouchableOpacity>

              {/* Number input */}
              <TextInput
                style={styles.phoneInput}
                placeholder="55 8421 9032"
                placeholderTextColor={C.muted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          {/* Continuar */}
          <TouchableOpacity
            style={[styles.primaryBtn, !isValid && styles.primaryBtnDisabled]}
            onPress={handleContinue}
            disabled={!isValid || isSending}
            activeOpacity={0.85}>
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Continuar</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CONTINÚA CON</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons — stacked */}
          <View style={styles.socialStack}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialLabel}>Continuar con Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.socialLabel}>Continuar con Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          Al continuar aceptas los{' '}
          <Text style={styles.termsLink}>Términos</Text>
          {' '}y la{' '}
          <Text style={styles.termsLink}>Política de privacidad</Text>.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  flex: {
    flex: 1,
  },

  // Back button
  backBtn: {
    marginTop: 8,
    marginLeft: 16,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 22,
  },

  // Header
  header: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: C.muted,
    lineHeight: 22,
  },

  // Phone field
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.inputBg,
  },
  flag: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: C.ink,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    color: C.ink,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.inputBg,
    letterSpacing: 0.5,
  },
  error: {
    fontSize: 13,
    color: '#DC2626',
    paddingLeft: 2,
  },

  // Primary button
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Social buttons
  socialStack: {
    gap: 10,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.inputBg,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
  appleIcon: {
    fontSize: 18,
    color: C.ink,
    lineHeight: 20,
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.ink,
  },

  // Terms
  terms: {
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: C.ink,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
