// src/config/firebase.ts
// @react-native-firebase se configura en los archivos nativos (google-services.json / GoogleService-Info.plist)
// Este archivo exporta las instancias para usar en toda la app

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

export { firestore, auth, functions };

// Colecciones principales
export const COLLECTIONS = {
  TENANTS: 'tenants',
  USERS: 'users',
} as const;

// Sub-colecciones por tenant
export const TENANT_COLLECTIONS = {
  SALES: 'sales',
  PRODUCTS: 'products',
  EXPENSES: 'expenses',
  CUSTOMERS: 'customers',
} as const;
