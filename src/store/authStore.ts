// src/store/authStore.ts
import { create } from 'zustand';
import { User, Tenant } from '../types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, tenant: null, isLoading: false }),
}));
