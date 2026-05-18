import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Text } from '../../../components/Text';
import { AppButton } from '../../../components/AppButton';
import { BackButton } from '../../../components/BackButton';
import { useAuth } from '../hooks/useAuth';
import { OtpScreenProps } from '../../../navigation/types';
import { Radius } from '../../../theme';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

const RESEND_SECONDS = 60;
const CODE_LENGTH    = 6;

export const OtpScreen = ({ navigation, route }: OtpScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const { phoneNumber, verificationId: initialVerificationId } = route.params;
  const [verificationId, setVerificationId] = useState(initialVerificationId);
  const [code, setCode]       = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);
  const { verifyOtp, sendOtp, isVerifying, error } = useAuth();

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) return;
    await verifyOtp(verificationId, code);
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    const newId = await sendOtp(phoneNumber);
    if (newId) {
      setVerificationId(newId);
      setSeconds(RESEND_SECONDS);
      setCode('');
    }
  };

  const handleCodeChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) inputRef.current?.blur();
  };

  const digits = code.split('').concat(Array(CODE_LENGTH - code.length).fill(''));

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={s.backRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Código SMS</Text>
            <Text style={s.subtitle}>
              Enviamos un código de 6 dígitos a{'\n'}
              <Text style={s.phone}>{phoneNumber}</Text>
            </Text>
          </View>

          {/* Hidden input captures real keyboard input */}
          <TextInput
            ref={inputRef}
            style={s.hiddenInput}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
          />

          {/* Digit boxes */}
          <TouchableOpacity
            style={s.digitsRow}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}>
            {digits.map((digit, i) => {
              const isFocused = i === code.length;
              return (
                <View
                  key={i}
                  style={[
                    s.digitBox,
                    isFocused && s.digitBoxFocused,
                    digit !== '' && s.digitBoxFilled,
                  ]}>
                  <Text style={s.digitText}>{digit}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <AppButton
            label="Verificar"
            onPress={handleVerify}
            loading={isVerifying}
            disabled={code.length < CODE_LENGTH}
          />

          <TouchableOpacity onPress={handleResend} disabled={seconds > 0} style={s.resendRow}>
            {seconds > 0 ? (
              <Text style={s.resendDisabled}>
                Reenviar código en <Text style={s.resendTimer}>{seconds}s</Text>
              </Text>
            ) : (
              <Text style={s.resendActive}>Reenviar código</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.canvas },
  flex:    { flex: 1 },
  backRow: { marginTop: 8, marginLeft: 16 },

  container: { flex: 1, paddingHorizontal: 20, paddingTop: 28, gap: 24 },

  header:   { gap: 8 },
  title:    { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  phone:    { fontSize: 15, fontWeight: '700', color: colors.ink },

  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  digitsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  digitBox: {
    width: 48, height: 56, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  digitBoxFocused: { borderColor: colors.accent, borderWidth: 2 },
  digitBoxFilled:  { borderColor: colors.ink },
  digitText: { fontSize: 24, fontWeight: '700', color: colors.ink },

  error: { fontSize: 13, color: colors.error, textAlign: 'center' },

  resendRow:      { alignItems: 'center', paddingVertical: 4 },
  resendDisabled: { fontSize: 14, color: colors.muted },
  resendTimer:    { fontWeight: '700', color: colors.muted },
  resendActive:   { fontSize: 14, fontWeight: '700', color: colors.accent },
});
