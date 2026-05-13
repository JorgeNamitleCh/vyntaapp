import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { Text } from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useToastStore, ToastItem, ToastType } from '../store/toastStore';

const CONFIG: Record<ToastType, {
  Icon: any;
  iconColor: string;
  bg: string;
  border: string;
  titleColor: string;
  descColor: string;
}> = {
  success: {
    Icon: CheckCircle,
    iconColor: '#4ADE80',
    bg: '#0E1614',
    border: 'transparent',
    titleColor: '#fff',
    descColor: 'rgba(255,255,255,0.6)',
  },
  error: {
    Icon: XCircle,
    iconColor: '#F87171',
    bg: '#1A0606',
    border: 'transparent',
    titleColor: '#fff',
    descColor: 'rgba(255,255,255,0.6)',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: '#FCD34D',
    bg: '#1A1205',
    border: 'transparent',
    titleColor: '#fff',
    descColor: 'rgba(255,255,255,0.6)',
  },
  info: {
    Icon: Info,
    iconColor: '#A7F3D0',
    bg: '#0E1614',
    border: 'transparent',
    titleColor: '#fff',
    descColor: 'rgba(255,255,255,0.6)',
  },
};

const AUTO_DISMISS_MS = 3500;

const ToastCard = ({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) => {
  const cfg = CONFIG[item.type];
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const hide = () => {
    clearTimeout(timer.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onDismiss);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    timer.current = setTimeout(hide, AUTO_DISMISS_MS);
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <Animated.View style={[
      s.card,
      { backgroundColor: cfg.bg, transform: [{ translateY }], opacity },
    ]}>
      <cfg.Icon size={20} color={cfg.iconColor} strokeWidth={2} />
      <View style={s.texts}>
        <Text style={[s.message, { color: cfg.titleColor }]}>{item.message}</Text>
        {item.description && (
          <Text style={[s.description, { color: cfg.descColor }]}>{item.description}</Text>
        )}
      </View>
      <TouchableOpacity onPress={hide} hitSlop={12}>
        <X size={16} color="rgba(255,255,255,0.4)" strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer = () => {
  const { current, dismiss } = useToastStore();
  const insets = useSafeAreaInsets();

  if (!current) return null;

  return (
    <View
      style={[s.root, { top: insets.top + (Platform.OS === 'android' ? 8 : 4) }]}
      pointerEvents="box-none">
      <ToastCard key={current.id} item={current} onDismiss={dismiss} />
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  texts: { flex: 1, gap: 2 },
  message: { fontSize: 14, fontWeight: '700', lineHeight: 18 },
  description: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
});
