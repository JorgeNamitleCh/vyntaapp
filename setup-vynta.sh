#!/bin/bash
# setup-vynta.sh
# Ejecutar DESPUÉS de: npx react-native init Vynta --template react-native-template-typescript
# Desde la raíz del proyecto: bash setup-vynta.sh

echo "🚀 Creando estructura de carpetas de Vynta..."

# Directorios principales
mkdir -p src/api
mkdir -p src/components/common
mkdir -p src/components/forms
mkdir -p src/config
mkdir -p src/navigation
mkdir -p src/store
mkdir -p src/theme
mkdir -p src/types
mkdir -p src/utils

# Repositories
mkdir -p src/repositories/interfaces
mkdir -p src/repositories/firebase
mkdir -p src/repositories/api

# Features
for feature in auth sales inventory expenses reports tenants; do
  mkdir -p src/features/$feature/hooks
  mkdir -p src/features/$feature/screens
  mkdir -p src/features/$feature/services
  mkdir -p src/features/$feature/types
done

echo "📦 Instalando dependencias..."

npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  @tanstack/react-query \
  zustand \
  @react-native-firebase/app \
  @react-native-firebase/auth \
  @react-native-firebase/firestore \
  @react-native-firebase/functions \
  react-native-purchases \
  @react-native-async-storage/async-storage \
  react-native-vector-icons \
  date-fns \
  zod

npm install --save-dev \
  @types/react-native-vector-icons

echo "✅ Estructura creada. Siguiente paso:"
echo "   1. Copia CLAUDE.md a la raíz del proyecto"
echo "   2. Configura Firebase en src/config/firebase.ts"
echo "   3. Sigue con: npx react-native run-android"
