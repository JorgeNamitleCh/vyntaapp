import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { OtpScreenProps } from '../../../navigation/types';

const C = {
  canvas:  '#F4F2EC',
  ink:     '#0E1614',
  accent:  '#0E5C3F',
  muted:   '#6B7280',
  border:  '#E5E3DC',
  white:   '#FFFFFF',
  error:   '#DC2626',
};

const RESEND_SECONDS = 60;
const CODE_LENGTH    = 6;

export const OtpScreen = ({ navigation, route }: OtpScreenProps) => {
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
    if (digits.length === CODE_LENGTH) {
      inputRef.current?.blur();
    }
  };

  const digits = code.split('').concat(Array(CODE_LENGTH - code.length).fill(''));

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>

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

          <TouchableOpacity
            style={[s.verifyBtn, code.length < CODE_LENGTH && s.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={code.length < CODE_LENGTH || isVerifying}
            activeOpacity={0.85}>
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.verifyBtnText}>Verificar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={seconds > 0} style={s.resendRow}>
            {seconds > 0 ? (
              <Text style={s.resendDisabled}>Reenviar código en <Text style={s.resendTimer}>{seconds}s</Text></Text>
            ) : (
              <Text style={s.resendActive}>Reenviar código</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.canvas },
  flex:   { flex: 1 },

  backBtn: {
    marginTop: 8, marginLeft: 16,
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  container: {
    flex: 1, paddingHorizontal: 20, paddingTop: 28, gap: 24,
  },

  header:   { gap: 8 },
  title:    { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: C.muted, lineHeight: 22 },
  phone:    { fontSize: 15, fontWeight: '700', color: C.ink },

  hiddenInput: {
    position: 'absolute', width: 1, height: 1, opacity: 0,
  },

  digitsRow: {
    flexDirection: 'row', gap: 10, justifyContent: 'center',
  },
  digitBox: {
    width: 48, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center',
  },
  digitBoxFocused: { borderColor: C.accent, borderWidth: 2 },
  digitBoxFilled:  { borderColor: C.ink },
  digitText: { fontSize: 24, fontWeight: '700', color: C.ink },

  error: { fontSize: 13, color: C.error, textAlign: 'center' },

  verifyBtn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  verifyBtnDisabled: { opacity: 0.4 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },

  resendRow:     { alignItems: 'center', paddingVertical: 4 },
  resendDisabled:{ fontSize: 14, color: C.muted },
  resendTimer:   { fontWeight: '700', color: C.muted },
  resendActive:  { fontSize: 14, fontWeight: '700', color: C.accent },
});
