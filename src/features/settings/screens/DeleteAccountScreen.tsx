import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, AlertTriangle, Trash2 } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { Text } from '../../../components/Text';
import { Card } from '../../../components/Card';
import { authService } from '../../auth/services/auth.service';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { Radius } from '../../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'DeleteAccount'>;

export const DeleteAccountScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción es permanente y no se puede deshacer. Se eliminarán tu cuenta y todos tus datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount();
    } catch (error: any) {
      setLoading(false);
      if (error?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Sesión expirada',
          'Por seguridad, cierra sesión, vuelve a iniciarla y luego intenta eliminar tu cuenta.',
          [{ text: 'Entendido' }],
        );
      } else {
        Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta de nuevo.');
      }
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Eliminar cuenta</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.iconWrap}>
          <AlertTriangle size={40} color={colors.error} strokeWidth={1.5} />
        </View>

        <Text style={s.heading}>Esta acción es permanente</Text>
        <Text style={s.body}>
          Al eliminar tu cuenta se borrarán de forma permanente tus datos de acceso. No podrás recuperar tu cuenta una vez eliminada.
        </Text>

        <Card style={s.listCard}>
          {[
            'Tu cuenta e información de inicio de sesión',
            'Tus datos de perfil y configuración',
            'El acceso a todos tus negocios en Vynta',
          ].map((item, i) => (
            <View key={i} style={s.listRow}>
              <View style={s.bullet} />
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </Card>

        <Text style={s.note}>
          Los datos de tu negocio (ventas, inventario, gastos) pueden conservarse en nuestros servidores por un periodo limitado conforme a nuestra política de privacidad.
        </Text>

        <TouchableOpacity
          style={[s.deleteBtn, loading && s.deleteBtnDisabled]}
          onPress={handleDelete}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Trash2 size={16} color="#fff" strokeWidth={2} />
              <Text style={s.deleteBtnText}>Eliminar mi cuenta</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink },

  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 24, marginBottom: 20,
  },

  heading: { fontSize: 22, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
  body:    { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  listCard: { width: '100%', paddingVertical: 8, marginBottom: 16 },
  listRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  bullet:   { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error, marginTop: 7 },
  listText: { flex: 1, fontSize: 14, color: colors.ink, lineHeight: 20 },

  note: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18, marginBottom: 32, paddingHorizontal: 8 },

  deleteBtn: {
    width: '100%', height: 52, borderRadius: Radius.md,
    backgroundColor: colors.error,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 12,
  },
  deleteBtnDisabled: { opacity: 0.6 },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  cancelBtn: { width: '100%', height: 52, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.muted },
});
