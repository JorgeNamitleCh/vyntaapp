import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  ScrollView, KeyboardAvoidingView, Platform,
  Modal,
} from 'react-native';
import { Text } from '../../../components/Text';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import {
  ChevronLeft, ChevronRight, CalendarDays,
  Zap, Home, Users, ShoppingBag, Tag, Truck,
} from 'lucide-react-native';
import { AddExpenseScreenProps } from '../../../navigation/types';
import { toast } from '../../../store/toastStore';

// Spanish locale
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  inputBg: '#FFFFFF',
  cardBg: '#F7F5EE',
};

const CAL_THEME = {
  backgroundColor: C.canvas,
  calendarBackground: C.canvas,
  textSectionTitleColor: C.muted,
  selectedDayBackgroundColor: C.ink,
  selectedDayTextColor: '#fff',
  todayTextColor: C.accent,
  todayBackgroundColor: 'transparent',
  dayTextColor: C.ink,
  textDisabledColor: '#C9C7BE',
  arrowColor: C.ink,
  disabledArrowColor: C.border,
  monthTextColor: C.ink,
  textDayFontWeight: '500' as any,
  textMonthFontWeight: '800' as any,
  textDayHeaderFontWeight: '600' as any,
  textDayFontSize: 14,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 12,
};

type Category = { id: string; label: string; Icon: any; color: string };

const CATEGORIES: Category[] = [
  { id: 'insumos',   label: 'Insumos',   Icon: ShoppingBag, color: '#0E5C3F' },
  { id: 'servicios', label: 'Servicios', Icon: Zap,         color: '#D97706' },
  { id: 'renta',     label: 'Renta',     Icon: Home,        color: '#0E1614' },
  { id: 'nomina',    label: 'Nómina',    Icon: Users,       color: '#B45309' },
  { id: 'delivery',  label: 'Delivery',  Icon: Truck,       color: '#7C3AED' },
  { id: 'otros',     label: 'Otros',     Icon: Tag,         color: '#9CA3AF' },
];

const toDateString = (d: Date): string => d.toISOString().split('T')[0];

const formatDisplay = (dateStr: string): string => {
  const today = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  const [, m, d] = dateStr.split('-');
  const months = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(m)]}`;
};

export const AddExpenseScreen = ({ navigation }: AddExpenseScreenProps) => {
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');

  const todayStr = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [pendingDate, setPendingDate] = useState(todayStr);
  const [calVisible, setCalVisible] = useState(false);

  const amountDisplay = amountRaw
    ? `$${(parseFloat(amountRaw) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
    : '$0.00';

  const isValid = (parseFloat(amountRaw) || 0) > 0
    && description.trim().length >= 2
    && !!selectedCat;

  const handleSave = () => {
    if (!isValid) return;
    toast.success('Gasto registrado', `${description.trim()} · ${amountDisplay}`);
    navigation.goBack();
  };

  const openCalendar = () => {
    setPendingDate(selectedDate);
    setCalVisible(true);
  };

  const confirmDate = () => {
    setSelectedDate(pendingDate);
    setCalVisible(false);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.saveBtn, !isValid && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid}>
            <Text style={s.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Text style={s.title}>Nuevo gasto</Text>

          {/* ── Amount ── */}
          <View style={s.amountCard}>
            <Text style={s.amountLabel}>MONTO</Text>
            <TextInput
              style={s.amountInput}
              value={amountRaw}
              onChangeText={setAmountRaw}
              placeholder="$0.00"
              placeholderTextColor="rgba(14,22,20,0.25)"
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>

          {/* ── Category ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>CATEGORÍA</Text>
            <View style={s.catGrid}>
              {CATEGORIES.map(cat => {
                const active = selectedCat === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.catCard, active && { borderColor: cat.color, backgroundColor: `${cat.color}12` }]}
                    onPress={() => setSelectedCat(active ? null : cat.id)}
                    activeOpacity={0.75}>
                    <View style={[s.catIcon, { backgroundColor: active ? cat.color : C.cardBg }]}>
                      <cat.Icon size={17} color={active ? '#fff' : C.muted} strokeWidth={1.75} />
                    </View>
                    <Text style={[s.catLabel, active && { color: cat.color, fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Details ── */}
          <View style={s.card}>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Descripción</Text>
              <TextInput
                style={s.fieldInput}
                value={description}
                onChangeText={setDescription}
                placeholder="CFE bimestral"
                placeholderTextColor={C.muted}
              />
            </View>
            <View style={s.divider} />
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Proveedor</Text>
              <TextInput
                style={s.fieldInput}
                value={supplier}
                onChangeText={setSupplier}
                placeholder="Opcional"
                placeholderTextColor={C.muted}
              />
            </View>
            <View style={s.divider} />

            {/* Date — tappable, opens calendar */}
            <TouchableOpacity style={s.fieldRow} onPress={openCalendar} activeOpacity={0.7}>
              <Text style={s.fieldLabel}>Fecha</Text>
              <View style={s.dateValue}>
                <Text style={s.dateText}>{formatDisplay(selectedDate)}</Text>
                <CalendarDays size={16} color={C.muted} strokeWidth={1.75} />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Note ── */}
          <View style={s.noteCard}>
            <TextInput
              style={s.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Agregar nota (opcional)"
              placeholderTextColor={C.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.primaryBtn, !isValid && s.primaryBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid}
            activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Registrar gasto</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Calendar modal ── */}
      <Modal
        visible={calVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalVisible(false)}>
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setCalVisible(false)}
        />
        <View style={s.sheet}>
          {/* Sheet handle */}
          <View style={s.handle} />

          <Text style={s.sheetTitle}>Seleccionar fecha</Text>

          <Calendar
            current={pendingDate}
            maxDate={todayStr}
            onDayPress={(day: { dateString: string }) => setPendingDate(day.dateString)}
            markedDates={{
              [pendingDate]: {
                selected: true,
                selectedColor: C.ink,
                selectedTextColor: '#fff',
              },
              [todayStr]: pendingDate !== todayStr
                ? { marked: true, dotColor: C.accent }
                : undefined,
            }}
            theme={CAL_THEME}
            renderArrow={(direction: 'left' | 'right') =>
              direction === 'left'
                ? <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
                : <ChevronRight size={20} color={C.ink} strokeWidth={2} />
            }
          />

          <View style={s.sheetFooter}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setCalVisible(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={confirmDate}>
              <Text style={s.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },
  flex: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: C.accent, borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  title: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -1 },

  amountCard: {
    backgroundColor: C.inputBg, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingVertical: 20, alignItems: 'center', gap: 8,
  },
  amountLabel: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  amountInput: {
    fontSize: 48, fontWeight: '800', color: C.ink,
    letterSpacing: -2, width: '100%', textAlign: 'center', padding: 0,
  },

  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '30%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.inputBg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  catIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 12, fontWeight: '600', color: C.muted },

  card: {
    backgroundColor: C.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 2,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  fieldLabel: { width: 90, fontSize: 14, color: C.muted, fontWeight: '500' },
  fieldInput: { flex: 1, fontSize: 14, color: C.ink, fontWeight: '500', padding: 0, textAlign: 'right' },
  divider: { height: 1, backgroundColor: C.border },
  dateValue: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  dateText: { fontSize: 14, fontWeight: '600', color: C.ink },

  noteCard: {
    backgroundColor: C.inputBg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border, padding: 14,
  },
  noteInput: { fontSize: 14, color: C.ink, minHeight: 72, padding: 0 },

  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  primaryBtn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },

  // Calendar modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: C.canvas,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17, fontWeight: '800', color: C.ink,
    letterSpacing: -0.5, textAlign: 'center', marginBottom: 4,
  },
  sheetFooter: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingTop: 16,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.muted },
  confirmBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    backgroundColor: C.ink, alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
