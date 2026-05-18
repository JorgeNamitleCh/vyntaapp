import React, { useState, useMemo } from 'react';
import {
  View, TouchableOpacity, FlatList, Modal, TextInput,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import {
  ChevronLeft, Plus, Trash2, X, Search, User, BookUser,
} from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { CustomersScreenProps } from '../../../navigation/types';
import { useCustomers } from '../hooks/useCustomers';
import { useSaveCustomer } from '../hooks/useSaveCustomer';
import { Customer } from '../../../types';
import { useContactPicker, ContactEntry } from '../../../utils/useContactPicker';

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Contact Picker Modal ─────────────────────────────────────────────────────

const ContactPickerModal = ({
  visible, contacts, isLoading, search, onSearch, onSelect, onClose,
}: {
  visible: boolean;
  contacts: ContactEntry[];
  isLoading: boolean;
  search: string;
  onSearch: (t: string) => void;
  onSelect: (c: ContactEntry) => void;
  onClose: () => void;
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const m = useMemo(() => make_cp(colors), [colors]);
  const filtered = useMemo(
    () => contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [contacts, search],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={[m.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={m.handle} />
          <View style={m.header}>
            <Text style={m.title}>Importar contacto</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.ink} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={m.searchWrap}>
            <Search size={15} color={colors.muted} strokeWidth={1.75} />
            <TextInput
              style={m.searchInput}
              value={search}
              onChangeText={onSearch}
              placeholder="Buscar contacto..."
              placeholderTextColor={colors.muted}
              autoFocus
            />
          </View>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(_, i) => i.toString()}
              style={m.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={m.item} onPress={() => onSelect(item)} activeOpacity={0.7}>
                  <View style={m.avatar}>
                    <Text style={m.avatarText}>{initials(item.name)}</Text>
                  </View>
                  <View style={m.itemInfo}>
                    <Text style={m.itemName}>{item.name}</Text>
                    {item.phone ? <Text style={m.itemPhone}>{item.phone}</Text> : null}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
              ListEmptyComponent={
                <Text style={m.empty}>Sin resultados</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const make_cp = (c: ThemeColors) => StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingHorizontal: 24 },
  handle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title:       { fontSize: 18, fontWeight: '800', color: c.ink },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 14, color: c.ink, padding: 0 },
  list:        { maxHeight: 420 },
  item:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: '#fff', fontSize: 13, fontWeight: '800' },
  itemInfo:    { flex: 1, gap: 2 },
  itemName:    { fontSize: 14, fontWeight: '600', color: c.ink },
  itemPhone:   { fontSize: 12, color: c.muted },
  empty:       { fontSize: 13, color: c.muted, textAlign: 'center', paddingVertical: 24 },
});

// ─── Customer Row ─────────────────────────────────────────────────────────────

const CustomerRow = ({ customer, onEdit, onDelete }: { customer: Customer; onEdit: () => void; onDelete: () => void }) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_row(colors), [colors]);
  return (
    <TouchableOpacity style={s.wrap} onPress={onEdit} activeOpacity={0.75}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials(customer.name)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{customer.name}</Text>
        {customer.phone ? <Text style={s.sub}>{customer.phone}</Text> : null}
        {customer.email ? <Text style={s.sub}>{customer.email}</Text> : null}
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={12} activeOpacity={0.7}>
        <Trash2 size={16} color={colors.muted} strokeWidth={1.75} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const make_row = (c: ThemeColors) => StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  info:       { flex: 1, gap: 2 },
  name:       { fontSize: 14, fontWeight: '700', color: c.ink },
  sub:        { fontSize: 12, color: c.muted },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const CustomersScreen = ({ navigation }: CustomersScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);
  const m = useMemo(() => make_m(colors), [colors]);

  const { customers, isLoading, deleteCustomer } = useCustomers();
  const { save, isSaving } = useSaveCustomer();
  const { contacts, isLoading: loadingContacts, openPicker } = useContactPicker();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contactPickerVisible, setContactPickerVisible] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filtered = useMemo(() =>
    customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? '').includes(search),
    ), [customers, search]);

  const openManual = () => {
    setEditingId(null);
    setName(''); setPhone(''); setEmail('');
    setModalVisible(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setName(customer.name);
    setPhone(customer.phone ?? '');
    setEmail(customer.email ?? '');
    setModalVisible(true);
  };

  const openContactImport = async () => {
    const ok = await openPicker();
    if (ok) {
      setContactSearch('');
      setContactPickerVisible(true);
    }
  };

  const handleContactSelect = async (contact: ContactEntry) => {
    setContactPickerVisible(false);
    await save({ name: contact.name, phone: contact.phone || undefined });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await save(
      { name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined },
      editingId ?? undefined,
    );
    setEditingId(null);
    setName(''); setPhone(''); setEmail('');
    setModalVisible(false);
  };

  const closeModal = () => {
    setEditingId(null);
    setName(''); setPhone(''); setEmail('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Clientes</Text>
          <Text style={s.subtitle}>{customers.length} registrados</Text>
        </View>
        <TouchableOpacity style={s.contactBtn} onPress={openContactImport} activeOpacity={0.8}>
          <BookUser size={18} color={colors.accent} strokeWidth={1.75} />
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={openManual} activeOpacity={0.8}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Search size={16} color={colors.muted} strokeWidth={1.75} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar cliente..."
          placeholderTextColor={colors.muted}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <User size={48} color={colors.muted} strokeWidth={1} />
          <Text style={s.emptyTitle}>{search ? 'Sin resultados' : 'Sin clientes aún'}</Text>
          <Text style={s.emptySub}>{search ? 'Prueba con otro nombre' : 'Agrega o importa un cliente'}</Text>
          {!search && (
            <TouchableOpacity style={s.importHint} onPress={openContactImport} activeOpacity={0.8}>
              <BookUser size={16} color={colors.accent} strokeWidth={1.75} />
              <Text style={s.importHintText}>Importar desde contactos</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <CustomerRow customer={item} onEdit={() => openEdit(item)} onDelete={() => deleteCustomer(item.id)} />
          )}
          ListFooterComponent={
            <TouchableOpacity style={s.importRow} onPress={openContactImport} activeOpacity={0.8}>
              <BookUser size={15} color={colors.accent} strokeWidth={1.75} />
              <Text style={s.importRowText}>Importar desde contactos</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Manual add modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={m.overlay}>
          <SafeAreaView style={m.sheetSafe}>
            <View style={m.sheet}>
              <View style={m.handle} />
              <View style={m.header}>
                <Text style={m.title}>{editingId ? 'Editar cliente' : 'Nuevo cliente'}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={20} color={colors.ink} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={m.field}>
                <Text style={m.label}>Nombre *</Text>
                <TextInput style={m.input} value={name} onChangeText={setName} placeholder="Ej. María García" placeholderTextColor={colors.muted} />
              </View>
              <View style={m.field}>
                <Text style={m.label}>Teléfono</Text>
                <TextInput style={m.input} value={phone} onChangeText={setPhone} placeholder="+52 55 0000 0000" placeholderTextColor={colors.muted} keyboardType="phone-pad" />
              </View>
              <View style={m.field}>
                <Text style={m.label}>Correo</Text>
                <TextInput style={m.input} value={email} onChangeText={setEmail} placeholder="cliente@correo.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <TouchableOpacity style={m.importBtn} onPress={() => { closeModal(); openContactImport(); }} activeOpacity={0.75}>
                <BookUser size={16} color={colors.accent} strokeWidth={1.75} />
                <Text style={m.importBtnText}>Importar desde contactos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[m.saveBtn, (!name.trim() || isSaving) && m.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!name.trim() || isSaving}
                activeOpacity={0.85}>
                <Text style={m.saveText}>{isSaving ? 'Guardando...' : editingId ? 'Actualizar cliente' : 'Guardar cliente'}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Contact picker modal */}
      <ContactPickerModal
        visible={contactPickerVisible}
        contacts={contacts}
        isLoading={loadingContacts}
        search={contactSearch}
        onSearch={setContactSearch}
        onSelect={handleContactSelect}
        onClose={() => setContactPickerVisible(false)}
      />
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:           { flex: 1, backgroundColor: c.canvas },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  headerText:     { flex: 1, gap: 1 },
  title:          { fontSize: 20, fontWeight: '800', color: c.ink, letterSpacing: -0.5 },
  subtitle:       { fontSize: 12, color: c.muted },
  contactBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1.5, borderColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  addBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 8, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput:    { flex: 1, fontSize: 14, color: c.ink, padding: 0 },
  list:           { paddingHorizontal: 20, paddingVertical: 4 },
  sep:            { height: 1, backgroundColor: c.border },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  emptyTitle:     { fontSize: 17, fontWeight: '700', color: c.ink },
  emptySub:       { fontSize: 13, color: c.muted },
  importHint:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 16, paddingVertical: 12 },
  importHintText: { fontSize: 14, fontWeight: '600', color: c.accent },
  importRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 16, marginTop: 4 },
  importRowText:  { fontSize: 14, fontWeight: '600', color: c.accent },
});

const make_m = (c: ThemeColors) => StyleSheet.create({
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:       { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:           { paddingHorizontal: 24, paddingBottom: 24 },
  handle:          { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:           { fontSize: 18, fontWeight: '800', color: c.ink },
  field:           { gap: 8, marginBottom: 16 },
  label:           { fontSize: 12, fontWeight: '700', color: c.muted, letterSpacing: 0.5 },
  input:           { backgroundColor: c.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: c.ink },
  importBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1.5, borderColor: c.accent, paddingVertical: 13, marginBottom: 12 },
  importBtnText:   { fontSize: 14, fontWeight: '700', color: c.accent },
  saveBtn:         { backgroundColor: c.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
});
