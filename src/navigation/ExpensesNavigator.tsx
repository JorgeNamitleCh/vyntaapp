import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from './types';
import { ExpensesScreen } from '../features/expenses/screens/ExpensesScreen';
import { AddExpenseScreen } from '../features/expenses/screens/AddExpenseScreen';

const Stack = createNativeStackNavigator<ExpensesStackParamList>();

export const ExpensesNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExpensesList" component={ExpensesScreen} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
  </Stack.Navigator>
);
