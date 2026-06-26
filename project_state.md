---
name: project-state
description: "Estado actual del proyecto Vynta — qué está construido, configurado y pendiente"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9436b0ab-fb13-4be1-9465-b9f344edfc98
---

## iOS build — resuelto (2026-05-12)
Xcode update resolvió los errores de Firebase/React Native (use_frameworks! + módulos Swift). Podfile actual usa `use_frameworks! :linkage => :static` con `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` y `DEFINES_MODULE = NO` para pods RNFB.

**Why:** Firebase iOS SDK 11 tiene pods pure-Swift (FirebaseFunctions, FirebaseStorage) que requieren frameworks para generar los -Swift.h headers. DEFINES_MODULE=NO en RNFB previene conflictos de ownership de tipos React.

**How to apply:** Si hay errores de build relacionados con Firebase/iOS, revisar Podfile antes de cualquier cambio.

## Firebase Auth — configurado (2026-05-12)
- Phone Authentication habilitado en Firebase Console
- GoogleService-Info.plist en ios/Vynta/ y agregado al Xcode project (Copy Bundle Resources)
- FirebaseApp.configure() en AppDelegate.swift
- Número de teléfono real de Jorge fijado como test number con código fijo
- URL scheme `com.georgeenami.vynta` agregado a Info.plist para reCAPTCHA fallback

**Why:** Sin APNs (no cuenta developer pagada), Firebase usa reCAPTCHA o test numbers para phone auth.
**How to apply:** Para producción con números reales se necesitará APNs configurado (cuenta Apple Developer pagada).

## Auth + Onboarding — lógica funcional (2026-05-12)
Flujo completo de punta a punta:
1. LoginScreen → OtpScreen (SMS via Firebase Phone Auth)
2. OtpScreen verifica, `onAuthStateChanged` dispara `initAuthListener`
3. `initAuthListener` lee `users/{uid}` en Firestore:
   - Si no existe → setUser con tenantId vacío → RootNavigator → Onboarding
   - Si existe → setUser + setTenant → RootNavigator → App
4. Onboarding: CreateBusiness → SalesChannels → BusinessSetup
5. BusinessSetup llama `tenantService.createBusiness` que hace batch write

**Colecciones Firestore:**
- `users/{uid}` — perfil del usuario
- `tenants/{tenantId}` — datos del negocio
- `tenants/{tenantId}/products/{productId}` — inventario
- `tenants/{tenantId}/sales/{saleId}` — ventas
- `tenants/{tenantId}/expenses/{expenseId}` — gastos
- `tenants/{tenantId}/customers/{customerId}` — clientes
- `tenants/{tenantId}/employees/{employeeId}` — empleados
- `tenants/{tenantId}/suppliers/{supplierId}` — proveedores
- `tenants/{tenantId}/quotes/{quoteId}` — cotizaciones
- `tenants/{tenantId}/debts/{debtId}` — deudas (por cobrar/pagar)

## Sistema de tema dinámico — completo (2026-05-12)
- `src/theme/index.ts`: paletas `lightColors` y `darkColors`, tipo `ThemeColors`
- Patrón: `const colors = useThemeColors(); const s = useMemo(() => makeStyles(colors), [colors]);`

## Construido hasta ahora (UI + lógica) — 2026-05-13
- Auth completo, Onboarding completo, Settings completo
- HomeScreen, POSScreen, CartScreen, PaymentScreen, SaleSuccessScreen
- InventoryScreen, AddProductScreen
- ExpensesScreen, AddExpenseScreen
- ReportsScreen
- **CustomersScreen** — CRUD completo con Firestore
- **EmployeesScreen** — actualizado a Firestore (ya no usa mock)
- **SuppliersScreen** — CRUD completo con Firestore
- **QuotesScreen + flujo completo**:
  - QuoteSelectProductsScreen (seleccionar del inventario con +/-)
  - QuoteConfirmProductsScreen (ajustar precios/cantidades)
  - QuoteDetailsScreen (fecha, expiración, cliente, descuento, concepto)
  - quoteStore (Zustand) para el flujo de creación
- **DebtsScreen** — Por cobrar / Por pagar tabs con registro de pagos
- HomeScreen actualizado con sección "MÁS FUNCIONES" (accesos directos)

## Bundle IDs
- iOS: com.georgeenami.vynta
- Android package: com.vynta
- Firebase Project: vynta-6c596

## Android — configurado (2026-05-18)
- SHA-1/SHA-256 del keystore correcto registrados en Firebase: `android/app/debug.keystore` (NO ~/.android/debug.keystore)
  - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
  - SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
- `google-services.json` en `android/app/` con certificate_hash correcto
- `webClientId` en `GoogleSignin.configure()`: `31919809319-lp6loqs4h8e5e6o753gu05vfpsv2lth8.apps.googleusercontent.com`
- `NODE_BINARY` en `android/gradle.properties` apunta a nvm node
- `@react-native-async-storage/async-storage` en v1.23.1 (v3.x requiere GitHub Packages auth)
- SafeAreaView reemplazado de react-native → react-native-safe-area-context en 36 pantallas (fix Android 15 edge-to-edge)
- Tab bar usa `useSafeAreaInsets().bottom` para navigation bar dinámica

## iOS — en App Store (2026-05-18)
- Enviado a revisión con plan gratuito
- Privacy policy: https://jorgenamitlech.github.io/vynta-legal/
- Marketing URL: https://jorgenamitlech.github.io/vynta-legal/marketing.html
- APNs Auth Key `KZHYPUJZ22` configurado en Firebase Cloud Messaging (Sandbox & Production)
- `aps-environment: development` en `ios/Vynta/Vynta.entitlements`

## Pendiente
- Notificaciones push reales
- RevenueCat / monetización
- Subir a Google Play
