import { create } from 'zustand';

export type NotifType = 'sale' | 'stock' | 'report' | 'system';

export type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: NotifType;
};

type NotifStore = {
  notifications: Notif[];
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const MOCK: Notif[] = [
  { id: '1', title: 'Meta del día alcanzada 🎉', body: 'Superaste $5,000 en ventas hoy.', time: 'hace 5 min', read: false, type: 'sale' },
  { id: '2', title: 'Stock bajo: Café molido', body: 'Quedan 2 unidades. Considera reponer pronto.', time: 'hace 1 hr', read: false, type: 'stock' },
  { id: '3', title: 'Reporte semanal listo', body: 'Tu resumen de esta semana está disponible.', time: 'hace 3 hrs', read: false, type: 'report' },
  { id: '4', title: 'Nueva actualización disponible', body: 'Vynta 1.2 trae mejoras en reportes y exportación.', time: 'ayer', read: true, type: 'system' },
  { id: '5', title: 'Venta completada', body: '#A0419 · $264 cobrado en efectivo', time: 'ayer', read: true, type: 'sale' },
];

export const useNotificationStore = create<NotifStore>((set) => ({
  notifications: MOCK,
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));
