import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  color: string;
}

export type DiscountType = 'percent' | 'fixed';

export interface CartDiscount {
  type: DiscountType;
  value: number;
}

interface CartState {
  items: CartItem[];
  note: string;
  discount: CartDiscount | null;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  setNote: (note: string) => void;
  setDiscount: (discount: CartDiscount | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  note: '',
  discount: null,

  addItem: (item) =>
    set((s) => {
      const exists = s.items.find((i) => i.id === item.id);
      if (exists) {
        return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)) };
      }
      return { items: [...s.items, { ...item, qty: 1 }] };
    }),

  increment: (id) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) })),

  decrement: (id) =>
    set((s) => {
      const item = s.items.find((i) => i.id === id);
      if (!item) return s;
      if (item.qty <= 1) return { items: s.items.filter((i) => i.id !== id) };
      return { items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)) };
    }),

  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  setNote: (note) => set({ note }),

  setDiscount: (discount) => set({ discount }),

  clear: () => set({ items: [], note: '', discount: null }),
}));
