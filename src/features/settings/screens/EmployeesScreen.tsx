import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, FlatList, Modal,
  TextInput, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, Plus, Trash2, X, BookUser } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { useEmployees } from '../../employees/hooks/useEmployees';
import { EmployeeRole } from '../../../types';
import { useContactPicker, ContactEntry } from '../../../utils/useContactPicker';

type Props = NativeStackScreenProps<AppStackParamList, 'Employees'>;

const ROLE_LABELS: Record<EmployeeRole, string> = {
  Admin:     'Admin',
  Cashier:   'Cajero',
  Inventory: 'Inventario',
};

const ROLE_COLORS: Record<EmployeeRole, { bg: string; text: string }> = {
  Admin:     { bg: '#DCFCE7', text: '#15803D' },
  Cashier:   { bg: '#EDE9FE', text: '#7C3AED' },
  Inventory: { bg: '#FEF3C7', text: '#D97706' },
};

const ROLES: EmployeeRole[] = ['Admin', 'Cashier', 'Inventory'];

const EmployeeRow = ({ name, phone, role, onDelete }: { name: string; phone?: string; role: EmployeeRole; onDelete: () => void }) => {
  const colors = useThemeColors();
  const card = useMemo(() => make_card(colors), [colors]);
  const initials   = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const roleColors = ROLE_COLORS[role];
  return (
    <View style={card.wrap}>
      <View style={card.avatar}><Text style={card.avatarText}>{initials}</Text></View>
      <View style={card.info}>
        <Text style={card.name}>{name}</Text>
        {phone ? <Text style={card.phone}>{phone}</Text> : null}
      </View>
      <View style={[card.badge, { backgroundColor: roleColors.bg }]}>
        <Text style={[card.badgeText, { color: roleColors.text }]}>{ROLE_LABELS[role]}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={12} activeOpacity={0.7}>
        <Trash2 size={16} color={colors.muted} strokeWidth={1.75} />
      </TouchableOpacity>
    </View>
  );
};

const make_card = (colors: ThemeColors) => StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.hero, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  info:       { flex: 1, gap: 2 },
  name:       { fontSize: 14, fontWeight: '700', color: colors.ink },
  phone:      { fontSize: 12, color: colors.muted },
  badge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
});

export const EmployeesScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => make_s(colors), [colors]);
  const modal = useMemo(() => make_modal(colors), [colors]);

  const { employees, isLoading, addEmployee, removeEmployee } = useEmployees();
  const { contacts, isLoading: loadingContacts, openPicker } = useContactPicker();

  const [modalVisible, setModalVisible] = useState(false);
  const [contactPickerVisible, setContactPickerVisible] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [newName, setNewName]   = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole]   = useState<EmployeeRole>('Cashier');
  const [isSaving, setIsSaving] = useState(false);

  const openContactImport = async () => {
    const ok = await openPicker();
    if (ok) { setContactSearch(''); setContactPickerVisible(true); }
  };

  const handleContactSelect = async (contact: ContactEntry) => {
    setContactPickerVisible(false);
    setIsSaving(true);
    try {
      await addEmployee({ name: contact.name, phone: contact.phone || undefined, role: newRole });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await addEmployee({ name: newName.trim(), phone: newPhone.trim() || undefined, role: newRole });
      setNewName(''); setNewPhone(''); setNewRole('Cashier');
      setModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Empleados</Text>
          <Text style={s.subtitle}>{employees.length} personas con acceso</Text>
        </View>
        <TouchableOpacity style={s.contactBtn} onPress={openContactImport} activeOpacity={0.8}>
          <BookUser size={18} color={colors.accent} strokeWidth={1.75} />
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item }) => (
            <EmployeeRow
              name={item.name}
              phone={item.phone}
              role={item.role}
              onDelete={() => removeEmployee(item.id)}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity style={s.inviteRow} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
              <Plus size={16} color={colors.accent} strokeWidth={2.5} />
              <Text style={s.inviteText}>Invitar empleado</Text>
            </TouchableOpacity>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={modal.overlay}>
          <SafeAreaView style={modal.sheetSafe}>
            <View style={modal.sheet}>
              <View style={modal.handle} />
              <View style={modal.header}>
                <Text style={modal.title}>Invitar empleado</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={colors.ink} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={modal.field}>
                <Text style={modal.fieldLabel}>Nombre completo</Text>
                <TextInput style={modal.input} value={newName} onChangeText={setNewName} placeholder="Ej. Ana García" placeholderTextColor={colors.muted} />
              </View>
              <View style={modal.field}>
                <Text style={modal.fieldLabel}>Teléfono (WhatsApp)</Text>
                <TextInput style={modal.input} value={newPhone} onChangeText={setNewPhone} placeholder="+52 55 0000 0000" placeholderTextColor={colors.muted} keyboardType="phone-pad" />
              </View>
              <View style={modal.field}>
                <Text style={modal.fieldLabel}>Rol</Text>
                <View style={modal.roleRow}>
                  {ROLES.map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[modal.roleChip, newRole === role && modal.roleChipActive]}
                      onPress={() => setNewRole(role)}
                      activeOpacity={0.75}>
                      <Text style={[modal.roleChipText, newRole === role && modal.roleChipTextActive]}>
                        {ROLE_LABELS[role]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={modal.importBtn}
                onPress={() => { setModalVisible(false); openContactImport(); }}
                activeOpacity={0.75}>
                <BookUser size={16} color={colors.accent} strokeWidth={1.75} />
                <Text style={modal.importText}>Importar desde contactos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.submitBtn, (!newName.trim() || isSaving) && { opacity: 0.5 }]}
                onPress={handleInvite}
                disabled={!newName.trim() || isSaving}
                activeOpacity={0.85}>
                <Text style={modal.submitText}>{isSaving ? 'Guardando...' : 'Guardar empleado'}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Contact picker */}
      <Modal visible={contactPickerVisible} transparent animationType="slide" onRequestClose={() => setContactPickerVisible(false)}>
        <View style={modal.overlay}>
          <View style={[modal.contactSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={modal.handle} />
            <View style={modal.header}>
              <Text style={modal.title}>Importar contacto</Text>
              <TouchableOpacity onPress={() => setContactPickerVisible(false)}>
                <X size={20} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={modal.input}
              value={contactSearch}
              onChangeText={setContactSearch}
              placeholder="Buscar contacto..."
              placeholderTextColor={colors.muted}
              autoFocus
            />
            <FlatList
              data={contacts.filter(c => c.name.toLowerCase().includes(contactSearch.toLowerCase()))}
              keyExtractor={(_, i) => i.toString()}
              style={modal.contactList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={modal.contactItem}
                  onPress={() => handleContactSelect(item)}
                  activeOpacity={0.7}>
                  <View style={modal.contactAvatar}>
                    <Text style={modal.contactAvatarText}>
                      {item.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={modal.contactName}>{item.name}</Text>
                    {item.phone ? <Text style={modal.contactPhone}>{item.phone}</Text> : null}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
              ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', paddingVertical: 20, fontSize: 13 }}>Sin resultados</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.canvas },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 1 },
  title:      { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle:   { fontSize: 12, color: colors.muted },
  contactBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  addBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  list:       { paddingHorizontal: 20, paddingVertical: 8 },
  separator:  { height: 1, backgroundColor: colors.border },
  inviteRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 16, marginTop: 4 },
  inviteText: { fontSize: 14, fontWeight: '700', color: colors.accent },
});

const make_modal = (colors: ThemeColors) => StyleSheet.create({
  overlay:            { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:          { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:              { paddingHorizontal: 24, paddingBottom: 24 },
  handle:             { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:              { fontSize: 18, fontWeight: '800', color: colors.ink },
  field:              { gap: 8, marginBottom: 20 },
  fieldLabel:         { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  input:              { backgroundColor: colors.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.ink },
  roleRow:            { flexDirection: 'row', gap: 8 },
  roleChip:           { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.canvas },
  roleChipActive:     { backgroundColor: colors.accent, borderColor: colors.accent },
  roleChipText:       { fontSize: 13, fontWeight: '600', color: colors.muted },
  roleChipTextActive: { color: '#fff' },
  importBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1.5, borderColor: colors.accent, paddingVertical: 13, marginBottom: 12 },
  importText:         { fontSize: 14, fontWeight: '700', color: colors.accent },
  submitBtn:          { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitText:         { fontSize: 16, fontWeight: '700', color: '#fff' },
  contactSheet:       { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingHorizontal: 24 },
  contactList:        { marginTop: 8, maxHeight: 420 },
  contactItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  contactAvatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  contactAvatarText:  { color: '#fff', fontSize: 13, fontWeight: '800' },
  contactName:        { fontSize: 14, fontWeight: '600', color: colors.ink },
  contactPhone:       { fontSize: 12, color: colors.muted },
});
