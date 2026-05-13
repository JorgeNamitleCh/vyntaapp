# Vynta — POS SaaS para pequeños negocios LATAM

## Descripción
App de punto de venta (POS) para pequeños negocios en México y LATAM.
Competidor directo de Treinta. Precio menor, mejor UX.
Producto público en App Store y Google Play.

## Stack
- React Native CLI (sin Expo)
- TypeScript (estricto)
- Firebase (Auth + Firestore + Functions)
- Zustand — estado global
- React Query (@tanstack/react-query) — caché y sync de datos
- RevenueCat — suscripciones y monetización
- React Navigation v6

## Arquitectura
Clean Architecture con abstracción de datos para migrar a REST API en el futuro.

```
UI (screens/components)
    ↓
Hooks (useXxx)
    ↓
Services (lógica de negocio)
    ↓
Repositories (abstracción de datos)
    ↓
Firebase / API (implementación concreta)
```

## Multi-tenancy
Cada negocio es un tenant aislado en Firestore:
```
/tenants/{tenantId}/products/{productId}
/tenants/{tenantId}/sales/{saleId}
/tenants/{tenantId}/expenses/{expenseId}
/tenants/{tenantId}/customers/{customerId}
```

## Estructura de carpetas
```
src/
  api/              ← clientes HTTP (para migración futura)
  components/       ← componentes reutilizables
  config/           ← firebase, env, constantes
  features/         ← módulos por dominio (sales, inventory, auth...)
    auth/
      hooks/
      screens/
      services/
    sales/
      hooks/
      screens/
      services/
    inventory/
      hooks/
      screens/
      services/
    expenses/
      hooks/
      screens/
      services/
    reports/
      hooks/
      screens/
      services/
  navigation/       ← stack, tabs, root navigator
  repositories/     ← interfaz + implementaciones
    interfaces/
    firebase/
    api/            ← implementación futura REST
  services/         ← servicios transversales (auth, storage)
  store/            ← Zustand stores
  theme/            ← colores, tipografía, espaciado
  types/            ← tipos globales TypeScript
  utils/            ← helpers
```

## Decisiones tomadas
- React Native CLI puro (sin Expo) para máximo control nativo
- Firebase como backend inicial — diseñado para migrar a servidor propio
- Abstracción repositorio/servicio desde el día 1
- Solo app móvil en MVP — dashboard web después
- RevenueCat desde el inicio para no refactorizar monetización
- Zustand para estado global (auth, tenant, UI)
- React Query para todo lo que venga de Firestore/API

## Monetización
- Plan gratuito con límites (X ventas/mes)
- Plan pagado con RevenueCat (App Store + Google Play)
- Objetivo: precio menor a Treinta

## Contexto de negocio
- Mercado: México y LATAM
- Usuarios objetivo: dueños de tiendas, cafés, restaurantes, peluquerías, etc.
- El developer es también dueño de Café Nami (caso de uso real para testear)

## Convenciones de código
- Todos los archivos en TypeScript estricto
- Nombres en inglés (código), español solo en UI strings
- Un componente por archivo
- Hooks con prefijo `use`
- Servicios con sufijo `.service.ts`
- Repositorios con sufijo `.repository.ts`
- No llamar Firebase directo desde componentes ni hooks — siempre pasar por el servicio

## Package manager
- Usar **yarn** siempre (no npm)

## Comandos útiles
```bash
yarn android
yarn ios
yarn start

# Instalar dependencias
yarn add <paquete>
yarn add -D <paquete-dev>
```

## TODO MVP
- [ ] Auth (login con teléfono / Google)
- [ ] Onboarding (crear negocio / tenant)
- [ ] Registro de ventas
- [ ] Inventario de productos
- [ ] Registro de gastos
- [ ] Reportes básicos (diario, semanal, mensual)
- [ ] Monetización con RevenueCat