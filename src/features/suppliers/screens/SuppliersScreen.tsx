import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, Plus, Trash2, X, Search, Package } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { SuppliersScreenProps } from '../../../navigation/types';
import { useSuppliers } from '../hooks/useSuppliers';
import { Supplier } from '../../../types';

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const SupplierRow = ({ supplier, onDelete }: { supplier: Supplier; onDelete: () => void }) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_row(colors), [colors]);
  return (
    <View style={s.wrap}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials(supplier.name)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{supplier.name}</Text>
        {supplier.category ? <Text style={s.chip}>{supplier.category}</Text> : null}
        {supplier.phone ? <Text style={s.sub}>{supplier.phone}</Text> : null}
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={12} activeOpacity={0.7}>
        <Trash2 size={16} color={colors.muted} strokeWidth={1.75} />
      </TouchableOpacity>
    </View>
  );
};

const make_row = (c: ThemeColors) => StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  info:       { flex: 1, gap: 3 },
  name:       { fontSize: 14, fontWeight: '700', color: c.ink },
  chip:       { alignSelf: 'flex-start', fontSize: 10, fontWeight: '700', color: c.amberText, backgroundColor: c.amberBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  sub:        { fontSize: 12, color: c.muted },
});

const CATEGORIES = ['Alimentos', 'Bebidas', 'Insumos', 'Empaques', 'Limpieza', 'Otro'];

export const SuppliersScreen = ({ navigation }: SuppliersScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);
  const m = useMemo(() => make_m(colors), [colors]);

  const { suppliers, isLoading, addSupplier, removeSupplier } = useSuppliers();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() =>
    suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone ?? '').includes(search),
    ), [suppliers, search]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await addSupplier({ name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, category: category || undefined });
      setName(''); setPhone(''); setEmail(''); setCategory('');
      setModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setName(''); setPhone(''); setEmail(''); setCategory('');
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
          <Text style={s.title}>Proveedores</Text>
          <Text style={s.subtitle}>{suppliers.length} registrados</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Search size={16} color={colors.muted} strokeWidth={1.75} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar proveedor..."
          placeholderTextColor={colors.muted}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Package size={48} color={colors.muted} strokeWidth={1} />
          <Text style={s.emptyTitle}>{search ? 'Sin resultados' : 'Sin proveedores aún'}</Text>
          <Text style={s.emptySub}>{search ? 'Prueba con otro nombre' : 'Agrega tu primer proveedor'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <SupplierRow supplier={item} onDelete={() => removeSupplier(item.id)} />
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={m.overlay}>
          <SafeAreaView style={m.sheetSafe}>
            <View style={m.sheet}>
              <View style={m.handle} />
              <View style={m.header}>
                <Text style={m.title}>Nuevo proveedor</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={20} color={colors.ink} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={m.field}>
                <Text style={m.label}>Nombre *</Text>
                <TextInput style={m.input} value={name} onChangeText={setName} placeholder="Ej. Distribuidora Norte" placeholderTextColor={colors.muted} />
              </View>
              <View style={m.field}>
                <Text style={m.label}>Teléfono</Text>
                <TextInput style={m.input} value={phone} onChangeText={setPhone} placeholder="+52 55 0000 0000" placeholderTextColor={colors.muted} keyboardType="phone-pad" />
              </View>
              <View style={m.field}>
                <Text style={m.label}>Categoría</Text>
                <View style={m.chips}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[m.chip, category === cat && m.chipActive]}
                      onPress={() => setCategory(c => c === cat ? '' : cat)}
                      activeOpacity={0.75}>
                      <Text style={[m.chipText, category === cat && m.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[m.saveBtn, (!name.trim() || isSaving) && m.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!name.trim() || isSaving}
                activeOpacity={0.85}>
                <Text style={m.saveText}>{isSaving ? 'Guardando...' : 'Guardar proveedor'}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: c.canvas },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  headerText:  { flex: 1, gap: 1 },
  title:       { fontSize: 20, fontWeight: '800', color: c.ink, letterSpacing: -0.5 },
  subtitle:    { fontSize: 12, color: c.muted },
  addBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 8, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput: { flex: 1, fontSize: 14, color: c.ink, padding: 0 },
  list:        { paddingHorizontal: 20, paddingVertical: 4 },
  sep:         { height: 1, backgroundColor: c.border },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 60 },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: c.ink },
  emptySub:    { fontSize: 13, color: c.muted },
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
  chips:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.canvas },
  chipActive:      { backgroundColor: c.accent, borderColor: c.accent },
  chipText:        { fontSize: 12, fontWeight: '600', color: c.muted },
  chipTextActive:  { color: '#fff' },
  saveBtn:         { backgroundColor: c.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.5 },
  saveText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
});
