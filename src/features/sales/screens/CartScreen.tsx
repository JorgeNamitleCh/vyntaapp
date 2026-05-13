import React, { useState } from 'react';
import {
  View, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text } from '../../../components/Text';
import {
  ChevronLeft, Plus, Minus, Tag, User, PenLine, X, Check,
} from 'lucide-react-native';
import { CartScreenProps } from '../../../navigation/types';
import { useCartStore, CartItem } from '../../../store/cartStore';

const C = {
  canvas: '#F4F2EC',
  ink: '#0E1614',
  accent: '#0E5C3F',
  muted: '#6B7280',
  border: '#E5E3DC',
  white: '#FFFFFF',
  danger: '#DC2626',
};

// ── Mock clients ─────────────────────────────────────────────
const CLIENTS = [
  { id: '1', name: 'María García',    phone: '55 1234 5678' },
  { id: '2', name: 'Carlos López',    phone: '55 8765 4321' },
  { id: '3', name: 'Ana Martínez',    phone: '55 2222 3333' },
  { id: '4', name: 'Luis Hernández',  phone: '55 4444 5555' },
  { id: '5', name: 'Sofia Ramírez',   phone: '55 6666 7777' },
];

// ── Sheet wrapper ─────────────────────────────────────────────
const Sheet = ({
  visible, onClose, title, children,
}: {
  visible: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={sh.overlay} activeOpacity={1} onPress={onClose} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={sh.sheet}>
        <View style={sh.handle} />
        <View style={sh.sheetTop}>
          <Text style={sh.sheetTitle}>{title}</Text>
          <TouchableOpacity style={sh.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color={C.muted} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const sh = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: C.canvas,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 14,
  },
  sheetTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ── Main screen ───────────────────────────────────────────────
export const CartScreen = ({ navigation }: CartScreenProps) => {
  const {
    items, increment, decrement, clear,
    note: cartNote, setNote: setCartNote,
    discount: cartDiscount, setDiscount: setCartDiscount,
  } = useCartStore();

  const [discountOpen, setDiscountOpen] = useState(false);
  const [noteOpen,     setNoteOpen]     = useState(false);
  const [clientOpen,   setClientOpen]   = useState(false);

  const [discountType,  setDiscountType]  = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [noteInput,     setNoteInput]     = useState('');
  const [client,        setClient]        = useState<typeof CLIENTS[0] | null>(null);
  const [clientSearch,  setClientSearch]  = useState('');

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const discountAmt = (() => {
    if (!cartDiscount) return 0;
    if (cartDiscount.type === 'percent') return Math.round((subtotal * cartDiscount.value / 100) * 100) / 100;
    return Math.min(cartDiscount.value, subtotal);
  })();

  const afterDiscount = subtotal - discountAmt;
  const iva   = Math.round(afterDiscount * 0.16 * 100) / 100;
  const total = afterDiscount + iva;

  const filteredClients = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch),
  );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={C.ink} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={clear} activeOpacity={0.7}>
          <Text style={s.clearText}>Vaciar</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.title}>Carrito</Text>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {items.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🛒</Text>
            <Text style={s.emptyText}>Carrito vacío</Text>
          </View>
        ) : (
          <>
            {/* ── Items card ── */}
            <View style={s.itemsCard}>
              {items.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <View style={s.divider} />}
                  <View style={s.itemRow}>
                    <View style={[s.avatar, { backgroundColor: item.color }]}>
                      <Text style={s.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={s.itemInfo}>
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.itemUnit}>${item.price.toLocaleString('es-MX')} c/u</Text>
                    </View>
                    <View style={s.qtyPill}>
                      <TouchableOpacity
                        style={s.qtyMinus} onPress={() => decrement(item.id)} activeOpacity={0.6}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Minus size={13} color={C.ink} strokeWidth={2.5} />
                      </TouchableOpacity>
                      <Text style={s.qtyNum}>{item.qty}</Text>
                      <TouchableOpacity
                        style={s.qtyPlus} onPress={() => increment(item.id)} activeOpacity={0.7}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                        <Plus size={13} color="#fff" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Action chips ── */}
            <View style={s.chips}>
              {[
                {
                  Icon: Tag,     label: 'Descuento',
                  active: !!cartDiscount,
                  onPress: () => {
                    setDiscountType(cartDiscount?.type ?? 'percent');
                    setDiscountValue(cartDiscount ? String(cartDiscount.value) : '');
                    setDiscountOpen(true);
                  },
                },
                {
                  Icon: User,    label: client ? client.name.split(' ')[0] : 'Cliente',
                  active: !!client,
                  onPress: () => setClientOpen(true),
                },
                {
                  Icon: PenLine, label: 'Nota',
                  active: !!cartNote,
                  onPress: () => { setNoteInput(cartNote); setNoteOpen(true); },
                },
              ].map(({ Icon, label, active, onPress }) => (
                <TouchableOpacity
                  key={label}
                  style={[s.chip, active && s.chipActive]}
                  onPress={onPress}
                  activeOpacity={0.75}>
                  <Icon size={14} color={active ? C.accent : C.ink} strokeWidth={1.75} />
                  <Text style={[s.chipText, active && s.chipTextActive]} numberOfLines={1}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Summary card ── */}
            <View style={s.summaryCard}>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Subtotal</Text>
                <Text style={s.summaryVal}>
                  ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              {discountAmt > 0 && (
                <View style={s.summaryRow}>
                  <Text style={[s.summaryLabel, { color: C.accent }]}>
                    Descuento {cartDiscount?.type === 'percent' ? `(${cartDiscount.value}%)` : ''}
                  </Text>
                  <Text style={[s.summaryVal, { color: C.accent }]}>
                    −${discountAmt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>IVA 16%</Text>
                <Text style={s.summaryVal}>
                  ${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>TOTAL</Text>
                <Text style={s.totalVal}>
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* ── Cobrar button ── */}
      {items.length > 0 && (
        <View style={s.footer}>
          <TouchableOpacity
            style={s.payBtn}
            onPress={() => navigation.navigate('Payment')}
            activeOpacity={0.88}>
            <Text style={s.payBtnText}>
              Cobrar ${total.toLocaleString('es-MX')}{'  '}→
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Descuento sheet ── */}
      <Sheet visible={discountOpen} onClose={() => setDiscountOpen(false)} title="Descuento">
        <View style={m.body}>
          <View style={m.toggle}>
            {(['percent', 'fixed'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[m.toggleBtn, discountType === t && m.toggleBtnActive]}
                onPress={() => setDiscountType(t)}
                activeOpacity={0.75}>
                <Text style={[m.toggleText, discountType === t && m.toggleTextActive]}>
                  {t === 'percent' ? 'Porcentaje %' : 'Monto fijo $'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={m.inputRow}>
            <Text style={m.inputPrefix}>{discountType === 'percent' ? '%' : '$'}</Text>
            <TextInput
              style={m.input}
              value={discountValue}
              onChangeText={setDiscountValue}
              placeholder="0"
              placeholderTextColor="rgba(14,22,20,0.25)"
              keyboardType="number-pad"
              autoFocus
            />
          </View>
          {discountAmt > 0 && (
            <Text style={m.discountPreview}>
              Ahorro: ${discountAmt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
          )}
          <TouchableOpacity
            style={m.confirmBtn}
            onPress={() => {
              const v = parseFloat(discountValue) || 0;
              setCartDiscount(v > 0 ? { type: discountType, value: v } : null);
              setDiscountOpen(false);
            }}
            activeOpacity={0.85}>
            <Text style={m.confirmText}>Aplicar descuento</Text>
          </TouchableOpacity>
        </View>
      </Sheet>

      {/* ── Nota sheet ── */}
      <Sheet visible={noteOpen} onClose={() => setNoteOpen(false)} title="Nota de venta">
        <View style={m.body}>
          <TextInput
            style={m.noteInput}
            value={noteInput}
            onChangeText={setNoteInput}
            placeholder="Escribe una nota para esta venta..."
            placeholderTextColor={C.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />
          <TouchableOpacity
            style={m.confirmBtn}
            onPress={() => { setCartNote(noteInput); setNoteOpen(false); }}
            activeOpacity={0.85}>
            <Text style={m.confirmText}>Guardar nota</Text>
          </TouchableOpacity>
        </View>
      </Sheet>

      {/* ── Cliente sheet ── */}
      <Sheet visible={clientOpen} onClose={() => setClientOpen(false)} title="Seleccionar cliente">
        <View style={m.body}>
          <View style={m.searchBox}>
            <TextInput
              style={m.searchInput}
              value={clientSearch}
              onChangeText={setClientSearch}
              placeholder="Buscar cliente..."
              placeholderTextColor={C.muted}
              autoFocus
            />
          </View>
          <View style={m.clientList}>
            {filteredClients.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[m.clientRow, client?.id === c.id && m.clientRowActive]}
                onPress={() => { setClient(c); setClientOpen(false); }}
                activeOpacity={0.75}>
                <View style={m.clientAvatar}>
                  <Text style={m.clientAvatarText}>{c.name.charAt(0)}</Text>
                </View>
                <View style={m.clientInfo}>
                  <Text style={m.clientName}>{c.name}</Text>
                  <Text style={m.clientPhone}>{c.phone}</Text>
                </View>
                {client?.id === c.id && (
                  <Check size={18} color={C.accent} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Sheet>
    </SafeAreaView>
  );
};

/* ─── Styles ──────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.canvas },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  clearText: { fontSize: 15, fontWeight: '600', color: C.danger },

  title: {
    fontSize: 32, fontWeight: '800', color: C.ink, letterSpacing: -1,
    paddingHorizontal: 20, paddingBottom: 14,
  },

  scroll: { paddingHorizontal: 20 },

  itemsCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: C.border },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 15, fontWeight: '700', color: C.ink },
  itemUnit: { fontSize: 13, color: C.muted },

  qtyPill: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 22, backgroundColor: C.white,
    paddingLeft: 10, paddingRight: 4, paddingVertical: 4, gap: 8,
  },
  qtyMinus: { padding: 2 },
  qtyNum: { fontSize: 15, fontWeight: '700', color: C.ink, minWidth: 16, textAlign: 'center' },
  qtyPlus: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
  },

  chips: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 14 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: C.white, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.border,
    paddingVertical: 10, paddingHorizontal: 8,
  },
  chipActive: { borderColor: C.accent, backgroundColor: '#F0FDF4' },
  chipText: { fontSize: 13, fontWeight: '600', color: C.ink },
  chipTextActive: { color: C.accent },

  summaryCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, paddingTop: 4,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 11,
  },
  summaryLabel: { fontSize: 14, color: C.muted },
  summaryVal: { fontSize: 14, fontWeight: '600', color: C.ink },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 12, paddingBottom: 14, marginTop: 2,
  },
  totalLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1 },
  totalVal: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -1 },

  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  payBtn: {
    backgroundColor: C.accent, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center',
  },
  payBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: C.muted, fontWeight: '500' },
});

const m = StyleSheet.create({
  body: { paddingHorizontal: 20, gap: 14 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    padding: 4, gap: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 9,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: C.ink },
  toggleText: { fontSize: 14, fontWeight: '600', color: C.muted },
  toggleTextActive: { color: '#fff' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, height: 60,
  },
  inputPrefix: { fontSize: 28, fontWeight: '700', color: C.muted, marginRight: 8 },
  input: { flex: 1, fontSize: 36, fontWeight: '800', color: C.ink, padding: 0 },

  discountPreview: { fontSize: 14, color: C.accent, fontWeight: '600', textAlign: 'center' },

  confirmBtn: {
    backgroundColor: C.ink, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  noteInput: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    padding: 14, fontSize: 15, color: C.ink,
    minHeight: 110, textAlignVertical: 'top',
  },

  searchBox: {
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, height: 44, justifyContent: 'center',
  },
  searchInput: { fontSize: 15, color: C.ink, padding: 0 },

  clientList: { gap: 0 },
  clientRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  clientRowActive: { backgroundColor: '#F0FDF4', borderRadius: 10 },
  clientAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
  },
  clientAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '600', color: C.ink },
  clientPhone: { fontSize: 13, color: C.muted },
});
