import { create } from 'zustand';
import { notificationRepository } from '../repositories/firebase/notification.repository';
import { useAuthStore } from './authStore';

export type NotifType = 'sale' | 'stock' | 'report' | 'system';

export type Notif = {
  id:    string;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
  type:  NotifType;
};

type NotifStore = {
  notifications:    Notif[];
  setNotifications: (notifs: Notif[]) => void;
  markRead:         (id: string) => void;
  markAllRead:      () => void;
};

export const useNotificationStore = create<NotifStore>((set) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  markRead: (id) => {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
    const tenantId = useAuthStore.getState().tenant?.id;
    if (tenantId) notificationRepository.markRead(tenantId, id).catch(() => {});
  },

  markAllRead: () => {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
    const tenantId = useAuthStore.getState().tenant?.id;
    if (tenantId) notificationRepository.markAllRead(tenantId).catch(() => {});
  },
}));
