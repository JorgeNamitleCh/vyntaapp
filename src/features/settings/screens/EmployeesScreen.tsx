import React, { useState } from 'react';
import {
  View, TouchableOpacity, FlatList, Modal,
  TextInput, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Text } from '../../../components/Text';
import { ChevronLeft, Plus, Trash2, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'Employees'>;

const C = {
  canvas: '#F4F2EC', ink: '#0E1614', accent: '#0E5C3F',
  muted: '#6B7280', border: '#E5E3DC', white: '#FFFFFF',
};

type EmployeeRole = 'Admin' | 'Cashier' | 'Inventory';

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

type Employee = { id: string; name: string; phone: string; role: EmployeeRole };

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Daniel Reyes', phone: '+52 55 1234 5678', role: 'Admin' },
  { id: '2', name: 'Sofía López',  phone: '+52 55 9876 5432', role: 'Cashier' },
];

const ROLES: EmployeeRole[] = ['Admin', 'Cashier', 'Inventory'];

const EmployeeRow = ({ employee, onDelete }: { employee: Employee; onDelete: () => void }) => {
  const initials   = employee.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const roleColors = ROLE_COLORS[employee.role];
  return (
    <View style={card.wrap}>
      <View style={card.avatar}><Text style={card.avatarText}>{initials}</Text></View>
      <View style={card.info}>
        <Text style={card.name}>{employee.name}</Text>
        <Text style={card.phone}>{employee.phone}</Text>
      </View>
      <View style={[card.badge, { backgroundColor: roleColors.bg }]}>
        <Text style={[card.badgeText, { color: roleColors.text }]}>{ROLE_LABELS[employee.role]}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={12} activeOpacity={0.7}>
        <Trash2 size={16} color={C.muted} strokeWidth={1.75} />
      </TouchableOpacity>
    </View>
  );
};

const card = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  info:       { flex: 1, gap: 2 },
  name:       { fontSize: 14, fontWeight: '700', color: C.ink },
  phone:      { fontSize: 12, color: C.muted },
  badge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
});

export const EmployeesScreen = ({ navigation }: Props) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole]   = useState<EmployeeRole>('Cashier');

  const handleInvite = () => {
    if (!newName.trim()) return;
    setEmployees((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim(), role: newRole },
    ]);
    setNewName(''); setNewPhone(''); setNewRole('Cashier');
    setModalVisible(false);
  };

  const removeEmployee = (id: string) =>
    setEmployees((prev) => prev.filter((e) => e.id !== id));

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Empleados</Text>
          <Text style={s.subtitle}>{employees.length} personas con acceso</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        renderItem={({ item }) => (
          <EmployeeRow employee={item} onDelete={() => removeEmployee(item.id)} />
        )}
        ListFooterComponent={
          <TouchableOpacity style={s.inviteRow} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Plus size={16} color={C.accent} strokeWidth={2.5} />
            <Text style={s.inviteText}>Invitar empleado</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={modal.overlay}>
          <SafeAreaView style={modal.sheetSafe}>
            <View style={modal.sheet}>
              <View style={modal.handle} />
              <View style={modal.header}>
                <Text style={modal.title}>Invitar empleado</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={C.ink} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={modal.field}>
                <Text style={modal.fieldLabel}>Nombre completo</Text>
                <TextInput style={modal.input} value={newName} onChangeText={setNewName} placeholder="Ej. Ana García" placeholderTextColor={C.muted} />
              </View>
              <View style={modal.field}>
                <Text style={modal.fieldLabel}>Teléfono (WhatsApp)</Text>
                <TextInput style={modal.input} value={newPhone} onChangeText={setNewPhone} placeholder="+52 55 0000 0000" placeholderTextColor={C.muted} keyboardType="phone-pad" />
              </View>
              <View style={modal.field}>
                <Text style={modal.fieldLabel}>Rol</Text>
                <View style={modal.roleRow}>
                  {ROLES.map((role) => (
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
              <TouchableOpacity style={modal.submitBtn} onPress={handleInvite} activeOpacity={0.85}>
                <Text style={modal.submitText}>Enviar invitación</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.canvas },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 1 },
  title:      { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  subtitle:   { fontSize: 12, color: C.muted },
  addBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  list:       { paddingHorizontal: 20, paddingVertical: 8 },
  separator:  { height: 1, backgroundColor: C.border },
  inviteRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 16, marginTop: 4 },
  inviteText: { fontSize: 14, fontWeight: '700', color: C.accent },
});

const modal = StyleSheet.create({
  overlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:         { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:             { paddingHorizontal: 24, paddingBottom: 24 },
  handle:            { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:             { fontSize: 18, fontWeight: '800', color: C.ink },
  field:             { gap: 8, marginBottom: 20 },
  fieldLabel:        { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  input:             { backgroundColor: C.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: C.ink },
  roleRow:           { flexDirection: 'row', gap: 8 },
  roleChip:          { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.canvas },
  roleChipActive:    { backgroundColor: C.ink, borderColor: C.ink },
  roleChipText:      { fontSize: 13, fontWeight: '600', color: C.muted },
  roleChipTextActive:{ color: '#fff' },
  submitBtn:         { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
});
