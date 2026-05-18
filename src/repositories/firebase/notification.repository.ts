import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../../config/firebase';
import type { NotifType, Notif } from '../../store/notificationStore';

const col = (tenantId: string) =>
  firestore().collection(COLLECTIONS.TENANTS).doc(tenantId).collection('notifications');

const relativeTime = (date: Date): string => {
  const diffMs  = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1)  return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHr  < 24) return `hace ${diffHr} hr`;
  if (diffDay === 1) return 'ayer';
  if (diffDay < 7)  return `hace ${diffDay} días`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

export type NotifInput = {
  title: string;
  body:  string;
  type:  NotifType;
};

export const notificationRepository = {
  async add(tenantId: string, notif: NotifInput): Promise<void> {
    await col(tenantId).add({
      ...notif,
      read:      false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  },

  subscribe(tenantId: string, cb: (notifs: Notif[]) => void): () => void {
    return col(tenantId)
      .orderBy('createdAt', 'desc')
      .limit(60)
      .onSnapshot(snap => {
        const notifs: Notif[] = snap.docs.map(doc => {
          const d = doc.data();
          const createdAt: Date = d.createdAt?.toDate() ?? new Date();
          return {
            id:    doc.id,
            title: d.title ?? '',
            body:  d.body ?? '',
            type:  d.type as NotifType,
            read:  d.read ?? false,
            time:  relativeTime(createdAt),
          };
        });
        cb(notifs);
      });
  },

  async markRead(tenantId: string, id: string): Promise<void> {
    await col(tenantId).doc(id).update({ read: true });
  },

  async markAllRead(tenantId: string): Promise<void> {
    const snap = await col(tenantId).where('read', '==', false).get();
    if (snap.empty) return;
    const batch = firestore().batch();
    snap.docs.forEach(doc => batch.update(doc.ref, { read: true }));
    await batch.commit();
  },
};
