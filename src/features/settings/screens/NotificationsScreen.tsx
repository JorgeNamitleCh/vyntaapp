import React, { useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { ChevronLeft, TrendingUp, Package, BarChart2, Bell } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/types';
import { useNotificationStore } from '../../../store/notificationStore';
import type { Notif, NotifType } from '../../../store/notificationStore';
import { useThemeColors, ThemeColors } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AppStackParamList, 'Notifications'>;

const TYPE_CONFIG: Record<NotifType, { Icon: any; bg: string; color: string }> = {
  sale:   { Icon: TrendingUp, bg: '#DCFCE7', color: '#15803D' },
  stock:  { Icon: Package,   bg: '#FEF3C7', color: '#D97706' },
  report: { Icon: BarChart2, bg: '#EDE9FE', color: '#7C3AED' },
  system: { Icon: Bell,      bg: '#F0F9FF', color: '#0284C7' },
};

const NotificationRow = ({ item, onPress }: { item: Notif; onPress: () => void }) => {
  const colors = useThemeColors();
  const row = useMemo(() => make_row(colors), [colors]);
  const cfg = TYPE_CONFIG[item.type];
  return (
    <TouchableOpacity style={[row.wrap, !item.read && row.unread]} onPress={onPress} activeOpacity={0.75}>
      <View style={[row.iconWrap, { backgroundColor: cfg.bg }]}>
        <cfg.Icon size={16} color={cfg.color} strokeWidth={1.75} />
      </View>
      <View style={row.info}>
        <View style={row.titleRow}>
          <Text style={row.title} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={row.dot} />}
        </View>
        <Text style={row.body} numberOfLines={2}>{item.body}</Text>
        <Text style={row.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const make_row = (colors: ThemeColors) => StyleSheet.create({
  wrap:     { flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  unread:   { backgroundColor: '#F0EEE8' },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  info:     { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:    { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  body:     { fontSize: 13, color: colors.muted, lineHeight: 18 },
  time:     { fontSize: 11, color: colors.muted, fontWeight: '500' },
});

export const NotificationsScreen = ({ navigation }: Props) => {
  const colors = useThemeColors();
  const row = useMemo(() => make_row(colors), [colors]);
  const s = useMemo(() => make_s(colors), [colors]);

  const { notifications, markRead, markAllRead } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => () => markAllRead(), []);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Notificaciones</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={s.readAll}>Leer todas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => markRead(item.id)} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Bell size={36} color={colors.muted} strokeWidth={1.5} />
            <Text style={s.emptyText}>Sin notificaciones</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const make_s = (colors: ThemeColors) => StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.canvas },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title:     { flex: 1, fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  readAll:   { fontSize: 13, fontWeight: '600', color: colors.accent },
  list:      { paddingVertical: 8 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
  empty:     { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 15, color: colors.muted },
});
