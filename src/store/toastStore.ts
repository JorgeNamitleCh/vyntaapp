import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastState {
  current: ToastItem | null;
  show: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (item) =>
    set({ current: { ...item, id: Date.now().toString() } }),
  dismiss: () => set({ current: null }),
}));

// Imperative API — call from anywhere (services, hooks, screens)
export const toast = {
  success: (message: string, description?: string) =>
    useToastStore.getState().show({ type: 'success', message, description }),
  error: (message: string, description?: string) =>
    useToastStore.getState().show({ type: 'error', message, description }),
  warning: (message: string, description?: string) =>
    useToastStore.getState().show({ type: 'warning', message, description }),
  info: (message: string, description?: string) =>
    useToastStore.getState().show({ type: 'info', message, description }),
};
