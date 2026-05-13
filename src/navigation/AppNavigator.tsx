import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { POSScreen } from '../features/sales/screens/POSScreen';
import { CartScreen } from '../features/sales/screens/CartScreen';
import { PaymentScreen } from '../features/sales/screens/PaymentScreen';
import { SaleSuccessScreen } from '../features/sales/screens/SaleSuccessScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { PaywallScreen } from '../features/settings/screens/PaywallScreen';
import { NotificationsScreen } from '../features/settings/screens/NotificationsScreen';
import { BillingInfoScreen } from '../features/settings/screens/BillingInfoScreen';
import { EmployeesScreen } from '../features/settings/screens/EmployeesScreen';
import { PaymentMethodsScreen } from '../features/settings/screens/PaymentMethodsScreen';
import { TaxesScreen } from '../features/settings/screens/TaxesScreen';
import { LogoReceiptScreen } from '../features/settings/screens/LogoReceiptScreen';
import { ExportDataScreen } from '../features/settings/screens/ExportDataScreen';
import { PreferencesScreen } from '../features/settings/screens/PreferencesScreen';
import { HelpSupportScreen } from '../features/settings/screens/HelpSupportScreen';
import { BusinessEditScreen } from '../features/settings/screens/BusinessEditScreen';
import { SwitchBusinessScreen } from '../features/settings/screens/SwitchBusinessScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen
      name="POS"
      component={POSScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen
      name="SaleSuccess"
      component={SaleSuccessScreen}
      options={{ animation: 'fade', gestureEnabled: false }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="Paywall"
      component={PaywallScreen}
      options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
    />
    <Stack.Screen name="Notifications"   component={NotificationsScreen}  options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="BillingInfo"     component={BillingInfoScreen}    options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Employees"       component={EmployeesScreen}      options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="PaymentMethods"  component={PaymentMethodsScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Taxes"           component={TaxesScreen}          options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="LogoReceipt"     component={LogoReceiptScreen}    options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="ExportData"      component={ExportDataScreen}     options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Preferences"     component={PreferencesScreen}    options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="HelpSupport"     component={HelpSupportScreen}    options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="BusinessEdit"    component={BusinessEditScreen}   options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="SwitchBusiness"  component={SwitchBusinessScreen} options={{ animation: 'slide_from_right' }} />
  </Stack.Navigator>
);
