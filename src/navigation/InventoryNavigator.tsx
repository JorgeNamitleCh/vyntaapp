import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InventoryStackParamList } from './types';
import { InventoryScreen } from '../features/inventory/screens/InventoryScreen';
import { AddProductScreen } from '../features/inventory/screens/AddProductScreen';

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export const InventoryNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InventoryList" component={InventoryScreen} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
  </Stack.Navigator>
);
