import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, TextInput, TouchableOpacity, Switch, Image,
  StyleSheet, SafeAreaView, StatusBar, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  PanResponder, LayoutChangeEvent, Alert,
} from 'react-native';
import { Text } from '../../../components/Text';
import {
  ChevronLeft, ChevronRight, Upload, ScanBarcode, ImageIcon, X,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { AddProductScreenProps } from '../../../navigation/types';
import { toast } from '../../../store/toastStore';
import { useSaveProduct } from '../hooks/useSaveProduct';
import { productService } from '../services/product.service';
import { storageService } from '../../../services/storage.service';
import { useAuthStore } from '../../../store/authStore';
import { Product } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

const ALERT_MAX = 200;

const MarginBar = ({ pct }: { pct: number }) => {
  const colors = useThemeColors();
  const mb = useMemo(() => make_mb(colors), [colors]);
  return (
    <View style={mb.bg}>
      <View style={[mb.fill, { width: `${Math.min(100, Math.max(0, pct))}%` }]} />
    </View>
  );
};
const make_mb = (colors: ThemeColors) => StyleSheet.create({
  bg:   { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 8 },
  fill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
});

const FieldRow = ({
  label, value, onChangeText, placeholder, keyboardType, onPress,
}: {
  label: string;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  onPress?: () => void;
}) => {
  const colors = useThemeColors();
  const f = useMemo(() => make_f(colors), [colors]);
  return (
    <TouchableOpacity style={f.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={f.label}>{label}</Text>
      {onPress ? (
        <View style={f.valueRow}>
          <Text style={[f.value, !value && f.placeholder]}>{value || placeholder}</Text>
          <ChevronRight size={14} color={colors.muted} strokeWidth={2} />
        </View>
      ) : (
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType ?? 'default'}
        />
      )}
    </TouchableOpacity>
  );
};

const make_f = (colors: ThemeColors) => StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  label:    { width: 110, fontSize: 14, color: colors.muted, fontWeight: '500' },
  valueRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value:    { fontSize: 14, fontWeight: '500', color: colors.ink },
  placeholder: { color: colors.muted },
  input:    { flex: 1, fontSize: 14, color: colors.accent, fontWeight: '600', textAlign: 'right', padding: 0 },
});

export const AddProductScreen = ({ navigation, route }: AddProductScreenProps) => {
  const colors = useThemeColors();
  const mb = useMemo(() => make_mb(colors), [colors]);
  const f = useMemo(() => make_f(colors), [colors]);
  const s = useMemo(() => make_s(colors), [colors]);

  const productId = route.params?.productId;
  const isEditing = !!productId;
  const tenantId  = useAuthStore(s => s.tenant?.id);

  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [name,         setName]         = useState('');
  const [category,     setCategory]     = useState('');
  const [sku,          setSku]          = useState('');
  const [barcode,      setBarcode]      = useState('');
  const [salePrice,    setSalePrice]    = useState('');
  const [cost,         setCost]         = useState('');
  const [controlStock, setControlStock] = useState(true);
  const [stock,        setStock]        = useState('');
  const [alertAt,      setAlertAt]      = useState('20');
  const [imageUri,     setImageUri]     = useState<string | null>(null);
  const [existingUrl,  setExistingUrl]  = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Slider
  const sliderWidth = useRef(0);
  const alertPct    = Math.min(100, ((parseInt(alertAt) || 0) / ALERT_MAX) * 100);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        if (!sliderWidth.current) return;
        const val = Math.round((e.nativeEvent.locationX / sliderWidth.current) * ALERT_MAX);
        setAlertAt(String(Math.max(0, Math.min(ALERT_MAX, val))));
      },
      onPanResponderMove: (e) => {
        if (!sliderWidth.current) return;
        const val = Math.round((e.nativeEvent.locationX / sliderWidth.current) * ALERT_MAX);
        setAlertAt(String(Math.max(0, Math.min(ALERT_MAX, val))));
      },
    }),
  ).current;

  const handleSliderLayout = (e: LayoutChangeEvent) => {
    sliderWidth.current = e.nativeEvent.layout.width;
  };

  const { mutateAsync: saveProduct, isPending } = useSaveProduct();

  useEffect(() => {
    if (!isEditing || !productId || !tenantId) return;
    productService.getById(tenantId, productId).then(p => {
      if (!p) return;
      setName(p.name);
      setCategory(p.category ?? '');
      setSku(p.sku ?? '');
      setBarcode(p.barcode ?? '');
      setSalePrice(p.price.toString());
      setCost(p.cost?.toString() ?? '');
      setControlStock(p.controlStock ?? true);
      setStock(p.stock.toString());
      setAlertAt((p.alertAt ?? 20).toString());
      if (p.imageUrl) setExistingUrl(p.imageUrl);
    }).finally(() => setLoadingProduct(false));
  }, [productId, tenantId, isEditing]);

  const salePriceNum = parseFloat(salePrice) || 0;
  const costNum      = parseFloat(cost) || 0;
  const gain         = salePriceNum - costNum;
  const marginPct    = salePriceNum > 0 ? Math.round((gain / salePriceNum) * 100) : 0;
  const isValid      = name.trim().length >= 2 && salePriceNum > 0;

  const pickImage = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    setImageUri(result.assets[0].uri);
  }, []);

  const removeImage = useCallback(() => {
    setImageUri(null);
    setExistingUrl(null);
  }, []);

  const handleSave = async () => {
    if (!isValid || !tenantId) return;
    try {
      // 1. Save product to Firestore first — never blocked by image
      const result = await saveProduct({
        id:           productId,
        name:         name.trim(),
        price:        salePriceNum,
        cost:         costNum || undefined,
        stock:        controlStock ? (parseInt(stock) || 0) : -1,
        category:     category.trim() || undefined,
        sku:          sku.trim() || undefined,
        barcode:      barcode.trim() || undefined,
        alertAt:      controlStock ? (parseInt(alertAt) || 0) : undefined,
        controlStock,
        imageUrl:     existingUrl ?? undefined,
      });

      // 2. Upload image separately — failure won't block the save
      if (imageUri) {
        const finalId = productId ?? (result as Product | undefined)?.id;
        if (finalId) {
          setUploadingImg(true);
          try {
            const url = await storageService.uploadProductImage(tenantId, finalId, imageUri);
            await productService.update(tenantId, finalId, { imageUrl: url });
          } catch (e) {
            console.warn('[AddProduct] Image upload failed:', e);
          } finally {
            setUploadingImg(false);
          }
        }
      }

      toast.success(
        isEditing ? 'Producto actualizado' : 'Producto guardado',
        `${name.trim()} · $${salePriceNum.toFixed(2)}`,
      );
      navigation.goBack();
    } catch (e: any) {
      console.error('[AddProduct] Save failed:', e?.code, e?.message, e);
      toast.error('Error', e?.message ?? 'No se pudo guardar el producto');
    }
  };

  const isSaving = isPending || uploadingImg;
  const displayUri = imageUri ?? existingUrl;

  if (loadingProduct) {
    return (
      <SafeAreaView style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.saveBtn, (!isValid || isSaving) && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid || isSaving}>
            {isSaving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.saveBtnText}>Guardar</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Text style={s.title}>{isEditing ? 'Editar producto' : 'Nuevo producto'}</Text>

          {/* ── Image section ── */}
          <View style={s.imageSection}>
            <View style={s.imagePlaceholder}>
              {displayUri ? (
                <>
                  <Image source={{ uri: displayUri }} style={s.productImage} />
                  <TouchableOpacity style={s.imageRemoveBtn} onPress={removeImage} activeOpacity={0.8}>
                    <X size={12} color="#fff" strokeWidth={3} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <ImageIcon size={28} color={colors.muted} strokeWidth={1.5} />
                  <Text style={s.imagePlaceholderText}>Imagen</Text>
                </>
              )}
            </View>
            <View style={s.imageActions}>
              <TouchableOpacity style={s.imageActionBtn} onPress={pickImage} activeOpacity={0.7}>
                <Upload size={15} color={colors.ink} strokeWidth={1.75} />
                <Text style={s.imageActionText}>Subir foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.imageActionBtn, s.imageActionDisabled]}
                onPress={() => Alert.alert('Próximamente', 'El escaneo de código estará disponible pronto.')}
                activeOpacity={0.7}>
                <ScanBarcode size={15} color={colors.muted} strokeWidth={1.75} />
                <Text style={[s.imageActionText, { color: colors.muted }]}>Escanear código</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <FieldRow label="Nombre"           value={name}     onChangeText={setName}     placeholder="Cappuccino" />
            <View style={s.divider} />
            <FieldRow label="Categoría"        value={category} onChangeText={setCategory} placeholder="Bebidas" />
            <View style={s.divider} />
            <FieldRow label="SKU"              value={sku}      onChangeText={setSku}      placeholder="CAF-CAP-001" />
            <View style={s.divider} />
            <FieldRow label="Código de barras" value={barcode}  onChangeText={setBarcode}  placeholder="7501234567890" keyboardType="number-pad" />
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>PRECIOS</Text>
          </View>

          <View style={[s.card, { gap: 0 }]}>
            <View style={s.pricesRow}>
              <View style={s.priceCol}>
                <Text style={s.priceLabel}>PRECIO VENTA</Text>
                <View style={s.priceInputRow}>
                  <Text style={s.priceCurrency}>$</Text>
                  <TextInput
                    style={s.priceInput}
                    value={salePrice}
                    onChangeText={setSalePrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={[s.priceCol, { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 16 }]}>
                <Text style={s.priceLabel}>COSTO</Text>
                <View style={s.priceInputRow}>
                  <Text style={s.priceCurrency}>$</Text>
                  <TextInput
                    style={s.priceInput}
                    value={cost}
                    onChangeText={setCost}
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {salePriceNum > 0 && (
              <View style={s.gainRow}>
                <Text style={s.gainLabel}>GANANCIA</Text>
                <View style={s.gainValues}>
                  <Text style={s.gainAmount}>${gain.toFixed(2)}</Text>
                  <Text style={s.gainPct}>{marginPct}% margen</Text>
                </View>
                <MarginBar pct={marginPct} />
              </View>
            )}
          </View>

          <Text style={[s.sectionLabel, { paddingHorizontal: 20, marginBottom: 4 }]}>INVENTARIO</Text>

          <View style={s.card}>
            <View style={s.toggleRow}>
              <Text style={s.toggleLabel}>Controlar stock</Text>
              <Switch
                value={controlStock}
                onValueChange={setControlStock}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
                ios_backgroundColor={colors.border}
              />
            </View>

            {controlStock && (
              <>
                <View style={s.divider} />
                <View style={s.stockRow}>
                  <Text style={s.toggleLabel}>Stock actual</Text>
                  <TextInput
                    style={s.stockInput}
                    value={stock}
                    onChangeText={setStock}
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    textAlign="right"
                  />
                </View>
                <View style={s.divider} />
                <View style={s.stockRow}>
                  <View>
                    <Text style={s.toggleLabel}>Alerta bajo stock</Text>
                    <Text style={s.alertHint}>avisar cuando queden {alertAt || '0'} unidades</Text>
                  </View>
                  <TextInput
                    style={s.stockInput}
                    value={alertAt}
                    onChangeText={v => setAlertAt(v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    textAlign="right"
                  />
                </View>
                <View style={s.sliderWrap} onLayout={handleSliderLayout} {...panResponder.panHandlers}>
                  <View style={s.sliderTrack} pointerEvents="none">
                    <View style={[s.sliderFill, { width: `${alertPct}%` }]} />
                    <View style={[s.sliderThumb, { left: `${Math.min(94, alertPct)}%` }]} />
                  </View>
                  <View style={s.sliderLabels} pointerEvents="none">
                    <Text style={s.sliderLabel}>0</Text>
                    <Text style={s.sliderLabel}>{ALERT_MAX / 2}</Text>
                    <Text style={s.sliderLabel}>{ALERT_MAX}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn:        { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, minWidth: 80, alignItems: 'center' },
  saveBtnDisabled:{ opacity: 0.4 },
  saveBtnText:    { color: '#fff', fontSize: 14, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  title:  { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1 },

  imageSection:        { flexDirection: 'row', gap: 12 },
  imagePlaceholder:    { width: 110, height: 110, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' },
  imagePlaceholderText:{ fontSize: 11, color: colors.muted, fontWeight: '500' },
  productImage:        { width: 110, height: 110, borderRadius: 12 },
  imageRemoveBtn:      { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  imageActions:        { flex: 1, gap: 8, justifyContent: 'center' },
  imageActionBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.inputBg, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11 },
  imageActionDisabled: { opacity: 0.5 },
  imageActionText:     { fontSize: 13, fontWeight: '600', color: colors.ink },

  card:    { backgroundColor: colors.inputBg, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: colors.border },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },

  pricesRow:    { flexDirection: 'row', paddingVertical: 16 },
  priceCol:     { flex: 1, gap: 4 },
  priceLabel:   { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  priceInputRow:{ flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  priceCurrency:{ fontSize: 16, fontWeight: '700', color: colors.accent },
  priceInput:   { fontSize: 26, fontWeight: '800', color: colors.accent, letterSpacing: -0.5, padding: 0 },

  gainRow:    { paddingBottom: 14, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border },
  gainValues: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  gainLabel:  { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  gainAmount: { fontSize: 20, fontWeight: '800', color: colors.accent, letterSpacing: -0.5 },
  gainPct:    { fontSize: 12, color: colors.muted, fontWeight: '500' },

  toggleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  toggleLabel:{ fontSize: 15, fontWeight: '500', color: colors.ink },
  stockRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  stockInput: { fontSize: 15, fontWeight: '700', color: colors.ink, minWidth: 60, padding: 0 },
  alertHint:  { fontSize: 11, color: colors.muted, marginTop: 2 },

  sliderWrap:   { paddingTop: 10, paddingBottom: 14 },
  sliderTrack:  { height: 4, backgroundColor: colors.border, borderRadius: 2, position: 'relative' },
  sliderFill:   { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  sliderThumb:  { position: 'absolute', top: -7, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, borderWidth: 2.5, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sliderLabel:  { fontSize: 10, color: colors.muted },
});
