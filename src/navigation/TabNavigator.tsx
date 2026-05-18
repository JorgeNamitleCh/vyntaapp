import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from '../components/Text';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Package, Plus, TrendingDown, BarChart2 } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppTabParamList, AppStackParamList } from './types';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { InventoryNavigator } from './InventoryNavigator';
import { ExpensesNavigator } from './ExpensesNavigator';
import { ReportsScreen } from '../features/reports/screens/ReportsScreen';
import { useThemeColors, ThemeColors } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<string, any> = {
  Home: Home,
  Inventory: Package,
  Expenses: TrendingDown,
  Reports: BarChart2,
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Inicio',
  Inventory: 'Inventario',
  Expenses: 'Gastos',
  Reports: 'Reportes',
};

const Placeholder = ({ name }: { name: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F2EC' }}>
    <Text style={{ fontSize: 16, color: '#6B7280' }}>{name}</Text>
  </View>
);

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const colors = useThemeColors();
  const { bottom } = useSafeAreaInsets();
  const tab = useMemo(() => make_tab(colors, bottom), [colors, bottom]);
  const stackNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();
  const left = state.routes.slice(0, 2);
  const right = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[0], focused: boolean) => {
    const Icon = TAB_ICONS[route.name];
    const label = TAB_LABELS[route.name];
    return (
      <TouchableOpacity
        key={route.key}
        style={tab.item}
        onPress={() => navigation.navigate(route.name)}
        activeOpacity={0.7}>
        <Icon size={22} color={focused ? colors.ink : colors.muted} strokeWidth={focused ? 2 : 1.75} />
        <Text style={[tab.label, focused && tab.labelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={tab.bar}>
      <View style={tab.side}>
        {left.map(r => renderTab(r, state.routes[state.index].name === r.name))}
      </View>

      <TouchableOpacity
        style={tab.fab}
        onPress={() => stackNav.navigate('POS')}
        activeOpacity={0.85}>
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={tab.side}>
        {right.map(r => renderTab(r, state.routes[state.index].name === r.name))}
      </View>
    </View>
  );
};

const make_tab = (colors: ThemeColors, bottomInset: number) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : bottomInset + 8,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
  },
  labelActive: {
    color: colors.ink,
    fontWeight: '700',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginTop: -20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export const TabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Inventory" component={InventoryNavigator} />
    <Tab.Screen name="Expenses" component={ExpensesNavigator} />
    <Tab.Screen name="Reports" component={ReportsScreen} />
  </Tab.Navigator>
);
