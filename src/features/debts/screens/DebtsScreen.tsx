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
import { ChevronLeft, Plus, Search, X, ChevronRight, CheckCircle, Clock } from 'lucide-react-native';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';
import { DebtsScreenProps } from '../../../navigation/types';
import { useDebts } from '../hooks/useDebts';
import { useAuthStore } from '../../../store/authStore';
import { debtService } from '../services/debt.service';
import { Debt, DebtType } from '../../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_COLORS: Record<Debt['status'], { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pendiente' },
  partial: { bg: '#EDE9FE', text: '#7C3AED', label: 'Parcial' },
  paid:    { bg: '#DCFCE7', text: '#15803D', label: 'Pagado' },
};

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DebtRow = ({ debt, onPress }: { debt: Debt; onPress: () => void }) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_row(colors), [colors]);
  const st = STATUS_COLORS[debt.status];
  const remaining = debt.amount - debt.paidAmount;
  return (
    <TouchableOpacity style={s.wrap} onPress={onPress} activeOpacity={0.7}>
      <View style={s.left}>
        <Text style={s.entity}>{debt.entityName}</Text>
        <Text style={s.desc} numberOfLines={1}>{debt.description}</Text>
        <Text style={s.date}>{format(debt.createdAt, 'dd MMM yyyy', { locale: es })}</Text>
      </View>
      <View style={s.right}>
        <Text style={s.amount}>{fmt(remaining)}</Text>
        <View style={[s.badge, { backgroundColor: st.bg }]}>
          <Text style={[s.badgeText, { color: st.text }]}>{st.label}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
    </TouchableOpacity>
  );
};

const make_row = (c: ThemeColors) => StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  left:      { flex: 1, gap: 2 },
  entity:    { fontSize: 14, fontWeight: '700', color: c.ink },
  desc:      { fontSize: 12, color: c.muted },
  date:      { fontSize: 11, color: c.muted },
  right:     { alignItems: 'flex-end', gap: 4 },
  amount:    { fontSize: 15, fontWeight: '700', color: c.ink },
  badge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});

const DebtList = ({ type }: { type: DebtType }) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_list(colors), [colors]);
  const tenantId = useAuthStore(st => st.tenant?.id);
  const { debts, isLoading } = useDebts(type);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);

  const filtered = useMemo(() =>
    debts.filter(d => d.entityName.toLowerCase().includes(search.toLowerCase())),
    [debts, search]);

  const total = useMemo(() => debts.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.paidAmount), 0), [debts]);

  const handlePay = async () => {
    if (!selected || !tenantId) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    setPaying(true);
    try {
      await debtService.recordPayment(tenantId, selected, amount);
      setSelected(null); setPayAmount('');
    } finally {
      setPaying(false);
    }
  };

  if (isLoading) return <ActivityIndicator color={colors.accent} style={{ flex: 1, marginTop: 60 }} />;

  return (
    <View style={{ flex: 1 }}>
      {debts.length > 0 && (
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>{type === 'receivable' ? 'TOTAL POR COBRAR' : 'TOTAL POR PAGAR'}</Text>
          <Text style={s.totalAmount}>{fmt(total)}</Text>
        </View>
      )}

      {debts.length > 0 && (
        <View style={s.searchWrap}>
          <Search size={16} color={colors.muted} strokeWidth={1.75} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar..."
            placeholderTextColor={colors.muted}
          />
        </View>
      )}

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <Text style={s.emptyEmoji}>💸</Text>
          </View>
          <Text style={s.emptyTitle}>
            {debts.length === 0
              ? type === 'receivable' ? 'No tienes deudas por cobrar' : 'No tienes deudas por pagar'
              : 'Sin resultados'}
          </Text>
          {debts.length === 0 && (
            <Text style={s.emptySub}>
              {type === 'receivable' ? 'Registra ventas a crédito aquí' : 'Registra lo que debes a proveedores'}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={d => d.id}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          renderItem={({ item }) => (
            <DebtRow debt={item} onPress={() => { setSelected(item); setPayAmount(''); }} />
          )}
        />
      )}

      {/* Pay modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <SafeAreaView style={s.sheetSafe}>
            {selected && (
              <View style={s.sheet}>
                <View style={s.sheetHandle} />
                <View style={s.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sheetTitle}>{selected.entityName}</Text>
                    <Text style={s.sheetSub}>{selected.description}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <X size={20} color={colors.ink} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={s.amounts}>
                  <View style={s.amountRow}>
                    <Text style={s.amountLabel}>Total</Text>
                    <Text style={s.amountVal}>{fmt(selected.amount)}</Text>
                  </View>
                  <View style={s.amountRow}>
                    <Text style={s.amountLabel}>Pagado</Text>
                    <Text style={[s.amountVal, { color: colors.success }]}>{fmt(selected.paidAmount)}</Text>
                  </View>
                  <View style={[s.amountRow, s.remaining]}>
                    <Text style={[s.amountLabel, { fontWeight: '700' }]}>Pendiente</Text>
                    <Text style={[s.amountVal, { fontWeight: '800', color: colors.ink }]}>{fmt(selected.amount - selected.paidAmount)}</Text>
                  </View>
                </View>

                {selected.status !== 'paid' && (
                  <>
                    <Text style={s.payLabel}>Registrar abono</Text>
                    <View style={s.payInput}>
                      <Text style={s.payPrefix}>$</Text>
                      <TextInput
                        style={s.payField}
                        value={payAmount}
                        onChangeText={setPayAmount}
                        placeholder="0.00"
                        placeholderTextColor={colors.muted}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <TouchableOpacity
                      style={[s.payBtn, (!payAmount || paying) && { opacity: 0.5 }]}
                      onPress={handlePay}
                      disabled={!payAmount || paying}
                      activeOpacity={0.85}>
                      <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
                      <Text style={s.payBtnText}>{paying ? 'Guardando...' : 'Registrar pago'}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {selected.status === 'paid' && (
                  <View style={s.paidBanner}>
                    <CheckCircle size={18} color="#15803D" strokeWidth={2} />
                    <Text style={s.paidText}>Esta deuda está completamente pagada</Text>
                  </View>
                )}
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const make_list = (c: ThemeColors) => StyleSheet.create({
  totalCard:   { marginHorizontal: 20, marginTop: 12, backgroundColor: c.ink, borderRadius: 16, padding: 16, gap: 4 },
  totalLabel:  { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  totalAmount: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 12, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput: { flex: 1, fontSize: 14, color: c.ink, padding: 0 },
  list:        { paddingHorizontal: 20, paddingTop: 8 },
  sep:         { height: 1, backgroundColor: c.border },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 60 },
  emptyIcon:   { width: 80, height: 80, borderRadius: 40, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji:  { fontSize: 36 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: c.ink, textAlign: 'center' },
  emptySub:    { fontSize: 13, color: c.muted, textAlign: 'center' },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:   { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:       { paddingHorizontal: 24, paddingBottom: 32 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  sheetTitle:  { fontSize: 18, fontWeight: '800', color: c.ink },
  sheetSub:    { fontSize: 13, color: c.muted, marginTop: 2 },
  amounts:     { gap: 0, backgroundColor: c.canvas, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  amountRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  remaining:   { borderTopWidth: 1, borderTopColor: c.border },
  amountLabel: { fontSize: 13, color: c.muted },
  amountVal:   { fontSize: 15, fontWeight: '600', color: c.ink },
  payLabel:    { fontSize: 12, fontWeight: '700', color: c.muted, letterSpacing: 0.5, marginBottom: 8 },
  payInput:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.white, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16 },
  payPrefix:   { fontSize: 20, fontWeight: '700', color: c.ink },
  payField:    { flex: 1, fontSize: 20, fontWeight: '700', color: c.ink, padding: 0 },
  payBtn:      { backgroundColor: c.accent, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  payBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  paidBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#DCFCE7', borderRadius: 12, padding: 16 },
  paidText:    { fontSize: 14, fontWeight: '600', color: '#15803D', flex: 1 },
});

// ─── Add Debt Modal ───────────────────────────────────────────────────────────

const AddDebtModal = ({ type, visible, onClose }: { type: DebtType; visible: boolean; onClose: () => void }) => {
  const colors = useThemeColors();
  const tenantId = useAuthStore(s => s.tenant?.id);
  const user = useAuthStore(s => s.user);
  const m = useMemo(() => make_add(colors), [colors]);

  const [entity, setEntity] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!entity.trim() || !amount || !tenantId) return;
    setSaving(true);
    try {
      await debtService.createDebt({
        tenantId,
        type,
        amount: parseFloat(amount),
        description: desc.trim() || (type === 'receivable' ? 'Deuda por cobrar' : 'Deuda por pagar'),
        entityName: entity.trim(),
        createdBy: user?.uid ?? '',
      });
      setEntity(''); setAmount(''); setDesc('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={m.overlay}>
        <SafeAreaView style={m.sheetSafe}>
          <View style={m.sheet}>
            <View style={m.handle} />
            <View style={m.header}>
              <Text style={m.title}>{type === 'receivable' ? 'Nueva deuda por cobrar' : 'Nueva deuda por pagar'}</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={colors.ink} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={m.field}>
              <Text style={m.label}>{type === 'receivable' ? 'Nombre del cliente *' : 'Nombre del proveedor *'}</Text>
              <TextInput style={m.input} value={entity} onChangeText={setEntity} placeholder="Ej. Juan López" placeholderTextColor={colors.muted} />
            </View>
            <View style={m.field}>
              <Text style={m.label}>Monto *</Text>
              <View style={m.amountRow}>
                <Text style={m.prefix}>$</Text>
                <TextInput style={m.amountInput} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={colors.muted} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={m.field}>
              <Text style={m.label}>Descripción</Text>
              <TextInput style={m.input} value={desc} onChangeText={setDesc} placeholder="Ej. Mercancía de abril" placeholderTextColor={colors.muted} />
            </View>

            <TouchableOpacity
              style={[m.saveBtn, (!entity.trim() || !amount || saving) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!entity.trim() || !amount || saving}
              activeOpacity={0.85}>
              <Text style={m.saveText}>{saving ? 'Guardando...' : 'Registrar deuda'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const make_add = (c: ThemeColors) => StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetSafe:  { backgroundColor: c.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheet:      { paddingHorizontal: 24, paddingBottom: 32 },
  handle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title:      { fontSize: 17, fontWeight: '800', color: c.ink, flex: 1, marginRight: 12 },
  field:      { gap: 8, marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '700', color: c.muted, letterSpacing: 0.5 },
  input:      { backgroundColor: c.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: c.ink },
  amountRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.canvas, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 13 },
  prefix:     { fontSize: 17, fontWeight: '700', color: c.ink },
  amountInput:{ flex: 1, fontSize: 17, fontWeight: '700', color: c.ink, padding: 0 },
  saveBtn:    { backgroundColor: c.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const DebtsScreen = ({ navigation }: DebtsScreenProps) => {
  const colors = useThemeColors();
  const s = useMemo(() => make_s(colors), [colors]);

  const [tab, setTab] = useState<DebtType>('receivable');
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Deudas</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setAddVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.tabs}>
        {(['receivable', 'payable'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)} activeOpacity={0.7}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'receivable' ? 'Por cobrar' : 'Por pagar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DebtList type={tab} />

      <AddDebtModal type={tab} visible={addVisible} onClose={() => setAddVisible(false)} />
    </SafeAreaView>
  );
};

const make_s = (c: ThemeColors) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: c.canvas },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  title:        { flex: 1, fontSize: 20, fontWeight: '800', color: c.ink, letterSpacing: -0.5 },
  addBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: c.border, marginBottom: 4 },
  tab:          { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: c.ink },
  tabText:      { fontSize: 15, fontWeight: '600', color: c.muted },
  tabTextActive:{ color: c.ink },
});
