import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { Text } from '../../../components/Text';
import { AppButton } from '../../../components/AppButton';
import { BackButton } from '../../../components/BackButton';
import { ChevronDown } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { LoginScreenProps } from '../../../navigation/types';
import { Radius } from '../../../theme';
import { useTheme, ThemeColors } from '../../../theme/ThemeContext';

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [phone, setPhone] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const { sendOtp, isSending, error } = useAuth();

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      await authService.signInWithApple();
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        setGoogleError(e?.message ?? 'Error al iniciar con Apple');
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (e: any) {
      setGoogleError(e?.message ?? 'Error al iniciar con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={s.backRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Inicia sesión</Text>
            <Text style={s.subtitle}>Te enviaremos un código por SMS.</Text>
          </View>

          {/* Phone field */}
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>TELÉFONO</Text>
            <View style={s.phoneRow}>
              <TouchableOpacity style={s.countryChip} activeOpacity={0.7}>
                <Text style={s.flag}>🇲🇽</Text>
                <Text style={s.countryCode}>+52</Text>
                <ChevronDown size={14} color={colors.muted} strokeWidth={2} />
              </TouchableOpacity>
              <TextInput
                style={s.phoneInput}
                placeholder="55 8421 9032"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {error ? <Text style={s.error}>{error}</Text> : null}
          </View>

          <AppButton
            label="Continuar"
            onPress={handleContinue}
            loading={isSending}
            disabled={!isValid}
          />

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>O CONTINÚA CON</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.socialStack}>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.7} onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading
                ? <ActivityIndicator size="small" color={colors.ink} />
                : <><Text style={s.googleIcon}>G</Text><Text style={s.socialLabel}>Continuar con Google</Text></>}
            </TouchableOpacity>
            {googleError ? <Text style={s.error}>{googleError}</Text> : null}
            {Platform.OS === 'ios' && (
              <AppleButton
                buttonStyle={isDark ? AppleButton.Style.WHITE : AppleButton.Style.BLACK}
                buttonType={AppleButton.Type.SIGN_IN}
                style={s.appleBtn}
                cornerRadius={Radius.xl}
                onPress={handleAppleSignIn}
              />
            )}
          </View>
        </View>

        <Text style={s.terms}>
          Al continuar aceptas los{' '}
          <Text style={s.termsLink}>Términos</Text>
          {' '}y la{' '}
          <Text style={s.termsLink}>Política de privacidad</Text>.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.canvas },
  flex:    { flex: 1 },
  backRow: { marginTop: 8, marginLeft: 16 },

  container: { flex: 1, paddingHorizontal: 20, paddingTop: 28, gap: 22 },

  header:   { gap: 6 },
  title:    { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22 },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  phoneRow:   { flexDirection: 'row', gap: 10 },
  countryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 14,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  flag:        { fontSize: 16 },
  countryCode: { fontSize: 15, fontWeight: '600', color: colors.ink },
  phoneInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 17, color: colors.ink,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.inputBg, letterSpacing: 0.5,
  },
  error: { fontSize: 13, color: colors.error, paddingLeft: 2 },

  divider:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 11, color: colors.muted, fontWeight: '600', letterSpacing: 0.5 },

  socialStack: { gap: 10 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 15, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.inputBg,
  },
  googleIcon:  { fontSize: 16, fontWeight: '800', color: colors.ink },
  socialLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  appleBtn:    { width: '100%', height: 52 },

  terms: {
    fontSize: 12, color: colors.muted, textAlign: 'center',
    paddingHorizontal: 24, paddingBottom: 20, lineHeight: 18,
  },
  termsLink: { color: colors.ink, fontWeight: '600', textDecorationLine: 'underline' },
});
