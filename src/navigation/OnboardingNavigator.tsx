import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { CreateBusinessScreen } from '../features/tenants/screens/CreateBusinessScreen';
import { SalesChannelsScreen } from '../features/tenants/screens/SalesChannelsScreen';
import { BusinessSetupScreen } from '../features/tenants/screens/BusinessSetupScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CreateBusiness" component={CreateBusinessScreen} />
    <Stack.Screen name="SalesChannels" component={SalesChannelsScreen} />
    <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
  </Stack.Navigator>
);
