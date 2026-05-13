import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView, Linking,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, MessageCircle, ChevronDown, ChevronUp, Mail, ExternalLink } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'HelpSupport'>;

const C = {
  canvas: '#F4F2EC', ink: '#0E1614', accent: '#0E5C3F',
  muted: '#6B7280', border: '#E5E3DC', white: '#FFFFFF',
  green: '#22C55E',
};

const FAQS = [
  { q: '¿Cómo agrego un producto al inventario?', a: 'Ve a la pestaña Inventario, toca el botón + y llena el nombre, precio y stock. El producto quedará disponible en el POS de inmediato.' },
  { q: '¿Puedo usar Vynta sin internet?', a: 'Sí, Vynta funciona en modo offline. Las ventas se sincronizan automáticamente cuando recuperas conexión.' },
  { q: '¿Cómo cancelo o edito una venta?', a: 'Por ahora puedes ver el historial en Reportes. La edición de ventas está disponible en el plan Pro.' },
  { q: '¿Cómo agrego a mi equipo?', a: 'Ve a Ajustes → Empleados y toca el botón +. Ingresa el número de WhatsApp y el empleado recibirá la invitación.' },
  { q: '¿Cómo genero una factura CFDI?', a: 'Configura tus datos fiscales en Ajustes → Datos de facturación. Activa la opción en Impuestos y podrás facturar desde cada venta.' },
];

const FaqItem = ({ faq }: { faq: typeof FAQS[0] }) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.75}>
      <View style={fq.row}>
        <Text style={fq.question}>{faq.q}</Text>
        {open ? <ChevronUp size={16} color={C.muted} strokeWidth={2} /> : <ChevronDown size={16} color={C.muted} strokeWidth={2} />}
      </View>
      {open && <Text style={fq.answer}>{faq.a}</Text>}
    </TouchableOpacity>
  );
};

const fq = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 },
  question: { flex: 1, fontSize: 14, fontWeight: '600', color: C.ink, lineHeight: 20 },
  answer:   { fontSize: 13, color: C.muted, lineHeight: 20, paddingBottom: 14, paddingRight: 28 },
});

export const HelpSupportScreen = ({ navigation }: Props) => (
  <SafeAreaView style={s.root}>
    <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
    <View style={s.header}>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
      </TouchableOpacity>
      <Text style={s.title}>Ayuda y soporte</Text>
    </View>

    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.contactRow}>
        <TouchableOpacity
          style={[s.contactCard, { backgroundColor: '#DCFCE7' }]}
          onPress={() => Linking.openURL('https://wa.me/5215500000000?text=Hola, necesito ayuda con Vynta')}
          activeOpacity={0.8}>
          <MessageCircle size={24} color={C.green} strokeWidth={1.75} />
          <Text style={[s.contactLabel, { color: '#15803D' }]}>WhatsApp</Text>
          <Text style={[s.contactSub, { color: '#15803D' }]}>Respuesta en minutos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.contactCard, { backgroundColor: '#EDE9FE' }]}
          onPress={() => Linking.openURL('mailto:soporte@vynta.mx')}
          activeOpacity={0.8}>
          <Mail size={24} color="#7C3AED" strokeWidth={1.75} />
          <Text style={[s.contactLabel, { color: '#7C3AED' }]}>Email</Text>
          <Text style={[s.contactSub, { color: '#7C3AED' }]}>soporte@vynta.mx</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionLabel}>PREGUNTAS FRECUENTES</Text>
      <View style={s.card}>
        {FAQS.map((faq, i) => (
          <View key={i}>
            {i > 0 && <View style={s.sep} />}
            <FaqItem faq={faq} />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={s.docsBtn}
        onPress={() => Linking.openURL('https://vynta.mx/ayuda')}
        activeOpacity={0.8}>
        <ExternalLink size={16} color={C.accent} strokeWidth={2} />
        <Text style={s.docsBtnText}>Ver documentación completa</Text>
      </TouchableOpacity>

      <Text style={s.version}>Vynta v1.0.0 · Hecho con ♥ en México</Text>
      <View style={{ height: 32 }} />
    </ScrollView>
  </SafeAreaView>
);

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.canvas },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  scroll:       { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8, marginTop: 4, marginBottom: 2 },
  contactRow:   { flexDirection: 'row', gap: 12 },
  contactCard:  { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  contactLabel: { fontSize: 15, fontWeight: '800' },
  contactSub:   { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  card:         { backgroundColor: C.white, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16 },
  sep:          { height: 1, backgroundColor: C.border },
  docsBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: C.white, borderRadius: 14, borderWidth: 1.5, borderColor: C.border },
  docsBtnText:  { fontSize: 14, fontWeight: '700', color: C.accent },
  version:      { fontSize: 12, color: C.muted, textAlign: 'center' },
});
