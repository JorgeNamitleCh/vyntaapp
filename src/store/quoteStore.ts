import { create } from 'zustand';
import { QuoteExpiration, QuoteItem } from '../types';

interface QuoteStore {
  type: 'products' | 'free' | null;
  items: QuoteItem[];
  customerId: string | null;
  customerName: string;
  discountPct: number;
  concept: string;
  expiration: QuoteExpiration;

  setType: (type: 'products' | 'free') => void;
  setItems: (items: QuoteItem[]) => void;
  updateItem: (productId: string | undefined, idx: number, qty: number, price: number) => void;
  removeItem: (idx: number) => void;
  addFreeItem: (item: QuoteItem) => void;
  setCustomer: (id: string | null, name: string) => void;
  setDiscountPct: (pct: number) => void;
  setConcept: (text: string) => void;
  setExpiration: (exp: QuoteExpiration) => void;
  clear: () => void;
}

const defaults = {
  type: null as 'products' | 'free' | null,
  items: [] as QuoteItem[],
  customerId: null as string | null,
  customerName: '',
  discountPct: 0,
  concept: '',
  expiration: 'never' as QuoteExpiration,
};

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  ...defaults,

  setType: type => set({ type }),

  setItems: items => {
    const concept = items.map(i => `${i.quantity} ${i.productName}`).join(', ');
    set({ items, concept });
  },

  updateItem: (productId, idx, qty, price) =>
    set(s => {
      const items = s.items.map((item, i) => {
        if (i !== idx) return item;
        return { ...item, quantity: qty, unitPrice: price, subtotal: qty * price };
      });
      return { items };
    }),

  removeItem: idx =>
    set(s => ({ items: s.items.filter((_, i) => i !== idx) })),

  addFreeItem: item =>
    set(s => ({ items: [...s.items, item] })),

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),

  setDiscountPct: pct => set({ discountPct: pct }),

  setConcept: concept => set({ concept }),

  setExpiration: expiration => set({ expiration }),

  clear: () => set({ ...defaults }),
}));
